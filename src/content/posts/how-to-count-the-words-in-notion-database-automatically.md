---
title: "如何在Notion数据库里的属性中自动化添加字数和预计阅读时间"
description: "介绍如何使用 Notion API 和 Python 自动统计数据库文章字数，并通过公式生成预计阅读时间，附连接配置、PowerShell 设置和完整脚本。"
pubDatetime: 2026-11-21T08:04:21.249Z
tags:
  - Notion
draft: false
---

因为办[周刊](https://cavill.site/articles/i-started-a-weekly/)的需求，我在昨天研究如何自动化的在Notion的数据库属性里添加字数，这也是为了方便填写预计阅读时间。

> [!info]事先说明
> 我是Windows电脑。

以下是我的做法，如果有更高效和简洁的做法，欢迎在评论区告诉我。

## 自动化添加字数

> 先在数据库里的属性中添加“数字”类型的“文字”属性。

首先打开Notion，在“设置”里点击“开发者”，再选择点击“开发者工具”。打开界面后，可以看到“开发者连接”。点开后，选择“创建新连接”，默认选择“API令牌”后创建连接。以下是功能设置：

![](https://picgocloud.com/m/22b2jxrd/c92adc32-48f0-4e05-a5e8-35fc0e4c9106.png)

接着复制你的API，回到“开发者连接”的选择栏，此前是在“配置”界面，它的右边就是“内容访问权限”，点开并选择你要统计的那个数据库的最外层界面（这样最方便）。

之后，回到“设置”，选择“开发者”，开启“开发者功能”。然后到最外层页面右键复制页底的页面ID。

然后运行这个脚本：

```powershell
$notionToken = Read-Host '粘贴 NOTION_TOKEN（输入不会显示）' -AsSecureString
[Environment]::SetEnvironmentVariable('NOTION_TOKEN', [System.Net.NetworkCredential]::new('', $notionToken).Password, 'User')
[Environment]::SetEnvironmentVariable('NOTION_ROOT_PAGE_ID', '替换为 weekly 页面的 ID', 'User')
Remove-Variable notionToken
```

检验方式：

```powershell
[bool]([Environment]::GetEnvironmentVariable('NOTION_TOKEN', 'User'))
[bool]([Environment]::GetEnvironmentVariable('NOTION_ROOT_PAGE_ID', 'User'))
```

如果两次都输出`True`就是成功。

最后可以手动验证，关闭并重新打开 PowerShell，运行预览：

```powershell
python "your-path/your-file-name.py" --dry-run
```

Python脚本具体内容如下：

```python
"""Update 字数 across article databases under a Notion page; standard library only."""

import argparse
import json
import os
import sys
import time
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


COUNT_PROPERTY = "字数"


def request(method, path, body=None):
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        raise RuntimeError("请先设置用户环境变量 NOTION_TOKEN。")
    req = Request(
        "https://api.notion.com/v1" + path,
        data=None if body is None else json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + token,
            "Notion-Version": "2026-03-11",
            "Content-Type": "application/json",
        },
        method=method,
    )
    for attempt in range(3):
        time.sleep(0.4)
        try:
            with urlopen(req, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code in (429, 529) and attempt < 2:
                delay = float(error.headers.get("Retry-After", "5"))
                error.close()
                time.sleep(max(0, delay))
                continue
            try:
                detail = json.load(error).get("message", "")
            except (ValueError, AttributeError):
                detail = "请检查连接权限、weekly 页面 ID 和网络。"
            finally:
                error.close()
            raise RuntimeError(f"Notion HTTP {error.code}: {detail}") from None


def list_results(method, path):
    cursor = None
    while True:
        params = {"page_size": 100}
        if cursor:
            params["start_cursor"] = cursor
        if method == "GET":
            result = request(method, path + "?" + urlencode(params))
        else:
            result = request(method, path, params)
        yield from result["results"]
        if not result.get("has_more"):
            return
        cursor = result.get("next_cursor")
        if not cursor:
            raise RuntimeError("分页响应缺少 next_cursor，停止统计以免写入不完整字数。")


def count_page(page_id):
    count = 0
    for block in list_results("GET", f"/blocks/{page_id}/children"):
        kind = block["type"]
        if kind in ("child_page", "child_database", "link_to_page"):
            continue
        if kind in ("unsupported", "meeting_notes"):
            raise RuntimeError(f"页面含暂不支持统计的块（{kind}），已跳过更新以免写入不完整字数。")
        data = block[kind]
        parts = list(data.get("rich_text", [])) + list(data.get("caption", []))
        for cell in data.get("cells", []):
            parts.extend(cell)
        text = "".join(part["plain_text"] for part in parts)
        if kind == "equation":
            text += data.get("expression", "")
        count += sum(not char.isspace() for char in text)
        if block.get("has_children"):
            count += count_page(block["id"])
    return count


def discover_articles(root_id):
    seen_blocks, seen_sources = set(), set()

    def visit(parent_id):
        if parent_id in seen_blocks:
            return
        seen_blocks.add(parent_id)
        for block in list_results("GET", f"/blocks/{parent_id}/children"):
            kind = block["type"]
            if kind == "child_database":
                database = request("GET", f"/databases/{block['id']}")
                for source in database["data_sources"]:
                    source_id = source["id"]
                    if source_id in seen_sources:
                        continue
                    seen_sources.add(source_id)
                    schema = request("GET", f"/data_sources/{source_id}")
                    if schema["parent"].get("database_id") != block["id"]:
                        print(f"跳过外部链接数据源：{source_id}")
                        continue
                    eligible = schema.get("properties", {}).get(COUNT_PROPERTY, {}).get("type") == "number"
                    print(f"{'统计文章库' if eligible else '仅查找下属数据库'}：{source_id}")
                    for page in list_results("POST", f"/data_sources/{source_id}/query"):
                        if page.get("object", "page") != "page":
                            raise RuntimeError("发现 Wiki 数据源条目；当前脚本暂不支持 Wiki 数据库。")
                        if eligible:
                            yield page
                        yield from visit(page["id"])
            elif kind == "child_page" or (
                block.get("has_children") and kind not in ("link_to_page", "synced_block")
            ):
                yield from visit(block["id"])

    yield from visit(root_id)


def run(dry_run=False):
    try:
        identifier = str(uuid.UUID(os.environ.get("NOTION_ROOT_PAGE_ID", "").strip()))
    except ValueError:
        raise RuntimeError(
            "请将 NOTION_ROOT_PAGE_ID 设置为 weekly 页面的 ID，而不是页面链接或视图 ID。"
        ) from None
    articles = discover_articles(identifier)
    pages = changed = failed = 0
    # shortcut: 每轮重读整个文章库，文章数量较大、耗时明显后再考虑增量同步。
    for page in articles:
        pages += 1
        page_id = page["id"]
        try:
            count = count_page(page_id)
            if page["properties"][COUNT_PROPERTY]["number"] == count:
                continue
            if not dry_run:
                request("PATCH", f"/pages/{page_id}", {
                    "properties": {COUNT_PROPERTY: {"number": count}}
                })
            changed += 1
            print(f"{'预计更新' if dry_run else '已更新'} {page_id}: {count}")
        except (RuntimeError, URLError, TimeoutError, KeyError, ValueError) as error:
            failed += 1
            print(f"跳过 {page_id}: {error}", file=sys.stderr)
    print(f"{'预览完成' if dry_run else '运行完成'}：检查 {pages} 篇，变更 {changed} 篇，失败 {failed} 篇。")
    return 1 if failed else 0


if __name__ == "__main__":
    for stream in (sys.stdout, sys.stderr):
        if stream is not None:
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="只统计并预览，不写入 Notion")
    args = parser.parse_args()
    try:
        sys.exit(run(args.dry_run))
    except (RuntimeError, URLError, TimeoutError, KeyError, ValueError) as error:
        print(f"运行失败：{error}", file=sys.stderr)
        sys.exit(1)

```

## 自动化添加预计阅读时间

> 先在数据库里的属性中添加“函数”类型的“预计阅读时间”属性。

在处理好“字数”后，“预计阅读时间”的处理并不困难。

考虑到一般人阅读文字的速度约为每分钟400字。

因此，点击“预计阅读时间”，选择“编辑属性”，再点击“编辑函数”，输入：

```shell
"约 " + format(ceil(字数 / 400)) + " 分钟"
```

然后退出，Notion好像会自动保存。

然后你就可以看到类似这样的画面：
![](https://picgocloud.com/m/22b2jxrd/b810e8bf-4b02-4f32-acb4-16a628ba25cb.png)

这样，我们就大功告成了。

>[!rant]By the way
>由于目前准备长期使用Notion编辑周刊，可能以后会持续更新关于Notion的使用技巧。
