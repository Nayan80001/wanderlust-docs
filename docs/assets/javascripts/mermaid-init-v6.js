mermaid.startOnLoad = false;
mermaid.initialize({
  securityLevel: "strict",
  startOnLoad: false,
  theme: "neutral",
});

const renderMermaid = async () => {
  const diagrams = Array.from(document.querySelectorAll(".mermaid"));
  if (diagrams.length === 0) return;

  if (diagrams.some((diagram) => !diagram.textContent.trim())) {
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
    if (sourceDiagrams.length !== diagrams.length) {
      throw new Error("Mermaid source blocks do not match rendered containers");
    }

    diagrams.forEach((diagram, index) => {
      if (!diagram.textContent.trim()) {
        diagram.textContent = sourceDiagrams[index].textContent;
      }
    });
  }

  return mermaid.run({ nodes: diagrams });
};

if (document.readyState === "complete") {
  renderMermaid();
} else {
  window.addEventListener("load", renderMermaid, { once: true });
}
