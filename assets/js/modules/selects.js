const enhancedWraps = [];

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

  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);

  enhancedWraps.push({ wrap, button });
}

export function setupSelects() {
  document
    .querySelectorAll("select.pp-select.pp-select--custom, select#c_servizio")
    .forEach(enhanceSelect);

  document.addEventListener("click", (event) => {
    enhancedWraps.forEach(({ wrap }) => {
      if (!wrap.contains(event.target)) {
        wrap.dataset.open = "false";
        wrap.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    enhancedWraps.forEach(({ wrap, button }) => {
      if (wrap.dataset.open === "true") {
        wrap.dataset.open = "false";
        wrap.setAttribute("aria-expanded", "false");
        button.focus();
      }
    });
  });
}
