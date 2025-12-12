/**
 * @file Slug Utilities
 * @description Utilities for generating URL-friendly slugs from strings
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} str - String to slugify
 * @returns {string} URL-friendly slug
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("Café & Açaí") // "cafe-acai"
 */
export const slugify = (str) => {
  if (!str || typeof str !== "string") return "";

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric -> hyphen
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

/**
 * Generate a unique slug by checking against existing records
 * Appends -1, -2, etc. if duplicates exist
 * @param {Object} adapter - Database adapter instance
 * @param {string} model - Model name
 * @param {string} field - Slug field name
 * @param {string} value - Source value to slugify
 * @param {string|number|null} [excludeId=null] - ID to exclude from duplicate check (for edits)
 * @returns {Promise<string>} Unique slug
 * @example
 * await generateUniqueSlug(adapter, "places", "slug", "My Place") // "my-place"
 * await generateUniqueSlug(adapter, "places", "slug", "My Place") // "my-place-1" (if "my-place" exists)
 */
export const generateUniqueSlug = async (
  adapter,
  model,
  field,
  value,
  excludeId = null,
) => {
  const base = slugify(value);
  if (!base) return "";

  let candidate = base;
  let suffix = 0;

  while (true) {
    const existing = await adapter.getAll(model, {
      where: { [field]: candidate },
      limit: 1,
    });

    // No conflict, or only conflict is self (edit case)
    if (!existing.length || existing[0].id === excludeId) {
      return candidate;
    }

    suffix++;
    candidate = `${base}-${suffix}`;
  }
};

/**
 * Create reusable hooks for auto-generating slugs
 * @param {string} [sourceField="name"] - Field to generate slug from
 * @param {string} [slugField="slug"] - Field to store slug in
 * @returns {Object} Hooks object with beforeAdd and beforeEdit
 * @example
 * // In schema.js
 * import { slugHooks } from "/$app/model/slug.js";
 *
 * places: {
 *   $hooks: slugHooks("name", "slug"),
 *   name: T.string({ required: true }),
 *   slug: T.string({ index: true, immutable: true }),
 * }
 */
export const slugHooks = (sourceField = "name", slugField = "slug") => ({
  beforeAdd: async (data, { model, adapter }) => {
    if (!data[slugField] && data[sourceField]) {
      data[slugField] = await generateUniqueSlug(
        adapter,
        model,
        slugField,
        data[sourceField],
      );
    }
    return data;
  },
  beforeEdit: async (data, { model, adapter }) => {
    // Only regenerate slug if source field changed and slug not manually provided
    // Note: If slug field is immutable, it will be stripped anyway
    if (data[sourceField] && !data[slugField]) {
      data[slugField] = await generateUniqueSlug(
        adapter,
        model,
        slugField,
        data[sourceField],
        data.id,
      );
    }
    return data;
  },
});

export default { slugify, generateUniqueSlug, slugHooks };
