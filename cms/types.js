/**
 * @bootstrapp/cms - Type Extensions
 * Adds CMS-specific field types for content management
 */

/**
 * Rich text field (Markdown with preview)
 * Usage:
 *   T.richText()                        // Default markdown editor
 *   T.richText({ editor: "wysiwyg" })   // WYSIWYG editor
 *   T.richText({ required: true })      // Required field
 */
const createRichText = (options = {}) => {
  return {
    type: "string",
    cmsType: "richText",
    editor: options.editor || "markdown",
    persist: true,
    attribute: false,
    defaultValue: "",
    ...options,
  };
};

/**
 * Media field (image URL with picker)
 * Usage:
 *   T.media()                           // Default image picker
 *   T.media({ accept: "image/png" })    // Specific file types
 *   T.media({ maxSize: 2 * 1024 * 1024 }) // 2MB limit
 */
const createMedia = (options = {}) => {
  return {
    type: "string",
    cmsType: "media",
    accept: options.accept || "image/*",
    maxSize: options.maxSize || 5 * 1024 * 1024, // 5MB default
    persist: true,
    attribute: false,
    defaultValue: "",
    ...options,
  };
};

/**
 * SEO object field with meta title, description, and og:image
 * Usage:
 *   T.seo()                             // Default SEO fields
 *   T.seo({ required: true })           // Required SEO
 */
const createSeo = (options = {}) => {
  return {
    type: "object",
    cmsType: "seo",
    persist: true,
    attribute: false,
    defaultValue: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      ...(options.defaultValue || {}),
    },
    ...options,
  };
};

/**
 * Publishing status enum
 * Usage:
 *   T.publishStatus()                   // Default: draft
 *   T.publishStatus({ defaultValue: "published" })
 */
const createPublishStatus = (options = {}) => {
  return {
    type: "string",
    cmsType: "publishStatus",
    persist: true,
    attribute: true,
    defaultValue: options.defaultValue || "draft",
    enum: ["draft", "published", "scheduled"],
    index: true,
    ...options,
  };
};

/**
 * CMS types extension object
 * Register with T.registerExtension(cmsTypes)
 */
const cmsTypes = {
  types: {
    richText: createRichText,
    media: createMedia,
    seo: createSeo,
    publishStatus: createPublishStatus,
  },
};

export default cmsTypes;
export { createRichText, createMedia, createSeo, createPublishStatus };
