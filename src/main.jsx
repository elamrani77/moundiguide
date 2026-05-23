// DEBUG SCROLL — remove after fix
if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', (e) => {
    console.log('touchstart target:', e.target.tagName, e.target.className);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    console.log('touchmove prevented:', e.defaultPrevented, 'target:', e.target.tagName, e.target.className);
  }, { passive: true });

  setTimeout(() => {
    const all = document.querySelectorAll('*');
    const blocking = [];
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      const overflow = style.overflow + style.overflowX + style.overflowY;
      const position = style.position;
      const height = style.height;
      if (
        overflow.includes('hidden') ||
        (position === 'fixed') ||
        (height === '100vh')
      ) {
        blocking.push({
          tag: el.tagName,
          id: el.id,
          class: el.className?.toString().slice(0, 50),
          overflow: style.overflow,
          overflowY: style.overflowY,
          position,
          height
        });
      }
    });
    console.table(blocking);
    console.log('Total blocking elements:', blocking.length);
  }, 2000);
}

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Lenis from "@studio-freight/lenis";
import MoundiGuide from "./MoundiGuide.jsx";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  return <MoundiGuide />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
