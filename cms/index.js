/**
 * @bootstrapp/cms - Content Management System
 *
 * Provides CMS features for content models:
 * - Rich text editing (Markdown)
 * - Media library with upload
 * - SEO fields with preview
 * - Publishing workflow (draft/published/scheduled)
 *
 * Usage:
 *   // In frontend.js - register types and plugin
 *   import "@bootstrapp/cms";
 *
 *   // In schema.js - use CMS types
 *   import { cmsModels, cmsFields } from "@bootstrapp/cms/schema.js";
 *
 *   $APP.models.set({
 *     ...cmsModels, // Adds cms_media model
 *     posts: {
 *       $cms: true, // Enable CMS features
 *       ...cmsFields, // Add status, publishedAt, scheduledAt, seo
 *       title: T.string({ required: true }),
 *       body: T.richText(), // Uses CMS rich text editor
 *       image: T.media(),   // Uses CMS media picker
 *     }
 *   });
 */

import T from "/$app/types/index.js";
import cmsTypes from "./types.js";

// Register CMS types with the type system
T.registerExtension(cmsTypes);

// Import and register the admin plugin
import "./plugin.js";

// Re-export schema helpers
export { cmsFields, cmsModels } from "./schema.js";

console.log("[CMS] Package initialized");
