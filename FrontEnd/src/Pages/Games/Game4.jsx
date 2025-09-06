import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
// Use QuestionUtils to guarantee non-overlapping options and shared preloading keys
import { pickItemsFromType, getAllIconKeys, getAllKeysForType, itemsFor } from './QuestionUtils';
// Still use feature asset list for display names
import { getAllFeatureAssets } from './AssetFeatureMapping';
import { getDimOverlayStyle } from './GameTheme';
import { QUESTIONS_PER_RUN } from './GameConfig';

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
          const dpr = window.devicePixelRatio || 1; const px = (n) => n * dpr;
          const COLOR_DARK = 0x042539; const COLOR_ACCENT = 0x57c785; const COLOR_ACCENT_2 = 0xf9644d;

          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560); const panelH = Math.min(H * 0.24, 180);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, px(18));
          panel.lineStyle(px(4), COLOR_DARK, 1);
          panel.strokeRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, px(18));

          this.add.text(W / 2, H / 2 - panelH * 0.28, 'Loading...', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.max(18, Math.min(36, (H / dpr) * 0.055))}px`,
            color: '#ffffff', stroke: '#1e607d', strokeThickness: px(3), align: 'center',
          }).setOrigin(0.5).setResolution(dpr);

          const barW = panelW * 0.78; const barH = Math.max(px(12), Math.min(px(18), H * 0.025));
          const barX = (W - barW) / 2; const barY = H / 2 + barH * 0.5;
          const barBg = this.add.graphics(); barBg.fillStyle(0xffffff, 0.25);
          barBg.fillRoundedRect(barX, barY, barW, barH, px(10));
          barBg.lineStyle(px(3), COLOR_DARK, 1); barBg.strokeRoundedRect(barX, barY, barW, barH, px(10));
          const barFill = this.add.graphics();
          const percentText = this.add.text(W / 2, barY + barH * 2, '0%', {
            fontFamily: 'Fredoka One', fontSize: `${Math.max(14, Math.min(22, (H / dpr) * 0.035))}px`, color: '#ffffff', stroke: '#1e607d', strokeThickness: px(2),
          }).setOrigin(0.5).setResolution(dpr);

          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
          // Preload ALL mapping assets so shuffles never miss
          try { ALL_ICON_KEYS.forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`)); } catch {}

          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW; barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95); barFill.fillRoundedRect(barX, barY, w, barH, px(10));
            barFill.lineStyle(px(2), COLOR_DARK, 1); barFill.strokeRoundedRect(barX, barY, Math.max(w, px(2)), barH, px(10));
            if (w > px(8)) {
              const t = (this.time.now % 1200) / 1200; const sheenWidth = Math.max(px(30), Math.min(px(80), w * 0.25));
              const sxRaw = barX - px(60) + (w + px(120)) * t; const startX = Math.max(barX, sxRaw); const endX = Math.min(barX + w, sxRaw + sheenWidth); const cw = endX - startX;
              if (cw > 0) {
                barFill.fillStyle(0xffffff, 0.2);
                barFill.beginPath(); barFill.moveTo(startX, barY); barFill.lineTo(startX + Math.min(px(16), cw * 0.25), barY);
                barFill.lineTo(startX + cw, barY + barH); barFill.lineTo(startX + Math.max(0, cw - Math.min(px(16), cw * 0.25)), barY + barH);
                barFill.closePath(); barFill.fillPath();
                barFill.fillStyle(COLOR_ACCENT_2, 0.12); barFill.fillRect(Math.max(barX, endX - px(2)), barY + px(2), px(2), barH - px(4));
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
            const scene = this;
            const WF = (typeof window !== 'undefined' && window.WebFont) ? window.WebFont : null;
            if (WF && WF.load) {
              WF.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureSelectAllScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureSelectAllScene'); } });
            } else {
              scene.sheenTick?.remove(); scene.scene.start('FeatureSelectAllScene');
            }
          });
        }
      }

      class FeatureSelectAllScene extends PhaserGame.Scene {
        constructor() { super({ key: 'FeatureSelectAllScene' }); }
        init() {
          this.dpr = window.devicePixelRatio || 1;
          this.px = (n) => n * this.dpr;
          this.rounds = buildUniqueRounds(QUESTIONS_PER_RUN);
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

        cssDims() { return { cssW: this.scale.width / this.dpr, cssH: this.scale.height / this.dpr }; }

        setupUI() {
          const { cssH, cssW } = this.cssDims();

          // Prompt and progress texts (font sizes in CSS px, multiplied by DPR)
          const qFontCss = Math.max(18, Math.min(40, cssH * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, Math.max(30, this.scale.height * 0.08), '', {
            fontFamily: 'Fredoka One',
            fontSize: `${qFontCss * this.dpr}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: this.px(4),
            align: 'center',
            wordWrap: { width: cssW * 0.9 * this.dpr },
          }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.35)', 6);

          const pFontCss = Math.max(14, Math.min(30, cssH * 0.055));
          this.progressText = this.add.text(this.scale.width / 12, Math.max(25, this.scale.height * 0.075), '', {
            fontFamily: 'Fredoka One',
            fontSize: `${pFontCss * this.dpr}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: this.px(3),
          }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.35)', 6);

          // Confirm button (single instance)
          this.confirmBtn = this.buildConfirmButton();
          this.positionConfirmButton();

          // Shuffle button
          // Guarded call in case of prototype init quirks
          if (typeof this.createShuffleButton === 'function') this.createShuffleButton();

          // Initial layout to avoid overlaps
          this.layoutTopUI?.();

          // Unified resize handler
          this._onResize = () => { this.positionConfirmButton(); this.layoutTopUI?.(); this.layoutOptionGrid?.(); };
          this.scale.on('resize', this._onResize);

          const offAll = () => {
            try { if (this._onResize) { this.scale.off('resize', this._onResize); this._onResize = null; } } catch {}
          };
          this.events.once('shutdown', offAll);
          this.events.once('destroy', offAll);
        }

        // New: robust top-bar layout like Game 2
        layoutTopUI() {
          if (!this.promptText || !this.progressText) return;
          const cssW = this.scale.width / this.dpr;
          const cssH = this.scale.height / this.dpr;

          // Progress font scales by both height and width
          const pFontCss = Math.max(12, Math.min(28, Math.min(cssH * 0.050, cssW * 0.060)));
          this.progressText.setFontSize(pFontCss * this.dpr);

          // Shuffle button font and box sizing
          if (this.shuffleBtn && this.shuffleBtn.meta?.text && this.shuffleBtn.meta?.bg) {
            const sFontCss = Math.max(12, Math.min(24, Math.min(cssH * 0.045, cssW * 0.050)));
            const text = this.shuffleBtn.meta.text;
            const bg = this.shuffleBtn.meta.bg;
            text.setFontSize(sFontCss * this.dpr);
            const width = text.width + 32;
            const height = text.height + 16;
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            bg.lineStyle(this.px(4), 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            this.shuffleBtn.setSize(width, height);
            // Right-align within safe margin
            this.shuffleBtn.x = this.scale.width - this.px(20) - width / 2;
          }

          // Compute top bar height (max of progress and shuffle)
          const shuffleH = this.shuffleBtn ? this.shuffleBtn.height : 0;
          const topBarH = Math.max(this.progressText.height, shuffleH);
          const topPadCss = Math.max(8, cssH * 0.015);
          const yCenter = topPadCss * this.dpr + topBarH / 2;

          // Vertically center within top bar
          this.progressText.y = yCenter;
          if (this.shuffleBtn) this.shuffleBtn.y = yCenter;

          // Prompt sizing by both width and height
          const qFontCss = Math.max(16, Math.min(36, Math.min(cssH * 0.075, cssW * 0.080)));
          this.promptText.setFontSize(qFontCss * this.dpr);
          this.promptText.setStyle({ wordWrap: { width: cssW * 0.9 * this.dpr } });

          // Place prompt below top bar + margin
          const marginCss = Math.max(10, cssH * 0.020);
          const topBarBottom = yCenter + topBarH / 2;
          this.promptText.setPosition(this.scale.width / 2, topBarBottom + marginCss * this.dpr);
        }

        positionConfirmButton() {
          if (!this.confirmBtn) return;
          const btnY = this.scale.height * 0.9;
          this.confirmBtn.y = btnY; this.confirmBtn.x = this.scale.width / 2;
        }

        buildConfirmButton() {
          const { cssW, cssH } = this.cssDims();
          const cssWBtn = Math.min(260, cssW * 0.4);
          const cssHBtn = Math.max(48, cssH * 0.09);
          const w = cssWBtn * this.dpr; const h = cssHBtn * this.dpr;
          const g = this.add.graphics();
          const draw = (enabled, evaluating = false) => {
            g.clear();
            const fill = !enabled ? 0x8aa3b5 : evaluating ? 0x57c785 : 0xf9644d;
            g.fillStyle(fill, 0.92);
            g.fillRoundedRect(-w / 2, -h / 2, w, h, this.px(20));
            g.lineStyle(this.px(4), 0x042539, 1);
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, this.px(20));
          };
          draw(false);
          const labelFsCss = Math.max(20, cssHBtn * 0.42);
          const label = this.add.text(0, 0, 'Confirm', {
            fontFamily: 'Fredoka One',
            fontSize: `${labelFsCss * this.dpr}px`,
            color: '#fff',
          }).setOrigin(0.5);
          const ct = this.add.container(this.scale.width / 2, this.scale.height * 0.9, [g, label]);
          ct.meta = { draw, label, enabled: false, g, w, h, cssWBtn, cssHBtn };
          ct.setSize(w, h);
          ct.setInteractive({ useHandCursor: true });
          ct.on('pointerover', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.05, duration: 160 }); });
          ct.on('pointerout', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.0, duration: 160 }); });
          ct.on('pointerdown', () => { if (ct.meta.enabled) this.evaluateSelection(); });
          ct.disable = () => { ct.meta.enabled = false; draw(false); };
          ct.enable = () => { ct.meta.enabled = true; draw(true); };
          ct.setEvaluating = (flag) => draw(ct.meta.enabled, flag);
          ct.disable();
          return ct;
        }

        updateConfirmButtonStyle() {
          if (!this.confirmBtn) return;
          const { cssW, cssH } = this.cssDims();
          const cssWBtn = Math.min(260, cssW * 0.4);
          const cssHBtn = Math.max(48, cssH * 0.09);
          const w = cssWBtn * this.dpr; const h = cssHBtn * this.dpr;
          this.confirmBtn.meta.w = w; this.confirmBtn.meta.h = h; this.confirmBtn.meta.cssWBtn = cssWBtn; this.confirmBtn.meta.cssHBtn = cssHBtn;
          const { g, draw, label } = this.confirmBtn.meta;
          this.confirmBtn.setSize(w, h);
          draw(this.confirmBtn.meta.enabled);
          label.setStyle({ fontSize: `${Math.max(20, cssHBtn * 0.42) * this.dpr}px` });
        }

        enableConfirmIfNeeded() {
          if (!this.confirmBtn) return;
          if (this.roundComplete) { this.confirmBtn.disable(); return; }
          if (this.selected.size > 0) this.confirmBtn.enable(); else this.confirmBtn.disable();
        }

        createShuffleButton() {
          const cssW = this.scale.width / this.dpr;
          const cssH = this.scale.height / this.dpr;
          const sFontCss = Math.max(14, Math.min(24, Math.min(cssH * 0.045, cssW * 0.050)));
          const text = this.add.text(0, 0, 'Shuffle', {
            fontFamily: 'Fredoka One',
            fontSize: `${sFontCss * this.dpr}px`,
            color: '#042539',
          }).setOrigin(0.5);
          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
          bg.lineStyle(this.px(4), 0x042539, 1);
          bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
          const x = this.scale.width - this.px(20) - width / 2;
          const y = Math.max(this.px(10) + height / 2, this.scale.height * 0.04 + height / 2);
          const container = this.add.container(x, y, [bg, text]);
          container.setSize(width, height);
          container.setInteractive({ useHandCursor: true });

          container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 200 });
            bg.clear();
            bg.fillStyle(0x57C785, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            bg.lineStyle(this.px(6), 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            text.setColor('#ffffff');
          });

          container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            bg.lineStyle(this.px(4), 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
            text.setColor('#042539');
          });

          container.on('pointerdown', () => {
            this.tweens.add({
              targets: container,
              scale: 1.1,
              duration: 300,
              ease: 'Circ.easeInOut',
              onComplete: () => this.handleShuffle(),
            });
          });

          container.meta = { bg, text };
          this.shuffleBtn = container;
        }

        handleShuffle() {
          this.rounds = buildUniqueRounds(QUESTIONS_PER_RUN);
          this.roundIndex = 0;
          this.firstAttempt = true;
          this.perfectRounds = 0;
          this.showRound();
        }

        toggleSelect(container) {
          if (this.roundComplete) return;
          const item = container.meta.itemName;
          if (this.selected.has(item)) {
            this.selected.delete(item);
            this.animateDeselection(container);
          } else {
            this.selected.add(item);
            this.animateSelection(container);
          }
          this.enableConfirmIfNeeded();
        }

        animateSelection(container) {
          const { ring } = container.meta;
          ring.setAlpha(1);
          ring.clear();
          ring.lineStyle(this.px(6), 0xf9644d, 1);
          ring.strokeCircle(0, -this.px(10), container.meta.radius);
          this.tweens.add({ targets: container, scale: 1.12, duration: 200, ease: 'Back.easeOut' });
        }

        animateDeselection(container) {
          const { ring } = container.meta;
          this.tweens.add({
            targets: container,
            scale: 1.0,
            duration: 160,
            onComplete: () => { ring.setAlpha(0); },
          });
        }

        evaluateSelection() {
          if (this.roundComplete) return;
          if (!this.confirmBtn || !this.confirmBtn.meta.enabled) return;

          const round = this.rounds[this.roundIndex];
          const correctSet = new Set(round.options.filter(o => o.isCorrect).map(o => o.name));

          let anyWrong = false;
          let anyMissing = false;

          this.selected.forEach((sel) => { if (!correctSet.has(sel)) anyWrong = true; });
          correctSet.forEach((c) => { if (!this.selected.has(c)) anyMissing = true; });

          this.optionContainers.forEach((ct) => {
            const item = ct.meta.itemName;
            const isSelected = this.selected.has(item);
            const isCorrect = correctSet.has(item);
            const { ring } = ct.meta;

            if (isSelected) {
              ring.setAlpha(1);
              ring.clear();
              ring.lineStyle(this.px(8), isCorrect ? 0x57c785 : 0xf9644d, 1);
              ring.strokeCircle(0, -this.px(10), ct.meta.radius);
              if (!isCorrect) this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
            } else {
              ring.setAlpha(0);
            }
          });

          if (!anyWrong && !anyMissing) {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)).play();
            this.roundComplete = true;
            this.confirmBtn.disable();
            if (this.firstAttempt) this.perfectRounds += 1;
            this.optionContainers.forEach((ct) => {
              if (correctSet.has(ct.meta.itemName)) {
                this.tweens.add({ targets: ct, scale: 1.25, duration: 260, yoyo: true });
              }
            });
            this.time.delayedCall(850, () => { this.roundIndex += 1; this.showRound(); });
          } else {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)).play();
            this.firstAttempt = false;
            const toRemove = [];
            this.selected.forEach((sel) => { if (!correctSet.has(sel)) toRemove.push(sel); });
            toRemove.forEach((r) => this.selected.delete(r));
            this.time.delayedCall(220, () => {
              this.optionContainers.forEach((ct) => {
                if (toRemove.includes(ct.meta.itemName)) this.animateDeselection(ct);
              });
              this.enableConfirmIfNeeded();
            });
          }
        }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let hist = [];
            try { hist = JSON.parse(localStorage.getItem('game4_history') || '[]'); } catch (e) { hist = []; }
            hist.push(this.perfectRounds);
            localStorage.setItem('game4_history', JSON.stringify(hist.slice(-20)));
            this.scene.start('SummaryScene', { correct: this.perfectRounds, total: this.rounds.length });
            return;
          }

          // Reset state
          this.optionContainers.forEach((c) => c.destroy());
          this.optionContainers = [];
          this.selected.clear();
          this.roundComplete = false;
          this.firstAttempt = true;
          this.enableConfirmIfNeeded();

          const cssW = this.scale.width / this.dpr;
          const cssH = this.scale.height / this.dpr;
          const round = this.rounds[this.roundIndex];

          this.promptText.setText(round.prompt);
          this.progressText.setText(`${this.roundIndex + 1} / ${this.rounds.length}`);
          this.layoutTopUI?.();

          // Grid layout 4x2
          const cols = 4; const rows = 2;
          const areaW = this.scale.width * 0.9;
          const areaH = this.scale.height * 0.60;
          const startX = this.scale.width / 2 - areaW / 2;
          const startY = this.scale.height / 2 - areaH / 2 + this.scale.height * 0.04;
          const cellW = areaW / cols; const cellH = areaH / rows;
          const imgSize = Math.min(cellW, cellH) * 0.6;
          const lblFontCss = Math.max(12, Math.min(22, cssH * 0.035));

          round.options.forEach((opt, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const cx = startX + c * cellW + cellW / 2;
            const cy = startY + r * cellH + cellH / 2;
            const jx = PhaserGame.Math.Between(-Math.floor(cellW * 0.1), Math.floor(cellW * 0.1));
            const x = cx + jx;
            const y = cy;

            const container = this.add.container(x, y);
            const shadow = this.add.ellipse(0, this.px(8), imgSize * 0.9, imgSize * 0.18, 0x000000, 0.18);
            const sprite = this.add.image(0, -this.px(10), opt.imagePath).setDisplaySize(imgSize, imgSize).setOrigin(0.5);
            const ring = this.add.graphics();
            const radius = imgSize / 2 + this.px(10);
            ring.setAlpha(0);

            const label = this.add.text(0, imgSize / 2 - 0, opt.name, {
              fontFamily: 'Fredoka One',
              fontSize: `${lblFontCss * this.dpr}px`,
              color: '#ffffff',
              align: 'center',
              stroke: '#042539',
              strokeThickness: this.px(4),
            }).setOrigin(0.5, 0).setShadow(2, 2, 'rgba(0,0,0,0.45)', 4);

            container.add([shadow, ring, sprite, label]);
            container.meta = { itemName: opt.name, imageKey: opt.imagePath, sprite, ring, label, radius, idx };
            container.setSize(imgSize + this.px(34), imgSize + label.height + this.px(26));
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => { if (this.roundComplete) return; if (!this.selected.has(opt.name)) this.tweens.add({ targets: container, scale: 1.06, duration: 140 }); });
            container.on('pointerout', () => { if (this.roundComplete) return; if (!this.selected.has(opt.name)) this.tweens.add({ targets: container, scale: 1.0, duration: 140 }); });
            container.on('pointerdown', () => this.toggleSelect(container));

            this.optionContainers.push(container);
          });
        }

        layoutOptionGrid() {
          if (!this.optionContainers || this.optionContainers.length === 0) return;
          const cssH = this.scale.height / this.dpr;
          const cols = 4; const rows = 2;
          const areaW = this.scale.width * 0.9;
          const areaH = this.scale.height * 0.60;
          const startX = this.scale.width / 2 - areaW / 2;
          const startY = this.scale.height / 2 - areaH / 2 + this.scale.height * 0.04;
          const cellW = areaW / cols; const cellH = areaH / rows;
          const imgSize = Math.min(cellW, cellH) * 0.6;
          const lblFontCss = Math.max(12, Math.min(22, cssH * 0.035));

          this.optionContainers.forEach((container) => {
            const idx = container.meta.idx || 0;
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const cx = startX + c * cellW + cellW / 2;
            const cy = startY + r * cellH + cellH / 2;
            container.x = cx;
            container.y = cy;
            const { sprite, label } = container.meta;
            sprite.setDisplaySize(imgSize, imgSize);
            label.setY(imgSize / 2 - 0);
            label.setStyle({ fontSize: `${lblFontCss * this.dpr}px`, strokeThickness: this.px(4) });
            container.meta.radius = imgSize / 2 + this.px(10);
          });
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) {
          this.correct = data.correct || 0;
          this.total = data.total || 0;
          try { this.history = JSON.parse(localStorage.getItem('game4_history') || '[]'); } catch (e) { this.history = []; }
          this.localHistory = this.history.slice(-5);
        }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() {
          const WF = (typeof window !== 'undefined' && window.WebFont) ? window.WebFont : null;
          if (WF && WF.load) { WF.load({ google: { families: ['Fredoka One'] }, active: () => this.build(), inactive: () => this.build() }); }
          else { this.build(); }
        }
        build() {
          const W = this.scale.width; const H = this.scale.height;
          buildSummaryUI(this, {
            correct: this.correct,
            total: this.total,
            history: this.localHistory,
            onRestart: () => {
              const fn = this.game?.reactHandleShuffle;
              if (typeof fn === 'function') { fn(); } else { this.scene.start('FeatureSelectAllScene'); }
            },
            texts: { heading: `You got ${this.correct} correct on first try!`, playAgain: 'Play Again' },
            graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } },
            renderHeading: true,
          });
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

      // Expose a regeneration hook for SummaryUI Play Again
      phaserRef.current.reactHandleShuffle = () => {
        try { phaserRef.current.scene.stop('SummaryScene'); } catch {}
        try { phaserRef.current.scene.stop('FeatureSelectAllScene'); } catch {}
        phaserRef.current.scene.start('FeatureSelectAllScene');
      };

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
