import "./chunk-LY6QAQLN.js";

// src/js/nochunk.js
function nochunk_default(test) {
  console.log(test);
}

// src/js/main.js
nochunk_default("test_2");
setTimeout(async () => {
  const fun = (await import("./chunk-KMJW4KVD.js")).default;
  fun();
}, 1e3);
//# sourceMappingURL=main.js.map
