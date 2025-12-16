/**
 * @bootstrapp/cms - Schema Definitions
 * Provides the media model and CMS-specific field definitions
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";

/**
 * Get all CMS-enabled models from the app schema
 * @returns {string[]} Array of model names that have $cms: true
 */
export const getCmsModels = () => {
  return Object.entries($APP.models)
    .filter(([_, schema]) => schema.$cms === true)
    .map(([name]) => name);
};

/**
 * CMS models schema
 * Projects can merge this into their own models via Object spread
 *
 * Usage:
 *   import { cmsModels } from "@bootstrapp/cms/schema.js";
 *   $APP.models.set({ ...cmsModels, ...myModels });
 */
export const cmsModels = {
  /**
   * Media library model
   * Stores uploaded media files (images, documents, etc.)
   */
  cms_media: {
    id: T.string({ required: true }),
    url: T.string({ required: true }),
    name: T.string({ required: true }),
    alt: T.string({ defaultValue: "" }),
    size: T.number({ defaultValue: 0 }),
    type: T.string({ defaultValue: "image/jpeg" }),
    width: T.number(),
    height: T.number(),
    folder: T.string({ defaultValue: "", index: true }),
    tags: T.array({ defaultValue: [], index: true }),
    createdAt: T.string({ required: true, index: true }),
    updatedAt: T.string({ index: true }),
  },
};

/**
 * CMS field mixin for content models
 * Add these fields to any model that needs CMS features
 *
 * Usage:
 *   import { cmsFields } from "@bootstrapp/cms/schema.js";
 *   $APP.models.set({
 *     posts: {
 *       $cms: true,
 *       ...cmsFields,
 *       title: T.string({ required: true }),
 *       // ... other fields
 *     }
 *   });
 */
export const cmsFields = {
  // Publishing workflow
  status: T.string({
    defaultValue: "draft",
    enum: ["draft", "published", "scheduled"],
    index: true,
  }),
  publishedAt: T.string({ index: true }),
  scheduledAt: T.string({ index: true }),

  // SEO fields
  seo: T.object({
    attribute: false,
    defaultValue: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    },
  }),
};

export default { cmsModels, cmsFields };
