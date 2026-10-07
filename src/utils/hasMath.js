const backslashRunLength = (markdown, index) => {
  let length = 0;

  for (let cursor = index; markdown[cursor] === "\\"; cursor -= 1) {
    length += 1;
  }

  return length;
};

const isEscaped = (markdown, index) =>
  backslashRunLength(markdown, index - 1) % 2 === 1;

const findUnescapedDelimiter = (markdown, delimiter, fromIndex) => {
  let index = markdown.indexOf(delimiter, fromIndex);

  while (index !== -1) {
    if (!isEscaped(markdown, index)) return index;
    index = markdown.indexOf(delimiter, index + delimiter.length);
  }

  return -1;
};

const hasUnescapedPair = (markdown, opening, closing) => {
  let start = findUnescapedDelimiter(markdown, opening, 0);

  while (start !== -1) {
    const end = findUnescapedDelimiter(
      markdown,
      closing,
      start + opening.length
    );
    if (end !== -1) return true;
    start = findUnescapedDelimiter(markdown, opening, start + opening.length);
  }

  return false;
};

const hasUnescapedInlineDollarPair = markdown => {
  let opening = -1;

  for (let index = 0; index < markdown.length; index += 1) {
    if (
      markdown[index] !== "$" ||
      markdown[index - 1] === "$" ||
      markdown[index + 1] === "$" ||
      isEscaped(markdown, index)
    ) {
      continue;
    }

    if (opening !== -1 && index > opening + 1) return true;
    opening = index;
  }

  return false;
};

const stripFrontmatter = markdown => {
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    return markdown;
  }

  const frontmatter = markdown.match(
    /^---\r?\n[\s\S]*?^(?:---|\.\.\.)\s*(?:\r?\n|$)/m
  );
  return frontmatter ? markdown.slice(frontmatter[0].length) : markdown;
};

const stripInlineCode = line => {
  let result = "";

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== "`") {
      result += line[index];
      continue;
    }

    let end = index;
    while (line[end] === "`") end += 1;
    const marker = line.slice(index, end);
    const closing = line.indexOf(marker, end);

    if (closing === -1) {
      result += marker;
      index = end - 1;
      continue;
    }

    index = closing + marker.length - 1;
  }

  return result;
};

const stripCode = markdown => {
  let fence;

  return stripFrontmatter(markdown)
    .split(/\r?\n/)
    .map(line => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

      if (fence) {
        if (
          fenceMatch &&
          fenceMatch[1][0] === fence[0] &&
          fenceMatch[1].length >= fence.length
        ) {
          fence = undefined;
        }
        return "";
      }

      if (fenceMatch) {
        fence = fenceMatch[1];
        return "";
      }

      return stripInlineCode(line);
    })
    .join("\n");
};

export function hasMath(markdown) {
  if (typeof markdown !== "string") return false;

  const body = stripCode(markdown);

  return (
    hasUnescapedPair(body, "$$", "$$") || hasUnescapedInlineDollarPair(body)
  );
}
