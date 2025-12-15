/**
 * Instagram Plugin for Admin
 * Scrape Instagram profiles and create places
 */

import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

// Instagram profile selectors (2024-2025)
// Instagram uses React with minified classes - prefer attribute/structure selectors
export const INSTAGRAM_SELECTORS = {
  // Profile picture - most stable selector
  avatar: 'header img[alt*="profile picture"], img[alt*="\'s profile picture"]',

  // Username from the page title meta tag (most reliable)
  metaTitle: 'meta[property="og:title"]',

  // Username from header - h2 is usually the username
  username: 'header section h2',

  // Verification badge - aria-label is stable
  isVerified: 'svg[aria-label="Verified"]',

  // External link in bio
  externalLink: 'header a[href*="l.instagram.com"]',

  // Stats - structure-based (fragile but common approach)
  statsSection: 'header section ul',
};

registerPlugin("instagram", {
  actions: {
    places: [
      {
        label: "Import from Instagram",
        icon: "instagram",
        handler: (context) => context.openModal("instagram-import"),
      },
    ],
  },

  modals: {
    "instagram-import": {
      title: "Import from Instagram",
      component: ({ model }) => html`
        <admin-instagram-import .model=${model}></admin-instagram-import>
      `,
    },
  },
});
