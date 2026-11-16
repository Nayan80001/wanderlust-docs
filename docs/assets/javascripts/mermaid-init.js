mermaid.initialize({
  securityLevel: "strict",
  startOnLoad: false,
  theme: "neutral",
});

const renderMermaid = () => {
  const diagrams = Array.from(document.querySelectorAll("pre.mermaid"));
  if (diagrams.length === 0) return;

  diagrams.forEach((diagram) => {
    diagram.textContent = diagram.textContent;
  });
  return mermaid.run({ nodes: diagrams });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderMermaid();
  }, { once: true });
} else {
  renderMermaid();
}
