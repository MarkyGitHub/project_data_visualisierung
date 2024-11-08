"use strict";

// Hilfsfunktionen, um mit dem DOM zu arbeiten
import { elements } from "./settings.js";

const dom = {
  mapping() {
    elements.head = dom.$("head");
    elements.header = dom.$("header");
    elements.title = dom.$("title");
    elements.nav = dom.$("nav");
    elements.main = dom.$("main");
    elements.footer = dom.$("footer");
  },
  create(
    content = false,
    metaContent = false,
    type = "div",
    parent = false,
    className = false,
    name = false,
    src = false,
    href = false,
    target = false
  ) {
    const el = document.createElement(type);
    if (content) el.innerHTML = content;
    if (metaContent) el.content = metaContent;
    if (className) el.className = className;
    if (src) el.src = src;
    if (href) el.href = href;
    if (name) el.name = name;
    if (target) el.target = target;
    if (parent) parent.append(el);

    return el;
  },
  $(selector) {
    return document.querySelector(selector);
  },
  $$(selector) {
    return [...document.querySelectorAll(selector)];
  },
  createCardElement(item) {
    const card = dom.create(false, false, "div", null, "data-card");

    if (item.type != "text") {
      const thumbnail = dom.create(false, false, "div", card, "thumbnail");
      dom.create(
        false,
        false,
        "img",
        thumbnail,
        "thumbnail-img",
        false,
        item.thumbnail
      );
    }
    const content = dom.create(false, false, "div", card, "content");
    dom.create(item.title, false, "h3", content, "data-title");
    dom.create(item.description, false, "p", content, "data-description");

    return card;
  },

  createTitle(title) {
    return this.create(title, false, "h1", null, "data-title");
  },

  createThumbnail(thumbnailUrl, type) {
    const img = this.create(false, false, "img", null, "thumbnail");
    img.src = thumbnailUrl;
    img.alt = `${type} thumbnail`;
    return img;
  },

  createExtraFields(dataItem) {
    const extraFields = this.create(false, false, "div", null, "extra-fields");
    let content = "";

    switch (dataItem.type) {
      case "numerical":
        content =
          "<h2>Data Points</h2>" +
          dataItem.dataPoints
            .map(
              (point) =>
                `<div class="data-point"><span>${
                  point.date || point.quarter
                }</span><span>${point.value}</span></div>`
            )
            .join("");
        break;
      case "text":
        content = `<h2>Content Type</h2><p>${dataItem.contentType}
        </p><h2>Keywords</h2><p>${dataItem.keywords.join(", ")}</p>`;
        break;
      case "image":
        content = `<h2>Full Image</h2><img src="${dataItem.imageUrl}
        " alt="Full Image" class="thumbnail"><h2>Annotations</h2><p>${dataItem.annotations.join(
          ", "
        )}</p>`;
        break;
      case "video":
        content = `<h2>Video</h2><video src="${dataItem.videoUrl}
        " controls width="100%"></video><h2>Duration</h2><p>${dataItem.duration}</p>`;
        break;
      case "ai_result":
        content = `<h2>Model Type</h2><p>${dataItem.modelType}
        </p><h2>Results</h2><pre>${JSON.stringify(
          dataItem.results,
          null,
          2
        )}</pre>`;
        break;
    }

    extraFields.innerHTML = content;
    return extraFields;
  },
};

export default dom;
