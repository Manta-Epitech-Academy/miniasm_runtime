/**
 * MiniASM — French language pack.
 * Extends English with translated UI strings (missing keys fallback to English).
 */
(function () {
  if (!window.MiniASMLang || !window.MiniASMLang.registerLanguage) return;

  window.MiniASMLang.registerLanguage({
    code: 'fr',
    name: 'Français',

    // Toolbar & navigation
    sandbox: '🏖️ Bac à sable',
    btnCode: 'Code',
    btnBlocks: 'Blocs',
    btnRun: 'Exécuter',
    btnStop: 'Arrêter',
    btnStep: 'Pas à pas',
    btnReset: 'Réinitialiser',
    btnTest: '▶ Tester',
    btnHint: '💡 Indice',
    speedLabel: 'Vitesse',
    speedInstant: 'Instantané',
    resetOnEdit: 'Réinitialiser le programme à chaque édition',
    confirmRestart: 'Le programme est terminé. Recommencer depuis le début ?',
    layoutReset: 'Replacer les panneaux',
    exShowResults: 'Voir les résultats des tests',
    exHideResults: 'Masquer les résultats des tests',
    navTutorials: 'Tutoriels',
    navChallenges: 'Défis',
    typeTutorial: 'tutoriel',
    typeChallenge: 'défi',

    // Status
    stopped: 'Arrêté',
    halted: 'Terminé',
    pcLabel: 'PC = ',

    // Tables
    registers: 'Registres',
    value: 'Valeur',
    memory: 'Mémoire',

    // Errors
    parseError: 'Erreur de syntaxe : ',
    noInstructions: 'Aucune instruction à exécuter',
    timeout: 'TIMEOUT — boucle infinie possible (100 000 étapes)',

    // Exercise panel
    challengePrefix: '{title}',
    tutorialPrefix: 'Tutoriel : {title}',
    availableLabel: 'Disponible : ',
    hintBox: '💡 Indice {num}/{total} :\n{text}',
    hintsRemaining: '({n} restants)',
    hintsNone: '(plus d\'indices)',
    alreadyCompleted: '✅ Déjà valide !',
    dropdownPlaceholder: 'Défis ▾',
    sandboxPanelTitle: '🏖️ Bac à sable',
    sandboxPanelNote: 'Ici tu essaies ce que tu veux, rien n\'est noté.\nReviens sur l\'onglet de l\'exercice pour le tester.',

    // Test results
    forbiddenSingular: '⚠️ Instruction interdite',
    forbiddenPlural: '⚠️ Instructions interdites',
    lineLabel: 'Ligne ',
    allowedLabel: 'Autorisé : ',
    testErrorLine: '⚠️ Test {n} : {io} → ERREUR : {err}',
    testPassLine: '✅ Test {n} : {io} → {actual}',
    testFailLine: '❌ Test {n} : {io} → attendu {expected}, obtenu {actual}',
    allPassed: '🎉 Tous les tests sont passés ! Défi valide !',
    unlockMsg: '🔓 Nouvelle instruction débloquée : {instr}',
    tokenLabel: 'Jeton de validation : ',
    tokenCopy: 'Copier',
    tokenCopied: 'Copié',
    stillPass: '🎉 Tous les tests passent toujours !',
    someFailed: 'Certains tests échouent — continue !',

    // Blockly categories
    blockStart: 'début',
    blockTo: 'vers',
    tooltipStart: 'Point d\'entrée du programme. Toutes les instructions s\'enchaînent sous ce bloc.',
    tooltipSet: 'SET dest src — Copie une valeur dans un\nregistre ou une case mémoire.\ndest : registre (rN) ou mémoire (@N)\nsrc : registre (rN), mémoire (@N), ou immédiat (#N)',
    tooltipInc: 'INC rN — Incrémente le registre rN de 1.',
    tooltipDec: 'DEC rN — Décrémente le registre rN de 1.',
    tooltipIsz: 'ISZ rN — Si le registre rN vaut zéro, saute l\'instruction suivante.',
    tooltipIsn: 'ISN rN — Si le registre rN est négatif, saute l\'instruction suivante.',
    tooltipJmp: 'JMP iN — Saute à l\'instruction N (goto inconditionnel).',
    tooltipStp: 'STP — Arrête l\'exécution et termine le programme.',
    tooltipAdd: 'ADD rX rY — rX = rX + rY  (rY est conservé)',
    tooltipSub: 'SUB rX rY — rX = rX − rY  (rY est conservé)',
    tooltipSwp: 'SWP rX rY — échange les valeurs dans rX et rY',
    tooltipMul: 'MUL rX rY — rX = rX × rY  (rY est conservé)',
    tooltipPow: 'POW rX rY — rX = rX ^ rY  (rY est conservé)',
    tooltipCmp: 'CMP rX rY — rX = sgn(rX − rY)\nMet rX à 1 (rX>rY), 0 (égal), ou −1 (rX<rY).\nrY est conservé.',
    tooltipJeq: 'JEQ rX iN — Si rX == 0, saute à l\'instruction N.\nSouvent utilisé après CMP pour sauter quand les valeurs sont égales.',
    tooltipJlt: 'JLT rX iN — Si rX < 0, saute à l\'instruction N.\nSouvent utilisé après CMP pour sauter quand la première valeur est plus petite.',
    tooltipJgt: 'JGT rX iN — Si rX > 0, saute à l\'instruction N.\nSouvent utilisé après CMP pour sauter quand la première valeur est plus grande.',
    tooltipJge: 'JGE rX iN — Si rX >= 0, saute à l\'instruction N.\nSouvent utilisé après CMP pour sauter quand la première valeur est plus grande ou égale.',
    tooltipJle: 'JLE rX iN — Si rX <= 0, saute à l\'instruction N.\nSouvent utilisé après CMP pour sauter quand la première valeur est plus petite ou égale.',
    blockComment: '; commentaire',
    tooltipComment: 'Une ligne de commentaire. Ignorée par la machine.\nUtilise les commentaires pour documenter ton code.',

    // Blockly categories
    catData: 'Données',
    catArithmetic: 'Arithmétique',
    catSwaps: 'Échanges',
    catControl: 'Contrôle',
    catComparisons: 'Comparaisons',
    catComments: 'Commentaires',

    // Exercise categories
    categoryArithmetic: 'Arithmétique',
    categoryComparisons: 'Comparaisons & Logique',
    categorySwaps: 'Échanges & Rearrangement',

    // Core tutorials/challenges metadata (titles/goals only for quick UX coverage)
    exercises: {
      0: {
        name: 'Tutoriel',
        title: 'Bonjour, Machine !',
        goal: 'Mettre r0 à 42 puis arrêter',
        description:
          'Bienvenue dans MiniASM ! Ce tutoriel t\'apprend les bases.\n' +
          '\n' +
          '🖥️ LA MACHINE\n' +
          'Tu as 4 registres (r0, r1, r2, r3) — de petites cases numérotées qui contiennent des valeurs.\n' +
          'Tu as aussi 64 cases mémoire (@0–@63).\n' +
          'Pendant les tests, tous les registres commencent à 0 (sauf si le test en fixe un).\n' +
          '\n' +
          '📝 COMMENT ÉCRIRE DU CODE\n' +
          'Chaque ligne est une instruction : OPCODE arguments\n' +
          'Les lignes qui commencent par ; sont des commentaires (ignorés par la machine).\n' +
          '\n' +
          '🧰 DEUX INSTRUCTIONS À RETENIR\n' +
          '  SET r0 #42  → Mettre le nombre 42 dans le registre r0\n' +
          '  STP         → Arrêter le programme (OBLIGATOIRE à la fin !)\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Écris un programme qui met exactement 42 dans r0, puis s\'arrête.\n' +
          'Tu n\'as besoin que de deux lignes !\n' +
          '\n' +
          '▶ Clique sur "Exécuter" pour lancer, ou sur "Pas à pas" pour exécuter instruction par instruction.\n' +
          '  Quand tu es prêt, clique sur "Tester" dans ce panneau pour vérifier ta réponse.',
        hints: [
          'L\'instruction SET copie une valeur dans un registre.\nPour écrire une constante, mets # devant le nombre.\nExemple : SET r0 #42',
          'N\'oublie pas de terminer ton programme avec STP !\nTon programme complet :\n  SET r0 #42\n  STP',
        ],
        starterCode:
          '; ─── Tutoriel 0 : Bonjour, Machine ! ───\n' +
          '; Objectif : mettre r0 à 42 puis arrêter\n' +
          ';\n' +
          '; Instructions utiles :\n' +
          ';   SET r0 #42  — met 42 dans r0\n' +
          ';   STP         — arrête le programme\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      1: {
        name: 'Tutoriel',
        title: 'Copieur',
        goal: 'Copier la valeur de r2 dans r0',
        description:
          'SET peut aussi copier un registre vers un autre.\n' +
          '\n' +
          '🧰 NOUVELLE CAPACITÉ\n' +
          '  SET r0 r2   → Copie la valeur de r2 dans r0\n' +
          '\n' +
          'Tu connais déjà :\n' +
          '  SET r0 #N   → Écrit une constante N dans r0\n' +
          '  STP         → Arrêter le programme\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Le test met une valeur dans r2.\n' +
          'Copie cette valeur dans r0, puis arrête.',
        hints: [
          'Utilise SET avec deux registres : SET r0 r2.',
          'Programme complet :\n  SET r0 r2\n  STP',
        ],
        starterCode:
          '; ─── Tutoriel 1 : Copieur ───\n' +
          '; Objectif : copier r2 dans r0\n' +
          ';\n' +
          '; Instructions utiles :\n' +
          ';   SET r0 r2  — copie r2 dans r0\n' +
          ';   STP        — arrête le programme\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      2: {
        name: 'Tutoriel',
        title: 'Pas à pas',
        goal: 'Mettre r2 + 3 dans r0',
        description:
          'Le programme s\'execute ligne par ligne.\n' +
          'En combinant des instructions, tu construis un résultat.\n' +
          '\n' +
          '🧰 NOUVELLES INSTRUCTIONS\n' +
          '  INC r0   → Ajoute 1 à r0\n' +
          '  DEC r0   → Retire 1 à r0\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Mettre r2 + 3 dans r0.\n' +
          '\n' +
          '💡 STRATEGIE\n' +
          '1. Copier r2 dans r0\n' +
          '2. Faire INC r0 trois fois\n' +
          '3. Arrêter',
        hints: [
          'Commence par SET r0 r2, puis INC r0 trois fois.',
          'Programme complet :\n  SET r0 r2\n  INC r0\n  INC r0\n  INC r0\n  STP',
        ],
        starterCode:
          '; ─── Tutoriel 2 : Pas à pas ───\n' +
          '; Objectif : mettre r2 + 3 dans r0\n' +
          ';\n' +
          '; Instructions utiles :\n' +
          ';   SET r0 r2  — copie r2 dans r0\n' +
          ';   INC r0     — ajoute 1 à r0\n' +
          ';   DEC r0     — retire 1 à r0\n' +
          ';   STP        — arrête le programme\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      3: {
        name: 'Tutoriel',
        title: 'La boucle',
        goal: 'Transférer la valeur de r2 dans r0 avec une boucle',
        description:
          'Concept clé : la BOUCLE.\n' +
          'Une boucle répète des instructions jusqu\'à une condition.\n' +
          '\n' +
          '🧰 NOUVELLES INSTRUCTIONS\n' +
          '  ISZ r2    → Si r2 vaut 0, saute la ligne suivante\n' +
          '  JMP iN    → Va à la ligne N\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Transférer r2 vers r0, une unité à la fois.\n' +
          'Dans la boucle : DEC r2 et INC r0.\n' +
          'Quand r2 arrive à 0, r0 contient la valeur initiale.\n' +
          '\n' +
          '⚠️ SET n\'est pas autorisé ici.',
        hints: [
          'Patron type : test (ISZ), saut vers corps, STP, corps, retour au test.',
          'Solution complète :\n  ISZ r2\n  JMP i4\n  STP\n  DEC r2\n  INC r0\n  JMP i1',
        ],
        starterCode:
          '; ─── Tutoriel 3 : La boucle ───\n' +
          '; Objectif : transférer r2 vers r0 avec une boucle\n' +
          ';\n' +
          '; Disponible : INC, DEC, ISZ, ISN, JMP, STP\n' +
          '; (SET n\'est PAS disponible)\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      4: {
        name: 'ADD',
        title: 'Addition',
        goal: 'Calculer r2 + r3 et stocker le résultat dans r0',
        description:
          'Les registres r2 et r3 sont pré-remplis.\n' +
          'Écris un programme qui calcule r2 + r3, met le résultat dans r0, puis STP.\n' +
          '\n' +
          'Tu peux utiliser r0, r1 et la mémoire comme zone de travail.',
        hints: [
          'Pense en incréments/décréments : additionner, c\'est transférer des unités.',
          'Copie r2 dans r0, puis boucle sur r3 : INC r0, DEC r3, jusqu\'à r3 = 0.',
        ],
        starterCode:
          '; ─── Défi : Addition ───\n' +
          '; Objectif : mettre r2 + r3 dans r0\n' +
          ';\n' +
          '; Disponible : SET, INC, DEC, ISZ, ISN, STP, JMP\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      5: {
        name: 'MUL',
        title: 'Multiplication',
        goal: 'Calculer r2 × r3 et stocker le résultat dans r0',
        description:
          'Calcule r2 × r3, place le résultat dans r0, puis STP.\n' +
          'Tu disposes maintenant de ADD.',
        hints: [
          'La multiplication = addition répétée.',
          'Initialise r0 à 0, conserve r2 dans r1, puis boucle : ADD r0 r1 et DEC r3.',
        ],
        starterCode:
          '; ─── Défi : Multiplication ───\n' +
          '; Objectif : mettre r2 × r3 dans r0\n' +
          ';\n' +
          '; Disponible : SET, INC, DEC, ISZ, ISN, STP, JMP, ADD\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      6: {
        name: 'POW',
        title: 'Puissance',
        goal: 'Calculer r2 ^ r3 et stocker le résultat dans r0',
        description:
          'Calcule r2 à la puissance r3, mets le résultat dans r0, puis STP.\n' +
          'Tu as maintenant ADD et MUL.',
        hints: [
          'La puissance = multiplication répétée.\nEx: 2^3 = 2 × 2 × 2.',
          'Commence avec r0 = 1. Conserve la base dans r1. Bouclé : MUL r0 r1 puis DEC r3.',
        ],
        starterCode:
          '; ─── Défi : Puissance ───\n' +
          '; Objectif : mettre r2 ^ r3 dans r0\n' +
          ';\n' +
          '; Disponible : SET, INC, DEC, ISZ, ISN, STP, JMP, ADD, MUL\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      7: {
        name: 'Tutoriel',
        title: 'Descendre',
        goal: 'Mettre r2 - 5 dans r0',
        description:
          'Tu connais INC. Son jumeau DEC retire 1.\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Mettre r2 - 5 dans r0 puis arrêter.\n' +
          '\n' +
          '💡 Les valeurs peuvent être négatives.',
        hints: [
          'Copie r2 dans r0, puis fais DEC r0 cinq fois.',
          'Solution complète :\n  SET r0 r2\n  DEC r0\n  DEC r0\n  DEC r0\n  DEC r0\n  DEC r0\n  STP',
        ],
        starterCode:
          '; ─── Tutoriel : Descendre ───\n' +
          '; Objectif : mettre r2 - 5 dans r0\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      8: {
        name: 'Tutoriel',
        title: 'Dans quel sens ?',
        goal: 'Mettre r0 à 1 si r2 est négatif, sinon 0',
        description:
          'ISN permet de détecter un nombre négatif.\n' +
          'ISN r2 saute la ligne suivante si r2 < 0.\n' +
          '\n' +
          '🎯 TA MISSION\n' +
          'Si r2 est négatif alors r0=1, sinon r0=0.',
        hints: [
          'Utilise ISN pour brancher vers le cas négatif.',
          'Solution type :\n  SET r0 #0\n  ISN r2\n  JMP i5\n  SET r0 #1\n  STP',
        ],
        starterCode:
          '; ─── Tutoriel : Dans quel sens ? ───\n' +
          '; Objectif : r0 = 1 si r2 < 0, sinon 0\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      9: {
        name: 'SUB',
        title: 'Soustraction',
        goal: 'Calculer r2 - r3 et stocker le résultat dans r0',
        description:
          'Construis la soustraction par boucle.\n' +
          'Calcule r2 - r3, place dans r0, puis STP.',
        hints: [
          'Copie r2 dans r0 puis boucle : DEC r0 et DEC r3 jusqu\'à r3 = 0.',
          'Approche type :\n  SET r0 r2\n  ISZ r3\n  JMP i5\n  STP\n  DEC r0\n  DEC r3\n  JMP i2',
        ],
        starterCode:
          '; ─── Défi : Soustraction ───\n' +
          '; Objectif : mettre r2 - r3 dans r0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      10: {
        name: 'ABS',
        title: 'Valeur absolue',
        goal: 'Mettre la valeur absolue de r2 dans r0',
        description:
          'Calcule |r2| : distance à zéro (toujours positive ou nulle).\n' +
          'Mets le résultat dans r0 puis STP.',
        hints: [
          'Si r2 est déjà positif, garde-le. S\'il est négatif, calcule 0 - r2.',
          'Approche type :\n  SET r0 r2\n  ISN r0\n  JMP i7\n  SET r1 #0\n  SUB r1 r0\n  SET r0 r1\n  STP',
        ],
        starterCode:
          '; ─── Défi : Valeur absolue ───\n' +
          '; Objectif : mettre |r2| dans r0\n' +
          ';\n' +
          '; Entrée dans r2. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      11: {
        name: 'SGN',
        title: 'Fonction signe',
        goal: 'Mettre le signe de r2 dans r0',
        description:
          'sgn(x) vaut 1 si x>0, 0 si x=0, -1 si x<0.\n' +
          'Écris ce comportement dans r0 puis STP.',
        hints: [
          'Teste d\'abord zéro (ISZ), puis négatif (ISN), sinon c\'est positif.',
          'Approche type :\n  ISZ r2\n  JMP i5\n  SET r0 #0\n  STP\n  ISN r2\n  JMP i10\n  SET r0 #0\n  DEC r0\n  STP\n  SET r0 #1\n  STP',
        ],
        starterCode:
          '; ─── Défi : Fonction signe ───\n' +
          '; Objectif : r0 = 1 si r2>0, 0 si r2=0, -1 si r2<0\n' +
          ';\n' +
          '; Entrée dans r2. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      12: {
        name: 'MIN2',
        title: 'Minimum de 2',
        goal: 'Mettre min(r2,r3) dans r0',
        description:
          'Trouve la plus petite valeur entre r2 et r3.\n' +
          'Place-la dans r0 puis STP.',
        hints: [
          'Calcule r2-r3 puis regarde le signe : négatif => r2 plus petit.',
          'Approche type :\n  SET r0 r2\n  SUB r0 r3\n  ISN r0\n  JMP i7\n  SET r0 r2\n  STP\n  SET r0 r3\n  STP',
        ],
        starterCode:
          '; ─── Défi : Minimum ───\n' +
          '; Objectif : r0 = min(r2, r3)\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      13: {
        name: 'MAX2',
        title: 'Maximum de 2',
        goal: 'Mettre max(r2,r3) dans r0',
        description:
          'Trouve la plus grande valeur entre r2 et r3.\n' +
          'Place-la dans r0 puis STP.',
        hints: [
          'Même idée que MIN, mais tu choisis la valeur opposée.',
          'Approche type :\n  SET r0 r2\n  SUB r0 r3\n  ISN r0\n  JMP i7\n  SET r0 r3\n  STP\n  SET r0 r2\n  STP',
        ],
        starterCode:
          '; ─── Défi : Maximum ───\n' +
          '; Objectif : r0 = max(r2, r3)\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      14: {
        name: 'CMP',
        title: 'Comparer',
        goal: 'Mettre sgn(r2-r3) dans r0',
        description:
          'Combine SUB et SGN : compare r2 et r3 en une valeur.\n' +
          'Résultat attendu : 1, 0 ou -1 dans r0.',
        hints: [
          'Fais r0 = r2 - r3 puis applique la logique du signe.',
          'Approche type :\n  SET r0 r2\n  SUB r0 r3\n  ISZ r0\n  JMP i6\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #0\n  DEC r0\n  STP\n  SET r0 #1\n  STP',
        ],
        starterCode:
          '; ─── Défi : Comparer ───\n' +
          '; Objectif : r0 = sgn(r2 - r3)\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      15: {
        name: 'JEQ',
        title: 'Saut si égal',
        goal: 'Mettre 1 si r2 == r3 sinon 0',
        description:
          'Détecte l\'égalité entre r2 et r3.\n' +
          'Mets 1 dans r0 si égal, sinon 0.',
        hints: [
          'CMP donne 0 quand les deux valeurs sont égales.',
          'Approche type :\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
        ],
        starterCode:
          '; ─── Défi : Saut si égal ───\n' +
          '; Objectif : r0 = 1 si r2 == r3, sinon 0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      16: {
        name: 'JLT',
        title: 'Saut si inférieur',
        goal: 'Mettre 1 si r2 < r3 sinon 0',
        description:
          'Détecte si r2 est strictement inférieur à r3.',
        hints: [
          'Après CMP, un résultat négatif signifie r2 < r3.',
          'Approche type :\n  SET r0 r2\n  CMP r0 r3\n  ISN r0\n  JMP i7\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
        ],
        starterCode:
          '; ─── Défi : Saut si inférieur ───\n' +
          '; Objectif : r0 = 1 si r2 < r3, sinon 0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      17: {
        name: 'JGE',
        title: 'Saut si supérieur ou égal',
        goal: 'Mettre 1 si r2 >= r3 sinon 0',
        description:
          'Détecte si r2 est supérieur ou égal à r3.',
        hints: [
          'r2 >= r3 est l\'opposé de r2 < r3.',
          'Approche type :\n  SET r0 r2\n  CMP r0 r3\n  ISN r0\n  JMP i7\n  SET r0 #0\n  STP\n  SET r0 #1\n  STP',
        ],
        starterCode:
          '; ─── Défi : Saut si supérieur ou égal ───\n' +
          '; Objectif : r0 = 1 si r2 >= r3, sinon 0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      18: {
        name: 'JGT',
        title: 'Saut si supérieur',
        goal: 'Mettre 1 si r2 > r3 sinon 0',
        description:
          'Détecte si r2 est strictement supérieur à r3.\n' +
          'Après CMP, il faut vérifier : ni zéro, ni négatif.',
        hints: [
          'Teste ISZ puis ISN. Si aucun des deux, c\'est positif donc >.',
          'Approche type :\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #0\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #0\n  STP\n  SET r0 #1\n  STP',
        ],
        starterCode:
          '; ─── Défi : Saut si supérieur ───\n' +
          '; Objectif : r0 = 1 si r2 > r3, sinon 0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      19: {
        name: 'JLE',
        title: 'Saut si inférieur ou égal',
        goal: 'Mettre 1 si r2 <= r3 sinon 0',
        description:
          'Détecte si r2 est inférieur ou égal à r3.\n' +
          'Après CMP, c\'est vrai quand le résultat est zéro ou négatif.',
        hints: [
          'Teste ISZ (égal), puis ISN (inférieur). Sinon, c\'est >.',
          'Approche type :\n  SET r0 r2\n  CMP r0 r3\n  ISZ r0\n  JMP i7\n  SET r0 #1\n  STP\n  ISN r0\n  JMP i11\n  SET r0 #1\n  STP\n  SET r0 #0\n  STP',
        ],
        starterCode:
          '; ─── Défi : Saut si inférieur ou égal ───\n' +
          '; Objectif : r0 = 1 si r2 <= r3, sinon 0\n' +
          ';\n' +
          '; Entrées dans r2 et r3. Résultat dans r0.\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      20: {
        name: 'Tutoriel',
        title: 'Le tiroir de secours',
        goal: 'Échanger r2 et r3 avec un registre temporaire',
        description:
          'Tu as deux valeurs dans r2 et r3. Il faut les échanger.\n' +
          'Tu n\'as pas encore SWP : utilise un registre temporaire (r0 ou r1).',
        hints: [
          'Sauvegarde r2 dans un temp, mets r3 dans r2, puis le temp dans r3.',
        ],
        starterCode:
          '; ─── Tutoriel : Le tiroir de secours ───\n' +
          '; Objectif : échanger r2 et r3 avec un registre temporaire\n' +
          ';\n' +
          '; Écris ton code ci-dessous :\n' +
          '\n' +
          'STP\n',
      },
      21: {
        name: 'SWAP',
        title: 'Échange',
        goal: 'Échanger r2 et r3',
        description:
          'Même idée que le tutoriel : échanger les valeurs de r2 et r3.\n' +
          'Ce défi débloque l\'instruction SWP.',
        hints: [
          'Utilise un registre temporaire : SET temp r2, SET r2 r3, SET r3 temp.',
        ],
        starterCode:
          '; ─── Défi : Échange ───\n' +
          '; Objectif : échanger r2 et r3\n' +
          ';\n' +
          ';\n' +
          'STP\n',
      },
      22: {
        name: 'ROTATE3',
        title: 'Rotation à trois',
        goal: 'Faire tourner r1→r2→r3→r1',
        description:
          'À la fin : r1 prend l\'ancien r3, r2 l\'ancien r1, r3 l\'ancien r2.\n' +
          'Tu as SWP : enchaîne quelques échanges.',
        hints: [
          'Deux SWP bien placés suffisent souvent (teste plusieurs ordres).',
        ],
        starterCode:
          '; ─── Défi : Rotation à trois ───\n' +
          '; Objectif : r1<-r3, r2<-r1, r3<-r2\n' +
          ';\n' +
          ';\n' +
          'STP\n',
      },
      23: {
        name: 'SORT2',
        title: 'Trier deux valeurs',
        goal: 'Mettre min(r2,r3) dans r2 et max(r2,r3) dans r3',
        description:
          'Trie r2 et r3 pour obtenir r2 <= r3 en sortie.\n' +
          'Utilise CMP et un saut conditionnel, puis SWP si besoin.',
        hints: [
          'Si r2 > r3, il faut les échanger.',
        ],
        starterCode:
          '; ─── Défi : Trier deux valeurs ───\n' +
          '; Objectif : r2 = min, r3 = max\n' +
          ';\n' +
          ';\n' +
          'STP\n',
      },
      24: {
        name: 'SORT3',
        title: 'Trier trois valeurs',
        goal: 'Trier r1 <= r2 <= r3',
        description:
          'À la fin, r1 doit être le plus petit, r2 le milieu, r3 le plus grand.\n' +
          'Utilise CMP, sauts conditionnels et SWP.',
        hints: [
          'Technique simple : trier r1/r2, puis r2/r3, puis r1/r2.',
        ],
        starterCode:
          '; ─── Défi : Trier trois valeurs ───\n' +
          '; Objectif : r1 <= r2 <= r3\n' +
          ';\n' +
          ';\n' +
          'STP\n',
      },
    },
  }, 'en');
})();
