
export async function loadRelationships(
  adapter,
  models,
  modelName,
  record,
  includes,
  recursive = false,
) {
  if (!includes || includes.length === 0 || !record) {
    return record;
  }

  const modelSchema = models[modelName];
  if (!modelSchema) {
    console.warn(`Relationship loader: Model "${modelName}" not found`);
    return record;
  }

  const enriched = { ...record };

  for (const relationName of includes) {
    const relationDef = modelSchema[relationName];

    if (!relationDef) {
      console.warn(
        `Relationship loader: Relationship "${relationName}" not found in model "${modelName}"`,
      );
      continue;
    }

    if (!relationDef.relationship) {
      console.warn(
        `Relationship loader: Field "${relationName}" is not a relationship`,
      );
      continue;
    }

    try {
      enriched[relationName] = await loadRelationship(
        adapter,
        models,
        modelName,
        record,
        relationName,
        relationDef,
        recursive,
      );
    } catch (error) {
      console.error(
        `Relationship loader: Error loading "${relationName}"`,
        error,
      );
      enriched[relationName] = relationDef.many ? [] : null;
    }
  }

  return enriched;
}

export async function loadRelationshipsForMany(
  adapter,
  models,
  modelName,
  records,
  includes,
  recursive = false,
) {
  if (!includes || includes.length === 0 || !records || records.length === 0) {
    return records;
  }

  return Promise.all(
    records.map((record) =>
      loadRelationships(adapter, models, modelName, record, includes, recursive),
    ),
  );
}

async function loadRelationship(
  adapter,
  models,
  modelName,
  record,
  relationName,
  relationDef,
  recursive,
) {
  const { relationship, targetModel, targetForeignKey, many } = relationDef;

  // Belongs relationship (foreign key in this model)
  if (relationship === "belongs") {
    const foreignKeyValue = record[relationName];
    if (!foreignKeyValue) return null;

    const related = await adapter.get(targetModel, foreignKeyValue);
    return related;
  }

  // Belongs Many relationship (array of foreign keys)
  if (relationship === "belongs_many") {
    const foreignKeyValues = record[relationName];
    if (!Array.isArray(foreignKeyValues) || foreignKeyValues.length === 0) {
      return [];
    }

    const allRecords = await adapter.getAll(targetModel);
    return allRecords.filter((r) => foreignKeyValues.includes(r.id));
  }

  // Has Many relationship (foreign key in target model)
  if (relationship === "many") {
    const foreignKeyField = targetForeignKey || `${modelName}Id`;

    const related = await adapter.getAll(targetModel, {
      where: { [foreignKeyField]: record.id },
    });

    return related || [];
  }

  // Has One relationship (foreign key in target model)
  if (relationship === "one") {
    const foreignKeyField = targetForeignKey || `${modelName}Id`;

    const related = await adapter.getAll(targetModel, {
      where: { [foreignKeyField]: record.id },
      limit: 1,
    });

    return related && related.length > 0 ? related[0] : null;
  }

  console.warn(
    `Relationship loader: Unknown relationship type "${relationship}"`,
  );
  return many ? [] : null;
}

export function parseIncludes(includes) {
  if (!includes || !Array.isArray(includes)) {
    return {};
  }

  const parsed = {};

  for (const include of includes) {
    const parts = include.split(".");
    const rootRelation = parts[0];

    if (!parsed[rootRelation]) {
      parsed[rootRelation] = { nested: [] };
    }

    if (parts.length > 1) {
      const nestedPath = parts.slice(1).join(".");
      parsed[rootRelation].nested.push(nestedPath);
    }
  }

  return parsed;
}

export async function loadNestedRelationships(
  adapter,
  models,
  modelName,
  records,
  includes,
) {
  if (!includes || includes.length === 0) {
    return records;
  }

  const parsedIncludes = parseIncludes(includes);
  const isArray = Array.isArray(records);
  const recordArray = isArray ? records : [records];

  // Load first level relationships
  const firstLevelIncludes = Object.keys(parsedIncludes);
  const enriched = await loadRelationshipsForMany(
    adapter,
    models,
    modelName,
    recordArray,
    firstLevelIncludes,
    false,
  );

  // Load nested relationships
  for (const [relationName, { nested }] of Object.entries(parsedIncludes)) {
    if (nested.length === 0) continue;

    const relationDef = models[modelName][relationName];
    if (!relationDef) continue;

    const targetModel = relationDef.targetModel;

    for (const record of enriched) {
      const relatedData = record[relationName];
      if (!relatedData) continue;

      // Recursively load nested relationships
      if (Array.isArray(relatedData)) {
        record[relationName] = await loadNestedRelationships(
          adapter,
          models,
          targetModel,
          relatedData,
          nested,
        );
      } else {
        record[relationName] = await loadNestedRelationships(
          adapter,
          models,
          targetModel,
          relatedData,
          nested,
        );
      }
    }
  }

  return isArray ? enriched : enriched[0];
}

export default {
  loadRelationships,
  loadRelationshipsForMany,
  loadNestedRelationships,
  parseIncludes,
};
