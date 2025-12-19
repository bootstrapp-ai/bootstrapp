
export async function discoverSchemaModules(projectPackageJson) {
  const modules = [];
  const deps = {
    ...projectPackageJson.dependencies,
    ...projectPackageJson.devDependencies,
  };

  for (const [depName] of Object.entries(deps)) {
    if (!depName.startsWith("@bootstrapp/")) continue;

    try {
      const pkgRes = await fetch(`/node_modules/${depName}/package.json`);
      if (!pkgRes.ok) continue;

      const pkg = await pkgRes.json();

      if (pkg?.bootstrapp?.schema === true) {
        const moduleName = depName.replace("@bootstrapp/", "");
        modules.push({
          name: moduleName,
          packageName: depName,
          namespace: pkg.bootstrapp.namespace !== false,
        });
      }
    } catch (e) {
      console.warn(`Failed to check schema for ${depName}:`, e);
    }
  }

  return modules;
}

export function namespaceModels(models, namespace) {
  if (!namespace) return models;

  const namespaced = {};
  const modelNames = Object.keys(models);

  for (const [modelName, modelDef] of Object.entries(models)) {
    const namespacedName = `${namespace}_${modelName}`;
    namespaced[namespacedName] = updateRelationshipRefs(
      { ...modelDef },
      namespace,
      modelNames
    );
  }

  return namespaced;
}

export function namespaceData(data, namespace) {
  if (!namespace) return data;

  const namespaced = {};

  for (const [modelName, records] of Object.entries(data)) {
    const namespacedName = `${namespace}_${modelName}`;
    namespaced[namespacedName] = records;
  }

  return namespaced;
}

function updateRelationshipRefs(modelDef, namespace, modelNames) {
  const updated = { ...modelDef };

  for (const [fieldName, fieldDef] of Object.entries(updated)) {
    if (!fieldDef || typeof fieldDef !== "object") continue;

    // Handle T.belongs, T.many, T.one, T.belongs_many relationships
    if (fieldDef.targetModel && modelNames.includes(fieldDef.targetModel)) {
      updated[fieldName] = {
        ...fieldDef,
        targetModel: `${namespace}_${fieldDef.targetModel}`,
      };
    }
  }

  return updated;
}
