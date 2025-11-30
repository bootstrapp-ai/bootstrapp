import T from "@bootstrapp/types";
import { html } from "lit-html";
import $APP from "/app";
export default {
  properties: {
    pageTitle: T.string(),
    description: T.string(),
    imageUrl: T.string("/assets/cover.png"),
    canonicalUrl: T.string(),
    structuredData: T.object(),
  },
  connected() {
    this.updateSeoTags();
  },
  updated() {
    this.updateSeoTags();
  },
  updateSeoTags() {
    const { pageTitle, description, imageUrl, canonicalUrl, structuredData } =
      this;
    const siteName = "MCP Discover";
    const defaultDescription =
      "Browse, experiment, develop, and discuss all things MCP.";

    document.title = pageTitle ? `${pageTitle} | ${siteName}` : siteName;

    this._upsertMetaTag(
      "name",
      "description",
      description || defaultDescription,
    );
    const finalUrl =
      canonicalUrl ||
      $APP.settings.url + window.location.pathname ||
      window.location.href;
    this._upsertLinkTag("rel", "canonical", finalUrl);

    this._upsertMetaTag("property", "og:title", pageTitle || siteName);
    this._upsertMetaTag(
      "property",
      "og:description",
      description || defaultDescription,
    );
    this._upsertMetaTag("property", "og:url", finalUrl);
    this._upsertMetaTag("property", "og:type", "website");
    if (imageUrl) {
      this._upsertMetaTag("property", "og:image", imageUrl);
    }

    // 5. Update Twitter Card tags
    this._upsertMetaTag("name", "twitter:card", "summary_large_image");
    this._upsertMetaTag("name", "twitter:title", pageTitle || siteName);
    this._upsertMetaTag(
      "name",
      "twitter:description",
      description || defaultDescription,
    );
    if (imageUrl) {
      this._upsertMetaTag("name", "twitter:image", imageUrl);
    }

    // 6. NEW: Update JSON-LD Structured Data
    this._upsertStructuredData(structuredData);
  },

  /**
   * Helper to create or update a <meta> tag in the head.
   * @param {string} keyName - The attribute to select by (e.g., 'name', 'property').
   * @param {string} keyValue - The value of the keyName attribute.
   * @param {string} content - The value for the 'content' attribute.
   */
  _upsertMetaTag(keyName, keyValue, content) {
    if (!content) return;
    let element = document.head.querySelector(`meta[${keyName}="${keyValue}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(keyName, keyValue);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  },

  /**
   * Helper to create or update a <link> tag in the head.
   * @param {string} keyName - The attribute to select by (e.g., 'rel').
   * @param {string} keyValue - The value of the keyName attribute.
   * @param {string} href - The value for the 'href' attribute.
   */
  _upsertLinkTag(keyName, keyValue, href) {
    if (!href) return;
    let element = document.head.querySelector(`link[${keyName}="${keyValue}"]`);
    if (!element) {
      element = document.createElement("link");
      element.setAttribute(keyName, keyValue);
      document.head.appendChild(element);
    }
    element.setAttribute("href", href);
  },

  /**
   * NEW: Helper to create, update, or remove a <script type="application/ld+json"> tag.
   * @param {object} jsonData - The JSON object for the structured data.
   */
  _upsertStructuredData(jsonData) {
    const selector = 'script[type="application/ld+json"]';
    let element = document.head.querySelector(selector);

    // If no JSON data is provided, remove the tag if it exists.
    if (!jsonData || Object.keys(jsonData).length === 0) {
      if (element) {
        element.remove();
      }
      return;
    }

    // If the tag doesn't exist, create and append it.
    if (!element) {
      element = document.createElement("script");
      element.setAttribute("type", "application/ld+json");
      document.head.appendChild(element);
    }

    // Set the content of the script tag.
    element.textContent = JSON.stringify(jsonData, null, 2);
  },

  // This component does not render any visible output.
  render() {
    return html``;
  },
};
