export function setupMobileMenu() {
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
