import { inject } from "@vercel/analytics";
inject();

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Lenis from "@studio-freight/lenis";
import MoundiGuide from "./MoundiGuide.jsx";

function App() {
  useEffect(() => {
    let lenis;
    function initLenis() {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initLenis);
    } else {
      setTimeout(initLenis, 200);
    }
    return () => lenis?.destroy();
  }, []);
  return <MoundiGuide />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.log("SW error:", err));
  });
}
