"use strict";

import render from "./render.js";
import settings, { elements } from "./settings.js";

// KONSTANTEN / VARIABLEN
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

// Theme ändern
const switchTheme = (theme) => {
  document.documentElement.className = theme;
  localStorage.setItem("selectedTheme", theme);
};

// Sparache ändern
const switchLanguage = async (lang) => {
  localStorage.setItem("selectedLanguage", lang);
  const translations = await fetch(`languages/${lang}.json`).then((res) =>
    res.json()
  );

  const elements = document.querySelectorAll("[data-translate]");
  for (const el of elements) {
    const key = el.getAttribute("data-translate");
    if (translations[key]) {
      if (el.tagName === "INPUT" && el.placeholder) {
        el.placeholder = translations[key];
      } else {
        el.textContent = translations[key];
      }
    }
  }
};

// JSON Daten laden und an die render Methode übergeben
const handleLoadedData = (evt) => {
  const xhr = evt.target;

  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    elements.allDataItems = data.dataItems;
    elements.originalOrder = [...elements.allDataItems];
    render.renderCards(elements.allDataItems, navigateToDetailPage);
  } else {
    console.warn(
      `${xhr.responseURL} kann nicht geladen werden. Status: ${xhr.statusText}`
    );
  }
};

// Auf die Detail Siche weiterleiten
const navigateToDetailPage = (dataId) => {
  window.location.href = `detail.html?id=${dataId}`;
};

// Daten nach Typ filtern und neu rendern
const filterCards = (evnt) => {
  const selectedType = evnt.target.value;
  const filteredDataItems =
    selectedType === "all"
      ? elements.allDataItems
      : elements.allDataItems.filter((item) => item.type === selectedType);

  render.renderCards(filteredDataItems, navigateToDetailPage);
};

// Nach Title filtern und neu rendern
const filterCardsByTitle = (evnt) => {
  const titleSearch = evnt.target.value.toLowerCase();
  const filteredByTitle = elements.allDataItems.filter((item) =>
    item.title.toLowerCase().includes(titleSearch)
  );

  render.renderCards(filteredByTitle, navigateToDetailPage);
};

// Sortier Knopf umschaltenzwischen A-Z, Z-A, und unsortiert
const toggleSort = () => {
  if (elements.sortState === "asc") {
    elements.sortState = "desc";
    elements.elSortButton.textContent = "Sortieren nach Title: Z-A";
  } else if (elements.sortState === "desc") {
    elements.sortState = "none";
    elements.elSortButton.textContent = "Unsortiert";
  } else {
    elements.sortState = "asc";
    elements.elSortButton.textContent = "Sortieren nach Title: A-Z";
  }

  applySort();
};

// Sortieren nach der dem Sortier Wert und neu rendern
const applySort = () => {
  let sortedItems = [...elements.allDataItems];

  if (elements.sortState === "asc") {
    sortedItems.sort((a, b) => a.title.localeCompare(b.title));
  } else if (elements.sortState === "desc") {
    sortedItems.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    sortedItems = [...elements.originalOrder];
  }

  render.renderCards(sortedItems, navigateToDetailPage);
};

// Event Listener hinzufügen
const appendEventListeners = () => {
  if (elements.elSelfilCrds) {
    elements.elSelfilCrds.addEventListener("change", filterCards);
  }
  if (elements.elSelThem) {
    elements.elSelThem.addEventListener("change", (ev) =>
      switchTheme(ev.target.value)
    );
  }
  if (elements.elSelLang) {
    elements.elSelLang.addEventListener("change", (ev) =>
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

// JSON Daten laden
const loadJsonDataItems = () => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", settings.jsonData, true);
  xhr.addEventListener("load", handleLoadedData);
  xhr.send();
};

// Aus local storage Theme, Sprache laden und aus Json Daten laden
const loadItems = () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "theme-default";
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  switchTheme(savedTheme);
  switchLanguage(savedLanguage);

  if (document.querySelector("#data-cards-container")) {
    loadJsonDataItems();
  }
};

// Anwendung initializieren
const init = () => {
  domMapping();
  appendEventListeners();
  window.document.addEventListener("DOMContentLoaded", loadItems);
};

// Anwendung starten
init();
