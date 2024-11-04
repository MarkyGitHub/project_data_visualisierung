"use strict";

// main.js
document.addEventListener("DOMContentLoaded", () => { 
  // Load saved theme and language
  const savedTheme = localStorage.getItem("selectedTheme") || "theme-default";
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  switchTheme(savedTheme);
  switchLanguage(savedLanguage);

  // Only load data items if #data-cards-container is present (i.e., on index.html)
  if (document.querySelector("#data-cards-container")) {
    loadDataItems();
  }
});


// Theme Switching
const switchTheme = theme => {
  document.documentElement.className = theme;
  localStorage.setItem("selectedTheme", theme);
};

// Language Switching and Translation
const switchLanguage = async lang => {
  localStorage.setItem("selectedLanguage", lang);
  const translations = await fetch(`languages/${lang}.json`).then(res => res.json());

  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    if (translations[key]) el.textContent = translations[key];
  });
};

// Load and display all data items
let allDataItems = []; // Store all data items here for easy filtering

const handleLoadedData = (evt) => {
  const xhr = evt.target;

  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    allDataItems = data.dataItems; // Store data items globally
    renderCards(allDataItems); // Display all cards initially
  } else {
    console.warn(`${xhr.responseURL} could not be loaded. Reason: ${xhr.statusText}`);
  }
};

const loadDataItems = () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', './assets/data/json/sample-data.json', true); // Adjust the path as needed
  xhr.addEventListener('load', handleLoadedData);
  xhr.send();
};

// Render cards based on provided data items
const renderCards = dataItems => {
  const container = document.querySelector("#data-cards-container");

  // Guard clause: if container is not found, log an error and return early
  if (!container) {
    console.error("Error: data-cards-container element not found in the document.");
    return;
  }

  container.innerHTML = ""; // Clear existing content

  dataItems.forEach(item => {
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

// Function to navigate to the detail page with the correct data item ID
const navigateToDetailPage = (dataId) => {
  window.location.href = `detail.html?id=${dataId}`;
};

// Filter cards based on selected type
const filterCards = (evnt) => {
  const selectedType = evnt.target.value
  // document.querySelector("#type-filter").value;
  const filteredDataItems = selectedType === "all"
    ? allDataItems // Show all items if "all" is selected
    : allDataItems.filter(item => item.type === selectedType);

  renderCards(filteredDataItems); // Render filtered cards
};

// Filter cards based on title search input
const filterCardsByTitle = () => {
  const titleSearch = document.querySelector("#title-search").value.toLowerCase();

  // Filter items by title within the already type-filtered items
  const filteredByTitle = allDataItems.filter(item =>
    item.title.toLowerCase().includes(titleSearch)
  );

  renderCards(filteredByTitle); // Render cards filtered by both type and title
};

let originalOrder = [...allDataItems]; // Stores the original unsorted order of items
let sortState = "asc"; // Initial sort state: "asc", "desc", "none"

// Toggle sorting between A-Z, Z-A, and original order
const toggleSort = () => {
  const sortButton = document.querySelector("#sort-button");

  // Toggle sort state and update button text
  if (sortState === "asc") {
    sortState = "desc";
    sortButton.textContent = "Sort by Title: Z-A";
  } else if (sortState === "desc") {
    sortState = "none";
    sortButton.textContent = "Sort by Title: Unsorted";
  } else {
    sortState = "asc";
    sortButton.textContent = "Sort by Title: A-Z";
  }

  applySort(); // Apply the current sort state to all data items
};

// Apply sorting based on the current sort state
const applySort = () => {
  let sortedItems = [...allDataItems]; // Create a shallow copy to avoid modifying the original

  if (sortState === "asc") {
    sortedItems.sort((a, b) => a.title.localeCompare(b.title)); // A-Z
  } else if (sortState === "desc") {
    sortedItems.sort((a, b) => b.title.localeCompare(a.title)); // Z-A
  } else {
    sortedItems = [...allDataItems]; // Reset to original order if sortState is "none"
  }

  renderCards(sortedItems); // Render the cards based on the current sort order
};
