"use strict";

// KONSTANTEN / VARIABLEN
const elements = {};

elements.allDataItems = [];
elements.originalOrder = [];
elements.sortState = "asc";

// FUNKTIONEN
const domMapping = () => {
  elements.elSelfilCrds = document.querySelector("#type-filter");
  elements.elSelThem = document.querySelector("#themeSelector");
  elements.elSelLang = document.querySelector("#languageSelector");
  elements.elSortButton = document.querySelector("#sort-button");
  elements.inputSelTitl = document.querySelector("#title-search");
};

const renderCards = (dataItems) => {
  const container = document.querySelector("#data-cards-container");

  if (!container) {
    console.error(
      "Error: data-cards-container element not found in the document."
    );
    return;
  }

  container.innerHTML = ""; // Clear existing content

  dataItems.forEach((item) => {
    // Create card elements
    const card = document.createElement("div");
    card.className = "data-card";
    card.onclick = () => navigateToDetailPage(item.id); // Navigate to detail page on click

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const img = document.createElement("img");
    img.src = item.thumbnail;
    img.alt = `${item.type} thumbnail`;
    img.className = "thumbnail-img";
    thumbnail.appendChild(img);

    const content = document.createElement("div");
    content.className = "content";

    const title = document.createElement("h3");
    title.className = "data-title";
    title.textContent = item.title;

    const description = document.createElement("p");
    description.className = "data-description";
    description.textContent = item.description;

    // Append elements to card
    content.appendChild(title);
    content.appendChild(description);
    card.appendChild(thumbnail);
    card.appendChild(content);
    container.appendChild(card);
  });
};

// Change the Theme as selected
const switchTheme = (theme) => {
  document.documentElement.className = theme;
  localStorage.setItem("selectedTheme", theme);
};

// Language Switching and Translation
const switchLanguage = async (lang) => {
  localStorage.setItem("selectedLanguage", lang);
  const translations = await fetch(`languages/${lang}.json`).then((res) =>
    res.json()
  );

  document.querySelectorAll("[data-translate]").forEach((el) => {
    const key = el.getAttribute("data-translate");
    if (translations[key]) el.textContent = translations[key];
  });
};

const handleLoadedData = (evt) => {
  const xhr = evt.target;

  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    elements.allDataItems = data.dataItems;
    elements.originalOrder = [...elements.allDataItems];
    renderCards(elements.allDataItems);
  } else {
    console.warn(
      `${xhr.responseURL} could not be loaded. Reason: ${xhr.statusText}`
    );
  }
};

const navigateToDetailPage = (dataId) => {
  window.location.href = `detail.html?id=${dataId}`;
};

const filterCards = (evnt) => {
  const selectedType = evnt.target.value;
  const filteredDataItems =
    selectedType === "all"
      ? elements.allDataItems
      : elements.allDataItems.filter((item) => item.type === selectedType);

  renderCards(filteredDataItems);
};

const filterCardsByTitle = (evnt) => {
  console.log(evnt);

  const titleSearch = evnt.target.value.toLowerCase();
  const filteredByTitle = elements.allDataItems.filter((item) =>
    item.title.toLowerCase().includes(titleSearch)
  );

  renderCards(filteredByTitle);
};

const toggleSort = () => {
  // Toggle sort
  if (elements.sortState === "asc") {
    elements.sortState = "desc";
    elements.elSortButton.textContent = "Sort by Title: Z-A";
  } else if (elements.sortState === "desc") {
    elements.sortState = "none";
    elements.elSortButton.textContent = "Sort by Title: Unsorted";
  } else {
    elements.sortState = "asc";
    elements.elSortButton.textContent = "Sort by Title: A-Z";
  }

  applySort();
};

const applySort = () => {
  let sortedItems = [...elements.allDataItems]; // Create a shallow copy

  if (elements.sortState === "asc") {
    sortedItems.sort((a, b) => a.title.localeCompare(b.title)); // A-Z
  } else if (elements.sortState === "desc") {
    sortedItems.sort((a, b) => b.title.localeCompare(a.title)); // Z-A
  } else {
    sortedItems = [...elements.originalOrder]; // Reset to original order if "none"
  }

  renderCards(sortedItems);
};

const appendEventListeners = () => {
  if (elements.elSelfilCrds) {
    elements.elSelfilCrds.addEventListener("input", filterCards);
  }
  if (elements.elSelThem) {
    elements.elSelThem.addEventListener("input", (ev) =>
      switchTheme(ev.target.value)
    );
  }
  if (elements.elSelLang) {
    elements.elSelLang.addEventListener("input", (ev) =>
      switchLanguage(ev.target.value)
    );
  }
  if (elements.elSortButton) {
    elements.elSortButton.addEventListener("click", toggleSort);
  }
  if (elements.inputSelTitl) {
    elements.inputSelTitl.addEventListener("input", filterCardsByTitle);
  }
};

const loadJsonDataItems = () => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "./assets/data/json/sample-data.json", true);
  xhr.addEventListener("load", handleLoadedData);
  xhr.send();
};

const loadItems = () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "theme-default";
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  switchTheme(savedTheme);
  switchLanguage(savedLanguage);

  if (document.querySelector("#data-cards-container")) {
    loadJsonDataItems();
  }
};

const init = () => {
  domMapping();
  appendEventListeners();
  window.document.addEventListener("DOMContentLoaded", loadItems);
};

// Initialize
init();
