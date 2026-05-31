import DOMPurify from "dompurify";

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "code", "br"],
  ALLOWED_ATTR: [],
};

function sanitize(html) {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

function md(t) {
  if (!t) return t;
  return t.split("\n").map((l, i) => {
    const c = l
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (l.startsWith("- ") || l.startsWith("• "))
      return (
        <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}
          dangerouslySetInnerHTML={{ __html: sanitize("• " + c.slice(2)) }}/>
      );
    if (l.trim() === "")
      return <div key={i} style={{ height: 6 }}/>;
    return <div key={i} dangerouslySetInnerHTML={{ __html: sanitize(c) }}/>;
  });
}

export default md;
