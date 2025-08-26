import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
// Use QuestionUtils to guarantee non-overlapping options and shared preloading keys
import { pickItemsFromType, getAllIconKeys, getAllKeysForType, itemsFor } from './QuestionUtils';
// Still use feature asset list for display names
import { getAllFeatureAssets } from './AssetFeatureMapping';
import { getDimOverlayStyle } from './GameTheme';

// Game 4 — Feature Select-All (like Game 2 but by feature)
// - 20 rounds
// - Each round shows up to 8 items with 2–4 correct for a chosen feature
// - Wrong options never include items from the correct feature
// - Uses shared Preload scene (sheen progress bar) and Summary UI

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function getFeaturePrompt(featureName) {
  if (!featureName) return 'Select all the items that are correct.';
  const s = featureName.trim();
  if (s.startsWith('Have ')) return `Select all the items that have ${lowerFirst(s.slice(5))}.`;
  if (s.startsWith('Are ')) return `Select all the items that are ${lowerFirst(s.slice(4))}.`;
  return `Select all the items that have ${lowerFirst(s)}.`;
}

// Build name lookup from feature mappings (covers all feature items)
const NAME_BY_IMAGE = new Map((() => {
  try { return getAllFeatureAssets().map(a => [a.imagePath, a.name]); } catch { return []; }
})());

// Precompute icon keys using shared util
const ALL_ICON_KEYS = getAllIconKeys();

// Build many rounds across features using QuestionUtils to ensure no overlap and no repeats per session
function buildUniqueRounds(limit = 20) {
  const rounds = [];
  const chosenKeys = new Set();
  const allKeys = getAllKeysForType('feature');
  const keysShuffled = shuffle(allKeys);

  for (const key of keysShuffled) {
    if (rounds.length >= limit) break;
    if (chosenKeys.has(key)) continue;

    // pool of correct images for this feature
    const correctPool = itemsFor('feature', key) || [];
    const maxPossible = Math.min(correctPool.length, 4);
    if (maxPossible < 2) continue; // need at least 2 correct

    const target = 2 + Math.floor(Math.random() * 3); // 2..4
    const numCorrect = Math.min(maxPossible, target);
    const correctImgs = shuffle(correctPool).slice(0, numCorrect);

    // Build wrong set from ALL OTHER feature pools without overlap
    const keySet = new Set(correctPool);
    const wrongSet = new Set();
    for (const other of allKeys) {
      if (other === key) continue;
      const pool = itemsFor('feature', other) || [];
      for (const img of pool) {
        if (!keySet.has(img)) wrongSet.add(img);
      }
    }
    const totalOptions = 8;
    const needWrong = totalOptions - correctImgs.length;
    const wrongPool = Array.from(wrongSet);
    if (wrongPool.length < needWrong) continue;
    const wrongImgs = shuffle(wrongPool).slice(0, needWrong);

    const correct = correctImgs.map(img => ({ name: NAME_BY_IMAGE.get(img) || img, imagePath: img, isCorrect: true }));
    const wrong = wrongImgs.map(img => ({ name: NAME_BY_IMAGE.get(img) || img, imagePath: img, isCorrect: false }));

    rounds.push({
      feature: key,
      prompt: getFeaturePrompt(key),
      options: shuffle([...correct, ...wrong]),
      correctCount: correct.length,
    });
    chosenKeys.add(key);
  }

  // Fallback: if not enough, use pickItemsFromType but still avoid repeating the same feature key
  if (rounds.length < limit) {
    let guard = 0;
    while (rounds.length < limit && guard < 200) {
      guard++;
      const target = 2 + Math.floor(Math.random() * 3); // 2..4
      const pick = pickItemsFromType({ type: 'feature', numCorrect: target, numWrong: Math.max(0, 8 - target) });
      if (!pick) continue;
      if (chosenKeys.has(pick.key)) continue; // keep questions distinct by feature key
      const correct = (pick.correctImgs || []).map(img => ({ name: NAME_BY_IMAGE.get(img) || img, imagePath: img, isCorrect: true }));
      const wrong = (pick.wrongImgs || []).map(img => ({ name: NAME_BY_IMAGE.get(img) || img, imagePath: img, isCorrect: false }));
      if (correct.length < 2) continue;
      rounds.push({ feature: pick.key, prompt: getFeaturePrompt(pick.key), options: shuffle([...correct, ...wrong]), correctCount: correct.length });
      chosenKeys.add(pick.key);
    }
  }

  return rounds.slice(0, limit);
}

const GameContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background:
    'linear-gradient(135deg, rgba(4, 37, 57, 0.1) 0%, rgba(87, 199, 133, 0.05) 50%, rgba(249, 117, 68, 0.05) 100%)',
}));

const GameBoard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '1000px',
  minWidth: '280px',
  aspectRatio: '4/3',
  backgroundImage: 'url(/Games/backgrounds/junglebg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  ...getDimOverlayStyle(),
}));

export function Game4() {
  const containerRef = useRef();
  const phaserRef = useRef();
  const resizeObserverRef = useRef();

  useLayoutEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    import('phaser').then((PhaserLib) => {
      if (!mounted || !container) return;
      const PhaserGame = PhaserLib.default;
      phaserRef.current?.destroy(true);

      // Preloader scene, themed like Game 2/3 (no bouncing logo)
      class PreloadScene extends PhaserGame.Scene {
        constructor() { super({ key: 'PreloadScene' }); }
        preload() {
          const W = this.scale.width; const H = this.scale.height;
          const COLOR_DARK = 0x042539; const COLOR_ACCENT = 0x57c785; const COLOR_ACCENT_2 = 0xf9644d;

          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560); const panelH = Math.min(H * 0.24, 180);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18);
          panel.lineStyle(4, COLOR_DARK, 1);
          panel.strokeRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18);

          this.add.text(W / 2, H / 2 - panelH * 0.28, 'Loading...', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.max(18, Math.min(36, H * 0.055))}px`,
            color: '#ffffff', stroke: '#1e607d', strokeThickness: 3, align: 'center',
          }).setOrigin(0.5);

          const barW = panelW * 0.78; const barH = Math.max(12, Math.min(18, H * 0.025));
          const barX = (W - barW) / 2; const barY = H / 2 + barH * 0.5;
          const barBg = this.add.graphics(); barBg.fillStyle(0xffffff, 0.25);
          barBg.fillRoundedRect(barX, barY, barW, barH, 10);
          barBg.lineStyle(3, COLOR_DARK, 1); barBg.strokeRoundedRect(barX, barY, barW, barH, 10);
          const barFill = this.add.graphics();
          const percentText = this.add.text(W / 2, barY + barH * 2, '0%', {
            fontFamily: 'Fredoka One', fontSize: `${Math.max(14, Math.min(22, H * 0.035))}px`, color: '#ffffff', stroke: '#1e607d', strokeThickness: 2,
          }).setOrigin(0.5);

          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
          // Preload ALL mapping assets so shuffles never miss
          try { ALL_ICON_KEYS.forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`)); } catch {}

          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW; barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95); barFill.fillRoundedRect(barX, barY, w, barH, 10);
            barFill.lineStyle(2, COLOR_DARK, 1); barFill.strokeRoundedRect(barX, barY, Math.max(w, 2), barH, 10);
            if (w > 8) {
              const t = (this.time.now % 1200) / 1200; const sheenWidth = Math.max(30, Math.min(80, w * 0.25));
              const sxRaw = barX - 60 + (w + 120) * t; const startX = Math.max(barX, sxRaw); const endX = Math.min(barX + w, sxRaw + sheenWidth); const cw = endX - startX;
              if (cw > 0) {
                barFill.fillStyle(0xffffff, 0.2);
                barFill.beginPath(); barFill.moveTo(startX, barY); barFill.lineTo(startX + Math.min(16, cw * 0.25), barY);
                barFill.lineTo(startX + cw, barY + barH); barFill.lineTo(startX + Math.max(0, cw - Math.min(16, cw * 0.25)), barY + barH);
                barFill.closePath(); barFill.fillPath();
                barFill.fillStyle(COLOR_ACCENT_2, 0.12); barFill.fillRect(Math.max(barX, endX - 2), barY + 2, 2, barH - 4);
              }
            }
          };
          drawBar(0);
          this.sheenTick = this.time.addEvent({ delay: 40, loop: true, callback: () => drawBar(this.prog.v) });

          this.load.on('progress', (value) => {
            if (this.progressTween) this.progressTween.remove();
            const start = this.prog.v; const dist = Math.abs(value - start);
            this.progressTween = this.tweens.add({ targets: this.prog, v: value, duration: Math.max(200, Math.min(700, 800 * dist)), ease: 'Sine.easeOut', onUpdate: () => {
              drawBar(this.prog.v); percentText.setText(`${Math.round(this.prog.v * 100)}%`);
            }});
          });

          this.load.once('complete', () => {
            const scene = this; // eslint-disable-next-line no-undef
            WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureSelectAllScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureSelectAllScene'); } });
          });
        }
      }

      class FeatureSelectAllScene extends PhaserGame.Scene {
        constructor() { super({ key: 'FeatureSelectAllScene' }); }
        init() {
          this.rounds = buildUniqueRounds(20);
          this.roundIndex = 0;
          this.perfectRounds = 0; // score counts perfect rounds (first confirm all correct)
          this.optionContainers = [];
          this.selected = new Set();
          this.roundComplete = false;
          this.firstAttempt = true;

          this.correctAudioFiles = [ '/Games/audio/right1.mp3', '/Games/audio/right2.mp3', '/Games/audio/right3.mp3' ];
          this.wrongAudioFiles = [ '/Games/audio/wrong1.mp3', '/Games/audio/wrong2.mp3' ];
        }
        preload() {}
        create() { this.setupUI(); this.showRound(); }

        setupUI() {
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, this.scale.height / 6, '', { fontFamily: 'Fredoka One', fontSize: `${qFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 6, align: 'center', wordWrap: { width: this.scale.width * 0.9 } }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);
          const pFont = Math.max(14, Math.min(28, this.scale.height * 0.05));
          this.progressText = this.add.text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '', { fontFamily: 'Fredoka One', fontSize: `${pFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 5 }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          // Shuffle button
          this.createShuffleButton();
          // Store resize handlers to detach later
          this._onResizeShuffle = () => this.positionShuffleButton();
          this.scale.on('resize', this._onResizeShuffle);

          // Confirm button
          this.confirmBtn = this.buildConfirmButton();
          this.positionConfirmButton();
          this._onResizeConfirm = () => this.positionConfirmButton();
          this.scale.on('resize', this._onResizeConfirm);

          // Teardown listeners on shutdown/destroy
          const offAll = () => {
            try { if (this._onResizeShuffle) { this.scale.off('resize', this._onResizeShuffle); this._onResizeShuffle = null; } } catch {}
            try { if (this._onResizeConfirm) { this.scale.off('resize', this._onResizeConfirm); this._onResizeConfirm = null; } } catch {}
          };
          this.events.once('shutdown', offAll);
          this.events.once('destroy', offAll);
        }

        createShuffleButton() {
          const sFontSize = Math.max(14, Math.min(24, this.scale.height * 0.045));
          const text = this.add.text(0, 0, 'Shuffle', { fontFamily: 'Fredoka One', fontSize: `${sFontSize}px`, color: '#042539' }).setOrigin(0.5);
          const width = text.width + 32; const height = text.height + 16;
          const bg = this.add.graphics(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
          const x = this.scale.width - 20 - width / 2; const y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          const container = this.add.container(x, y, [bg, text]); container.setSize(width, height); container.setInteractive({ useHandCursor: true });
          container.on('pointerover', () => { this.tweens.add({ targets: container, scale: 1.05, duration: 200 }); bg.clear(); bg.fillStyle(0x57C785, 0.8); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(6, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12); text.setColor('#ffffff'); });
          container.on('pointerout', () => { this.tweens.add({ targets: container, scale: 1, duration: 200 }); bg.clear(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12); text.setColor('#042539'); });
          container.on('pointerdown', () => { this.tweens.add({ targets: container, scale: 1.1, duration: 300, ease: 'Circ.easeInOut', onComplete: () => this.handleShuffle() }); });
          container.meta = { width, height }; this.shuffleBtn = container; this.positionShuffleButton();
        }
        positionShuffleButton() { if (!this.shuffleBtn) return; const width = this.shuffleBtn.meta.width; const height = this.shuffleBtn.meta.height; this.shuffleBtn.x = this.scale.width - 20 - width / 2; this.shuffleBtn.y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2); }
        handleShuffle() { this.rounds = buildUniqueRounds(20); this.roundIndex = 0; this.firstAttempt = true; this.perfectRounds = 0; this.showRound(); }

        positionConfirmButton() { if (!this.confirmBtn) return; this.confirmBtn.x = this.scale.width / 2; this.confirmBtn.y = this.scale.height * 0.9; }
        buildConfirmButton() {
          const w = Math.min(260, this.scale.width * 0.4); const h = Math.max(48, this.scale.height * 0.09);
          const g = this.add.graphics();
          const draw = (enabled, evaluating = false) => { g.clear(); const fill = !enabled ? 0x8aa3b5 : evaluating ? 0x57c785 : 0xf9644d; g.fillStyle(fill, 0.92); g.fillRoundedRect(-w / 2, -h / 2, w, h, 20); g.lineStyle(4, 0x042539, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20); };
          draw(false);
          const label = this.add.text(0, 0, 'Confirm', { fontFamily: 'Fredoka One', fontSize: `${Math.max(20, h * 0.42)}px`, color: '#fff' }).setOrigin(0.5);
          const ct = this.add.container(this.scale.width / 2, this.scale.height * 0.9, [g, label]);
          ct.meta = { draw, label, enabled: false };
          ct.setSize(w, h); ct.setInteractive({ useHandCursor: true });
          ct.on('pointerover', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.05, duration: 160 }); });
          ct.on('pointerout', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.0, duration: 160 }); });
          ct.on('pointerdown', () => { if (ct.meta.enabled) this.evaluateSelection(); });
          ct.disable = () => { ct.meta.enabled = false; draw(false); };
          ct.enable = () => { ct.meta.enabled = true; draw(true); };
          ct.setEvaluating = (flag) => draw(ct.meta.enabled, flag);
          ct.disable();
          return ct;
        }

        enableConfirmIfNeeded() { if (!this.confirmBtn) return; if (this.roundComplete) return this.confirmBtn.disable(); if (this.selected.size > 0) this.confirmBtn.enable(); else this.confirmBtn.disable(); }

        toggleSelect(container) {
          if (this.roundComplete) return;
          const item = container.meta.itemName;
          if (this.selected.has(item)) { this.selected.delete(item); this.animateDeselection(container); }
          else { this.selected.add(item); this.animateSelection(container); }
          this.enableConfirmIfNeeded();
        }
        animateSelection(container) {
          const { ring } = container.meta; ring.setAlpha(1); ring.clear(); ring.lineStyle(6, 0xf9644d, 1); ring.strokeCircle(0, -10, container.meta.radius); this.tweens.add({ targets: container, scale: 1.12, duration: 200, ease: 'Back.easeOut' });
        }
        animateDeselection(container) {
          const { ring } = container.meta; this.tweens.add({ targets: container, scale: 1.0, duration: 160, onComplete: () => { ring.setAlpha(0); } });
        }

        evaluateSelection() {
          if (this.roundComplete) return; if (!this.confirmBtn || !this.confirmBtn.meta.enabled) return;
          const round = this.rounds[this.roundIndex];
          const correctSet = new Set(round.options.filter(o => o.isCorrect).map(o => o.name));
          let anyWrong = false; let anyMissing = false;
          this.selected.forEach((sel) => { if (!correctSet.has(sel)) anyWrong = true; });
          correctSet.forEach((c) => { if (!this.selected.has(c)) anyMissing = true; });

          this.optionContainers.forEach((ct) => {
            const item = ct.meta.itemName; const isSelected = this.selected.has(item); const isCorrect = correctSet.has(item); const { ring } = ct.meta;
            if (isSelected) {
              ring.setAlpha(1); ring.clear(); ring.lineStyle(8, isCorrect ? 0x57c785 : 0xf9644d, 1); ring.strokeCircle(0, -10, ct.meta.radius);
              if (!isCorrect) this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
            } else { ring.setAlpha(0); }
          });

          if (!anyWrong && !anyMissing) {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)).play();
            this.roundComplete = true; this.confirmBtn.disable(); if (this.firstAttempt) this.perfectRounds += 1;
            this.optionContainers.forEach((ct) => { if (correctSet.has(ct.meta.itemName)) this.tweens.add({ targets: ct, scale: 1.25, duration: 260, yoyo: true }); });
            this.time.delayedCall(850, () => { this.roundIndex += 1; this.showRound(); });
          } else {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)).play(); this.firstAttempt = false;
            const toRemove = []; this.selected.forEach((sel) => { if (!correctSet.has(sel)) toRemove.push(sel); }); toRemove.forEach((r) => this.selected.delete(r));
            this.time.delayedCall(220, () => { this.optionContainers.forEach((ct) => { if (toRemove.includes(ct.meta.itemName)) this.animateDeselection(ct); }); this.enableConfirmIfNeeded(); });
          }
        }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let hist = []; try { hist = JSON.parse(localStorage.getItem('game4_history') || '[]'); } catch (e) { hist = []; }
            hist.push(this.perfectRounds); localStorage.setItem('game4_history', JSON.stringify(hist.slice(-20)));
            this.scene.start('SummaryScene', { correct: this.perfectRounds, total: this.rounds.length }); return;
          }

          // Reset state
          this.optionContainers.forEach((c) => c.destroy()); this.optionContainers = []; this.selected.clear(); this.roundComplete = false; this.firstAttempt = true; this.enableConfirmIfNeeded();

          const round = this.rounds[this.roundIndex];
          this.promptText.setText(round.prompt); this.progressText.setText(`${this.roundIndex + 1} / ${this.rounds.length}`);

          // 4x2 grid layout
          const cols = 4; const rows = 2; const areaW = this.scale.width * 0.9; const areaH = this.scale.height * 0.60;
          const startX = this.scale.width / 2 - areaW / 2; const startY = this.scale.height / 2 - areaH / 2 + this.scale.height * 0.04;
          const cellW = areaW / cols; const cellH = areaH / rows;
          const imgSize = Math.min(cellW, cellH) * 0.6; const lblFont = Math.max(12, Math.min(22, this.scale.height * 0.035));

          round.options.forEach((opt, idx) => {
            const r = Math.floor(idx / cols); const c = idx % cols; const cx = startX + c * cellW + cellW / 2; const cy = startY + r * cellH + cellH / 2;
            const jx = PhaserGame.Math.Between(-Math.floor(cellW * 0.1), Math.floor(cellW * 0.1)); const x = cx + jx; const y = cy;
            const container = this.add.container(x, y);
            const shadow = this.add.ellipse(0, 8, imgSize * 0.9, imgSize * 0.18, 0x000000, 0.18);
            const sprite = this.add.image(0, -10, opt.imagePath).setDisplaySize(imgSize, imgSize).setOrigin(0.5);
            const ring = this.add.graphics(); const radius = imgSize / 2 + 10; ring.setAlpha(0);
            const label = this.add.text(0, imgSize / 2 - 0, opt.name, { fontFamily: 'Fredoka One', fontSize: `${lblFont}px`, color: '#ffffff', align: 'center', stroke: '#042539', strokeThickness: 4 }).setOrigin(0.5, 0).setShadow(2, 2, 'rgba(0,0,0,0.45)', 4);
            container.add([shadow, ring, sprite, label]);
            container.meta = { itemName: opt.name, imageKey: opt.imagePath, sprite, ring, label, radius };
            container.setSize(imgSize + 34, imgSize + label.height + 26); container.setInteractive({ useHandCursor: true });
            container.on('pointerover', () => { if (this.roundComplete) return; if (!this.selected.has(opt.name)) this.tweens.add({ targets: container, scale: 1.06, duration: 140 }); });
            container.on('pointerout', () => { if (this.roundComplete) return; if (!this.selected.has(opt.name)) this.tweens.add({ targets: container, scale: 1.0, duration: 140 }); });
            container.on('pointerdown', () => this.toggleSelect(container));
            this.optionContainers.push(container);
          });
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) {
          this.correct = data.correct || 0; this.total = data.total || 0;
          try { this.history = JSON.parse(localStorage.getItem('game4_history') || '[]'); } catch (e) { this.history = []; }
          this.localHistory = this.history.slice(-5);
        }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() { /* eslint-disable no-undef */ WebFont.load({ google: { families: ['Fredoka One'] }, active: () => this.build() }); /* eslint-enable */ }
        build() {
          const W = this.scale.width; const H = this.scale.height;
          buildSummaryUI(this, { correct: this.correct, total: this.total, history: this.localHistory, onRestart: () => this.scene.start('FeatureSelectAllScene'), texts: { heading: `You got ${this.correct} correct on first try!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true });
        }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, FeatureSelectAllScene, SummaryScene],
        scale: { mode: PhaserGame.Scale.NONE, width: container.clientWidth * ratio, height: container.clientHeight * ratio },
        callbacks: { postBoot: (game) => { game.canvas.style.width = `${container.clientWidth}px`; game.canvas.style.height = `${container.clientHeight}px`; } },
      };

      phaserRef.current = new PhaserGame.Game(config);

      resizeObserverRef.current = new ResizeObserver(() => {
        if (!phaserRef.current) return;
        const w = container.clientWidth; const h = container.clientHeight;
        phaserRef.current.scale.resize(w * ratio, h * ratio);
        phaserRef.current.canvas.style.width = `${w}px`;
        phaserRef.current.canvas.style.height = `${h}px`;
      });
      resizeObserverRef.current.observe(container);
    });

    return () => { mounted = false; resizeObserverRef.current?.disconnect(); phaserRef.current?.destroy(true); };
  }, []);

  return (
    <div>
      <GameContainer>
        <div className="pt-24 w-full flex justify-center items-center">
          <GameBoard ref={containerRef} />
        </div>
      </GameContainer>
    </div>
  );
}

export default Game4;
