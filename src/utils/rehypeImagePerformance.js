export default function rehypeImagePerformance() {
  return tree => {
    visit(tree);
  };
}

function visit(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element" && node.tagName === "img") {
    const properties = { ...node.properties };

    if (properties.loading === undefined) properties.loading = "lazy";
    if (properties.decoding === undefined) properties.decoding = "async";
    if (
      properties.loading === "lazy" &&
      properties.fetchPriority === undefined
    ) {
      properties.fetchPriority = "low";
    }

    node.properties = properties;
  }

  if (!Array.isArray(node.children)) return;
  for (const child of node.children) visit(child);
}
