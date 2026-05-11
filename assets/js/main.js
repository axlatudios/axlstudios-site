(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isMobileViewport = window.matchMedia("(max-width: 768px)");

  function setupAdaptiveVideos() {
    const videos = document.querySelectorAll(
      ".pp-hero-bg, .pp-services-bg-video, .pp-team-bg-video"
    );

    if (!videos.length) {
      return;
    }

    const hydrateVideo = (video) => {
      if (video.dataset.hydrated === "true") {
        return;
      }

      const src = video.dataset.videoSrc;
      if (!src) {
        return;
      }

      video.src = src;
      video.dataset.hydrated = "true";
      video.load();
    };

    const dehydrateVideo = (video) => {
      if (video.dataset.hydrated !== "true") {
        return;
      }

      video.pause();
      video.removeAttribute("src");
      video.load();
      video.dataset.hydrated = "false";
    };

    const syncVideos = () => {
      const shouldPause = prefersReducedMotion.matches || isMobileViewport.matches;

      videos.forEach((video) => {
        if (!(video instanceof HTMLVideoElement)) {
          return;
        }

        if (shouldPause) {
          dehydrateVideo(video);
          return;
        }

        hydrateVideo(video);
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      });
    };

    syncVideos();
    prefersReducedMotion.addEventListener("change", syncVideos);
    isMobileViewport.addEventListener("change", syncVideos);
  }

  function setupServicesTrack() {
    const track = document.getElementById("servicesTrack");
    if (!track || !track.parentElement) {
      return;
    }

    const viewport = track.parentElement;
    let cards = Array.from(track.children);
    const baseCount = cards.length;

    if (!baseCount) {
      return;
    }

    function cardWidth() {
      return cards[0].getBoundingClientRect().width;
    }

    function populateClones() {
      const fragStart = document.createDocumentFragment();
      const fragEnd = document.createDocumentFragment();

      cards.forEach((card) => fragEnd.appendChild(card.cloneNode(true)));
      [...cards]
        .reverse()
        .forEach((card) => fragStart.appendChild(card.cloneNode(true)));

      track.insertBefore(fragStart, track.firstChild);
      track.appendChild(fragEnd);
      cards = Array.from(track.children);
    }

    populateClones();

    let startX = 0;
    let currentX = 0;
    let previousX = 0;
    let isPointerDown = false;
    let translate = 0;
    let total = 0;
    let leftLimit = 0;
    let rightLimit = 0;
    let resizeFrame;

    function recalc() {
      const width = cardWidth();
      total = width * baseCount * 3;
      leftLimit = -total + width * baseCount;
      rightLimit = -(width * baseCount);
      translate = rightLimit;
      track.style.transform = `translateX(${translate}px)`;
    }

    function wrap() {
      const width = cardWidth() * baseCount;
      if (translate < leftLimit) {
        translate += width;
      }
      if (translate > rightLimit) {
        translate -= width;
      }
    }

    function onPointerDown(event) {
      isPointerDown = true;
      viewport.classList.add("dragging");
      document.body.style.userSelect = "none";
      startX = event.touches ? event.touches[0].clientX : event.clientX;
      previousX = startX;
    }

    function onPointerMove(event) {
      if (!isPointerDown) {
        return;
      }

      currentX = event.touches ? event.touches[0].clientX : event.clientX;
      translate += currentX - previousX;
      previousX = currentX;
      wrap();
      track.style.transform = `translateX(${translate}px)`;
      event.preventDefault();
    }

    function onPointerUp() {
      isPointerDown = false;
      viewport.classList.remove("dragging");
      document.body.style.userSelect = "";
    }

    recalc();

    viewport.addEventListener("mousedown", onPointerDown);
    viewport.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    viewport.addEventListener("touchstart", onPointerDown, { passive: false });
    viewport.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
    viewport.addEventListener("dragstart", (event) => event.preventDefault());

    window.addEventListener("resize", () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(recalc);
    });
  }

  function setupMobileMenu() {
    const checkbox = document.getElementById("ppMenu");
    const burger = document.querySelector("label.pp-burger");
    const nav = document.getElementById("primaryNav");

    if (!checkbox || !burger || !nav) {
      return;
    }

    const links = nav.querySelectorAll("[data-close]");

    function syncAria() {
      const isOpen = checkbox.checked;
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      nav.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.documentElement.style.overflow = isOpen ? "hidden" : "";
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    checkbox.addEventListener("change", syncAria);
    links.forEach((link) =>
      link.addEventListener("click", () => {
        checkbox.checked = false;
        syncAria();
      })
    );

    syncAria();
  }

  function setupFaq() {
    const rows = Array.from(document.querySelectorAll(".pp-faq-row"));
    if (!rows.length) {
      return;
    }

    const toggles = rows
      .map((row) => row.querySelector(".pp-faq-toggle"))
      .filter(Boolean);

    function closeAll(exceptToggle) {
      toggles.forEach((toggle) => {
        if (toggle === exceptToggle) {
          return;
        }

        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        toggle.setAttribute("aria-expanded", "false");
        if (panel) {
          panel.hidden = true;
        }
      });
    }

    toggles.forEach((toggle) => {
      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!panel) {
        return;
      }

      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        closeAll(toggle);
        toggle.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
      });
    });

    if (location.hash) {
      const panel = document.querySelector(location.hash);
      if (!panel || !panel.id.startsWith("faq-")) {
        return;
      }

      const toggle = document.querySelector(
        `.pp-faq-toggle[aria-controls="${panel.id}"]`
      );

      if (toggle) {
        closeAll(toggle);
        toggle.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    }
  }

  function setupContactForm() {
    const form = document.getElementById("axlContactForm");
    const submitButton = document.getElementById("c_submit");

    if (!form || !submitButton) {
      return;
    }

    const okMessage = form.querySelector(".pp-form-msg--ok");
    const errorMessage = form.querySelector(".pp-form-msg--err");

    function show(element, shouldShow) {
      if (element) {
        element.hidden = !shouldShow;
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      show(okMessage, false);
      show(errorMessage, false);

      const data = new FormData(form);
      if ((data.get("_company") || "").toString().trim()) {
        form.reset();
        show(okMessage, true);
        return;
      }

      const firstName = (data.get("nome") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const hasConsent = data.get("consent") === "on";
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!firstName || !emailOk || !message || !hasConsent) {
        show(errorMessage, true);
        return;
      }

      submitButton.setAttribute("aria-disabled", "true");

      try {
        await new Promise((resolve) => setTimeout(resolve, 700));
        form.reset();
        show(okMessage, true);
      } finally {
        submitButton.removeAttribute("aria-disabled");
      }
    });
  }

  function enhanceSelect(select) {
    if (select.dataset.enhanced) {
      return;
    }

    select.dataset.enhanced = "true";
    select.classList.add("pp-select--enhance");
    select.closest(".pp-selectwrap")?.classList.add("is-enhanced");

    const wrap = document.createElement("div");
    wrap.className = "pp-sel";
    wrap.setAttribute("role", "combobox");
    wrap.setAttribute("aria-haspopup", "listbox");
    wrap.setAttribute("aria-expanded", "false");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "pp-sel__btn";
    button.textContent =
      select.options[select.selectedIndex]?.text ||
      select.getAttribute("placeholder") ||
      "Seleziona…";
    wrap.appendChild(button);

    const list = document.createElement("ul");
    list.className = "pp-sel__list";
    list.setAttribute("role", "listbox");
    wrap.appendChild(list);

    [...select.options].forEach((option) => {
      if (option.disabled || option.value === "") {
        return;
      }

      const item = document.createElement("li");
      item.className = "pp-sel__opt";
      item.setAttribute("role", "option");
      item.setAttribute("data-value", option.value);
      item.textContent = option.text;

      if (option.selected) {
        item.setAttribute("aria-selected", "true");
      }

      item.addEventListener("click", () => {
        select.value = option.value;
        button.textContent = option.text;
        list
          .querySelectorAll(".pp-sel__opt[aria-selected]")
          .forEach((node) => node.removeAttribute("aria-selected"));
        item.setAttribute("aria-selected", "true");
        wrap.dataset.open = "false";
        wrap.setAttribute("aria-expanded", "false");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });

      list.appendChild(item);
    });

    button.addEventListener("click", () => {
      const isOpen = wrap.dataset.open === "true";
      wrap.dataset.open = String(!isOpen);
      wrap.setAttribute("aria-expanded", String(!isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) {
        wrap.dataset.open = "false";
        wrap.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        wrap.dataset.open = "false";
        wrap.setAttribute("aria-expanded", "false");
        button.focus();
      }
    });

    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
  }

  function setupSelects() {
    document
      .querySelectorAll("select.pp-select.pp-select--custom, select#c_servizio")
      .forEach(enhanceSelect);
  }

  function setupHomeLogo() {
    const logo = document.querySelector(".pp-nav-left .pp-logo");
    const home = document.getElementById("home");

    if (!logo || !home) {
      return;
    }

    logo.setAttribute("role", "link");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("aria-label", "AXL Studios — Home");

    const goHome = () => {
      home.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
    };

    logo.addEventListener("click", (event) => {
      event.preventDefault();
      goHome();
    });

    logo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goHome();
      }
    });
  }

  setupAdaptiveVideos();
  setupServicesTrack();
  setupMobileMenu();
  setupFaq();
  setupContactForm();
  setupSelects();
  setupHomeLogo();
})();
