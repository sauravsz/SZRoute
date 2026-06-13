import fs from "fs";
import path from "path";

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (
      file === ".git" ||
      file === "node_modules" ||
      file === ".next" ||
      file === "coverage" ||
      file === "dist" ||
      file === "dist-electron" ||
      file === ".build"
    ) {
      continue;
    }
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      if (
        !file.match(/\.(ts|tsx|js|jsx|json|md|yaml|yml|example|mjs|html|css|scss|txt)$/) &&
        file !== ".env" &&
        file !== ".env.example" &&
        file !== ".gitignore" &&
        file !== ".npmignore"
      ) {
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
    if (
      content.includes("SZRoute") ||
      content.includes("szroute") ||
      content.includes("SZROUTE") ||
      content.includes("sauravsz/SZRoute")
    ) {
      let newContent = content;
      // Specifically fix the GitHub Repo link
      newContent = newContent.replace(/diegosouzapw\/SZRoute/g, "sauravsz/SZRoute");
      // Replace others
      newContent = newContent.replace(/SZRoute/g, "SZRoute");
      newContent = newContent.replace(/szroute/g, "szroute");
      newContent = newContent.replace(/SZROUTE/g, "SZROUTE");

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, "utf8");
        modifiedFiles++;
      }
    }
  } catch (err) {
    // skip unreadable files
  }
});

console.log(`Rebranded ${modifiedFiles} files.`);
