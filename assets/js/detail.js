"use strict";

import render from "./render.js";
import settings, { elements } from "./settings.js";
let dataId = parseInt(settings.urlParams.get("id")) || 1; 
let currentIndex = 0;

// FUNKTIONEN
const domMapping = () => {
  elements.elSelThem = document.querySelector("#theme-selector");
  elements.elSelLang = document.querySelector("#language-selector");
  elements.nextButton = document.querySelector("#next-button");
  elements.prevButton = document.querySelector("#prev-button");
  elements.backButton = document.querySelector("#back-to-list");
};

// Auf die Start Seite gehen
const navigateBackToList = () => {
  window.location.href = "index.html";
};

// JSON Daten laden und den eintrag mit der ID anzeigen
const fetchDataItems = async () => {
  try {
    const response = await fetch(settings.jsonData);
    const data = await response.json();
    elements.allDataItems = data.dataItems;
    
    currentIndex = elements.allDataItems.findIndex((item) => item.id === dataId);
    if (currentIndex === -1) {
      console.warn(`Daten mit ID ${dataId} nicht gefunden.`);
      currentIndex = 0;
    }

    displayCurrentItem();
  } catch (error) {
    console.error("Fehler beim laden der Daten:", error);
    document.querySelector("#data-item-container").innerHTML = "<p>Fehler beim laden der Daten.</p>";
  }
};

// Daten laden nach der Index
const displayCurrentItem = () => {
  const dataItem = elements.allDataItems[currentIndex];
  if (dataItem) {
    render.renderDataItemDetails(dataItem);
  } else {
    document.querySelector("#data-item-container").innerHTML = "<p>Daten nicht gefunden.</p>";
  }
};

// Button handler
const goToNextItem = () => {
  currentIndex = (currentIndex + 1) % elements.allDataItems.length;
  displayCurrentItem();
};

// Button handler
const goToPreviousItem = () => {
  currentIndex = (currentIndex - 1 + elements.allDataItems.length) % elements.allDataItems.length;
  displayCurrentItem();
};

// Event Listener hinzufügen
const appendEventListeners = () => {
  if (elements.elSelThem) {
    elements.elSelThem.addEventListener("change", (ev) => switchTheme(ev.target.value));
  }
  if (elements.elSelLang) {
    elements.elSelLang.addEventListener("change", (ev) => switchLanguage(ev.target.value));
  }
  if (elements.nextButton) {
    elements.nextButton.addEventListener("click", goToNextItem);
  }
  if (elements.prevButton) {
    elements.prevButton.addEventListener("click", goToPreviousItem);
  }
  if (elements.backButton) {
    elements.backButton.addEventListener("click", navigateBackToList);
  }
};

// Theme ändern
const switchTheme = (theme) => {
  document.documentElement.className = theme;
  localStorage.setItem("selectedTheme", theme);
};

// Sparache ändern
const switchLanguage = async (lang) => {
  localStorage.setItem("selectedLanguage", lang);
  const translations = await fetch(`languages/${lang}.json`).then((res) => res.json());

  for (const el of document.querySelectorAll("[data-translate]")) {
    const key = el.getAttribute("data-translate");
    if (translations[key]) {
      el.textContent = translations[key];
    }
  }
};

// Anwendung initializieren
const init = () => {
  domMapping();
  appendEventListeners();
  fetchDataItems();
};

// Anwendung starten
init();
