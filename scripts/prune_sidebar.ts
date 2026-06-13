import { Project, SyntaxKind, VariableDeclaration } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/shared/constants/sidebarVisibility.ts");
const sourceFile = project.getSourceFileOrThrow("sidebarVisibility.ts");

// We only want to keep these HideableSidebarItemId's
const KEEP_SIDEBAR_ITEMS = [
  "home",
  "api-manager",
  "endpoints",
  "providers",
  "quota",
  "settings",
  "settings-general",
  "settings-routing"
];

const decl = sourceFile.getVariableDeclaration("HIDEABLE_SIDEBAR_ITEM_IDS");
if (decl) {
  const init = decl.getInitializerIfKind(SyntaxKind.AsExpression);
  if (init) {
    const arrayLit = init.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression);
    if (arrayLit) {
      const elements = arrayLit.getElements();
      for (const el of elements) {
        if (el.getKind() === SyntaxKind.StringLiteral) {
          const val = el.getText().slice(1, -1);
          if (!KEEP_SIDEBAR_ITEMS.includes(val)) {
            arrayLit.removeElement(el);
          }
        }
      }
    }
  }
}

// Keep only home, omni-proxy, configuration in SIDEBAR_SECTIONS
const sectionsDecl = sourceFile.getVariableDeclaration("SIDEBAR_SECTIONS");
if (sectionsDecl) {
  const init = sectionsDecl.getInitializerIfKind(SyntaxKind.AsExpression);
  if (init) {
    const arrayLit = init.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression);
    if (arrayLit) {
      const elements = arrayLit.getElements();
      for (const el of elements) {
        if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
          const obj = el.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
          const idProp = obj.getProperty("id");
          if (idProp && idProp.getKind() === SyntaxKind.PropertyAssignment) {
            const idVal = idProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()?.getText().slice(1, -1);
            if (idVal !== "home" && idVal !== "omni-proxy" && idVal !== "configuration") {
              arrayLit.removeElement(el);
            } else if (idVal === "omni-proxy") {
              // Modify its children to only be [...OMNI_PROXY_ITEMS]
              const childrenProp = obj.getProperty("children");
              if (childrenProp && childrenProp.getKind() === SyntaxKind.PropertyAssignment) {
                childrenProp.asKindOrThrow(SyntaxKind.PropertyAssignment).setInitializer("[...OMNI_PROXY_ITEMS]");
              }
            }
          }
        }
      }
    }
  }
}

// Modify OMNI_PROXY_ITEMS to only have "endpoints", "api-manager", "providers", "quota"
const proxyItemsDecl = sourceFile.getVariableDeclaration("OMNI_PROXY_ITEMS");
if (proxyItemsDecl) {
  const init = proxyItemsDecl.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression) || proxyItemsDecl.getInitializerIfKind(SyntaxKind.AsExpression)?.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression);
  if (init && init.getKind() === SyntaxKind.ArrayLiteralExpression) {
    const elements = init.getElements();
    for (const el of elements) {
      if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const obj = el.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const idProp = obj.getProperty("id");
        if (idProp && idProp.getKind() === SyntaxKind.PropertyAssignment) {
          const idVal = idProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()?.getText().slice(1, -1);
          if (!["endpoints", "api-manager", "providers", "quota"].includes(idVal!)) {
            init.removeElement(el);
          }
        }
      }
    }
  }
}

// Modify CONFIGURATION_ITEMS to only have "settings", "settings-general", "settings-routing"
const configItemsDecl = sourceFile.getVariableDeclaration("CONFIGURATION_ITEMS");
if (configItemsDecl) {
  const init = configItemsDecl.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression) || configItemsDecl.getInitializerIfKind(SyntaxKind.AsExpression)?.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression);
  if (init && init.getKind() === SyntaxKind.ArrayLiteralExpression) {
    const elements = init.getElements();
    for (const el of elements) {
      if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const obj = el.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const idProp = obj.getProperty("id");
        if (idProp && idProp.getKind() === SyntaxKind.PropertyAssignment) {
          const idVal = idProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()?.getText().slice(1, -1);
          if (!["settings", "settings-general", "settings-routing"].includes(idVal!)) {
            init.removeElement(el);
          }
        }
      }
    }
  }
}

sourceFile.saveSync();
console.log("Sidebar pruned");
