import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/shared/constants/providers.ts");

const sourceFile = project.getSourceFileOrThrow("providers.ts");

function pruneObject(varName: string, keepKeys: string[]) {
  const decl = sourceFile.getVariableDeclaration(varName);
  if (!decl) return;
  const initializer = decl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
  if (!initializer) return;

  const properties = initializer.getProperties();
  for (const prop of properties) {
    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      const propAssign = prop as PropertyAssignment;
      // Get key as string without quotes
      let key = propAssign.getName();
      if (key.startsWith('"') || key.startsWith("'")) {
        key = key.slice(1, -1);
      }
      if (!keepKeys.includes(key)) {
        prop.remove();
      }
    }
  }
}

pruneObject("NOAUTH_PROVIDERS", ["opencode"]);
pruneObject("OAUTH_PROVIDERS", ["github", "antigravity", "agy"]);
pruneObject("WEB_COOKIE_PROVIDERS", []);
pruneObject("APIKEY_PROVIDERS", ["bluesminds", "gemini", "nvidia", "ollama-cloud", "reka", "tavily-search", "command-code"]);

sourceFile.saveSync();
console.log("Pruned providers successfully");
