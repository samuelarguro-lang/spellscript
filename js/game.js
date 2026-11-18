/* El estado de partida se mantiene únicamente en memoria; sin servidor ni BD. */
(function () {
  'use strict';
  const state = {
    currentRoom: 0, lives: 5, solved: [false, false, false],
    attempts: 0, syntaxErrors: 0, puzzleErrors: 0, restartCount: 0,
    lastResult: null
  };
  function cast(rawInput) {
    const input = String(rawInput ?? '');
    if (!input.trim()) return { kind: 'empty', damage: 0, message: 'Escribe primero un conjuro. No se han descontado puntos de vida.' };
    if (state.solved[0]) return { kind: 'already-solved', damage: 0, message: 'Ya abriste esta puerta. Puedes consultar tu resultado en el AFD.' };
    const dfa = window.SpellAFD.run(input);
    state.attempts++;
    let result;
    if (!dfa.accepted) {
      state.syntaxErrors++;
      state.lives = Math.max(0, state.lives - 1);
      const why = dfa.firstError.kind === 'incomplete'
        ? `La frase terminó antes de completarse (posición ${dfa.firstError.index}).`
        : `Carácter inesperado «${dfa.firstError.symbol}» en la posición ${dfa.firstError.index}.`;
      result = { kind: 'syntax-error', damage: 1, message: `${why} El AFD rechaza la sintaxis. Pierdes 1 PV.`, dfa, text: input };
    } else {
      const { invocation, circle, action } = dfa.spell;
      const solution = window.SpellData.rooms[0].solution;
      if (invocation === solution.invocation && circle === solution.circle && action === solution.action) {
        state.solved[0] = true;
        result = { kind: 'correct', damage: 0, message: '¡Conjuro aceptado! El fuego del segundo círculo rompe el sello de hielo.', dfa, text: input };
      } else {
        state.puzzleErrors++;
        state.lives = Math.max(0, state.lives - 2);
        result = { kind: 'wrong-choice', damage: 2, message: 'El AFD aceptó la frase, pero no resuelve esta habitación. Pierdes 2 PV.', dfa, text: input };
      }
    }
    if (state.lives === 0) {
      state.restartCount++;
      state.lives = 5;
      result.restarted = true;
      result.message += ' Al agotarse la vida, se reinició solo esta habitación con 5 PV.';
    }
    state.lastResult = result;
    return result;
  }
  function resetGame() {
    state.currentRoom = 0; state.lives = 5; state.solved = [false,false,false];
    state.attempts = 0; state.syntaxErrors = 0; state.puzzleErrors = 0;
    state.restartCount = 0; state.lastResult = null;
  }
  window.SpellGame = { state, cast, resetGame };
})();