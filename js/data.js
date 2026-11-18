/* SpellScript: catálogo regular de 27 frases y tres habitaciones narrativas. */
(function () {
 'use strict';
 const invocations = ['Aethra Ignis', 'Nivara Glacies', 'Zephira Ventus'];
 const circles = ['primer', 'segundo', 'tercer'];
 const actions = ['rompe el sello', 'detén al guardián', 'dispersa la niebla'];
 const difficulty = {
   facil: {name:'Aprendiz', label:'Fácil', lives:7, riddles:3, description:'Pistas más claras y siete vidas por habitación.'},
   normal: {name:'Aventurero', label:'Intermedio', lives:5, riddles:4, description:'Cuatro pruebas por sala y cinco vidas.'},
   dificil: {name:'Archimago', label:'Difícil', lives:4, riddles:5, description:'Cinco pruebas, pistas crípticas y cuatro vidas.'}
 };
 function formulate(invocation,circle,action){return `¡${invocation}, despierta en el ${circle} círculo y ${action}!`;}
 /* El reconocimiento sigue siendo regular y determinista: se normaliza ANTES del AFD. */
 function normalize(input){
   return String(input??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[¡!¿?.,;:«»“”"'`´]/g,' ').replace(/\s+/g,' ').trim();
 }
 const spells=[];
 invocations.forEach(invocation=>circles.forEach(circle=>actions.forEach(action=>spells.push({invocation,circle,action,text:formulate(invocation,circle,action)}))));
 const pattern = new RegExp('^(aethra ignis|nivara glacies|zephira ventus) despierta en el (primer|segundo|tercer) circulo y (rompe el sello|deten al guardian|dispersa la niebla)$');
 const puzzle=(title,story,poem,invocation,circle,action,easyHint,mediumHint,hardHint,icon)=>({title,story,poem,solution:{invocation,circle,action},hints:{facil:easyHint,normal:mediumHint,dificil:hardHint},icon});
 const rooms=[
 {id:'hielo',name:'La puerta helada',stage:'LAS CRIPTAS DE GLACIES',symbol:'❄',kind:'hielo',music:'Cristales bajo la nieve',ambient:'El frío murmura detrás de los muros. Los símbolos flotan sobre el umbral.',
 puzzles:[
  puzzle('El sello de Glacies','Una puerta cubierta de hielo eterno oculta el primer pasaje del torreón. El metal del sello cede al calor, pero solo el segundo círculo puede despertarlo.','«Lo opuesto al invierno, dos pasos en el anillo y el sello se quebrará».','Aethra Ignis','segundo','rompe el sello','Usa Aethra Ignis + segundo círculo + rompe el sello.','El elemento opuesto al frío, círculo II, acción del sello.','El hielo teme al sol; dos veces suena el círculo y el cerrojo obedece.','♨'),
  puzzle('La niebla de escarcha','El hielo estalla en polvo blanco y no puedes distinguir el puente. Una ráfaga pequeña basta para despejar el camino.','«No derritas el puente; aparta lo que oculta tu vista».','Zephira Ventus','primer','dispersa la niebla','Usa Zephira Ventus + primer círculo + dispersa la niebla.','Invoca viento suave, círculo I, para apartar la neblina.','El aliento más leve del cielo revela las huellas.','≋'),
  puzzle('El reloj dormido','Un mecanismo de hielo gira sin control. Un guardián invisible guía sus engranajes; debes detenerlo sin romper la maquinaria.','«Si todo se mueve, deja que el frío imponga silencio».','Nivara Glacies','primer','detén al guardián','Usa Nivara Glacies + primer círculo + detén al guardián.','Elige hielo, intensidad I, para detener al guardián del reloj.','La quietud vence al vigilante; basta el primer círculo.','❄'),
  puzzle('Cadenas de cristal','Tres cadenas más gruesas sujetan la escalera. Se necesita fuego más intenso para romper su sello.' ,'«Quien abrió la puerta puede quebrar los eslabones, pero con mayor poder».','Aethra Ignis','tercer','rompe el sello','Fuego + tercer círculo + rompe el sello.','Repite el elemento de la primera puerta, esta vez con el círculo III.','El primer sol ya no basta para tres cadenas.','♨'),
  puzzle('La ventisca final','Al salir, una tormenta de nieve vaporosa cierra el corredor. Un viento del tercer círculo dispersará su densa cortina.','«Donde nada se ve, el mayor de los vientos enseña la ruta».','Zephira Ventus','tercer','dispersa la niebla','Viento + tercer círculo + dispersa la niebla.','La acción despeja el aire; la intensidad debe ser máxima.','Tres remolinos revelan el último camino.','≋') ]},
 {id:'fuego',name:'El guardián de fuego',stage:'EL SALÓN DE IGNIS',symbol:'♨',kind:'fuego',music:'El pulso de las brasas',ambient:'La piedra late como un corazón de lava. Cada error despierta al coloso.',
 puzzles:[
  puzzle('El coloso en llamas','Un guardián de fuego bloquea la entrada. Para inmovilizarlo sin destruir el salón, debes recurrir al hielo de menor intensidad.','«Su furia se detiene cuando el primer invierno toca sus pies».','Nivara Glacies','primer','detén al guardián','Hielo + primer círculo + detén al guardián.','Contrarresta el fuego con hielo, círculo I; detén al guardián.','El primero de los inviernos domina a quien arde.','❄'),
  puzzle('El humo de la forja','El coloso quieto deja escapar humo negro que te ciega. Una corriente de viento del segundo círculo puede apartarlo.','«Da al humo un sendero que abandone el santuario».','Zephira Ventus','segundo','dispersa la niebla','Viento + segundo círculo + dispersa la niebla.','Viento de intensidad II para despejar el aire.','El aire medio apartará el velo de ceniza.','≋'),
  puzzle('El candado del crisol','En la forja, un candado solo responde al fuego primigenio. El primer círculo basta para fracturar el sello.' ,'«Esta cerradura no teme las llamas: las reconoce».','Aethra Ignis','primer','rompe el sello','Fuego + primer círculo + rompe el sello.','La llave ahora es fuego, no hielo. Usa intensidad I.','El primer aliento del horno abre el crisol.','♨'),
  puzzle('El corazón del titán','El guardián despierta otra vez, más poderoso. Su núcleo requiere el hielo del tercer círculo para quedar inmóvil.','«Para apagar un corazón de lava, invoca el invierno más profundo».','Nivara Glacies','tercer','detén al guardián','Hielo + tercer círculo + detén al guardián.','Usa máxima intensidad de hielo para parar al titán.','Tres inviernos sujetan un corazón encendido.','❄'),
  puzzle('La lluvia de cenizas','Miles de cenizas llueven sobre el altar. Solo el gran viento puede apartarlas sin reavivar la llama.','«La salida no es una chispa: es una corriente que barre todo».','Zephira Ventus','tercer','dispersa la niebla','Viento + tercer círculo + dispersa la niebla.','Máximo viento: la acción correcta limpia el aire.','El tercer soplo borra las huellas del fuego.','≋') ]},
 {id:'niebla',name:'La cámara de niebla',stage:'LA CÚPULA DE VENTUS',symbol:'≋',kind:'niebla',music:'El eco del firmamento',ambient:'La luna se multiplica entre velos violetas. La salida existe, pero nadie puede verla.',
 puzzles:[
  puzzle('La cortina sin fin','Una bruma ancestral esconde el pasillo central. Solo el viento del tercer círculo puede abrirle un túnel.','«La niebla más densa precisa del aliento más alto».','Zephira Ventus','tercer','dispersa la niebla','Viento + tercer círculo + dispersa la niebla.','El aire debe disiparse con el viento más fuerte.','La tercera corriente encuentra lo invisible.','≋'),
  puzzle('La lámpara dormida','La cámara queda oscura. Un brasero del primer círculo enciende la runa que rompe el sello de la lámpara.','«La luz mínima basta para vencer un candado de sombra».','Aethra Ignis','primer','rompe el sello','Fuego + primer círculo + rompe el sello.','Usa el elemento que produce luz y el primer círculo.','La primera chispa rompe la oscuridad.','♨'),
  puzzle('El espejo errante','El espejo que guarda el mapa se mueve sin cesar. Un guardián de ecos lo agita; enfríalo con el segundo círculo para detenerlo.','«Congela el reflejo antes de leer su secreto».','Nivara Glacies','segundo','detén al guardián','Hielo + segundo círculo + detén al guardián.','Usa hielo para inmovilizar el espíritu, círculo II.','El segundo silencio detiene al que habita detrás del cristal.','❄'),
  puzzle('El corredor de susurros','Una neblina fina vuelve a ocultar las escaleras. Esta vez basta con la primera corriente de aire.','«No gastes la gran tormenta en un susurro».','Zephira Ventus','primer','dispersa la niebla','Viento + primer círculo + dispersa la niebla.','Brisa suave e intensidad I para despejar la bruma.','El viento más pequeño revela la escalera.','≋'),
  puzzle('El sello del firmamento','Al final aparece un aro sellado que contiene una chispa de estrellas. Necesitas fuego del tercer círculo para romperlo y escapar.','«La última puerta se abre con el sol más intenso».','Aethra Ignis','tercer','rompe el sello','Fuego + tercer círculo + rompe el sello.','Usa el máximo poder del fuego para romper el sello final.','La tercera aurora partirá el último anillo.','♨') ]}
 ];
 window.SpellData=Object.freeze({invocations,circles,actions,spells,rooms,difficulty,formulate,normalize,pattern});
})();
