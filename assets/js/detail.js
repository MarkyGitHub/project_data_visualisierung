"use strict";

// Apply saved theme and language on load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "theme-default";
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  switchTheme(savedTheme);
  switchLanguage(savedLanguage);
  fetchDataItem();
});

// Get data item ID from URL parameters, or use 1 as the default if no ID is provided
const urlParams = new URLSearchParams(window.location.search);
let dataId = urlParams.get("id") || "1"; // Default to ID 1 if no ID is provided

// Fetch and display the specific data item based on its ID
const fetchDataItem = async () => {
  try {
    const response = await fetch("assets/data/json/sample-data.json");
    const data = await response.json();
    let dataItem = data.dataItems.find(item => item.id == dataId);

    // If the specified item is not found, load the default item with ID 1
    if (!dataItem) {
      console.warn(`Data item with ID ${dataId} not found. Loading default item with ID 1.`);
      dataItem = data.dataItems.find(item => item.id == "1");
    }

    if (dataItem) {
      displayDataItem(dataItem);
    } else {
      document.querySelector("#data-item-container").innerHTML = "<p>Data item not found.</p>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelector("#data-item-container").innerHTML = "<p>Error loading data item.</p>";
  }
};

// Display data item details based on its type
const displayDataItem = (dataItem) => {
  const container = document.querySelector("#data-item-container");
  container.innerHTML = `
    <h1 data-translate="title">${dataItem.title}</h1>
    <img src="${dataItem.thumbnail}" alt="${dataItem.type} thumbnail" class="thumbnail">
    <p class="description" data-translate="description">${dataItem.description}</p>
  `;

  const extraFields = document.createElement("div");
  extraFields.className = "extra-fields";

  // Display additional fields based on data item type
  switch (dataItem.type) {
    case "numerical":
      extraFields.innerHTML = "<h2>Data Points</h2>" +
        dataItem.dataPoints.map(point => `<div class="data-point"><span>${point.date || point.quarter}</span><span>${point.value}</span></div>`).join("");
      break;
    case "text":
      extraFields.innerHTML = `<h2>Content Type</h2><p>${dataItem.contentType}</p><h2>Keywords</h2><p>${dataItem.keywords.join(", ")}</p>`;
      break;
    case "image":
      extraFields.innerHTML = `<h2>Full Image</h2><img src="${dataItem.imageUrl}" alt="Full Image" class="thumbnail"><h2>Annotations</h2><p>${dataItem.annotations.join(", ")}</p>`;
      break;
    case "video":
      extraFields.innerHTML = `<h2>Video</h2><video src="${dataItem.videoUrl}" controls width="100%"></video><h2>Duration</h2><p>${dataItem.duration}</p>`;
      break;
    case "ai_result":
      extraFields.innerHTML = `<h2>Model Type</h2><p>${dataItem.modelType}</p><h2>Results</h2><pre>${JSON.stringify(dataItem.results, null, 2)}</pre>`;
      break;
  }

  container.appendChild(extraFields);
};
