import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
import { itemsFor as qItemsFor, getAllKeysForType as qGetAllKeysForType, getAllIconKeys as qGetAllIconKeys } from './QuestionUtils';
import { getDimOverlayStyle } from './GameTheme';

// Game 9 — Odd One Out
// Show 4 items (3 belong to the same group, 1 does not). Click the odd one. 20 rounds.

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

function buildRounds(limit = 20) {
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
          getAllIconKeys().forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`));

          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW; barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95); barFill.fillRoundedRect(barX, barY, w, barH, 10);
            barFill.lineStyle(2, COLOR_DARK, 1); barFill.strokeRoundedRect(barX, barY, Math.max(w, 2), barH, 10);
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
            WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('OddOneScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('OddOneScene'); } });
          });
        }
      }

      class OddOneScene extends PhaserGame.Scene {
        constructor() { super({ key: 'OddOneScene' }); }
        init() {
          this.rounds = buildRounds(20);
          this.roundIndex = 0;
          this.score = 0; // first-try correct count
          this.perRoundMistake = false;
          this.correctAudioFiles = [ '/Games/audio/right1.mp3', '/Games/audio/right2.mp3', '/Games/audio/right3.mp3' ];
          this.wrongAudioFiles = [ '/Games/audio/wrong1.mp3', '/Games/audio/wrong2.mp3' ];
          this.itemCards = [];
        }
        preload() {}
        create() {
          this.setupUI();

          // Resize handling
          this.onResizeHandler = () => {
            try { this.promptText && this.promptText.setY(Math.max(28, this.scale.height * 0.14)); } catch {}
            try { this.progressText && this.progressText.setY(Math.max(24, this.scale.height * 0.075)); } catch {}
            try { typeof this.layoutItems === 'function' && this.layoutItems(); } catch {}
          };
          this.scale.on('resize', this.onResizeHandler, this);
          const off = () => { try { this.scale?.off('resize', this.onResizeHandler, this); } catch {} };
          this.events.once('shutdown', off);
          this.events.once('destroy', off);

          this.showRound();
        }

        setupUI() {
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, this.scale.height/6, '', {
            fontFamily: 'Fredoka One',
            fontSize: `${qFont}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: this.scale.width * 0.9 },
          }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          const pFont = Math.max(14, Math.min(28, this.scale.height * 0.05));
          this.progressText = this.add.text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '', {
            fontFamily: 'Fredoka One',
            fontSize: `${pFont}px`,
            color: '#ffffff',
            stroke: '#042539',
            strokeThickness: 5,
          }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          // Shuffle button
          this.createShuffleButton();
          this.positionShuffleButton();
          this._onResizeShuffle = () => { this.positionShuffleButton?.(); this.layoutItems?.(); };
          this.scale.on('resize', this._onResizeShuffle);
          const offShuffle = () => { try { if (this._onResizeShuffle) { this.scale.off('resize', this._onResizeShuffle); this._onResizeShuffle = null; } } catch {} };
          this.events.once('shutdown', offShuffle);
          this.events.once('destroy', offShuffle);
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
          container.meta = { width, height }; this.shuffleBtn = container;
        }
        positionShuffleButton() { if (!this.shuffleBtn) return; const width = this.shuffleBtn.meta.width; const height = this.shuffleBtn.meta.height; this.shuffleBtn.x = this.scale.width - 20 - width / 2; this.shuffleBtn.y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2); }
        handleShuffle() { this.rounds = buildRounds(20); this.roundIndex = 0; this.score = 0; this.perRoundMistake = false; this.showRound(); }

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

          // Layout 4 cards evenly spaced
          const items = round.items; // [{img, isOdd}]
          const count = items.length;
          const areaW = this.scale.width * 0.86;
          const cardSize = Math.min(this.scale.width, this.scale.height) * 0.22;
          const centerY = this.scale.height * 0.5;
          const startX = this.scale.width / 2 - ((count - 1) * (areaW / count)) / 2;

          items.forEach((it, idx) => {
            const x = startX + idx * (areaW / count);
            const card = this.createItemCard(x, centerY, it.img, cardSize, it.isOdd);
            this.itemCards.push(card);
          });

          this.layoutItems = () => {
            if (!this.itemCards || this.itemCards.length === 0) return;
            const areaW2 = this.scale.width * 0.86; const cardSize2 = Math.min(this.scale.width, this.scale.height) * 0.22; const centerY2 = this.scale.height * 0.5; const startX2 = this.scale.width / 2 - ((count - 1) * (areaW2 / count)) / 2;
            this.itemCards.forEach((card, i) => { if (!card || !card.scene || card._destroyed) return; card.x = startX2 + i * (areaW2 / count); card.y = centerY2; try { card.meta?.resize?.(cardSize2); } catch {} });
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
          // Capture the base scale computed by setDisplaySize so hover scales are relative
          let baseScaleX = img.scaleX;
          let baseScaleY = img.scaleY;

          const ct = this.add.container(x, y, [bg, img]);
          ct.setSize(size, size);
          // Use a dedicated hit zone like Game 8 buttons for reliable hover/click
          const hit = this.add.zone(0, 0, size, size).setOrigin(0.5);
          ct.add(hit);
          hit.setInteractive({ cursor: 'pointer' });

          ct._destroyed = false; img._destroyed = false;
          ct.once('destroy', () => { ct._destroyed = true; img._destroyed = true; });

          let isHover = false;
          let scaleTween = null;
          const hoverIn = () => {
            if (ct._destroyed || img._destroyed) return;
            isHover = true;
            drawHover(false);
            if (scaleTween) scaleTween.stop();
            scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX * 1.06, scaleY: baseScaleY * 1.06, duration: 180, ease: 'Sine.easeOut' });
          };
          const hoverOut = () => {
            if (ct._destroyed || img._destroyed) return;
            isHover = false;
            drawDefault();
            if (scaleTween) scaleTween.stop();
            scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX, scaleY: baseScaleY, duration: 180, ease: 'Sine.easeOut' });
          };
          hit.on('pointerover', hoverIn);
          hit.on('pointerout', hoverOut);

          const onCorrect = () => {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)).play();
            if (!this.perRoundMistake) this.score += 1;

            // Prevent hover/click tweens from interfering with the correct animation
            if (scaleTween) { scaleTween.stop(); scaleTween = null; }
            isHover = false;
            hit.disableInteractive();
            hit.off('pointerover', hoverIn);
            hit.off('pointerout', hoverOut);
            hit.off('pointerdown');

            drawHover(true);

            // Single smooth pop using a yoyo tween: scale up then back down once (match Game 8 behavior)
            this.tweens.add({
              targets: img,
              scaleX: baseScaleX * 1.12,
              scaleY: baseScaleY * 1.12,
              duration: 200,
              ease: 'Sine.easeOut',
              yoyo: true,
              repeat: 0,
              onComplete: () => { img.scaleX = baseScaleX; img.scaleY = baseScaleY; },
            });

            this.time.delayedCall(700, () => { this.roundIndex += 1; this.showRound(); });
          };
          const onWrong = () => {
            new Audio(PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)).play();
            this.perRoundMistake = true;
            this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
          };

          hit.on('pointerdown', () => { if (ct._destroyed) return; isOdd ? onCorrect() : onWrong(); });

          ct.meta = {
            resize: (newSize) => {
              if (!ct || !ct.scene || !img || !img.scene || ct._destroyed || img._destroyed) return;
              size = newSize;
              if (isHover) drawHover(false); else drawDefault();
              img.setDisplaySize(size * 0.78, size * 0.78);
              // Recalculate base scales after display size change
              baseScaleX = img.scaleX;
              baseScaleY = img.scaleY;
              // Keep hover scale consistent if currently hovered
              if (isHover) { img.scaleX = baseScaleX * 1.06; img.scaleY = baseScaleY * 1.06; } else { img.scaleX = baseScaleX; img.scaleY = baseScaleY; }
              ct.setSize(size, size);
              hit.setSize(size, size);
            },
          };
          return ct;
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) { this.score = (data && (data.score ?? data.correct)) || 0; this.total = (data && data.total) || 0; try { this.history = JSON.parse(localStorage.getItem('game9_history') || '[]'); } catch (e) { this.history = []; } this.localHistory = this.history.slice(-5); }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() { /* eslint-disable no-undef */ WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { const W = this.scale.width; const H = this.scale.height; buildSummaryUI(this, { correct: this.score, total: this.total, history: this.localHistory, onRestart: () => this.scene.start('OddOneScene'), texts: { heading: `You found ${this.score} odd ones on first try!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true }); } }); /* eslint-enable */ }
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
