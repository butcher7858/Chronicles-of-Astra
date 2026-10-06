const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error("No <script> tag found in index.html");
  process.exit(1);
}
try {
  new Function(scriptMatch[1]);
  console.log("JavaScript syntax validation PASSED: 0 errors");
} catch (e) {
  console.error("JavaScript syntax ERROR:", e);
  process.exit(1);
}
