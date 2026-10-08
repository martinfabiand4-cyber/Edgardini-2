(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu
  const wrap = document.querySelector(".nav-wrap");
  const toggle = document.querySelector(".menu-toggle");
  if (wrap && toggle) {
    const setOpen = (open) => {
      wrap.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    toggle.addEventListener("click", () => setOpen(!wrap.classList.contains("is-open")));
    document.querySelectorAll("#nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Hide hero/section images that have not been added yet, so the gradient fallback shows
  document.querySelectorAll("img").forEach((img) => {
    const hide = () => img.classList.add("is-missing");
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener("error", hide, { once: true });
  });

  // Animated counters
  const counters = document.querySelectorAll("[data-count]");
  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || target === 0) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  } else {
    counters.forEach(animate);
  }
})();
