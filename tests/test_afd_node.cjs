const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = {};
context.window = context;
vm.createContext(context);
for (const filename of ['data.js', 'afd.js', 'game.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', filename), 'utf8'), context);
}
const { SpellData, SpellAFD, SpellGame } = context.window;
assert.equal(SpellData.spells.length, 27);
for (const { text } of SpellData.spells) {
  const result = SpellAFD.run(text);
  assert.equal(result.accepted, true, text);
  assert.equal(result.byRegex, true, text);
  assert.equal(result.trace.length, [...text].length);
}
const invalid = [
  '¡Aethra Ignus, despierta en el segundo círculo y rompe el sello!',
  '¡Aethra Ignis, despierta en el segundo circulo y rompe el sello!',
  '¡Aethra Ignis, despierta en el segundo círculo y rompe el sello',
];
for (const text of invalid) assert.equal(SpellAFD.run(text).accepted, false, text);
assert.equal(SpellGame.cast('   ').kind, 'empty');
assert.equal(SpellGame.state.lives, 5);
assert.equal(SpellGame.cast(invalid[0]).damage, 1);
assert.equal(SpellGame.state.lives, 4);
const otherValid = SpellData.formulate('Aethra Ignis','tercer','rompe el sello');
assert.equal(SpellGame.cast(otherValid).damage, 2);
assert.equal(SpellGame.state.lives, 2);
assert.equal(SpellGame.cast(invalid[0]).damage, 1);
const restart = SpellGame.cast(invalid[0]);
assert.equal(restart.restarted, true);
assert.equal(SpellGame.state.lives, 5);
const solution = SpellData.formulate('Aethra Ignis','segundo','rompe el sello');
assert.equal(SpellGame.cast(solution).kind, 'correct');
assert.equal(SpellGame.state.solved[0], true);
console.log('SpellScript: 27 cadenas aceptadas, invalidaciones, daños, reinicio y victoria OK.');