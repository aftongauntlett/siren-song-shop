export const initializeCategoryTabs = (): void => {
  const CATEGORY_CHANGE_EVENT = "siren-category-change";
  const tabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-category-tab]"),
  );
  const panels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-category-panel]"),
  );
  const categoryDropdown = document.querySelector<HTMLElement>(
    "[data-category-dropdown]",
  );
  const categoryTrigger = document.querySelector<HTMLButtonElement>(
    "[data-category-trigger]",
  );
  const categoryValueEl = document.querySelector<HTMLElement>(
    "[data-category-value]",
  );
  const categoryOptionsPanel = document.querySelector<HTMLElement>(
    "[data-category-options]",
  );
  const categoryOptionBtns = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-category-option]"),
  );
  if (tabs.length === 0 || panels.length === 0) return;

  const focusMenuOption = (offset: number, from?: HTMLButtonElement): void => {
    if (categoryOptionBtns.length === 0) return;
    const currentIndex = from ? categoryOptionBtns.indexOf(from) : 0;
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (safeIndex + offset + categoryOptionBtns.length) %
      categoryOptionBtns.length;
    categoryOptionBtns[nextIndex]?.focus();
  };

  const getTabCategory = (tab: HTMLButtonElement) => tab.dataset.category;

  const closeCategoryOptions = () => {
    if (!categoryTrigger || !categoryOptionsPanel) return;
    categoryOptionsPanel.hidden = true;
    categoryTrigger.setAttribute("aria-expanded", "false");
    if (categoryDropdown) delete categoryDropdown.dataset.open;
  };

  const openCategoryOptions = () => {
    if (!categoryTrigger || !categoryOptionsPanel) return;
    categoryOptionsPanel.hidden = false;
    categoryTrigger.setAttribute("aria-expanded", "true");
    if (categoryDropdown) categoryDropdown.dataset.open = "true";
  };

  const setActiveCategory = (category: string) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.category === category;
      tab.setAttribute("aria-selected", String(isActive));
      tab.classList.toggle("category-tab--active", isActive);
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.category !== category;
    });

    if (categoryValueEl) {
      const activeOpt = categoryOptionBtns.find(
        (opt) => opt.dataset.value === category,
      );
      if (activeOpt)
        categoryValueEl.textContent = activeOpt.textContent?.trim() ?? category;
    }

    categoryOptionBtns.forEach((opt) => {
      const isActive = opt.dataset.value === category;
      opt.classList.toggle("category-option--active", isActive);
      opt.setAttribute("aria-checked", String(isActive));
    });

    document.dispatchEvent(
      new CustomEvent(CATEGORY_CHANGE_EVENT, {
        detail: { category },
      }),
    );
  };

  const setActiveByIndex = (index: number) => {
    const safeIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[safeIndex];
    if (!nextTab) return;
    const category = getTabCategory(nextTab);
    if (!category) return;
    setActiveCategory(category);
    nextTab.focus();
  };

  tabs.forEach((tab) => {
    if (tab.dataset.categoryBound === "true") return;

    tab.addEventListener("click", () => {
      const category = getTabCategory(tab);
      if (!category) return;
      setActiveCategory(category);
    });

    tab.addEventListener("keydown", (event) => {
      const currentIndex = tabs.indexOf(tab);
      if (currentIndex < 0) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveByIndex(currentIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveByIndex(currentIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        setActiveByIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        setActiveByIndex(tabs.length - 1);
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const category = getTabCategory(tab);
        if (!category) return;
        setActiveCategory(category);
      }
    });

    tab.dataset.categoryBound = "true";
  });

  if (
    categoryTrigger &&
    categoryOptionsPanel &&
    categoryTrigger.dataset.categoryTriggerBound !== "true"
  ) {
    categoryTrigger.addEventListener("click", () => {
      if (categoryOptionsPanel.hidden) {
        openCategoryOptions();
      } else {
        closeCategoryOptions();
      }
    });

    categoryTrigger.addEventListener("keydown", (event) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openCategoryOptions();
        const active = categoryOptionBtns.find((opt) =>
          opt.classList.contains("category-option--active"),
        );
        (active ?? categoryOptionBtns[0])?.focus();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeCategoryOptions();
      }
    });

    categoryTrigger.dataset.categoryTriggerBound = "true";
  }

  categoryOptionBtns.forEach((opt) => {
    if (opt.dataset.categoryOptionBound === "true") return;

    opt.addEventListener("click", () => {
      const value = opt.dataset.value;
      if (!value) return;
      setActiveCategory(value);
      closeCategoryOptions();
      const nextTab = tabs.find((tab) => tab.dataset.category === value);
      nextTab?.focus();
    });

    opt.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusMenuOption(1, opt);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusMenuOption(-1, opt);
      }

      if (event.key === "Home") {
        event.preventDefault();
        categoryOptionBtns[0]?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        categoryOptionBtns[categoryOptionBtns.length - 1]?.focus();
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        opt.click();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeCategoryOptions();
        categoryTrigger?.focus();
      }

      if (event.key === "Tab") {
        closeCategoryOptions();
      }
    });

    opt.dataset.categoryOptionBound = "true";
  });

  if (
    categoryDropdown &&
    categoryDropdown.dataset.categoryOutsideBound !== "true"
  ) {
    document.addEventListener("click", (event) => {
      const target = event.target as Node;
      if (!categoryDropdown.contains(target)) closeCategoryOptions();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCategoryOptions();
    });
    categoryDropdown.dataset.categoryOutsideBound = "true";
  }

  const firstTab = tabs.at(0);
  if (firstTab?.dataset.category) {
    setActiveCategory(firstTab.dataset.category);
  }
};
