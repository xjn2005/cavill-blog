export default function rehypeImageCaptions() {
  return tree => {
    visit(tree);
  };
}

function visit(node) {
  if (!Array.isArray(node?.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child?.type === "element" && child.tagName === "p") {
      const img = standaloneImage(child.children);
      const title = typeof img?.properties?.title === "string"
        ? img.properties.title.trim()
        : "";

      if (title) {
        const properties = { ...img.properties };
        delete properties.title;

        node.children[index] = {
          type: "element",
          tagName: "figure",
          properties: { className: ["image-caption"] },
          children: [
            { ...img, properties },
            {
              type: "element",
              tagName: "figcaption",
              properties: { className: ["text-center"] },
              children: [{ type: "text", value: title }],
            },
          ],
        };
        continue;
      }
    }

    visit(child);
  }
}

function standaloneImage(children = []) {
  const meaningful = children.filter(
    child => child.type !== "text" || /\S/.test(child.value ?? ""),
  );

  return meaningful.length === 1 &&
    meaningful[0].type === "element" &&
    meaningful[0].tagName === "img"
    ? meaningful[0]
    : undefined;
}

