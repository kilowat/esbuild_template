// src/js/livereload.js
new EventSource("/esbuild").addEventListener("change", (e) => {
  const { added, removed, updated } = JSON.parse(e.data);
  console.log(added);
  if (added.length || removed.length) {
    location.reload();
    return;
  }
  Array.from(document.getElementsByTagName("link")).forEach((link) => {
    const url = new URL(link.href), path = url.pathname;
    if (updated.includes(path) && url.host === location.host) {
      const css = link.cloneNode();
      css.onload = () => link.remove();
      css.href = `${path}?${+/* @__PURE__ */ new Date()}`;
      link.after(css);
    }
  });
});
//# sourceMappingURL=chunk-LY6QAQLN.js.map
