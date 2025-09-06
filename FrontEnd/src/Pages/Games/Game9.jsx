import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
import { itemsFor as qItemsFor, getAllKeysForType as qGetAllKeysForType, getAllIconKeys as qGetAllIconKeys } from './QuestionUtils';
import { getDimOverlayStyle } from './GameTheme';
import { QUESTIONS_PER_RUN } from './GameConfig';

// Game 9 — Odd One Out
// Show 4 items (3 belong to the same group, 1 does not). Click the odd one. Rounds = QUESTIONS_PER_RUN.

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Build a pool of all asset keys used across mappings (for preloading)
function getAllIconKeys() { return qGetAllIconKeys(); }

function itemsFor(type, key) { return qItemsFor(type, key); }

function getAllKeysForType(type) { return qGetAllKeysForType(type); }

function buildOddOneRound(type, key) {
  const pool = itemsFor(type, key);
  if (!pool || pool.length < 3) return null;

  // Pick 3 correct exemplars
  const correct = shuffle(pool).slice(0, 3);
  const exclude = new Set(correct);

  // Find a distractor from a different key of the same type
  const otherKeys = getAllKeysForType(type).filter(k => k !== key);
  let distractorImg = null;
  for (const k of shuffle(otherKeys)) {
    const imgs = itemsFor(type, k);
    // choose any image not overlapping with the chosen correct exemplars
    const candidate = imgs.find(img => !exclude.has(img));
    if (candidate) { distractorImg = candidate; break; }
  }
  if (!distractorImg) return null;

  const items = shuffle([
    ...correct.map(img => ({ img, isOdd: false })),
    { img: distractorImg, isOdd: true },
  ]);

  const prompt = `Which one does NOT have a common ${type}?`;
  return { type, key, items, prompt };
}

function buildRounds(limit = QUESTIONS_PER_RUN) {
  // Build a shuffled pool of unique (type, key) pairs where at least 3 exemplars exist
  const types = ['function', 'feature', 'class'];
  const pairs = [];
  for (const t of types) {
    const keys = getAllKeysForType(t).filter(k => (itemsFor(t, k) || []).length >= 3);
    for (const k of keys) pairs.push({ t, k });
  }
  const shuffledPairs = shuffle(pairs);

  const rounds = [];
  for (const { t, k } of shuffledPairs) {
    if (rounds.length >= limit) break;
    const r = buildOddOneRound(t, k);
    if (r) rounds.push(r); // ensure we only include valid rounds; uniqueness guaranteed by unique pair selection
  }
  return rounds;
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
  backgroundImage: 'url(/Games/backgrounds/forest.jpg)',
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

export function Game9() {
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

      class PreloadScene extends PhaserGame.Scene {
        constructor() { super({ key: 'PreloadScene' }); }
        preload() {
          const W = this.scale.width; const H = this.scale.height;
          const COLOR_DARK = 0x042539; const COLOR_ACCENT = 0x57c785;
          const dpr = Math.max(1, window.devicePixelRatio || 1);

          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560 * dpr); const panelH = Math.min(H * 0.24, 180 * dpr);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18 * dpr);
          panel.lineStyle(4 * dpr, COLOR_DARK, 1);
          panel.strokeRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18 * dpr);

          const loadingFontCss = Math.max(18, Math.min(36, (H / dpr) * 0.055));
          const loadingText = this.add.text(W / 2, H / 2 - panelH * 0.28, 'Loading...', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.round(loadingFontCss * dpr)}px`,
            color: '#ffffff', stroke: '#1e607d', strokeThickness: Math.round(3 * dpr), align: 'center',
          }).setOrigin(0.5);
          try { loadingText.setResolution(dpr); } catch {}

          const barW = Math.min(panelW * 0.78, 600 * dpr); const barH = Math.max(12 * dpr, Math.min(18 * dpr, H * 0.025));
          const barX = (W - barW) / 2; const barY = H / 2 + barH * 0.5;
          const barBg = this.add.graphics(); barBg.fillStyle(0xffffff, 0.25);
          barBg.fillRoundedRect(barX, barY, barW, barH, 10 * dpr);
          barBg.lineStyle(3 * dpr, COLOR_DARK, 1); barBg.strokeRoundedRect(barX, barY, barW, barH, 10 * dpr);
          const barFill = this.add.graphics();
          const percentFontCss = Math.max(14, Math.min(22, (H / dpr) * 0.035));
          const percentText = this.add.text(W / 2, barY + barH * 2, '0%', {
            fontFamily: 'Fredoka One', fontSize: `${Math.round(percentFontCss * dpr)}px`, color: '#ffffff', stroke: '#1e607d', strokeThickness: Math.round(2 * dpr),
          }).setOrigin(0.5);
          try { percentText.setResolution(dpr); } catch {}

          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
          getAllIconKeys().forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`));

          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW; barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95); barFill.fillRoundedRect(barX, barY, w, barH, 10 * dpr);
            barFill.lineStyle(2 * dpr, COLOR_DARK, 1); barFill.strokeRoundedRect(barX, barY, Math.max(w, 2 * dpr), barH, 10 * dpr);
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
            const scene = this; const WF = window.WebFont;
            if (WF && WF.load) { WF.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('OddOneScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('OddOneScene'); } }); }
            else { scene.sheenTick?.remove(); scene.scene.start('OddOneScene'); }
          });
        }
      }

      class OddOneScene extends PhaserGame.Scene {
        constructor() { super({ key: 'OddOneScene' }); }
        init() {
          this.rounds = buildRounds(QUESTIONS_PER_RUN);
          this.roundIndex = 0;
          this.score = 0; // first-try correct count
          this.perRoundMistake = false;
          this.correctAudioFiles = [ '/Games/audio/right1.mp3', '/Games/audio/right2.mp3', '/Games/audio/right3.mp3' ];
          this.wrongAudioFiles = [ '/Games/audio/wrong1.mp3', '/Games/audio/wrong2.mp3' ];
          this.itemCards = [];
        }
        // DPR helpers
        getDpr() { return Math.max(1, window.devicePixelRatio || 1); }
        px(n) { return Math.round(n * this.getDpr()); }
        preload() {}
        create() {
          this.setupUI();

          // Resize handling
          this.onResizeHandler = () => {
            try { this.positionShuffleButton && this.positionShuffleButton(); } catch {}
            try { this.positionTopBar && this.positionTopBar(); } catch {}
            try { this.positionPrompt && this.positionPrompt(); } catch {}
            try { typeof this.layoutItems === 'function' && this.layoutItems(); } catch {}
          };
          this.scale.on('resize', this.onResizeHandler, this);
          const off = () => { try { this.scale?.off('resize', this.onResizeHandler, this); } catch {} };
          this.events.once('shutdown', off);
          this.events.once('destroy', off);

          this.showRound();
        }

        setupUI() {
          const dpr = this.getDpr();
          const hCss = this.scale.height / dpr;
          const qFontCss = Math.max(18, Math.min(40, hCss * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, this.px(10), '', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.round(qFontCss * dpr)}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: this.px(6),
            align: 'center',
            wordWrap: { width: this.scale.width - this.px(40) },
          }).setOrigin(0.5).setShadow(2 * dpr, 2 * dpr, 'rgba(0,0,0,0.4)', 6 * dpr);
          try { this.promptText.setResolution(dpr); } catch {}

          const pFontCss = Math.max(14, Math.min(28, hCss * 0.05));
          this.progressText = this.add.text(this.scale.width / 12, this.px(10), '', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.round(pFontCss * dpr)}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: this.px(5),
          }).setOrigin(0.5).setShadow(2 * dpr, 2 * dpr, 'rgba(0,0,0,0.4)', 6 * dpr);
          try { this.progressText.setResolution(dpr); } catch {}

          // Shuffle button
          this.createShuffleButton();
          this.positionShuffleButton();

          // Keep progress at the same height as Shuffle
          this.positionTopBar = () => {
            if (this.progressText && this.shuffleBtn) { this.progressText.y = this.shuffleBtn.y; }
          };
          this.positionTopBar();

          // Compute safe top area and position prompt below it
          this.positionPrompt = () => {
            if (!this.promptText) return;
            const bottoms = [
              this.progressText ? (this.progressText.y + this.progressText.height / 2) : 0,
              (this.shuffleBtn && this.shuffleBtn.meta) ? (this.shuffleBtn.y + this.shuffleBtn.meta.height / 2) : 0,
            ];
            const topSafe = Math.max(...bottoms);
            const pad = this.px(14); // more space so prompt doesn't overlap
            this.promptText.y = topSafe + pad + this.promptText.height / 2;
            try { this.promptText.setStyle({ wordWrap: { width: this.scale.width - this.px(40) } }); } catch {}
          };
          this.positionPrompt();

          // Resize hooks for shuffle
          this._onResizeShuffle = () => { this.positionShuffleButton?.(); this.positionTopBar?.(); this.positionPrompt?.(); this.layoutItems?.(); };
          this.scale.on('resize', this._onResizeShuffle);
          const offShuffle = () => { try { if (this._onResizeShuffle) { this.scale.off('resize', this._onResizeShuffle); this._onResizeShuffle = null; } } catch {} };
          this.events.once('shutdown', offShuffle);
          this.events.once('destroy', offShuffle);
        }

        createShuffleButton() {
          const dpr = this.getDpr();
          const hCss = this.scale.height / dpr;
          const sFontSizeCss = Math.max(14, Math.min(24, hCss * 0.045));
          const text = this.add.text(0, 0, 'Shuffle', { fontFamily: 'Fredoka One', fontSize: `${Math.round(sFontSizeCss * dpr)}px`, color: '#042539' }).setOrigin(0.5);
          try { text.setResolution(dpr); } catch {}
          const width = text.width + this.px(32); const height = text.height + this.px(16);
          const bg = this.add.graphics(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12)); bg.lineStyle(this.px(4), 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12));
          const x = this.scale.width - this.px(20) - width / 2; const y = Math.max(this.px(10) + height / 2, this.px(hCss * 0.04) + height / 2);
          const container = this.add.container(x, y, [bg, text]); container.setSize(width, height); container.setInteractive({ useHandCursor: true });
          container.on('pointerover', () => { this.tweens.add({ targets: container, scale: 1.05, duration: 200 }); bg.clear(); bg.fillStyle(0x57C785, 0.8); bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12)); bg.lineStyle(this.px(6), 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12)); text.setColor('#ffffff'); });
          container.on('pointerout', () => { this.tweens.add({ targets: container, scale: 1, duration: 200 }); bg.clear(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, this.px(12)); bg.lineStyle(this.px(4), 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, this.px(12)); text.setColor('#042539'); });
          container.on('pointerdown', () => { this.tweens.add({ targets: container, scale: 1.1, duration: 300, ease: 'Circ.easeInOut', onComplete: () => this.handleShuffle() }); });
          container.meta = { width, height }; this.shuffleBtn = container;
        }
        positionShuffleButton() { if (!this.shuffleBtn) return; const width = this.shuffleBtn.meta.width; const height = this.shuffleBtn.meta.height; const dpr = this.getDpr(); const hCss = this.scale.height / dpr; this.shuffleBtn.x = this.scale.width - this.px(20) - width / 2; this.shuffleBtn.y = Math.max(this.px(10) + height / 2, this.px(hCss * 0.04) + height / 2); }
        handleShuffle() { this.rounds = buildRounds(QUESTIONS_PER_RUN); this.roundIndex = 0; this.score = 0; this.perRoundMistake = false; this.showRound(); }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let hist = []; try { hist = JSON.parse(localStorage.getItem('game9_history') || '[]'); } catch (e) { hist = []; }
            hist.push(this.score); localStorage.setItem('game9_history', JSON.stringify(hist.slice(-20)));
            this.scene.start('SummaryScene', { score: this.score, total: this.rounds.length }); return;
          }
          this.perRoundMistake = false;

          // Clear previous
          this.itemCards.forEach(c => { try { c.destroy(); } catch {} }); this.itemCards = [];

          const round = this.rounds[this.roundIndex];
          this.promptText.setText(round.prompt || 'Which item does not belong?');
          this.progressText.setText(`${this.roundIndex + 1} / ${this.rounds.length}`);
          this.positionTopBar && this.positionTopBar();
          this.positionPrompt && this.positionPrompt();

          // Layout 4 cards in a grid that always fits (1x4 or 2x2) within a safe area
          const items = round.items; // [{img, isOdd}]
          const count = items.length;

          const safeLeft = this.px(16);
          const safeRight = this.scale.width - this.px(16);
          const safeTop = Math.max(
            (this.progressText ? (this.progressText.y + this.progressText.height / 2) : 0),
            (this.shuffleBtn && this.shuffleBtn.meta) ? (this.shuffleBtn.y + this.shuffleBtn.meta.height / 2) : 0,
            (this.promptText ? (this.promptText.y + this.promptText.height / 2) : 0)
          ) + this.px(12);
          const safeBottom = this.scale.height - this.px(16);
          const safeW = Math.max(0, safeRight - safeLeft);
          const safeH = Math.max(0, safeBottom - safeTop);

          const calcSize = (cols, rows) => {
            const cellW = safeW / cols;
            const cellH = safeH / rows;
            // Leave padding inside each cell and clamp to a minimum touch target
            return Math.max(this.px(56), Math.min(cellW, cellH) * 0.8);
          };

          // Evaluate candidate layouts and choose the one with the larger card size
          const cand = [
            { cols: 4, rows: 1, size: calcSize(4, 1) },
            { cols: 2, rows: 2, size: calcSize(2, 2) },
          ];
          cand.sort((a, b) => b.size - a.size);
          const best = cand[0];
          const cols = best.cols; const rows = best.rows; let cardSize = best.size;

          // If vertical space is extremely tight, force single row and clamp Y to be visible
          if (safeH < this.px(70)) { cardSize = Math.max(this.px(48), Math.min(cardSize, safeH * 0.9)); }

          const cellW = safeW / cols; const cellH = safeH / rows;
          const startX = safeLeft + cellW / 2;
          const startY = safeTop + cellH / 2;

          items.forEach((it, idx) => {
            const row = rows === 1 ? 0 : Math.floor(idx / cols);
            const col = rows === 1 ? idx : (idx % cols);
            const x = startX + col * cellW;
            let y = startY + row * cellH;
            // Clamp Y to keep the full card on screen
            y = Math.max(safeTop + cardSize / 2, Math.min(y, safeBottom - cardSize / 2));
            const card = this.createItemCard(x, y, it.img, cardSize, it.isOdd);
            this.itemCards.push(card);
          });

          // Save layout parameters for responsive relayout
          this._gridLayout = { safeLeft, safeRight, safeTop, safeBottom };

          this.layoutItems = () => {
            if (!this.itemCards || this.itemCards.length === 0) return;
            const safeLeft2 = this.px(16);
            const safeRight2 = this.scale.width - this.px(16);
            const safeTop2 = Math.max(
              (this.progressText ? (this.progressText.y + this.progressText.height / 2) : 0),
              (this.shuffleBtn && this.shuffleBtn.meta) ? (this.shuffleBtn.y + this.shuffleBtn.meta.height / 2) : 0,
              (this.promptText ? (this.promptText.y + this.promptText.height / 2) : 0)
            ) + this.px(12);
            const safeBottom2 = this.scale.height - this.px(16);
            const safeW2 = Math.max(0, safeRight2 - safeLeft2);
            const safeH2 = Math.max(0, safeBottom2 - safeTop2);

            const calcSize2 = (cols, rows) => {
              const cellW2 = safeW2 / cols; const cellH2 = safeH2 / rows;
              return Math.max(this.px(56), Math.min(cellW2, cellH2) * 0.8);
            };
            const cand2 = [ { cols: 4, rows: 1, size: calcSize2(4, 1) }, { cols: 2, rows: 2, size: calcSize2(2, 2) } ];
            cand2.sort((a, b) => b.size - a.size);
            const best2 = cand2[0];
            const cols2 = best2.cols; const rows2 = best2.rows; const size2 = best2.size;
            const cellW2 = safeW2 / cols2; const cellH2 = safeH2 / rows2;
            const startX2 = safeLeft2 + cellW2 / 2; const startY2 = safeTop2 + cellH2 / 2;

            this.itemCards.forEach((card, i) => {
              if (!card || !card.scene || card._destroyed) return;
              const row2 = rows2 === 1 ? 0 : Math.floor(i / cols2);
              const col2 = rows2 === 1 ? i : (i % cols2);
              const nx = startX2 + col2 * cellW2;
              let ny = startY2 + row2 * cellH2;
              const topClamp = safeTop2 + size2 / 2; const botClamp = safeBottom2 - size2 / 2;
              ny = Math.max(topClamp, Math.min(ny, botClamp));
              card.x = nx; card.y = ny; try { card.meta?.resize?.(size2); } catch {}
            });
          };
        }

        createItemCard(x, y, imageKey, size, isOdd) {
          const bg = this.add.graphics();
          const drawDefault = () => {
            bg.clear();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillRoundedRect(-size/2, -size/2, size, size, 16);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-size/2, -size/2, size, size, 16);
          };
          const drawHover = (correct = false) => {
            bg.clear();
            const fill = correct ? 0x57C785 : 0x57C785;
            const alpha = correct ? 0.85 : 0.8;
            bg.fillStyle(fill, alpha);
            bg.fillRoundedRect(-size/2, -size/2, size, size, 16);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-size/2, -size/2, size, size, 16);
          };
          drawDefault();

          const img = this.add.image(0, 0, imageKey).setOrigin(0.5);
          img.setDisplaySize(size * 0.78, size * 0.78);
          let baseScaleX = img.scaleX; let baseScaleY = img.scaleY;

          const ct = this.add.container(x, y, [bg, img]);
          ct.setSize(size, size);
          const hit = this.add.zone(0, 0, size, size).setOrigin(0.5);
          ct.add(hit);
          hit.setInteractive({ cursor: 'pointer' });

          ct._destroyed = false; img._destroyed = false;
          ct.once('destroy', () => { ct._destroyed = true; img._destroyed = true; });

          let isHover = false; let scaleTween = null;
          const hoverIn = () => { if (ct._destroyed || img._destroyed) return; isHover = true; drawHover(false); if (scaleTween) scaleTween.stop(); scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX * 1.06, scaleY: baseScaleY * 1.06, duration: 180, ease: 'Sine.easeOut' }); };
          const hoverOut = () => { if (ct._destroyed || img._destroyed) return; isHover = false; drawDefault(); if (scaleTween) scaleTween.stop(); scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX, scaleY: baseScaleY, duration: 180, ease: 'Sine.easeOut' }); };
          hit.on('pointerover', hoverIn);
          hit.on('pointerout', hoverOut);

          const onCorrect = () => {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)).play();
            if (!this.perRoundMistake) this.score += 1;
            if (scaleTween) { scaleTween.stop(); scaleTween = null; }
            isHover = false;
            hit.disableInteractive();
            hit.off('pointerover', hoverIn);
            hit.off('pointerout', hoverOut);
            hit.off('pointerdown');
            drawHover(true);
            this.tweens.add({ targets: img, scaleX: baseScaleX * 1.12, scaleY: baseScaleY * 1.12, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 0, onComplete: () => { img.scaleX = baseScaleX; img.scaleY = baseScaleY; } });
            this.time.delayedCall(700, () => { this.roundIndex += 1; this.showRound(); });
          };
          const onWrong = () => { new Audio(PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)).play(); this.perRoundMistake = true; this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 }); };
          hit.on('pointerdown', () => { if (ct._destroyed) return; isOdd ? onCorrect() : onWrong(); });

          ct.meta = { resize: (newSize) => { if (!ct || !ct.scene || !img || !img.scene || ct._destroyed || img._destroyed) return; size = newSize; drawDefault(); img.setDisplaySize(size * 0.78, size * 0.78); baseScaleX = img.scaleX; baseScaleY = img.scaleY; if (isHover) { img.scaleX = baseScaleX * 1.06; img.scaleY = baseScaleY * 1.06; } else { img.scaleX = baseScaleX; img.scaleY = baseScaleY; } ct.setSize(size, size); hit.setSize(size, size); } };
          return ct;
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) { this.score = (data && (data.score ?? data.correct)) || 0; this.total = (data && data.total) || 0; try { this.history = JSON.parse(localStorage.getItem('game9_history') || '[]'); } catch (e) { this.history = []; } this.localHistory = this.history.slice(-5); }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() {
          const W = this.scale.width; const H = this.scale.height;
          const renderSummary = () => { buildSummaryUI(this, { correct: this.score, total: this.total, history: this.localHistory, onRestart: () => { const fn = this.game?.reactHandleShuffle; if (typeof fn === 'function') { fn(); } else { this.scene.start('OddOneScene'); } }, texts: { heading: `You found ${this.score} odd ones on first try!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true }); };
          const WF = window.WebFont; if (WF && WF.load) { WF.load({ google: { families: ['Fredoka One'] }, active: renderSummary, inactive: renderSummary }); } else { renderSummary(); }
        }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, OddOneScene, SummaryScene],
        scale: { mode: PhaserGame.Scale.NONE, width: container.clientWidth * ratio, height: container.clientHeight * ratio },
        callbacks: { postBoot: (game) => { game.canvas.style.width = `${container.clientWidth}px`; game.canvas.style.height = `${container.clientHeight}px`; } },
      };

      phaserRef.current = new PhaserGame.Game(config);

      // Expose a regeneration hook for SummaryUI Play Again
      phaserRef.current.reactHandleShuffle = () => {
        try { phaserRef.current.scene.stop('SummaryScene'); } catch {}
        try { phaserRef.current.scene.stop('OddOneScene'); } catch {}
        phaserRef.current.scene.start('OddOneScene');
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

export default Game9;
