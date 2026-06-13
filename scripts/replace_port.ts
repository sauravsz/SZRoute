import fs from "fs";
import path from "path";

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === ".git" || file === "node_modules" || file === ".next" || file === "coverage") continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      if (!file.match(/\.(ts|tsx|js|jsx|json|md|yaml|yml|example|mjs)$/) && file !== ".env" && file !== ".env.example") {
        continue;
      }
      callback(filePath);
    }
  }
}

let modifiedFiles = 0;
walkDir(".", (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("21128")) {
      const newContent = content.replace(/21128/g, "21128");
      fs.writeFileSync(filePath, newContent, "utf8");
      modifiedFiles++;
    }
  } catch (err) {
    // skip unreadable files
  }
});

console.log(`Replaced 21128 with 21128 in ${modifiedFiles} files.`);
