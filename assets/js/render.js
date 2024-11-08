"use strict";

import contents from "./contents.js";
import { elements } from "./settings.js";
import dom from "./dom.js";

const render = {
  meta() {
    // Meta Information
    dom.create(
      false,
      contents.meta.author,
      "meta",
      elements.head,
      false,
      "author"
    );
    dom.create(
      false,
      contents.meta.changeDate,
      "meta",
      elements.head,
      false,
      "last-modified"
    );
    dom.create(
      false,
      contents.meta.desc,
      "meta",
      elements.head,
      false,
      "description"
    );

    // Title
    elements.title.innerHTML = contents.meta.title;
    dom.create(contents.meta.title, false, "h1", elements.header);
  },

  // Daten Cards darstellen
  renderCards(dataItems, navigateToDetailPage) {
    const container = dom.$("#data-cards-container");
    if (!container) {
      console.error(
        "Error: data-cards-container element not found in the document."
      );
      return;
    }

    container.innerHTML = "";
    for (const item of dataItems) {
      const card = dom.createCardElement(item);
      card.addEventListener("click", () => navigateToDetailPage(item.id));
      container.appendChild(card);
    }
  },

  // Render funktion um unterschiedliche Datentypen zu rendern
  renderDataItemDetails(dataItem) {
    const container = dom.$("#data-item-container");
    if (!container) return;

    container.innerHTML = "";

    switch (dataItem.type) {
      case "text":
        this.renderTextData(dataItem, container);
        break;
      case "image":
        this.renderImageData(dataItem, container);
        break;
      case "video":
        this.renderVideoData(dataItem, container);
        break;
      case "numerical":
        this.renderNumericalData(dataItem, container);
        break;
      case "ai_result":
        this.renderAIData(dataItem, container);
        break;
      default:
        console.warn("Unknown data type:", dataItem.type);
    }
  },

  // Text Daten rendern
  renderTextData(dataItem, container) {
    container.appendChild(dom.createTitle(dataItem.title));
    const textContent = dom.create(
      dataItem.description,
      false,
      "p",
      null,
      "main-content"
    );
    container.appendChild(textContent);
    this.renderSourceLink(dataItem.sourceUrl, container);
  },

  // Bild Daten rendern
  renderImageData(dataItem, container) {
    const title = dom.create(dataItem.title, false, "h1", null);
    container.appendChild(title);

    const mainImage = dom.create(false, false, "img", null, "main-content");
    mainImage.src = dataItem.imageUrl;
    mainImage.alt = dataItem.title;
    container.appendChild(mainImage);

    const descriptionLabel = dom.create(
      "Description:",
      false,
      "h2",
      null,
      "description-label"
    );
    descriptionLabel.setAttribute("data-translate", "description");
    container.appendChild(descriptionLabel);

    const description = dom.create(
      dataItem.description,
      false,
      "p",
      null,
      "description"
    );
    container.appendChild(description);

    if (dataItem.annotations && dataItem.annotations.length > 0) {
      const annotationsLabel = dom.create(
        "Annotations:",
        false,
        "h2",
        null,
        "annotations-label"
      );
      container.appendChild(annotationsLabel);
      const annotationsContent = dom.create(
        dataItem.annotations.join(", "),
        false,
        "p",
        null,
        "annotations-content"
      );
      container.appendChild(annotationsContent);
    }

    this.renderSourceLink(dataItem.sourceUrl, container);
  },

  // Video Daten rendern
  renderVideoData(dataItem, container) {
    // Title at the top
    const title = dom.create(dataItem.title, false, "h1", null);
    container.appendChild(title);

    let mainVideo;

    // Youtube URL validieren
    const youtubeMatch = dataItem.videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&?]+)/
    );
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      mainVideo = document.createElement("iframe");
      mainVideo.src = `https://www.youtube.com/embed/${videoId}`;
      mainVideo.width = "100%";
      mainVideo.height = "315";
      mainVideo.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      mainVideo.allowFullscreen = true;
    } else {
      // Nicht-YouTube URLs als standard video
      mainVideo = dom.create(false, false, "video", null, "main-content");
      mainVideo.src = dataItem.videoUrl;
      mainVideo.controls = true;
    }

    container.appendChild(mainVideo);

    const descriptionLabel = dom.create(
      "Description:",
      false,
      "h2",
      null,
      "description-label"
    );
    descriptionLabel.setAttribute("data-translate", "description");
    container.appendChild(descriptionLabel);

    const description = dom.create(
      dataItem.description,
      false,
      "p",
      null,
      "description"
    );
    container.appendChild(description);

    this.renderSourceLink(dataItem.sourceUrl, container);
  },

  // Numerische Daten darstellen
  renderNumericalData(dataItem, container) {
    const title = dom.create(dataItem.title, false, "h1", null);
    container.appendChild(title);

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const canvas = document.createElement("canvas");
    chartContainer.appendChild(canvas);
    container.appendChild(chartContainer);

    const labels = dataItem.dataPoints.map(
      (point) => point.quarter || point.date
    );
    const values = dataItem.dataPoints.map((point) => point.value);
    const chartType =
      dataItem.visualizationType === "line_chart" ? "line" : "bar";

    // Numerische Daten mit Chart.js darstellen
    new Chart(canvas, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: dataItem.title,
            data: values,
            backgroundColor:
              chartType === "bar"
                ? "rgba(75, 192, 192, 0.2)"
                : "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: chartType === "line",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: chartType === "line" ? "Quarter" : "Date",
            },
          },
          y: { title: { display: true, text: "Value" } },
        },
      },
    });

    const descriptionLabel = dom.create(
      "Description:",
      false,
      "h2",
      null,
      "description-label"
    );
    descriptionLabel.setAttribute("data-translate", "description");
    container.appendChild(descriptionLabel);

    const description = dom.create(
      dataItem.description,
      false,
      "p",
      null,
      "description"
    );
    container.appendChild(description);

    this.renderSourceLink(dataItem.sourceUrl, container);
  },

  // AI Ergebnis darstellen
  renderAIData(dataItem, container) {
    const title = dom.create(dataItem.title, false, "h1", null);
    container.appendChild(title);

    // Daten nach AI model Typ darstellen
    switch (dataItem.modelType) {
      case "sentiment_analysis":
        this.renderSentimentAnalysis(dataItem, container);
        break;
      case "image_classification":
        this.renderImageClassification(dataItem, container);
        break;
      case "object_detection":
        this.renderObjectDetection(dataItem, container);
        break;
      default:
        console.warn("Unknown AI model type:", dataItem.modelType);
    }

    const descriptionLabel = dom.create(
      "Description:",
      false,
      "h2",
      null,
      "description-label"
    );
    descriptionLabel.setAttribute("data-translate", "description"); // For localization
    container.appendChild(descriptionLabel);

    const description = dom.create(
      dataItem.description,
      false,
      "p",
      null,
      "description"
    );
    container.appendChild(description);

    this.renderSourceLink(dataItem.sourceUrl, container);
  },

  // Ai Ergebnis rendern
  renderSentimentAnalysis(dataItem, container) {
    const sentimentContainer = document.createElement("div");
    sentimentContainer.className = "sentiment-analysis-container";

    for (const result of dataItem.results) {
      const sentimentCard = document.createElement("div");
      sentimentCard.className = "sentiment-card";

      const reviewText = dom.create(
        `"${result.review}"`,
        false,
        "p",
        null,
        "review-text"
      );
      const sentimentLabel = dom.create(
        `Sentiment: ${result.sentiment}`,
        false,
        "p",
        null,
        "sentiment-label"
      );
      sentimentLabel.classList.add(result.sentiment.toLowerCase());

      const confidenceLabel = dom.create(
        `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        false,
        "p",
        null,
        "confidence-label"
      );

      sentimentCard.append(reviewText, sentimentLabel, confidenceLabel);
      sentimentContainer.appendChild(sentimentCard);
    }

    container.appendChild(sentimentContainer);
  },

  // Ai Ergebnis rendern
  renderImageClassification(dataItem, container) {
    const aiContainer = document.createElement("div");
    aiContainer.className = "ai-results-container";

    for (const result of dataItem.results) {
      const resultCard = document.createElement("div");
      resultCard.className = "result-card";

      const img = dom.create(false, false, "img", null, "ai-result-image");
      img.src = result.image;
      img.alt = `Image classified as ${result.category}`;

      const categoryLabel = dom.create(
        `Category: ${result.category}`,
        false,
        "p",
        null,
        "category-label"
      );
      const confidenceLabel = dom.create(
        `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        false,
        "p",
        null,
        "confidence-label"
      );

      resultCard.append(img, categoryLabel, confidenceLabel);
      aiContainer.appendChild(resultCard);
    }

    container.appendChild(aiContainer);
  },

  // Ai Ergebnis rendern
  renderObjectDetection(dataItem, container) {
    const objectContainer = document.createElement("div");
    objectContainer.className = "object-detection-container";

    for (const result of dataItem.results) {
      const objectCard = document.createElement("div");
      objectCard.className = "object-card";

      const objectLabel = dom.create(
        `Object: ${result.object}`,
        false,
        "p",
        null,
        "object-label"
      );
      const confidenceLabel = dom.create(
        `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        false,
        "p",
        null,
        "confidence-label"
      );

      objectCard.append(objectLabel, confidenceLabel);
      objectContainer.appendChild(objectCard);
    }

    container.appendChild(objectContainer);
  },

  // Link unterhalb der Darstellung rendern
  renderSourceLink(url, container) {
    const link = dom.create("Zur Webquelle", false, "a", null, "source-link");
    link.href = url;
    link.target = "_blank";
    link.setAttribute("data-translate", "source-link");
    container.appendChild(link);
  },
};

export default render;
