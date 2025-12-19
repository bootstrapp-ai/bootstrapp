
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
