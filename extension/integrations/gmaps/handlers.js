/**
 * Google Maps Integration - Content Script Handlers
 * DOM scraping and API interaction for Google Maps
 */

import { getPlaceData, parsePlaceList } from "./parser.js";

// Message types for Google Maps
const MSG = {
  SCRAPE_GMAPS_SEARCH: "ext:scrapeGmapsSearch",
  SCRAPE_GMAPS_DETAILS: "ext:scrapeGmapsDetails",
  GMAPS_INTERCEPTED_SEARCH: "ext:gmapsInterceptedSearch",
  GMAPS_INTERCEPTED_PLACE: "ext:gmapsInterceptedPlace",
  DATA: "ext:data",
  ERROR: "ext:error",
};

/**
 * Scrape search results from Google Maps DOM
 * Fallback method when interception doesn't work
 */
function scrapeSearchResults() {
  try {
    const results = [];

    // Google Maps search results are in a scrollable list
    // The selectors may change over time
    const searchResultContainer = document.querySelector('[role="feed"]') ||
      document.querySelector('.m6QErb.DxyBCb');

    if (!searchResultContainer) {
      return {
        type: MSG.DATA,
        data: {
          success: false,
          error: "Could not find search results container. Make sure you're on a Google Maps search page.",
        },
      };
    }

    // Find all result items
    const resultItems = searchResultContainer.querySelectorAll('[data-result-index]') ||
      searchResultContainer.querySelectorAll('.Nv2PK');

    for (const item of resultItems) {
      const place = scrapeSearchResultItem(item);
      if (place) {
        results.push(place);
      }
    }

    console.log("[GMaps] Scraped search results:", results.length);
    return {
      type: MSG.DATA,
      data: {
        success: true,
        places: results,
        count: results.length,
        source: "dom",
      },
    };
  } catch (error) {
    console.error("[GMaps] Scrape search error:", error);
    return { type: MSG.ERROR, error: error.message };
  }
}

/**
 * Scrape individual search result item from DOM
 */
function scrapeSearchResultItem(item) {
  try {
    // Name is usually in an anchor or heading
    const nameEl = item.querySelector('.qBF1Pd') ||
      item.querySelector('[class*="fontHeadlineSmall"]') ||
      item.querySelector('a[aria-label]');

    // Rating
    const ratingEl = item.querySelector('[class*="MW4etd"]') ||
      item.querySelector('span[aria-label*="stars"]');

    // Review count
    const reviewCountEl = item.querySelector('[class*="UY7F9"]') ||
      item.querySelector('span[aria-label*="reviews"]');

    // Category/type
    const categoryEl = item.querySelector('[class*="W4Efsd"]:not([class*="price"])') ||
      item.querySelector('[class*="DkEaL"]');

    // Address
    const addressEl = item.querySelector('[class*="W4Efsd"] span:not([class])');

    // Price level
    const priceEl = item.querySelector('[class*="price"]') ||
      item.querySelector('span:contains("$")');

    // Image
    const imgEl = item.querySelector('img[src*="googleusercontent"]') ||
      item.querySelector('img[src*="maps.gstatic"]');

    // Place link (contains place ID)
    const linkEl = item.querySelector('a[href*="/maps/place"]') ||
      item.querySelector('a[data-item-id]');

    const name = nameEl?.textContent?.trim() || nameEl?.getAttribute('aria-label');
    if (!name) return null;

    // Extract place ID from link if available
    let placeId = null;
    if (linkEl) {
      const href = linkEl.href || '';
      const match = href.match(/place_id[=:]([^&/]+)/) ||
        href.match(/!1s([^!]+)/) ||
        linkEl.getAttribute('data-item-id');
      if (match) {
        placeId = typeof match === 'string' ? match : match[1];
      }
    }

    // Parse rating
    let rating = null;
    if (ratingEl) {
      const ratingText = ratingEl.textContent || ratingEl.getAttribute('aria-label') || '';
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }
    }

    // Parse review count
    let reviewCount = 0;
    if (reviewCountEl) {
      const countText = reviewCountEl.textContent || '';
      const countMatch = countText.match(/\(?([\d,]+)\)?/);
      if (countMatch) {
        reviewCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
      }
    }

    return {
      name,
      rating,
      reviewCount,
      category: categoryEl?.textContent?.trim() || null,
      address: addressEl?.textContent?.trim() || null,
      priceLevel: priceEl?.textContent?.trim() || null,
      image: imgEl?.src || null,
      placeId,
    };
  } catch (error) {
    console.error("[GMaps] Error scraping item:", error);
    return null;
  }
}

/**
 * Scrape place details from Google Maps DOM
 */
function scrapeDetails() {
  try {
    // Check if we're on a place detail page
    const isDetailView = window.location.href.includes('/place/') ||
      document.querySelector('[data-attrid="title"]') ||
      document.querySelector('.DUwDvf');

    if (!isDetailView) {
      return {
        type: MSG.DATA,
        data: {
          success: false,
          error: "Not on a place detail page. Navigate to a specific place first.",
        },
      };
    }

    // Name
    const nameEl = document.querySelector('.DUwDvf') ||
      document.querySelector('[data-attrid="title"]') ||
      document.querySelector('h1');

    // Rating
    const ratingEl = document.querySelector('.F7nice span') ||
      document.querySelector('[data-attrid="kc:/local:star rating"]');

    // Review count
    const reviewCountEl = document.querySelector('.F7nice span:nth-child(2)') ||
      document.querySelector('[aria-label*="reviews"]');

    // Address
    const addressEl = document.querySelector('[data-item-id="address"]') ||
      document.querySelector('button[data-tooltip="Copy address"]');

    // Phone
    const phoneEl = document.querySelector('[data-item-id*="phone"]') ||
      document.querySelector('button[data-tooltip="Copy phone number"]');

    // Website
    const websiteEl = document.querySelector('a[data-item-id="authority"]') ||
      document.querySelector('[data-item-id="oloc"]');

    // Category
    const categoryEl = document.querySelector('button[jsaction*="category"]') ||
      document.querySelector('.DkEaL');

    // Hours
    const hoursEl = document.querySelector('[data-item-id*="hours"]') ||
      document.querySelector('[aria-label*="Hours"]');

    // Images
    const images = [];
    const imageEls = document.querySelectorAll('img[src*="googleusercontent"]');
    imageEls.forEach(img => {
      if (img.src && !images.includes(img.src)) {
        images.push({ url: img.src });
      }
    });

    // Parse rating
    let rating = null;
    if (ratingEl) {
      const ratingText = ratingEl.textContent || ratingEl.getAttribute('aria-label') || '';
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
      }
    }

    // Parse review count
    let reviewCount = 0;
    if (reviewCountEl) {
      const countText = reviewCountEl.textContent || '';
      const countMatch = countText.match(/\(?([\d,]+)\)?/);
      if (countMatch) {
        reviewCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
      }
    }

    // Extract coordinates from URL if available
    let coordinates = null;
    const urlMatch = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlMatch) {
      coordinates = {
        latitude: parseFloat(urlMatch[1]),
        longitude: parseFloat(urlMatch[2]),
      };
    }

    // Extract place ID from URL
    let placeId = null;
    const placeIdMatch = window.location.href.match(/place_id[=:]([^&/]+)/) ||
      window.location.href.match(/!1s([^!]+)/);
    if (placeIdMatch) {
      placeId = placeIdMatch[1];
    }

    const data = {
      name: nameEl?.textContent?.trim() || null,
      rating,
      reviewCount,
      address: addressEl?.textContent?.trim() || null,
      phoneNumber: phoneEl?.textContent?.trim() || null,
      website: websiteEl?.href || null,
      categories: categoryEl ? [categoryEl.textContent?.trim()] : [],
      openingHours: hoursEl?.textContent?.trim() || null,
      coordinates,
      placeId,
      images,
      url: window.location.href,
    };

    console.log("[GMaps] Scraped place details:", data);
    return {
      type: MSG.DATA,
      data: {
        success: true,
        place: data,
        source: "dom",
      },
    };
  } catch (error) {
    console.error("[GMaps] Scrape details error:", error);
    return { type: MSG.ERROR, error: error.message };
  }
}

/**
 * Register Google Maps message handlers with the core content script
 * @param {Function} addHandler - Function to register a handler: addHandler(type, handlerFn)
 */
export function register(addHandler) {
  addHandler(MSG.SCRAPE_GMAPS_SEARCH, () => scrapeSearchResults());
  addHandler(MSG.SCRAPE_GMAPS_DETAILS, () => scrapeDetails());

  console.log("[GMaps] Handlers registered");
}

/**
 * Check if current URL is a Google Maps page
 */
export function isMatch() {
  return (
    window.location.hostname.includes("google.com") &&
    window.location.pathname.includes("/maps")
  );
}

export default {
  register,
  isMatch,
  MSG,
};
