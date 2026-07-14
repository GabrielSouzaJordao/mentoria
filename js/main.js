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

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${value}%`;
  };

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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    document.querySelectorAll(".hero .reveal").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const parallaxRoots = document.querySelectorAll("[data-parallax], .silent__bg");

  const updateParallax = () => {
    if (reduceMotion || !parallaxRoots.length) return;

    parallaxRoots.forEach((node) => {
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

  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const resultWords = document.querySelectorAll(".results__word");
  if (!reduceMotion && "IntersectionObserver" in window) {
    let animated = false;
    const resultsSection = document.getElementById("transformacao");
    if (resultsSection) {
      const resultsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || animated) return;
            animated = true;
            resultWords.forEach((word, index) => {
              word.style.opacity = "0";
              word.style.transform = "translateY(20px)";
              requestAnimationFrame(() => {
                word.style.transition = `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s, color 0.4s ease`;
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
