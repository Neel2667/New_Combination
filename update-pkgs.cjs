const fs = require('fs');
const dirs = ['apps/frontend', 'apps/backend', 'packages/shared'];
for (const d of dirs) {
  const p = 'combination_repo/' + d + '/package.json';
  const j = JSON.parse(fs.readFileSync(p));
  j.scripts = j.scripts || {};
  j.scripts.typecheck = 'tsc --noEmit';
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
}
