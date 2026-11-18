/* Vocabulario cerrado de SpellScript. Las cadenas se comparan de forma estricta. */
(function () {
  'use strict';
  const invocations = ['Aethra Ignis', 'Nivara Glacies', 'Zephira Ventus'];
  const circles = ['primer', 'segundo', 'tercer'];
  const actions = ['rompe el sello', 'detén al guardián', 'dispersa la niebla'];
  function formulate(invocation, circle, action) {
    return `¡${invocation}, despierta en el ${circle} círculo y ${action}!`;
  }
  const spells = [];
  invocations.forEach(invocation => circles.forEach(circle => actions.forEach(action => {
    spells.push({ invocation, circle, action, text: formulate(invocation, circle, action) });
  })));
  const rooms = [{
    id: 'hielo', name: 'La puerta helada',
    clue: 'El fuego es el elemento opuesto al hielo; la cerradura exige el segundo círculo y la acción que rompe el sello.',
    solution: { invocation: 'Aethra Ignis', circle: 'segundo', action: 'rompe el sello' }
  }, {
    id: 'fuego', name: 'El guardián de fuego',
    solution: { invocation: 'Nivara Glacies', circle: 'primer', action: 'detén al guardián' }
  }, {
    id: 'niebla', name: 'La cámara de niebla',
    solution: { invocation: 'Zephira Ventus', circle: 'tercer', action: 'dispersa la niebla' }
  }];
  const expression = /^¡(Aethra Ignis|Nivara Glacies|Zephira Ventus), despierta en el (primer|segundo|tercer) círculo y (rompe el sello|detén al guardián|dispersa la niebla)!$/;
  window.SpellData = Object.freeze({ invocations, circles, actions, spells, rooms, expression, formulate });
})();
