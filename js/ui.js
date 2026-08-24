/**
 * WDR+E — User interface with challenge system.
 * Depends on: lang.js, interpreter.js, exercises.js, blocks-miniasm.js, Blockly, Monaco.
 */
(function () {
  var T = window.MiniASMLang.T;
  var CFG = window.MiniASMConfig;

  var REG_NAMES   = CFG.REG_NAMES;
  var MEMORY_SIZE = CFG.memory.size;
  var MEMORY_COLS = CFG.memory.columns;

  // ─── State ──────────────────────────────────────────────────────────
  var editor = null;
  var blocklyWorkspace = null;
  var machine = null;
  var decorations = [];
  var currentMode = 'code';          // 'code' | 'blocks'
  var monacoCodeBeforeBlocks = '';   // Monaco content when last switching to blocks (used by switchMode for exercise/sandbox transitions)
  var syncHighlightTimeout = null;

  var currentModeId = 'sandbox';     // 'sandbox' | exercise id (number)
  var currentExercise = null;        // null in sandbox, exercise object otherwise
  var autoRunInterval = null;        // setInterval id for auto-stepping
  var isAutoRunning = false;         // whether auto-run is active
  var resetOnChange = true;          // reset program when user edits registers/memory
  var cheatsEnabled = !!CFG.enableCheats;

  // ─── Helpers ────────────────────────────────────────────────────────

  function getSource() {
    if (currentMode === 'code' && editor) return editor.getValue();
    if (currentMode === 'blocks' && blocklyWorkspace) return window.MiniASMBlocks.blocksToCode(blocklyWorkspace);
    return '';
  }

  function createMachine() {
    return window.MiniASM.createMachine();
  }

  function loadProgram() {
    if (!machine) machine = createMachine();
    try {
      window.MiniASM.loadProgram(machine, { source: getSource() });
      return true;
    } catch (e) {
      // A typo is the most common thing a beginner does, and answering it with
      // a browser alert means a modal stamped with the host's domain on top of
      // the workshop page. Say it where the machine already reports itself.
      showError(T('parseError') + e.message);
      return false;
    }
  }

  function canEditState() {
    return !!machine;
  }

  // ─── Code persistence per mode ──────────────────────────────────────

  function codeKey(modeId) {
    return 'miniasm-code-' + modeId;
  }

  function saveCurrentCode() {
    try {
      localStorage.setItem(codeKey(currentModeId), getSource());
    } catch (e) { /* ignore */ }
  }

  function loadCodeForMode(modeId) {
    try {
      var saved = localStorage.getItem(codeKey(modeId));
      if (saved !== null) return saved;
    } catch (e) { /* ignore */ }
    // Return starter code for exercises, empty for sandbox
    if (modeId !== 'sandbox') {
      var ex = findExercise(modeId);
      return ex ? ex.starterCode : '';
    }
    return '';
  }

  function findExercise(id) {
    var exercises = window.MiniASMExercises.EXERCISES;
    for (var i = 0; i < exercises.length; i++) {
      if (exercises[i].id === id) return exercises[i];
    }
    return null;
  }

  // ─── Allowed opcodes for current mode ───────────────────────────────

  function getAllowedOpcodes() {
    if (currentExercise) {
      // Exercise: base available + any unlocked instructions
      return window.MiniASMExercises.effectiveAvailable(currentExercise);
    }
    // Sandbox: primitives + unlocked instructions
    var unlocked = window.MiniASMExercises.getUnlockedInstructions();
    return window.MiniASMExercises.PRIMITIVES.concat(unlocked);
  }

  // ─── The exercise bar ───────────────────────────────────────────────
  /*
     Collapsed by default: what a student needs to keep working is the title,
     the opcodes they may use and the button — and those live in the bar. The
     drawer under it holds the test lines and the verdict, which are worth
     reading after pressing Tester and not before, so pressing Tester opens it.
     The choice is remembered, like the panel layout.
  */
  var COLLAPSE_KEY = 'miniasm-exercise-collapsed';

  function exerciseCollapsed() {
    var panel = document.getElementById('exercise-panel');
    return !panel || panel.classList.contains('collapsed');
  }

  function setExerciseCollapsed(collapsed, remember) {
    var panel = document.getElementById('exercise-panel');
    var toggle = document.getElementById('btn-ex-toggle');
    if (!panel) return;
    panel.classList.toggle('collapsed', collapsed);
    if (toggle) {
      toggle.textContent = collapsed ? '▲' : '▼';
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.title = T(collapsed ? 'exShowResults' : 'exHideResults');
    }
    if (remember !== false) {
      try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) { /* ignore */ }
    }
    if (window.MiniASMLayout) window.MiniASMLayout.notifyResize();
  }

  function restoreExerciseCollapsed() {
    var saved = null;
    try { saved = localStorage.getItem(COLLAPSE_KEY); } catch (e) { /* ignore */ }
    setExerciseCollapsed(saved !== '0', false);
  }

  // ─── Registers & memory tables ──────────────────────────────────────

  function refreshRegisters() {
    var theadRow = document.getElementById('registers-thead-row');
    var tbody = document.querySelector('#registers-table tbody');
    theadRow.innerHTML = '';
    tbody.innerHTML = '';
    for (var i = 0; i < REG_NAMES.length; i++) {
      var th = document.createElement('th');
      th.className = 'reg-name';
      th.textContent = REG_NAMES[i];
      theadRow.appendChild(th);
    }
    if (!machine) return;
    var editable = canEditState();
    var tr = document.createElement('tr');
    for (var j = 0; j < REG_NAMES.length; j++) {
      var td = document.createElement('td');
      td.className = 'value';
      td.textContent = String(machine.registers[j] ?? 0);
      if (editable) {
        td.setAttribute('contenteditable', 'true');
        td.setAttribute('data-reg', String(j));
        td.setAttribute('spellcheck', 'false');
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  function refreshMemory() {
    var theadRow = document.getElementById('memory-thead-row');
    var tbody = document.querySelector('#memory-table tbody');
    tbody.innerHTML = '';
    theadRow.innerHTML = '';
    var th0 = document.createElement('th');
    th0.className = 'addr';
    theadRow.appendChild(th0);
    for (var c = 0; c < MEMORY_COLS; c++) {
      var th = document.createElement('th');
      th.className = 'addr';
      th.textContent = String(c);
      theadRow.appendChild(th);
    }
    if (!machine) return;
    var editable = canEditState();
    for (var row = 0; row < MEMORY_SIZE / MEMORY_COLS; row++) {
      var tr = document.createElement('tr');
      var tdLine = document.createElement('td');
      tdLine.className = 'addr';
      // The address the row starts at, not the row's number: a statement says
      // "@37", and the student should be able to find it by reading down to
      // @32 and across five, instead of multiplying the row by the column
      // count first. The column headers are the offset to add.
      tdLine.textContent = CFG.memory.prefix + (row * MEMORY_COLS);
      tr.appendChild(tdLine);
      for (var col = 0; col < MEMORY_COLS; col++) {
        var idx = row * MEMORY_COLS + col;
        var td = document.createElement('td');
        td.className = 'value';
        td.textContent = String(machine.memory[idx] ?? 0);
        if (editable) {
          td.setAttribute('contenteditable', 'true');
          td.setAttribute('data-index', String(idx));
          td.setAttribute('spellcheck', 'false');
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  function refreshTables() {
    refreshRegisters();
    refreshMemory();
  }

  function commitRegisterEdit(td) {
    var reg = parseInt(td.getAttribute('data-reg'), 10);
    if (isNaN(reg) || reg < 0 || reg >= CFG.registers.count) return;
    var v = parseInt(td.textContent.trim(), 10);
    if (!isNaN(v)) {
      machine.registers[reg] = v;
      td.textContent = String(v);
    } else {
      td.textContent = String(machine.registers[reg] ?? 0);
    }
  }

  function commitMemoryEdit(td) {
    var idx = parseInt(td.getAttribute('data-index'), 10);
    if (isNaN(idx) || idx < 0 || idx >= MEMORY_SIZE) return;
    var v = parseInt(td.textContent.trim(), 10);
    if (!isNaN(v)) {
      machine.memory[idx] = v;
      td.textContent = String(v);
    } else {
      td.textContent = String(machine.memory[idx] ?? 0);
    }
  }

  document.querySelector('.panel-state').addEventListener('focusout', function (e) {
    if (!machine) return;
    var t = e.target;
    if (t.nodeName !== 'TD' || !t.classList.contains('value')) return;
    if (t.hasAttribute('data-reg')) commitRegisterEdit(t);
    else if (t.hasAttribute('data-index')) commitMemoryEdit(t);
    else return;

    // If resetOnChange is enabled, reset program (PC → 0, halted → false)
    if (resetOnChange) {
      try {
        window.MiniASM.loadProgram(machine, { source: getSource() });
      } catch (err) { /* parse error — leave machine as-is */ }
      updateStatus();
      highlightPCLine();
      if (currentMode === 'blocks' && blocklyWorkspace) {
        window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine ? machine.pc : -1);
      }
    }
  });

  // ─── Status & PC highlight ──────────────────────────────────────────

  function showError(message) {
    var el = document.getElementById('status');
    el.textContent = message;
    el.className = 'status error';
  }

  function updateStatus() {
    var el = document.getElementById('status');
    if (!machine) { el.textContent = T('stopped'); el.className = 'status'; return; }
    if (machine.halted) {
      el.textContent = T('halted');
      el.className = 'status halted';
    } else {
      el.textContent = T('pcLabel') + (machine.pc + 1);
      el.className = 'status running';
    }
  }

  function highlightPCLine() {
    if (!editor || !machine) return;
    var validPC = machine.pc >= 0 && machine.pc < machine.code.length;
    var line = validPC && machine.lineNumbers && machine.lineNumbers[machine.pc] !== undefined
      ? machine.lineNumbers[machine.pc]
      : null;
    decorations = editor.deltaDecorations(decorations, line != null
      ? [{ range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 }, options: { isWholeLine: true, className: 'pc-line-highlight' } }]
      : []);
  }

  function clampPC() {
    if (!machine || !machine.code.length) return;
    machine.pc = Math.max(0, Math.min(machine.pc, machine.code.length - 1));
  }

  function syncProgramAndHighlightPC() {
    if (!machine) machine = createMachine();
    var source = getSource();
    try {
      window.MiniASM.loadProgram(machine, { source: source });
      clampPC();
      updateStatus();
      if (currentMode === 'blocks' && blocklyWorkspace && editor) {
        editor.setValue(source);
      }
      if (currentMode === 'code' && blocklyWorkspace && editor) {
        window.MiniASMBlocks.codeToBlocks(blocklyWorkspace, source);
      }
    } catch (e) {
      // Parse error while editing – keep current machine state
    }
    highlightPCLine();
    if (currentMode === 'blocks' && blocklyWorkspace) {
      window.MiniASMBlocks.updateBlockLineNumbers(blocklyWorkspace);
      window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine ? machine.pc : -1);
    }
  }

  // ─── Run / Step / Reset ─────────────────────────────────────────────

  function getAutoRunInterval() {
    var slider = document.getElementById('speed-slider');
    return slider ? parseInt(slider.value, 10) : 500;
  }

  function stopAutoRun() {
    if (autoRunInterval !== null) {
      clearInterval(autoRunInterval);
      autoRunInterval = null;
    }
    isAutoRunning = false;
    var btn = document.getElementById('btn-run');
    btn.textContent = T('btnRun');
    btn.classList.remove('stop');
    btn.classList.add('primary');
  }

  function run() {
    // If already auto-running, stop
    if (isAutoRunning) {
      stopAutoRun();
      return;
    }

    // If machine is halted or finished, ask user if they want to restart
    if (machine && (machine.halted || machine.pc >= machine.code.length)) {
      if (!confirm(T('confirmRestart'))) return;
      reset();
    }

    // Load program fresh
    if (!loadProgram()) return;

    // Instant execution when delay is 0
    if (getAutoRunInterval() === 0) {
      window.MiniASM.run(machine);
      refreshTables();
      updateStatus();
      highlightPCLine();
      if (currentMode === 'blocks' && blocklyWorkspace) {
        window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine.pc);
      }
      return;
    }

    // Switch button to "Stop"
    isAutoRunning = true;
    var btn = document.getElementById('btn-run');
    btn.textContent = T('btnStop');
    btn.classList.remove('primary');
    btn.classList.add('stop');

    // Perform initial step immediately, then set interval
    function autoStep() {
      if (!machine || machine.halted || machine.pc >= machine.code.length) {
        stopAutoRun();
        refreshTables();
        updateStatus();
        highlightPCLine();
        if (currentMode === 'blocks' && blocklyWorkspace) {
          window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine ? machine.pc : -1);
        }
        return;
      }
      window.MiniASM.execute(machine);
      refreshTables();
      updateStatus();
      highlightPCLine();
      if (currentMode === 'blocks' && blocklyWorkspace) {
        window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine.pc);
      }
    }

    // First step right away
    autoStep();
    if (!isAutoRunning) return; // halted on first step

    // Use setTimeout recursion so interval changes take effect immediately
    function scheduleNext() {
      if (!isAutoRunning) return;
      autoRunInterval = setTimeout(function () {
        autoStep();
        if (isAutoRunning) scheduleNext();
      }, getAutoRunInterval());
    }
    scheduleNext();
  }

  function step() {
    if (!machine) {
      if (!loadProgram()) return;
    }
    if (machine.halted || machine.pc >= machine.code.length) {
      // loadProgram only re-parses; it leaves pc and halted where they were, so
      // stepping past the end of a program did nothing at all and the button
      // looked broken. Rewind here, and keep whatever the registers hold —
      // Réinitialiser is the control that clears them.
      if (!loadProgram()) return;
      machine.pc = 0;
      machine.halted = false;
    }
    if (machine.pc < machine.code.length && !machine.halted) {
      window.MiniASM.execute(machine);
    }
    refreshTables();
    updateStatus();
    highlightPCLine();
    if (currentMode === 'blocks' && blocklyWorkspace) {
      window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine.pc);
    }
  }

  function reset() {
    stopAutoRun();
    try {
      machine = createMachine();
      window.MiniASM.loadProgram(machine, { source: getSource() });
    } catch (e) {
      machine = null;
    }
    refreshTables();
    updateStatus();
    if (!machine) {
      decorations = editor ? editor.deltaDecorations(decorations, []) : [];
    }
    highlightPCLine();
    if (currentMode === 'blocks' && blocklyWorkspace) {
      window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine ? machine.pc : -1);
    }
  }

  // ─── Code / Blocks mode toggle ──────────────────────────────────────

  function setEditorMode(mode) {
    currentMode = mode;
    document.querySelector('.code-wrap').classList.toggle('active', mode === 'code');
    document.querySelector('.blocks-wrap').classList.toggle('active', mode === 'blocks');
    document.getElementById('btn-mode-code').classList.toggle('active', mode === 'code');
    document.getElementById('btn-mode-blocks').classList.toggle('active', mode === 'blocks');
    if (mode === 'blocks') {
      if (editor) monacoCodeBeforeBlocks = editor.getValue();
      var allowed = getAllowedOpcodes();
      if (!blocklyWorkspace) {
        blocklyWorkspace = window.MiniASMBlocks.createWorkspace(
          document.getElementById('blockly-workspace'),
          allowed
        );
        blocklyWorkspace.addChangeListener(function () {
          clearTimeout(syncHighlightTimeout);
          syncHighlightTimeout = setTimeout(syncProgramAndHighlightPC, 200);
        });
      } else {
        window.MiniASMBlocks.updateToolbox(blocklyWorkspace, allowed);
      }
      window.MiniASMBlocks.codeToBlocks(blocklyWorkspace, editor ? editor.getValue() : '');
      if (machine) {
        window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine.pc);
      }
      window.MiniASMBlocks.centerBlocksInView(blocklyWorkspace);
      window.MiniASMBlocks.updateBlockLineNumbers(blocklyWorkspace);
    } else {
      if (blocklyWorkspace && editor) {
        var codeFromBlocks = window.MiniASMBlocks.blocksToCode(blocklyWorkspace);
        editor.setValue(codeFromBlocks);
      }
      if (machine) {
        highlightPCLine();
      }
    }
  }

  // ─── Navigation bar setup (Sandbox + Category dropdown) ─────────────

  function buildNavButtons() {
    var menu = document.getElementById('nav-dropdown-menu');
    menu.innerHTML = '';

    var categories = window.MiniASMExercises.CATEGORIES;
    var exercises  = window.MiniASMExercises.EXERCISES;

    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];

      // Category header
      var header = document.createElement('div');
      header.className = 'nav-cat-header';
      header.textContent = cat.name;
      menu.appendChild(header);

      // Collect tutorials and challenges for this category
      var tutorials  = [];
      var challenges = [];
      for (var i = 0; i < exercises.length; i++) {
        if (exercises[i].category === cat.id) {
          if (exercises[i].type === 'tutorial') tutorials.push(exercises[i]);
          else challenges.push(exercises[i]);
        }
      }

      // Tutorial sub-label + items
      if (tutorials.length > 0) {
        var tutLabel = document.createElement('div');
        tutLabel.className = 'nav-cat-sublabel';
        tutLabel.textContent = T('navTutorials');
        menu.appendChild(tutLabel);

        for (var t = 0; t < tutorials.length; t++) {
          menu.appendChild(createNavItem(tutorials[t]));
        }
      }

      // Separator + challenge sub-label + items
      if (challenges.length > 0) {
        if (tutorials.length > 0) {
          var sep = document.createElement('div');
          sep.className = 'nav-cat-separator';
          menu.appendChild(sep);
        }
        var chLabel = document.createElement('div');
        chLabel.className = 'nav-cat-sublabel';
        chLabel.textContent = T('navChallenges');
        menu.appendChild(chLabel);

        for (var ch = 0; ch < challenges.length; ch++) {
          menu.appendChild(createNavItem(challenges[ch]));
        }
      }

      // Separator between categories
      if (c < categories.length - 1) {
        var catSep = document.createElement('div');
        catSep.className = 'nav-cat-separator';
        catSep.style.margin = '8px 12px';
        menu.appendChild(catSep);
      }
    }

    updateNavButtons();
  }

  // ─── Cheat mode: fast-forward progress to an exercise ────────────────

  function fastForwardProgressTo(exerciseId) {
    if (!cheatsEnabled) return;
    var progress = window.MiniASMExercises.loadProgress();
    var exercises = window.MiniASMExercises.EXERCISES;
    var completed = [];

    for (var i = 0; i < exercises.length; i++) {
      var ex = exercises[i];
      if (typeof exerciseId === 'number' && ex.id < exerciseId) {
        completed.push(ex.id);
      }
    }

    progress.completed = completed;
    window.MiniASMExercises.saveProgress(progress);
    updateNavButtons();

    if (typeof exerciseId === 'number') {
      switchMode(exerciseId);
    }
  }

  function buildCheatOverlayList() {
    if (!cheatsEnabled) return;
    var listEl = document.getElementById('cheat-exercise-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    var exercises = window.MiniASMExercises.EXERCISES;
    var categories = window.MiniASMExercises.CATEGORIES;
    var catById = {};

    for (var c = 0; c < categories.length; c++) {
      catById[categories[c].id] = categories[c];
    }

    for (var i = 0; i < exercises.length; i++) {
      var ex = exercises[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cheat-ex-item';
      btn.setAttribute('data-ex-id', String(ex.id));

      var main = document.createElement('div');
      main.className = 'cheat-ex-item-main';

      var title = document.createElement('div');
      title.className = 'cheat-ex-item-title';
      var label = ex.type === 'tutorial' ? ex.title : ex.name;
      title.textContent = '[' + ex.id + '] ' + label;

      var meta = document.createElement('div');
      meta.className = 'cheat-ex-item-meta';
      var cat = catById[ex.category];
      var catName = cat ? cat.name : ex.category;
      var typeLabel = ex.type === 'tutorial' ? T('typeTutorial') : T('typeChallenge');
      meta.textContent = catName + ' • ' + typeLabel;

      main.appendChild(title);
      main.appendChild(meta);

      btn.appendChild(main);

      (function (id) {
        btn.addEventListener('click', function () {
          fastForwardProgressTo(id);
          closeCheatOverlay();
        });
      })(ex.id);

      listEl.appendChild(btn);
    }
  }

  function openCheatOverlay() {
    if (!cheatsEnabled) return;
    var overlay = document.getElementById('cheat-overlay');
    if (!overlay) return;
    buildCheatOverlayList();
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeCheatOverlay() {
    var overlay = document.getElementById('cheat-overlay');
    if (!overlay) return;
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function createNavItem(ex) {
    var btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.setAttribute('data-mode', String(ex.id));

    var icon = document.createElement('span');
    icon.className = 'nav-item-icon';
    btn.appendChild(icon);

    var text = document.createElement('span');
    text.textContent = ex.type === 'tutorial' ? ex.title : ex.name;
    btn.appendChild(text);

    return btn;
  }

  function updateNavButtons() {
    // Sandbox button
    var sandboxBtn = document.querySelector('#mode-nav > button[data-mode="sandbox"]');
    sandboxBtn.classList.toggle('active', currentModeId === 'sandbox');
    var embedTab = document.getElementById('embed-exercise-tab');
    if (embedTab) embedTab.classList.toggle('active', currentModeId !== 'sandbox');

    // Dropdown toggle
    var toggle = document.getElementById('nav-dropdown-toggle');
    var label  = document.getElementById('nav-dropdown-label');
    if (currentModeId !== 'sandbox' && currentExercise) {
      var displayName = currentExercise.type === 'tutorial'
        ? currentExercise.title
        : currentExercise.name;
      label.textContent = displayName + ' ▾';
      toggle.classList.add('has-selection');
    } else {
      label.textContent = T('dropdownPlaceholder');
      toggle.classList.remove('has-selection');
    }

    // Menu items
    var items = document.querySelectorAll('#nav-dropdown-menu .nav-item');
    for (var i = 0; i < items.length; i++) {
      var btn    = items[i];
      var exId   = parseInt(btn.getAttribute('data-mode'), 10);
      var ex     = findExercise(exId);
      if (!ex) continue;

      var completed = window.MiniASMExercises.isCompleted(exId);
      var available = window.MiniASMExercises.isAvailable(ex);

      btn.classList.remove('active', 'locked', 'completed');
      if (completed) btn.classList.add('completed');
      if (!available && !completed) btn.classList.add('locked');
      if (currentModeId === exId) btn.classList.add('active');

      // Update icon
      var icon = btn.querySelector('.nav-item-icon');
      if (icon) {
        icon.textContent = completed ? '✅' : (!available ? '🔒' : '○');
      }
    }
  }

  /** Open / close dropdown, handle item clicks */
  function setupDropdown() {
    var dropdown = document.getElementById('nav-dropdown');
    var toggle   = document.getElementById('nav-dropdown-toggle');
    var menu     = document.getElementById('nav-dropdown-menu');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    menu.addEventListener('click', function (e) {
      var btn = e.target.closest('.nav-item');
      if (!btn) return;
      if (btn.classList.contains('locked')) return;

      var exId = parseInt(btn.getAttribute('data-mode'), 10);
      dropdown.classList.remove('open');
      switchMode(exId);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  function handleNavClick(e) {
    var btn = e.target.closest('button[data-mode="sandbox"]');
    if (!btn) return;
    var dropdown = document.getElementById('nav-dropdown');
    dropdown.classList.remove('open');
    switchMode('sandbox');
  }

  // ─── Mode switching ─────────────────────────────────────────────────

  function switchMode(modeId) {
    if (modeId === currentModeId) return;

    // Stop any running auto-step
    stopAutoRun();

    // Save current code
    saveCurrentCode();

    // Update state
    currentModeId = modeId;
    currentExercise = (modeId === 'sandbox') ? null : findExercise(modeId);

    // Load code for new mode
    var code = loadCodeForMode(modeId);
    if (editor) editor.setValue(code);
    monacoCodeBeforeBlocks = code;

    // Reset machine
    machine = createMachine();
    try {
      window.MiniASM.loadProgram(machine, { source: code });
    } catch (e) { /* parse error in saved code — ok */ }

    // Update blockly toolbox
    var allowed = getAllowedOpcodes();
    if (blocklyWorkspace) {
      window.MiniASMBlocks.updateToolbox(blocklyWorkspace, allowed);
      if (currentMode === 'blocks') {
        window.MiniASMBlocks.codeToBlocks(blocklyWorkspace, code);
        window.MiniASMBlocks.centerBlocksInView(blocklyWorkspace);
      }
    }

    renderExercisePanel();

    // Update everything
    updateNavButtons();
    refreshTables();
    updateStatus();
    highlightPCLine();

    if (currentMode === 'blocks' && blocklyWorkspace) {
      window.MiniASMBlocks.setPCIndicator(blocklyWorkspace, machine ? machine.pc : -1);
    }
  }

  // ─── Exercise panel ─────────────────────────────────────────────────

  /**
   * The exercise panel is a dock panel with a tab of its own, so hiding it in
   * the sandbox left the tab standing over an empty rectangle. Keep the panel
   * and say which of the two states it is in.
   */
  function renderExercisePanel() {
    var panel = document.getElementById('exercise-panel');
    panel.classList.add('visible');
    panel.classList.toggle('sandbox', !currentExercise);
    if (currentExercise) {
      updateExercisePanel();
      return;
    }
    document.getElementById('ex-title').textContent = T('sandboxPanelTitle');
    document.getElementById('ex-sandbox-note').textContent = T('sandboxPanelNote');
  }

  function updateExercisePanel() {
    if (!currentExercise) return;
    var ex = currentExercise;

    var titleKey = ex.type === 'tutorial' ? 'tutorialPrefix' : 'challengePrefix';
    document.getElementById('ex-title').textContent =
      T(titleKey, { id: ex.id, title: ex.title });
    // Goal, description and hints are NOT rendered here any more: the workshop
    // platform holds the statement, in markdown, and showing it twice means
    // maintaining it twice. The title stays so the pane says which exercise is
    // loaded. The strings remain in lang*.js because they are the source the
    // platform's importer reads.

    // Available instructions (base + unlocked)
    var allowed = window.MiniASMExercises.effectiveAvailable(ex);
    var availEl = document.getElementById('ex-available');
    availEl.innerHTML = T('availableLabel');
    for (var i = 0; i < allowed.length; i++) {
      var code = document.createElement('code');
      code.textContent = allowed[i];
      availEl.appendChild(code);
    }

    // Hints live in the platform, next to the statement, and it serves them
    // with CTFd's own reveal tracking — so there is nothing to render here.
    document.getElementById('test-results').innerHTML = '';

    // Show completed badge
    if (window.MiniASMExercises.isCompleted(ex.id)) {
      var results = document.getElementById('test-results');
      results.innerHTML = '<div class="test-summary success">' + T('alreadyCompleted') + '</div>';
    }
  }

  // ─── Test runner UI ─────────────────────────────────────────────────

  function renderForbiddenInstructions(resultsEl, forbidden, allowed) {
    var summary = document.createElement('div');
    summary.className = 'test-summary forbidden';

    var forbiddenTitle = forbidden.length > 1 ? T('forbiddenPlural') : T('forbiddenSingular');
    var title = document.createElement('div');
    title.textContent = forbiddenTitle + ':';
    summary.appendChild(title);

    for (var i = 0; i < forbidden.length; i++) {
      var err = forbidden[i];
      var line = document.createElement('div');
      line.textContent = T('lineLabel') + err.line + ': ' + err.opcode;
      summary.appendChild(line);
    }

    var allowedLine = document.createElement('div');
    allowedLine.textContent = T('allowedLabel') + allowed.join(', ');
    summary.appendChild(allowedLine);

    resultsEl.appendChild(summary);
  }

  function makeTestLine(r, fmtIO) {
    var div = document.createElement('div');
    div.className = 'test-line';

    if (r.error) {
      div.classList.add('error');
      div.textContent = T('testErrorLine', {
        n: r.index + 1, io: fmtIO(r.inputs), err: r.error
      });
      return div;
    }

    if (r.passed) {
      div.classList.add('pass');
      div.textContent = T('testPassLine', {
        n: r.index + 1, io: fmtIO(r.inputs), actual: fmtIO(r.actual)
      });
      return div;
    }

    div.classList.add('fail');
    div.textContent = T('testFailLine', {
      n: r.index + 1, io: fmtIO(r.inputs),
      expected: fmtIO(r.expected), actual: fmtIO(r.actual)
    });
    return div;
  }

  /**
   * Show the completion token, when the app is embedded in a platform that
   * supplied a secret (js/token.js). Standalone, this does nothing at all.
   *
   * Shown on every pass, not only the first: a participant who solved an
   * exercise before the platform was open still needs the token.
   */
  function revealToken(summary, exerciseId) {
    if (!window.MiniASMToken) return;
    window.MiniASMToken.tokenFor(exerciseId).then(function (token) {
      if (!token) return;
      var box = document.createElement('div');
      box.className = 'completion-token';
      var label = document.createElement('span');
      label.textContent = T('tokenLabel');
      var code = document.createElement('code');
      code.textContent = token;
      code.setAttribute('data-token', token);
      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'token-copy';
      copy.textContent = T('tokenCopy');
      copy.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(token);
        copy.textContent = T('tokenCopied');
      });
      box.appendChild(label);
      box.appendChild(code);
      box.appendChild(copy);
      summary.appendChild(box);
    });
  }

  function runTests() {
    if (!currentExercise) return;
    // Everything this writes goes in the drawer. Open it, or the student
    // presses the button and nothing appears to happen.
    setExerciseCollapsed(false);
    var ex = currentExercise;
    var source = getSource();
    var fmtIO = window.MiniASMExercises.formatIO;
    var allowed = window.MiniASMExercises.effectiveAvailable(ex);

    var result = window.MiniASMExercises.runAllTests(ex, source);
    var resultsEl = document.getElementById('test-results');
    resultsEl.innerHTML = '';

    // Forbidden opcodes?
    if (result.forbidden && result.forbidden.length > 0) {
      renderForbiddenInstructions(resultsEl, result.forbidden, allowed);
      return;
    }

    // Test lines
    for (var i = 0; i < result.results.length; i++) {
      var r = result.results[i];
      resultsEl.appendChild(makeTestLine(r, fmtIO));
    }

    // Summary
    var summary = document.createElement('div');
    summary.className = 'test-summary';

    if (result.allPassed) {
      revealToken(summary, ex.id);
      var wasAlreadyDone = window.MiniASMExercises.isCompleted(ex.id);
      if (!wasAlreadyDone) {
        window.MiniASMExercises.markCompleted(ex.id);
        summary.classList.add('success');
        summary.innerHTML = T('allPassed');
        if (ex.unlocks) {
          var unlock = document.createElement('div');
          unlock.className = 'unlock-msg';
          unlock.textContent = T('unlockMsg', { instr: ex.unlocks + ' rX rY' });
          summary.appendChild(unlock);
        }
        updateNavButtons();
      } else {
        summary.classList.add('success');
        summary.innerHTML = T('stillPass');
      }
    } else {
      summary.classList.add('failure');
      summary.innerHTML = T('someFailed');
    }
    resultsEl.appendChild(summary);
  }

  function applyTranslations() {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var key = node.getAttribute('data-i18n');
      if (!key) continue;
      node.textContent = T(key);
    }

    var dropdownLabel = document.getElementById('nav-dropdown-label');
    if (dropdownLabel && currentModeId !== 'sandbox' && currentExercise) {
      var displayName = currentExercise.type === 'tutorial'
        ? currentExercise.title
        : currentExercise.name;
      dropdownLabel.textContent = displayName || T('dropdownPlaceholder');
    }

    var speedValue = document.getElementById('speed-value');
    var slider = document.getElementById('speed-slider');
    if (speedValue && slider) {
      var v = parseInt(slider.value, 10);
      speedValue.textContent = v === 0 ? T('speedInstant') : v + 'ms';
    }
  }

  function setupLanguageSelector() {
    var select = document.getElementById('lang-select');
    if (!select) return;

    select.innerHTML = '';
    var langs = window.MiniASMLang.LANGUAGES;
    for (var i = 0; i < langs.length; i++) {
      var opt = document.createElement('option');
      opt.value = langs[i].code;
      opt.textContent = langs[i].name;
      select.appendChild(opt);
    }
    select.value = window.MiniASMLang.current().code;

    select.addEventListener('change', function () {
      if (window.MiniASMLang.setCurrent(this.value)) {
        location.reload();
      }
    });
  }

  // Panels first: it moves the app's own containers into dockview, and Monaco
  // and Blockly must measure themselves inside their final boxes.
  if (window.MiniASMLayout) {
    window.MiniASMLayout.start();
    window.MiniASMLayout.onResize(function () {
      if (editor) editor.layout();
      if (window.Blockly && blocklyWorkspace) window.Blockly.svgResize(blocklyWorkspace);
    });
  }

  // ─── Wire up event handlers ─────────────────────────────────────────
  setupLanguageSelector();
  applyTranslations();

  document.getElementById('btn-run').addEventListener('click', run);
  document.getElementById('btn-step').addEventListener('click', step);
  document.getElementById('btn-reset').addEventListener('click', reset);

  // Speed slider: update displayed value
  document.getElementById('speed-slider').addEventListener('input', function () {
    var v = parseInt(this.value, 10);
    document.getElementById('speed-value').textContent = v === 0 ? T('speedInstant') : v + 'ms';
  });

  document.getElementById('btn-panel-test').addEventListener('click', runTests);
  document.getElementById('btn-ex-toggle').addEventListener('click', function () {
    setExerciseCollapsed(!exerciseCollapsed());
  });
  restoreExerciseCollapsed();
  document.getElementById('btn-mode-code').addEventListener('click', function () { setEditorMode('code'); });
  document.getElementById('btn-mode-blocks').addEventListener('click', function () { setEditorMode('blocks'); });
  document.getElementById('mode-nav').addEventListener('click', handleNavClick);

  // The saved layout outlives the session, so there has to be a way back to the
  // default one from inside the app.
  (function () {
    var btn = document.getElementById('btn-layout-reset');
    if (!btn) return;
    if (!window.MiniASMLayout) { btn.style.display = 'none'; return; }
    btn.addEventListener('click', function () { window.MiniASMLayout.reset(); });
  })();

  // Cheat overlay: button + close (only when enableCheats is true)
  (function () {
    var overlay = document.getElementById('cheat-overlay');
    var closeBtn = document.getElementById('cheat-close-btn');
    var cheatBtn = document.getElementById('btn-cheat-progress');

    if (cheatBtn) {
      cheatBtn.style.display = cheatsEnabled ? '' : 'none';
      cheatBtn.addEventListener('click', function () {
        if (cheatsEnabled) openCheatOverlay();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeCheatOverlay);
    }

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCheatOverlay();
      });
    }
  })();

  // Reset-on-change toggle: restore from localStorage and wire up
  (function () {
    var chk = document.getElementById('chk-reset-on-change');
    try {
      var saved = localStorage.getItem('miniasm-resetOnChange');
      if (saved !== null) {
        resetOnChange = saved === 'true';
        chk.checked = resetOnChange;
      }
    } catch (e) { /* ignore */ }
    chk.addEventListener('change', function () {
      resetOnChange = this.checked;
      try { localStorage.setItem('miniasm-resetOnChange', String(resetOnChange)); } catch (e) { /* ignore */ }
    });
  })();

  // ─── Monaco editor initialization ───────────────────────────────────

  require.config({
    // Relative, so the app works under any path prefix — a workshop platform
    // serves it from /runtime/<id>/<version>/.
    paths: { vs: 'vendor/monaco/vs' },
    // `'*': 'en'` made the loader fetch `editor.main.nls.en.js`, which
    // monaco-editor does not ship — English is built in — so every load 404'd,
    // and in the offline room this vendoring is for, that is a failed request
    // rather than a harmless one. The empty string means "the built-in
    // strings", which is what was wanted all along.
    'vs/nls': { availableLanguages: { '*': '' } }
  });

  require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
      value: loadCodeForMode('sandbox'),
      language: 'plaintext',
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      // Monaco measures its box once and then paints at that size, absolutely
      // positioned — so a container that shrinks leaves the editor's own DOM
      // hanging outside it, invisible but still swallowing clicks. The exercise
      // bar appearing under the dock is exactly that kind of shrink, and it
      // made the collapse button unclickable. Let Monaco watch its own box
      // rather than depending on being told.
      automaticLayout: true
    });

    function lineNumbersForLine(lineNumber) {
      var model = editor.getModel();
      if (!model) return String(lineNumber);
      var line = model.getLineContent(lineNumber);
      if (line.trim() === '' || line.trim().startsWith(';')) return '';
      var codeLineIndex = 0;
      for (var i = 1; i <= lineNumber; i++) {
        var l = model.getLineContent(i);
        if (l.trim() !== '' && !l.trim().startsWith(';')) codeLineIndex++;
      }
      return String(codeLineIndex);
    }

    function applyLineNumberOption() {
      editor.updateOptions({ lineNumbers: lineNumbersForLine });
    }

    applyLineNumberOption();
    editor.getModel().onDidChangeContent(function () {
      applyLineNumberOption();
      clearTimeout(syncHighlightTimeout);
      syncHighlightTimeout = setTimeout(syncProgramAndHighlightPC, 200);
    });

    var style = document.createElement('style');
    style.textContent = '.pc-line-highlight { background: rgba(249, 226, 175, 0.15); }';
    document.head.appendChild(style);

    // Build nav & initialize
    setupDropdown();
    buildNavButtons();
    renderExercisePanel();
    machine = createMachine();
    loadProgram();
    refreshTables();
    updateStatus();
    highlightPCLine();
  });

  /* ─── Embedding ───────────────────────────────────────────────────────
   *
   * A workshop platform shows the statement and tracks progress; this app is
   * the machine beside it. When it says so, hide the controls the platform
   * owns — the language picker, the exercise list, the dev jump — and let it
   * choose the exercise, so opening a step there loads the matching one here.
   */
  window.MiniASMEmbed = {
    /** Called once by the host, before anything else it asks for. */
    enable: function (options) {
      options = options || {};
      document.body.classList.add('embedded');
      if (options.language) {
        // Exercise text is resolved once, at load, against the language then
        // current — so switching afterwards would leave the statements in the
        // old one. The app's own language selector solves this by reloading;
        // do the same, and only when the language actually differs, which is
        // what stops it looping (the adapter re-runs on every frame load).
        try {
          var current = window.MiniASMLang.current();
          if (current && current.code !== options.language
              && window.MiniASMLang.setCurrent(options.language)) {
            location.reload();
            return;
          }
        } catch (e) { /* unknown language: keep the current one */ }
      }
    },

    /** Show exercise `id`, as the platform's current step. */
    selectExercise: function (id) {
      var exercise = findExercise(id);
      if (!exercise) return false;
      switchMode(id);
      updateNavButtons();
      // The exercise list is hidden when embedded, so without this tab a
      // participant who clicks Sandbox has no way back to their exercise —
      // short of touching the platform. One tab, always the current one.
      var tab = document.getElementById('embed-exercise-tab');
      if (tab) {
        var titleKey = exercise.type === 'tutorial' ? 'tutorialPrefix' : 'challengePrefix';
        tab.textContent = T(titleKey, { id: exercise.id, title: exercise.title });
        tab.hidden = false;
        tab.onclick = function () { window.MiniASMEmbed.selectExercise(id); };
      }
      return true;
    },

    /** Which exercise is open, or null in the sandbox. */
    currentExercise: function () {
      return currentExercise ? currentExercise.id : null;
    }
  };

})();
