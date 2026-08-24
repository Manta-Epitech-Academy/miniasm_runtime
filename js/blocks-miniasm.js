/**
 * MiniASM Blockly blocks and code generator (Scratch-like block mode).
 * Supports dynamic toolbox — only shows blocks for allowed opcodes.
 * Depends on: lang.js
 */
(function(global) {
  var Blockly = global.Blockly;
  if (!Blockly) return;

  var T = global.MiniASMLang.T;
  var CFG = global.MiniASMConfig;

  var regOptions = CFG.regOptions;

  // ----- Block definitions -----
  Blockly.Blocks['miniasm_start'] = {
    init: function() {
      this.appendDummyInput().appendField(T('blockStart'));
      appendHelpLines(this, 'tooltipStart');
      this.setNextStatement(true, null);
      this.setPreviousStatement(false);
      this.setDeletable(false);
      this.setColour(120);
      this.setTooltip(T('tooltipStart'));
    }
  };

  var lineNumField = function() {
    return new (Blockly.FieldLabelSerializable || Blockly.FieldLabel)('[1]', 'line_num');
  };

  var MAX_HELP_LINE = 48;

  /** Append help rows from T(tooltipKey), one dummy input per line (split on \\n). Long lines are word-wrapped. */
  function appendHelpLines(block, tooltipKey) {
    var text = T(tooltipKey);
    var lines = text.split('\n').map(function(s) { return s.trim(); }).filter(Boolean);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      while (line.length > MAX_HELP_LINE) {
        var idx = line.lastIndexOf(' ', MAX_HELP_LINE);
        if (idx <= 0) idx = MAX_HELP_LINE;
        out.push(line.slice(0, idx).trim());
        line = line.slice(idx).trim();
      }
      if (line) out.push(line);
    }
    for (var j = 0; j < out.length; j++) {
      block.appendDummyInput()
          .appendField((j === 0 ? 'ℹ️ ' : '   ') + out[j]);
    }
  }

  function setBlockUpdateValueFields(block) {
    if (block.type !== 'miniasm_set') return;
    var n = CFG.registers.count;
    var regOpts = CFG.regOptions;

    function validRegIndex(val) {
      var i = parseInt(val, 10);
      return !isNaN(i) && i >= 0 && i < n ? String(i) : '0';
    }

    function ensureDestVal() {
      var input = block.getInput('DEST_ROW') || block.getInput(0);
      var destType = block.getFieldValue('DEST_TYPE');
      var currentField = block.getField('DEST_VAL');
      var wantDropdown = (destType === 'reg');
      var isDropdown = currentField && currentField.constructor === Blockly.FieldDropdown;
      if (!currentField || isDropdown !== wantDropdown) {
        var saved = currentField ? block.getFieldValue('DEST_VAL') : '0';
        input.removeField('DEST_VAL');
        if (wantDropdown) {
          input.appendField(new Blockly.FieldDropdown(regOpts), 'DEST_VAL');
          block.setFieldValue(validRegIndex(saved), 'DEST_VAL');
        } else {
          input.appendField(new Blockly.FieldTextInput(saved || '0'), 'DEST_VAL');
        }
      }
    }

    function ensureSrcVal() {
      var input = block.getInput('SRC_ROW') || block.getInput(1);
      var srcType = block.getFieldValue('SRC_TYPE');
      var currentField = block.getField('SRC_VAL');
      var wantDropdown = (srcType === 'reg');
      var isDropdown = currentField && currentField.constructor === Blockly.FieldDropdown;
      if (!currentField || isDropdown !== wantDropdown) {
        var saved = currentField ? block.getFieldValue('SRC_VAL') : '0';
        input.removeField('SRC_VAL');
        if (wantDropdown) {
          input.appendField(new Blockly.FieldDropdown(regOpts), 'SRC_VAL');
          block.setFieldValue(validRegIndex(saved), 'SRC_VAL');
        } else {
          input.appendField(new Blockly.FieldTextInput(saved || '0'), 'SRC_VAL');
        }
      }
    }

    ensureDestVal();
    ensureSrcVal();
  }

  function createSetTypeDropdown(options, onTypeChange) {
    var field = new Blockly.FieldDropdown(options);
    if (field.setValidator) {
      field.setValidator(function(newVal) {
        var f = this;
        setTimeout(function() {
          var block = f.getSourceBlock && f.getSourceBlock();
          if (block && block.workspace && !block.isDisposed() && onTypeChange) {
            onTypeChange(block);
          }
        }, 0);
        return newVal;
      });
    }
    return field;
  }

  Blockly.Blocks['miniasm_set'] = {
    init: function() {
      var self = this;
      this.appendDummyInput('DEST_ROW')
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('SET')
          .appendField(
              createSetTypeDropdown([['reg', 'reg'], ['mem', 'mem']], setBlockUpdateValueFields),
              'DEST_TYPE')
          .appendField(new Blockly.FieldDropdown(regOptions), 'DEST_VAL');
      this.appendDummyInput('SRC_ROW')
          .appendField(T('blockTo'))
          .appendField(
              createSetTypeDropdown([['reg', 'reg'], ['mem', 'mem'], ['#', '#']], setBlockUpdateValueFields),
              'SRC_TYPE')
          .appendField(new Blockly.FieldDropdown(regOptions), 'SRC_VAL');
      appendHelpLines(this, 'tooltipSet');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip(T('tooltipSet'));
    }
  };

  Blockly.Blocks['miniasm_inc'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('INC reg ')
          .appendField(new Blockly.FieldDropdown(regOptions), 'REG');
      appendHelpLines(this, 'tooltipInc');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip(T('tooltipInc'));
    }
  };

  Blockly.Blocks['miniasm_dec'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('DEC reg ')
          .appendField(new Blockly.FieldDropdown(regOptions), 'REG');
      appendHelpLines(this, 'tooltipDec');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip(T('tooltipDec'));
    }
  };

  Blockly.Blocks['miniasm_isz'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('ISZ reg ')
          .appendField(new Blockly.FieldDropdown(regOptions), 'REG');
      appendHelpLines(this, 'tooltipIsz');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip(T('tooltipIsz'));
    }
  };

  Blockly.Blocks['miniasm_isn'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('ISN reg ')
          .appendField(new Blockly.FieldDropdown(regOptions), 'REG');
      appendHelpLines(this, 'tooltipIsn');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip(T('tooltipIsn'));
    }
  };

  Blockly.Blocks['miniasm_jmp'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('JMP to instruction ')
          .appendField(new Blockly.FieldNumber(1, 1, 999), 'LINE');
      appendHelpLines(this, 'tooltipJmp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip(T('tooltipJmp'));
    }
  };

  Blockly.Blocks['miniasm_stp'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('STP');
      appendHelpLines(this, 'tooltipStp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(30);
      this.setTooltip(T('tooltipStp'));
    }
  };

  // ----- Comment block -----
  Blockly.Blocks['miniasm_comment'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('; ')
          .appendField(new Blockly.FieldTextInput('comment'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip(T('tooltipComment'));
    }
  };

  // ----- Unlockable instruction blocks -----
  Blockly.Blocks['miniasm_add'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('ADD  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipAdd');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipAdd'));
    }
  };

  Blockly.Blocks['miniasm_sub'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('SUB  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipSub');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipSub'));
    }
  };

  Blockly.Blocks['miniasm_swp'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('SWP  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipSwp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipSwp'));
    }
  };

  Blockly.Blocks['miniasm_mul'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('MUL  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipMul');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipMul'));
    }
  };

  Blockly.Blocks['miniasm_pow'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('POW  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipPow');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipPow'));
    }
  };

  Blockly.Blocks['miniasm_cmp'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(lineNumField(), 'LINE_NUM')
          .appendField('CMP  r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'X')
          .appendField(' r')
          .appendField(new Blockly.FieldDropdown(regOptions), 'Y');
      appendHelpLines(this, 'tooltipCmp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip(T('tooltipCmp'));
    }
  };

  // ----- Conditional jump blocks -----
  var condJumps = [
    { op: 'JEQ', tooltip: 'tooltipJeq' },
    { op: 'JLT', tooltip: 'tooltipJlt' },
    { op: 'JGT', tooltip: 'tooltipJgt' },
    { op: 'JGE', tooltip: 'tooltipJge' },
    { op: 'JLE', tooltip: 'tooltipJle' },
  ];
  condJumps.forEach(function(def) {
    var blockType = 'miniasm_' + def.op.toLowerCase();
    Blockly.Blocks[blockType] = {
      init: function() {
        this.appendDummyInput()
            .appendField(lineNumField(), 'LINE_NUM')
            .appendField(def.op + '  r')
            .appendField(new Blockly.FieldDropdown(regOptions), 'REG')
            .appendField(' to instruction ')
            .appendField(new Blockly.FieldNumber(1, 1, 999), 'LINE');
        appendHelpLines(this, def.tooltip);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip(T(def.tooltip));
      }
    };
  });

  // ----- Generator: block -> MiniASM line -----
  var generator = {};
  generator['miniasm_set'] = function(block) {
    var dt = block.getFieldValue('DEST_TYPE');
    var dval = String(block.getFieldValue('DEST_VAL') || '').trim().replace(/^r|^@/, '');
    var dest = dt === 'reg' ? ('r' + dval) : ('@' + dval);
    var st = block.getFieldValue('SRC_TYPE');
    var sval = String(block.getFieldValue('SRC_VAL') || '').trim().replace(/^r|^@|^#/, '');
    var src = st === 'reg' ? ('r' + sval) : (st === 'mem' ? ('@' + sval) : ('#' + sval));
    return 'SET ' + dest + ' ' + src;
  };
  generator['miniasm_inc'] = function(block) {
    return 'INC r' + (block.getFieldValue('REG') || '0');
  };
  generator['miniasm_dec'] = function(block) {
    return 'DEC r' + (block.getFieldValue('REG') || '0');
  };
  generator['miniasm_isz'] = function(block) {
    return 'ISZ r' + (block.getFieldValue('REG') || '0');
  };
  generator['miniasm_isn'] = function(block) {
    return 'ISN r' + (block.getFieldValue('REG') || '0');
  };
  generator['miniasm_jmp'] = function(block) {
    return 'JMP i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_stp'] = function() {
    return 'STP';
  };
  generator['miniasm_add'] = function(block) {
    return 'ADD r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_sub'] = function(block) {
    return 'SUB r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_swp'] = function(block) {
    return 'SWP r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_mul'] = function(block) {
    return 'MUL r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_pow'] = function(block) {
    return 'POW r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_cmp'] = function(block) {
    return 'CMP r' + (block.getFieldValue('X') || '0') + ' r' + (block.getFieldValue('Y') || '0');
  };
  generator['miniasm_jeq'] = function(block) {
    return 'JEQ r' + (block.getFieldValue('REG') || '0') + ' i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_jlt'] = function(block) {
    return 'JLT r' + (block.getFieldValue('REG') || '0') + ' i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_jgt'] = function(block) {
    return 'JGT r' + (block.getFieldValue('REG') || '0') + ' i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_jge'] = function(block) {
    return 'JGE r' + (block.getFieldValue('REG') || '0') + ' i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_jle'] = function(block) {
    return 'JLE r' + (block.getFieldValue('REG') || '0') + ' i' + (block.getFieldValue('LINE') || 1);
  };
  generator['miniasm_comment'] = function(block) {
    return '; ' + (block.getFieldValue('TEXT') || '');
  };

  // ----- blocksToCode -----
  function blocksToCode(workspace) {
    var lines = [];
    var topBlocks = workspace.getTopBlocks(true);
    var startBlock = null;
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].type === 'miniasm_start') {
        startBlock = topBlocks[i];
        break;
      }
    }
    var block;
    if (startBlock && startBlock.getNextBlock) {
      block = startBlock.getNextBlock();
    } else {
      block = null;
    }
    function emitBlock(b) {
      var fn = generator[b.type];
      if (!fn) return null;
      var line = fn(b);
      // Append Blockly native comment as inline comment (skip for comment blocks)
      if (b.type !== 'miniasm_comment') {
        var ic = (typeof b.getCommentText === 'function') ? b.getCommentText() : null;
        if (ic) line += ' ; ' + ic;
      }
      return line;
    }
    if (block) {
      while (block) {
        var line = emitBlock(block);
        if (line !== null) lines.push(line);
        block = block.getNextBlock ? block.getNextBlock() : null;
      }
    } else {
      for (var j = 0; j < topBlocks.length; j++) {
        var line = emitBlock(topBlocks[j]);
        if (line !== null) lines.push(line);
      }
    }
    return lines.join('\n');
  }

  // ----- codeToBlocks -----
  function codeToBlocks(workspace, code) {
    workspace.clear();
    var lines = (code || '').split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    var blockInfos = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // Full-line comment → comment block
      if (line.startsWith(';')) {
        blockInfos.push({ type: 'miniasm_comment', TEXT: line.slice(1).trim() });
        continue;
      }
      // Check for inline comment
      var semiIdx = line.indexOf(';');
      var inlineComment = null;
      if (semiIdx !== -1) {
        inlineComment = line.slice(semiIdx + 1).trim();
        line = line.slice(0, semiIdx).trim();
      }
      var blockInfo = parseLineToBlock(line);
      if (blockInfo) {
        if (inlineComment) blockInfo._comment = inlineComment;
        blockInfos.push(blockInfo);
      }
    }
    var blockXml = document.createElement('xml');
    var startEl = document.createElement('block');
    startEl.setAttribute('type', 'miniasm_start');
    startEl.setAttribute('x', 20);
    startEl.setAttribute('y', 20);
    startEl.setAttribute('deletable', 'false');
    if (blockInfos.length > 0) {
      var nextEl = buildNextChain(blockInfos, 0);
      if (nextEl) startEl.appendChild(nextEl);
    }
    blockXml.appendChild(startEl);
    try {
      Blockly.Xml.domToWorkspace(blockXml, workspace);
      workspace.getAllBlocks(false).forEach(function(b) {
        if (b.type === 'miniasm_set') setBlockUpdateValueFields(b);
      });
      updateBlockLineNumbers(workspace);
    } catch (e) {
      console.warn('codeToBlocks:', e);
    }
  }

  function buildNextChain(blockInfos, index) {
    if (index >= blockInfos.length) return null;
    var nextEl = document.createElement('next');
    var blockEl = blockInfoToXml(blockInfos[index], 20, 20 + (index + 1) * 50);
    var nested = buildNextChain(blockInfos, index + 1);
    if (nested) blockEl.appendChild(nested);
    nextEl.appendChild(blockEl);
    return nextEl;
  }

  function parseLineToBlock(line) {
    var tokens = line.split(/\s+/).map(function(t) { return t.trim(); }).filter(Boolean);
    if (tokens.length === 0) return null;
    var op = tokens[0];
    if (op === 'SET' && tokens.length >= 3) {
      var dest = tokens[1];
      var src = tokens[2];
      var destIsReg = dest.charAt(0) === 'r';
      var srcIsReg = src.charAt(0) === 'r';
      var srcIsMem = src.charAt(0) === '@';
      var srcIsImm = src.charAt(0) === '#';
      return {
        type: 'miniasm_set',
        DEST_TYPE: destIsReg ? 'reg' : 'mem',
        DEST_VAL: destIsReg ? dest.replace(/^r/, '') : dest.replace(/^@/, ''),
        SRC_TYPE: srcIsImm ? '#' : (srcIsMem ? 'mem' : 'reg'),
        SRC_VAL: srcIsImm ? src.replace(/^#/, '') : (srcIsMem ? src.replace(/^@/, '') : src.replace(/^r/, ''))
      };
    }
    if (op === 'INC' && tokens.length >= 2) return { type: 'miniasm_inc', REG: tokens[1].replace(/^r/, '') };
    if (op === 'DEC' && tokens.length >= 2) return { type: 'miniasm_dec', REG: tokens[1].replace(/^r/, '') };
    if (op === 'ISZ' && tokens.length >= 2) return { type: 'miniasm_isz', REG: tokens[1].replace(/^r/, '') };
    if (op === 'ISN' && tokens.length >= 2) return { type: 'miniasm_isn', REG: tokens[1].replace(/^r/, '') };
    if (op === 'JMP' && tokens.length >= 2) {
      var lineNum = tokens[1].charAt(0) === 'i' ? parseInt(tokens[1].slice(1), 10) : parseInt(tokens[1], 10);
      return { type: 'miniasm_jmp', LINE: (isNaN(lineNum) || lineNum < 1) ? 1 : lineNum };
    }
    if (op === 'STP') return { type: 'miniasm_stp' };
    // Unlockable instructions
    if (op === 'ADD' && tokens.length >= 3) return { type: 'miniasm_add', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (op === 'SUB' && tokens.length >= 3) return { type: 'miniasm_sub', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (op === 'SWP' && tokens.length >= 3) return { type: 'miniasm_swp', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (op === 'MUL' && tokens.length >= 3) return { type: 'miniasm_mul', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (op === 'POW' && tokens.length >= 3) return { type: 'miniasm_pow', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (op === 'CMP' && tokens.length >= 3) return { type: 'miniasm_cmp', X: tokens[1].replace(/^r/, ''), Y: tokens[2].replace(/^r/, '') };
    if (['JEQ','JLT','JGT','JGE','JLE'].indexOf(op) !== -1 && tokens.length >= 3) {
      var regVal = tokens[1].replace(/^r/, '');
      var lineNum = tokens[2].charAt(0) === 'i' ? parseInt(tokens[2].slice(1), 10) : parseInt(tokens[2], 10);
      return { type: 'miniasm_' + op.toLowerCase(), REG: regVal, LINE: (isNaN(lineNum) || lineNum < 1) ? 1 : lineNum };
    }
    return null;
  }

  function blockInfoToXml(info, x, y) {
    var block = document.createElement('block');
    block.setAttribute('type', info.type);
    block.setAttribute('x', x);
    block.setAttribute('y', y);
    for (var key in info) {
      if (key === 'type' || key === '_comment') continue;
      var field = document.createElement('field');
      field.setAttribute('name', key);
      field.textContent = String(info[key]);
      block.appendChild(field);
    }
    // Inline comment → Blockly native comment bubble (hidden by default)
    if (info._comment) {
      var commentEl = document.createElement('comment');
      commentEl.setAttribute('pinned', 'false');
      // Size the bubble to fit the text
      var textLen = info._comment.length;
      var w = Math.max(120, Math.min(320, textLen * 8));
      var h = Math.max(40, Math.ceil(textLen / 35) * 24 + 16);
      commentEl.setAttribute('w', String(w));
      commentEl.setAttribute('h', String(h));
      commentEl.textContent = info._comment;
      block.appendChild(commentEl);
    }
    return block;
  }

  // ----- Dynamic toolbox -----
  // Maps opcodes to their Blockly block type
  var OPCODE_TO_BLOCK = {
    SET: 'miniasm_set',
    INC: 'miniasm_inc',
    DEC: 'miniasm_dec',
    ISZ: 'miniasm_isz',
    ISN: 'miniasm_isn',
    JMP: 'miniasm_jmp',
    STP: 'miniasm_stp',
    ADD: 'miniasm_add',
    SUB: 'miniasm_sub',
    SWP: 'miniasm_swp',
    MUL: 'miniasm_mul',
    POW: 'miniasm_pow',
    CMP: 'miniasm_cmp',
    JEQ: 'miniasm_jeq',
    JLT: 'miniasm_jlt',
    JGT: 'miniasm_jgt',
    JGE: 'miniasm_jge',
    JLE: 'miniasm_jle',
  };

  // Category structure (opcodes grouped by category, with lang keys)
  var CATEGORIES = [
    { nameKey: 'catData',        opcodes: ['SET'] },
    { nameKey: 'catArithmetic',  opcodes: ['INC', 'DEC', 'ADD', 'SUB', 'MUL', 'POW'] },
    { nameKey: 'catComparisons', opcodes: ['CMP', 'JEQ', 'JLT', 'JGT', 'JGE', 'JLE'] },
    { nameKey: 'catSwaps',       opcodes: ['SWP'] },
    { nameKey: 'catControl',     opcodes: ['ISZ', 'ISN', 'JMP', 'STP'] },
  ];

  /**
   * Build a Blockly toolbox XML string showing only allowed opcodes.
   * If allowedOpcodes is null/undefined, all opcodes are shown.
   */
  function buildToolboxXml(allowedOpcodes) {
    var xml = '<xml xmlns="https://developers.google.com/blockly/xml">';
    for (var c = 0; c < CATEGORIES.length; c++) {
      var cat = CATEGORIES[c];
      var blocks = [];
      for (var o = 0; o < cat.opcodes.length; o++) {
        var op = cat.opcodes[o];
        if (!allowedOpcodes || allowedOpcodes.indexOf(op) !== -1) {
          blocks.push(OPCODE_TO_BLOCK[op]);
        }
      }
      if (blocks.length > 0) {
        xml += '<category name="' + T(cat.nameKey) + '">';
        for (var b = 0; b < blocks.length; b++) {
          xml += '<block type="' + blocks[b] + '"></block>';
        }
        xml += '</category>';
      }
    }
    // Comment block is always available (not gated by opcodes)
    xml += '<category name="' + T('catComments') + '">';
    xml += '<block type="miniasm_comment"></block>';
    xml += '</category>';
    xml += '</xml>';
    return xml;
  }

  /**
   * Update a workspace's toolbox to show only the given opcodes.
   */
  function updateToolbox(workspace, allowedOpcodes) {
    if (!workspace) return;
    var xml = buildToolboxXml(allowedOpcodes);
    workspace.updateToolbox(xml);
  }

  // ----- Workspace creation -----
  function createWorkspace(container, allowedOpcodes) {
    var toolbox = buildToolboxXml(allowedOpcodes);
    var workspace = Blockly.inject(container, {
      toolbox: toolbox,
      grid: { spacing: 20, length: 3, colour: '#313244', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1, maxScale: 2, minScale: 0.5 }
    });
    if (workspace.addChangeListener) {
      workspace.addChangeListener(function(event) {
        var fieldName = event.name || event.field;
        if ((fieldName === 'DEST_TYPE' || fieldName === 'SRC_TYPE') && event.blockId) {
          var block = workspace.getBlockById ? workspace.getBlockById(event.blockId) : null;
          if (!block && workspace.getAllBlocks) {
            var all = workspace.getAllBlocks(false);
            for (var i = 0; i < all.length; i++) {
              var b = all[i];
              if ((b.id || b.getId && b.getId()) === event.blockId) {
                block = b;
                break;
              }
            }
          }
          if (block && block.type === 'miniasm_set') {
            setTimeout(function() {
              if (block.workspace && !block.isDisposed()) setBlockUpdateValueFields(block);
            }, 0);
          }
        }
      });
    }
    return workspace;
  }

  // ----- PC indicator & line numbers -----
  function isExecutableBlock(block) {
    return block.type !== 'miniasm_start' && block.type !== 'miniasm_comment' && generator[block.type];
  }

  function getBlockAtLineIndex(workspace, index) {
    if (!workspace || index < 0) return null;
    var topBlocks = workspace.getTopBlocks(true);
    var startBlock = null;
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].type === 'miniasm_start') {
        startBlock = topBlocks[i];
        break;
      }
    }
    var block = startBlock && startBlock.getNextBlock ? startBlock.getNextBlock() : null;
    var n = 0;
    while (block) {
      if (isExecutableBlock(block)) {
        if (n === index) return block;
        n++;
      }
      block = block.getNextBlock ? block.getNextBlock() : null;
    }
    return null;
  }

  function setPCIndicator(workspace, pcIndex) {
    if (!workspace) return;
    var pcBlock = pcIndex >= 0 ? getBlockAtLineIndex(workspace, pcIndex) : null;
    if (typeof workspace.highlightBlock === 'function') {
      workspace.highlightBlock(pcBlock ? pcBlock.id : null);
    }
  }

  function updateBlockLineNumbers(workspace) {
    if (!workspace) return;
    var topBlocks = workspace.getTopBlocks(true);
    var startBlock = null;
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].type === 'miniasm_start') {
        startBlock = topBlocks[i];
        break;
      }
    }
    var block = startBlock && startBlock.getNextBlock ? startBlock.getNextBlock() : null;
    var lineNum = 1;
    while (block) {
      if (isExecutableBlock(block)) {
        var field = block.getField('LINE_NUM');
        if (field && typeof field.setValue === 'function') {
          field.setValue('[' + lineNum + ']');
        }
        lineNum++;
      }
      block = block.getNextBlock ? block.getNextBlock() : null;
    }
  }

  function centerBlocksInView(workspace) {
    if (!workspace) return;
    var topBlocks = workspace.getTopBlocks(true);
    var startBlock = null;
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].type === 'miniasm_start') {
        startBlock = topBlocks[i];
        break;
      }
    }
    if (startBlock && typeof workspace.centerOnBlock === 'function') {
      workspace.centerOnBlock(startBlock.id, false);
    }
  }

  global.MiniASMBlocks = {
    blocksToCode: blocksToCode,
    codeToBlocks: codeToBlocks,
    createWorkspace: createWorkspace,
    getBlockAtLineIndex: getBlockAtLineIndex,
    setPCIndicator: setPCIndicator,
    updateBlockLineNumbers: updateBlockLineNumbers,
    centerBlocksInView: centerBlocksInView,
    buildToolboxXml: buildToolboxXml,
    updateToolbox: updateToolbox
  };
})(typeof window !== 'undefined' ? window : this);
