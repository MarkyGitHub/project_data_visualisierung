"use strict";

// Ein paar Daten für die Darstellung
const settings = {
  elements: {},
  jsonData: "./assets/data/json/sample-data.json",
  urlParams: new URLSearchParams(window.location.search)
};

export default settings;
// Benannten Export, um beim Import leichter auf das Objekt zugreifen zu könnne
export let elements = settings.elements;
