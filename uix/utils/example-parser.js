export function extractExamplesFromComments(sourceCode) {
  const matches = sourceCode.match(/\/\*\*([\s\S]*?)\*\//g);
  if (!matches || matches.length === 0) return [];

  const lastComment = matches[matches.length - 1];
  const docstring = lastComment.replace(/^\/\*\*/, "").replace(/\*\/$/, "");
  const examples = [];
  const exampleRegex = /@example\s+([^\n]*)\n([\s\S]*?)(?=\n\s*\*\s*@(?:example|component|category|tag|param|returns|prop|slot|part|event)\b|$)/g;
  let match;

  while ((match = exampleRegex.exec(docstring)) !== null) {
    const title = match[1].replace(/^\s*\*\s?/, '').trim();
    const content = match[2]
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, ""))
      .join("\n")
      .trim();

    const codeBlocks = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let codeMatch;

    while ((codeMatch = codeRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: codeMatch[1] || "html",
        code: codeMatch[2].trim(),
      });
    }

    const description = content.split("```")[0].trim();

    if (codeBlocks.length > 0) {
      examples.push({
        title: title || `Example ${examples.length + 1}`,
        description: description || null,
        codeBlocks,
      });
    }
  }

  return examples;
}

export function extractDescription(sourceCode) {
  const matches = sourceCode.match(/\/\*\*([\s\S]*?)\*\//g);
  if (!matches || matches.length === 0) return "";

  const lastComment = matches[matches.length - 1];
  const docstring = lastComment.replace(/^\/\*\*/, "").replace(/\*\/$/, "");

  const lines = docstring.split("\n");
  const descLines = [];

  for (const line of lines) {
    const cleaned = line.replace(/^\s*\*\s?/, "").trim();

    if (cleaned.startsWith("@")) break;

    if (descLines.length === 0 && !cleaned) continue;

    descLines.push(cleaned);
  }

  return descLines.join("\n").trim();
}

export function extractMetadataTags(sourceCode) {
  const matches = sourceCode.match(/\/\*\*([\s\S]*?)\*\//g);
  if (!matches || matches.length === 0) return {};

  const lastComment = matches[matches.length - 1];
  const docstring = lastComment.replace(/^\/\*\*/, "").replace(/\*\/$/, "");
  const metadata = {};

  const tagMatch = docstring.match(/@tag\s+(\S+)/);
  if (tagMatch) metadata.tag = tagMatch[1];

  const categoryMatch = docstring.match(/@category\s+(\S+)/);
  if (categoryMatch) metadata.category = categoryMatch[1];

  metadata.isComponent = /@component/.test(docstring);

  return metadata;
}

export function extractParts(sourceCode) {
  const matches = sourceCode.match(/\/\*\*([\s\S]*?)\*\//g);
  if (!matches || matches.length === 0) return [];

  const lastComment = matches[matches.length - 1];
  const docstring = lastComment.replace(/^\/\*\*/, "").replace(/\*\/$/, "");
  const parts = [];
  const partRegex = /@part\s+(\S+)\s+-\s+(.+?)(?=\n\s*[@*]|$)/gm;
  let match;

  while ((match = partRegex.exec(docstring)) !== null) {
    parts.push({
      name: match[1].trim(),
      description: match[2].trim(),
    });
  }

  return parts;
}

export function extractSlots(sourceCode) {
  const matches = sourceCode.match(/\/\*\*([\s\S]*?)\*\//g);
  if (!matches || matches.length === 0) return [];

  const lastComment = matches[matches.length - 1];
  const docstring = lastComment.replace(/^\/\*\*/, "").replace(/\*\/$/, "");
  const slots = [];
  const slotRegex = /@slot\s+([^\s-]*)\s*-?\s*(.*)$/gm;
  let match;

  while ((match = slotRegex.exec(docstring)) !== null) {
    const name = match[1].trim();
    const description = match[2].trim();

    slots.push({
      name: name || "default",
      description: description || "Default slot",
    });
  }

  return slots;
}
