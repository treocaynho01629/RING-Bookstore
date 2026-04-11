import fs from "node:fs/promises";
import path from "node:path";

const sourceUrl = "http://localhost:8080/v3/api-docs";
const outputFile = "./.orval/openapi.sanitized.json";

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to download OpenAPI doc (${response.status}) from ${sourceUrl}`);
}

const spec = await response.json();
const schemes = spec?.components?.securitySchemes;

// Spring docs may include `name` for HTTP bearer schemes, which is invalid OpenAPI for type=http.
if (schemes && typeof schemes === "object") {
  for (const scheme of Object.values(schemes)) {
    if (scheme && typeof scheme === "object" && scheme.type === "http") {
      delete scheme.name;
    }
  }
}

const outputPath = path.resolve(outputFile);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(spec, null, 2), "utf8");

console.log(`Sanitized OpenAPI saved to ${outputPath}`);
