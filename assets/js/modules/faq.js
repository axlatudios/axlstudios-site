export function setupFaq() {
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
