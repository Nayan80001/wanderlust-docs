mermaid.startOnLoad = false;
mermaid.initialize({
  securityLevel: "strict",
  startOnLoad: false,
  theme: "neutral",
});

const renderMermaid = async () => {
  const containers = Array.from(document.querySelectorAll(".mermaid"));
  if (containers.length === 0) return;

  const response = await fetch(location.pathname);
  if (!response.ok) {
    throw new Error(`Failed to reload Mermaid source: ${response.status}`);
  }

  const html = await response.text();
  const sourceDiagrams = Array.from(
    new DOMParser()
      .parseFromString(html, "text/html")
      .querySelectorAll("pre.mermaid"),
  );
  if (sourceDiagrams.length !== containers.length) {
    throw new Error("Mermaid source blocks do not match rendered containers");
  }

  const diagrams = sourceDiagrams.map((source, index) => {
    const diagram = source.cloneNode(true);
    containers[index].replaceWith(diagram);
    diagram.textContent = diagram.textContent;
    return diagram;
  });

  return mermaid.run({ nodes: diagrams });
};

if (document.readyState === "complete") {
  renderMermaid();
} else {
  window.addEventListener("load", renderMermaid, { once: true });
}
