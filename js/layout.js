/**
 * Panel layout, on dockview — the same library the platform's other editor
 * runtime (tic80-web-editor) uses, so a participant meets one set of manners
 * across workshops: drag a divider to resize, drag a tab to rearrange, double
 * click a tab to maximise.
 *
 * The panels are the app's existing DOM, moved rather than rebuilt: the code
 * editor, the exercise (statement header, Test, results), and the machine
 * (registers and memory). Nothing in ui.js needs to know this happened, beyond
 * being told when its panel changed size so Monaco and Blockly can re-measure.
 *
 * `dockview-core` is the framework-free build; the UMD file carries its own
 * CSS. If it is missing the app falls back to the plain CSS split, so a
 * vendor/ that was never fetched degrades instead of breaking.
 */
(function () {
  var STORAGE_KEY = 'miniasm-layout';
  // Bump when the default arrangement changes shape. A saved layout is the
  // participant's, and normally wins — but it also outlives the release that
  // produced it, and the platform syncs it to the server, so it follows them
  // to the next machine. Without this, everyone who had already opened the app
  // would keep the old stacked panels for ever and never see the tabs.
  // 2: Machine and Exercice became tabs of one group.
  // 3: the exercise left the dock for a bar under it; two panels remain.
  var LAYOUT_VERSION = 3;
  var resizeHandlers = [];

  function api() {
    return window['dockview-core'] || window.dockviewCore || null;
  }

  function panelDefs() {
    var editor = document.querySelector('.panel-editor');
    var state = document.querySelector('.panel-state');
    if (!editor || !state) return null;

    // The machine is what is left of the state panel once the exercise moves
    // out: options, registers, memory.
    var machine = document.createElement('div');
    machine.className = 'dock-machine';
    ['.state-options', '.table-block.registers', '.table-block.memory']
      .forEach(function (selector) {
        var node = state.querySelector(selector);
        if (node) machine.appendChild(node);
      });

    return {
      code: { title: 'Code', element: editor },
      machine: { title: 'Machine', element: machine },
    };
  }

  function build() {
    var dockview = api();
    var root = document.getElementById('root');
    var defs = panelDefs();
    if (!dockview || !root || !defs) return null;

    // The exercise bar is not a dock panel: it spans the app under both of
    // them and collapses on its own. Take it out before the wipe, and put it
    // back under the dock.
    var exercise = document.getElementById('exercise-panel');
    var host = document.createElement('div');
    host.id = 'dock';
    host.className = 'dockview-theme-dark';
    root.innerHTML = '';
    root.appendChild(host);
    if (exercise) root.appendChild(exercise);

    var component = dockview.createDockview(host, {
      className: 'dockview-theme-dark',
      // dockview detaches a panel's DOM when its tab is not the active one
      // ('onlyWhenVisible', its default). That is fine for a panel a component
      // rebuilds on demand, and wrong here: these panels *are* the app's DOM,
      // and ui.js reaches into them by id from the top level. With Machine and
      // Exercice sharing a group, the hidden one's elements left the document
      // — getElementById returned null, and the listener wiring threw before
      // it finished. Keep every panel mounted.
      defaultRenderer: 'always',
      createComponent: function (options) {
        var def = defs[options.name];
        var element = document.createElement('div');
        element.className = 'dock-panel';
        if (def && def.element) {
          def.element.classList.add('dock-content');
          element.appendChild(def.element);
        }
        return {
          element: element,
          init: function () { /* content is already built by ui.js */ },
        };
      },
    });

    // Default: code and the machine side by side, both always on screen.
    // Neither is ever a tab behind the other — a student reads the machine to
    // understand what their code did, so hiding either to show the other is
    // the wrong trade at any size. What used to compete with them for the
    // space, the exercise, is the bar underneath now.
    function defaultLayout() {
      component.addPanel({ id: 'code', component: 'code', title: defs.code.title });
      component.addPanel({
        id: 'machine', component: 'machine', title: defs.machine.title,
        position: { referencePanel: 'code', direction: 'right' },
      });
      // `initialWidth` on addPanel does not survive the split that creates the
      // group, so the sizes are set afterwards, through the panel API. Checked
      // by measuring, not by assuming: without this the machine opened as a
      // strip about 100px wide.
      sizeAfterLayout();
    }

    /**
     * dockview learns its own size from a ResizeObserver, which has not fired
     * yet on the frame the panels are added: `component.width` reads 0 there,
     * every group is 100px, and a setSize against that is thrown away when the
     * real size arrives — which is why the panes always opened at an even
     * 50/50, however loudly the code asked for something else. Embedded it is
     * worse: the pane animates open, so the first non-zero width is not the
     * final one either. Wait for two frames that agree, take the shares from
     * that width, and give up rather than spin.
     */
    function sizeAfterLayout() {
      var attempts = 0;
      var previous = 0;
      requestAnimationFrame(function apply() {
        var width = component.width;
        var height = component.height;
        if (!width || !height || width !== previous) {
          previous = width;
          if (attempts++ < 120) requestAnimationFrame(apply);
          return;
        }
        try {
          var machine = component.getPanel('machine');
          // A floor for the machine: a memory table narrower than this is
          // unreadable, and the pane can be dragged narrow. Height needs no
          // share now — Machine and Exercice are tabs, so each has the column.
          if (machine) machine.api.setSize({ width: Math.max(300, Math.round(width * 0.42)) });
        } catch (e) { /* older dockview: leave the defaults */ }
      });
    }

    // A layout is only worth restoring if it still holds every panel. Earlier
    // builds let a tab be closed, and that layout was saved and then followed
    // the participant into every later session — an app with no editor, and no
    // way back. Treat a short layout as no layout.
    function isComplete() {
      var ids = Object.keys(defs);
      for (var i = 0; i < ids.length; i++) {
        if (!component.getPanel(ids[i])) return false;
      }
      return true;
    }

    var restored = false;
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.v === LAYOUT_VERSION && saved.layout) {
        component.fromJSON(saved.layout);
        restored = component.panels.length > 0 && isComplete();
      }
    } catch (e) {
      restored = false;
    }
    if (!restored) {
      try { component.clear(); } catch (e) { /* nothing to clear */ }
      defaultLayout();
    }

    var save = function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(
          { v: LAYOUT_VERSION, layout: component.toJSON() }));
      } catch (e) { /* private mode, or quota */ }
    };
    component.onDidLayoutChange(save);

    // Monaco and Blockly both measure themselves once and need telling when
    // their box changes — which, with draggable dividers, is often.
    component.onDidLayoutChange(notifyResize);
    window.addEventListener('resize', notifyResize);

    return component;
  }

  function notifyResize() {
    for (var i = 0; i < resizeHandlers.length; i++) {
      try { resizeHandlers[i](); } catch (e) { /* one bad handler is not fatal */ }
    }
  }

  window.MiniASMLayout = {
    /** Called by ui.js once its DOM exists. Returns false if dockview is absent. */
    start: function () {
      var component = build();
      this.component = component || null;
      if (component) document.body.classList.add('docked');
      return !!component;
    },
    /** Re-measure hook for anything that caches its own size. */
    onResize: function (handler) { resizeHandlers.push(handler); },
    /** Say the boxes changed. The exercise drawer opening is one such change. */
    notifyResize: notifyResize,
    /** Put the panels back where they started. */
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      location.reload();
    },
  };
})();
