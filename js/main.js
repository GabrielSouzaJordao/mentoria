(() => {
  "use strict";

  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const progress = document.querySelector(".scroll-progress");
  const yearEl = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* —— Header state —— */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  /* —— Scroll progress —— */
  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${value}%`;
  };

  /* —— Mobile nav —— */
  const closeNav = () => {
    header?.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  };

  navToggle?.addEventListener("click", () => {
    const open = header?.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  /* —— Smooth anchor offset (native + fallback) —— */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* —— Scroll reveal —— */
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // Hero immediately
    document.querySelectorAll(".hero .reveal").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* —— Parallax —— */
  const parallaxNodes = document.querySelectorAll("[data-parallax]");

  const updateParallax = () => {
    if (reduceMotion || !parallaxNodes.length) return;

    parallaxNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewH) return;

      const progressY = (viewH - rect.top) / (viewH + rect.height);
      const offset = (progressY - 0.5) * 48;
      const img = node.querySelector("img");
      if (img) {
        img.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
      }
    });
  };

  /* —— FAQ: only one open —— */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* —— Subtle counter pulse on results words —— */
  const resultWords = document.querySelectorAll(".results__word");
  if (!reduceMotion && "IntersectionObserver" in window) {
    let animated = false;
    const resultsSection = document.getElementById("resultados");
    if (resultsSection) {
      const resultsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || animated) return;
            animated = true;
            resultWords.forEach((word, index) => {
              word.style.transitionDelay = `${index * 0.12}s`;
              word.style.opacity = "0";
              word.style.transform = "translateY(20px)";
              requestAnimationFrame(() => {
                word.style.transition = "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1), color 0.4s ease";
                word.style.opacity = "1";
                word.style.transform = "translateY(0)";
              });
            });
            resultsObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.35 }
      );
      resultsObserver.observe(resultsSection);
    }
  }

  /* —— RAF scroll loop —— */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      updateProgress();
      updateParallax();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateHeader();
  updateProgress();
  updateParallax();
})();
