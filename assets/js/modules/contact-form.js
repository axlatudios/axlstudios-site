export function setupContactForm() {
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
