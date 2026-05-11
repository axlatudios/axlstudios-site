export function setupContactForm() {
  const form = document.getElementById("axlContactForm");
  const submitButton = document.getElementById("c_submit");

  if (!form || !submitButton) {
    return;
  }

  const okMessage = form.querySelector(".pp-form-msg--ok");
  const errorMessage = form.querySelector(".pp-form-msg--err");
  const endpoint = form.getAttribute("action");

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

    const firstName = (data.get("nome") || "").toString().trim();
    const lastName = (data.get("cognome") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const hasConsent = data.get("consent") === "on";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!firstName || !lastName || !emailOk || !message || !hasConsent || !endpoint) {
      show(errorMessage, true);
      return;
    }

    submitButton.setAttribute("aria-disabled", "true");
    submitButton.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error("Contact form submission failed");
      }

      form.reset();
      show(okMessage, true);
      show(errorMessage, false);
      const enhancedSelect = document.querySelector(".pp-sel__btn");
      const defaultOption = form.querySelector("#c_servizio option[disabled]");
      if (enhancedSelect && defaultOption) {
        enhancedSelect.textContent = defaultOption.textContent || "Seleziona…";
      }
    } catch {
      if (errorMessage) {
        errorMessage.textContent = "Invio non riuscito. Verifica la connessione o riprova piu tardi.";
      }
      show(okMessage, false);
      show(errorMessage, true);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-disabled");
    }
  });
}
