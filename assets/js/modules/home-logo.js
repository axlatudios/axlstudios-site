export function setupHomeLogo({ prefersReducedMotion }) {
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
