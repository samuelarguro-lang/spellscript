/* AFD REAL (a nivel de carácter) creado como trie determinista de las 27 cadenas.
 * Es un autómata finito determinista porque cada par (estado, carácter) tiene
 * exactamente una transición; las restantes llevan al estado sumidero q⊥.
 * Su función es SOLO reconocer sintaxis, no resolver las habitaciones.
 */
(function () {
  'use strict';
  function makeDFA(spells) {
    const states = [{ id: 'q0', edges: new Map(), final: false }];
    const byText = new Map();
    for (const spell of spells) {
      let index = 0;
      for (const symbol of [...spell.text]) {
        let next = states[index].edges.get(symbol);
        if (next === undefined) {
          next = states.length;
          states[index].edges.set(symbol, next);
          states.push({ id: `q${next}`, edges: new Map(), final: false });
        }
        index = next;
      }
      states[index].final = true;
      byText.set(spell.text, spell);
    }
    function transition(state, symbol) {
      if (state === -1) return -1;
      return states[state].edges.has(symbol) ? states[state].edges.get(symbol) : -1;
    }
    function run(input) {
      const characters = [...input];
      let current = 0;
      let firstError = null;
      const trace = [];
      for (let i = 0; i < characters.length; i++) {
        const symbol = characters[i];
        const destination = transition(current, symbol);
        if (destination === -1 && firstError === null) {
          firstError = {
            index: i + 1,
            symbol,
            expected: current === -1 ? [] : [...states[current].edges.keys()],
            kind: 'invalid-symbol'
          };
        }
        trace.push({ position: i + 1, symbol, from: current === -1 ? 'q⊥' : `q${current}`, to: destination === -1 ? 'q⊥' : `q${destination}`, rejected: destination === -1 });
        current = destination;
      }
      const accepted = current !== -1 && states[current].final === true;
      if (!accepted && firstError === null) {
        firstError = { index: characters.length + 1, symbol: 'fin de cadena', expected: current === -1 ? [] : [...states[current].edges.keys()], kind: 'incomplete' };
      }
      return {
        accepted, trace, firstError,
        endState: current === -1 ? 'q⊥' : `q${current}`,
        spell: accepted ? byText.get(input) : null,
        byRegex: (() => { const match = SpellData.expression.exec(input); return Boolean(match && match[0] === input); })()
      };
    }
    return { states, run, transition, validSpells: spells.length };
  }
  window.SpellAFD = makeDFA(window.SpellData.spells);
})();
