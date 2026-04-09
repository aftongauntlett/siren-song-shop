// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { initializeCategoryTabs } from "./categoryTabs";

const setupDom = () => {
  document.body.innerHTML = `
    <div data-category-dropdown>
      <button type="button" data-category-trigger aria-expanded="false"><span data-category-value>One</span></button>
      <div data-category-options role="menu" hidden>
        <button type="button" data-category-option data-value="one" role="menuitemradio" aria-checked="true" class="category-option category-option--active">One</button>
        <button type="button" data-category-option data-value="two" role="menuitemradio" aria-checked="false" class="category-option">Two</button>
      </div>
    </div>
    <div data-state-dropdown>
      <button type="button" data-state-trigger aria-expanded="false"><span data-state-value>NC</span></button>
      <div data-state-options role="menu" hidden>
        <button type="button" data-state-option data-value="all" role="menuitemradio" aria-checked="false" class="state-option">All</button>
        <button type="button" data-state-option data-value="NC" role="menuitemradio" aria-checked="true" class="state-option state-option--active">NC</button>
      </div>
    </div>
    <div role="tablist">
      <button type="button" role="tab" data-category-tab data-category="one" aria-selected="true" tabindex="0" class="category-tab category-tab--active">One</button>
      <button type="button" role="tab" data-category-tab data-category="two" aria-selected="false" tabindex="-1" class="category-tab">Two</button>
    </div>
    <section data-category-panel data-category="one">
      <article data-local-card data-state="NC"></article>
      <article data-local-card data-state="VA"></article>
    </section>
    <section data-category-panel data-category="two" hidden>
      <article data-local-card data-state="NC"></article>
      <article data-local-card data-state="VA"></article>
    </section>
  `;
};

describe("initializeCategoryTabs", () => {
  beforeEach(() => {
    setupDom();
    initializeCategoryTabs();
  });

  it("switches active panel on tab click", () => {
    const tabTwo = document.querySelector<HTMLButtonElement>(
      '[data-category-tab][data-category="two"]',
    );
    const panelOne = document.querySelector<HTMLElement>(
      '[data-category-panel][data-category="one"]',
    );
    const panelTwo = document.querySelector<HTMLElement>(
      '[data-category-panel][data-category="two"]',
    );

    tabTwo?.click();

    expect(tabTwo?.getAttribute("aria-selected")).toBe("true");
    expect(panelOne?.hidden).toBe(true);
    expect(panelTwo?.hidden).toBe(false);
  });

  it("opens menu and supports keyboard selection", () => {
    const trigger = document.querySelector<HTMLButtonElement>(
      "[data-category-trigger]",
    );
    const optionTwo = document.querySelector<HTMLButtonElement>(
      '[data-category-option][data-value="two"]',
    );

    trigger?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    optionTwo?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(optionTwo?.getAttribute("aria-checked")).toBe("true");
  });

  it("supports keyboard tab switch and allows external state filtering to reapply", () => {
    const tabOne = document.querySelector<HTMLButtonElement>(
      '[data-category-tab][data-category="one"]',
    );
    const panelTwo = document.querySelector<HTMLElement>(
      '[data-category-panel][data-category="two"]',
    );
    const panelTwoCards = Array.from(
      panelTwo?.querySelectorAll<HTMLElement>("[data-local-card]") ?? [],
    );

    const applyLocalStateFilter = () => {
      const selected =
        document.querySelector<HTMLButtonElement>(
          "[data-state-option].state-option--active",
        )?.dataset.value ?? "all";
      const visiblePanel = document.querySelector<HTMLElement>(
        "[data-category-panel]:not([hidden])",
      );
      if (!visiblePanel) return;

      Array.from(
        visiblePanel.querySelectorAll<HTMLElement>("[data-local-card]"),
      ).forEach((card) => {
        card.hidden = selected !== "all" && card.dataset.state !== selected;
      });
    };

    document.addEventListener("siren-category-change", applyLocalStateFilter);

    tabOne?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(panelTwo?.hidden).toBe(false);
    expect(panelTwoCards[0]?.hidden).toBe(false);
    expect(panelTwoCards[1]?.hidden).toBe(true);
  });
});
