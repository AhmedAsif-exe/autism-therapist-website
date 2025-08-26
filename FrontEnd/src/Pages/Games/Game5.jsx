import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
// Use shared QuestionUtils to ensure robust separation and unified helpers
import { getAllKeysForType, itemsFor, getAllIconKeys } from './QuestionUtils';
import { getDimOverlayStyle } from './GameTheme';

// Game 5 — Classify the Item (MCQ)
// Uses Class mapping for item -> class questions
// - 20 rounds
// - Each round shows one item and 3 class options (1 correct + 2 distractors)
// - Distractor classes NEVER include the target item (avoid ambiguous answers)
// - Preload scene with progress bar + sheen
// - Shuffle button regenerates a new 20-round set

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Build a single round for a given class name
function buildClassRound(clsName) {
  const itemKeys = itemsFor('class', clsName); // [imagePath]
  if (!itemKeys || itemKeys.length === 0) return null;
  const pickedKey = choice(itemKeys);
  const item = { imagePath: pickedKey };

  // Candidate distractor classes: any other class not containing this item
  const allClasses = getAllKeysForType('class');
  const distractorPool = allClasses.filter((c) => c !== clsName && !itemsFor('class', c).includes(item.imagePath));
  if (distractorPool.length < 2) return null;

  const options = shuffle([clsName, ...shuffle(distractorPool).slice(0, 2)]);
  return { item, correct: clsName, options };
}

function buildRounds(limit = 20) {
  // Build a unique item list across all classes and generate rounds without repeating the same item image
  const rounds = [];
  const usedImages = new Set();

  const allClasses = getAllKeysForType('class') || [];
  // Map: class -> unique items
  const classItems = new Map();
  allClasses.forEach((c) => {
    const arr = (itemsFor('class', c) || []).filter(Boolean);
    classItems.set(c, Array.from(new Set(arr)));
  });

  // Map: item image -> all classes that contain it
  const itemToClasses = new Map();
  allClasses.forEach((c) => {
    const imgs = classItems.get(c) || [];
    imgs.forEach((img) => {
      if (!itemToClasses.has(img)) itemToClasses.set(img, []);
      itemToClasses.get(img).push(c);
    });
  });

  // Candidate items that can form a valid question (need at least 2 distractor classes)
  const candidates = [];
  itemToClasses.forEach((classesForImg, img) => {
    const distractorPool = allClasses.filter((c) => !classesForImg.includes(c));
    if (distractorPool.length >= 2) {
      candidates.push({ imagePath: img, classes: classesForImg, distractorPool });
    }
  });

  // Prefer unique-by-item questions first
  shuffle(candidates).forEach((cand) => {
    if (rounds.length >= limit) return;
    if (usedImages.has(cand.imagePath)) return;
    const correct = choice(cand.classes);
    const options = shuffle([correct, ...shuffle(cand.distractorPool).slice(0, 2)]);
    rounds.push({ item: { imagePath: cand.imagePath }, correct, options });
    usedImages.add(cand.imagePath);
  });

  // Fallback fill if still short (keep uniqueness by image, validate distractors)
  let attempts = 0;
  while (rounds.length < limit && attempts < 600) {
    attempts += 1;
    const cls = choice(allClasses);
    const imgs = classItems.get(cls) || [];
    const remaining = imgs.filter((img) => !usedImages.has(img));
    if (remaining.length === 0) continue;
    const picked = choice(remaining);
    const distractorPool = allClasses.filter((c) => !(classItems.get(c) || []).includes(picked));
    if (distractorPool.length < 2) continue;
    const options = shuffle([cls, ...shuffle(distractorPool).slice(0, 2)]);
    rounds.push({ item: { imagePath: picked }, correct: cls, options });
    usedImages.add(picked);
  }

  return rounds.slice(0, limit);
}

// Precompute all icon keys used by mappings for preloading
const ALL_ICON_KEYS = getAllIconKeys();

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
  backgroundImage: 'url(/Games/backgrounds/checkers.jpg)',
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

export function Game5() {
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

      // Preloader scene, themed like Games 2/3/4 (no bouncing logo)
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
          ALL_ICON_KEYS.forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`));

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
            WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('ClassifyScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('ClassifyScene'); } });
          });
        }
      }

      class ClassifyScene extends PhaserGame.Scene {
        constructor() { super({ key: 'ClassifyScene' }); }

        init() {
          this.rounds = buildRounds(20);
          this.roundIndex = 0;

          this.correctCount = 0;
          this.mistakesCount = 0;

          this.perRoundMistake = false; // track if wrong happened in current round
          this.perfectRounds = 0; // count of rounds with no mistakes
          this.longestPerfectStreak = 0;
          this.currentPerfectStreak = 0;

          this.itemSprite = null;
          this.optionButtons = [];

          // Prevent score spamming by locking after first correct
          this.roundLocked = false;

          this.correctAudioFiles = [ '/Games/audio/right1.mp3', '/Games/audio/right2.mp3', '/Games/audio/right3.mp3' ];
          this.wrongAudioFiles = [ '/Games/audio/wrong1.mp3', '/Games/audio/wrong2.mp3' ];
        }

        preload() {}

        create() {
          this.setupUI();
          this.showRound();
        }

        setupUI() {
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, this.scale.height / 6, '', { fontFamily: 'Fredoka One', fontSize: `${qFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 6, align: 'center', wordWrap: { width: this.scale.width * 0.9 } }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);
          const pFont = Math.max(14, Math.min(28, this.scale.height * 0.05));
          this.progressText = this.add.text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '', { fontFamily: 'Fredoka One', fontSize: `${pFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 5 }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          // Shuffle button (no confirm button needed for single-tap MCQ)
          this.createShuffleButton();
          this._onResizeShuffle = () => {
            this.positionShuffleButton?.();
            this.layoutOptionButtons?.();
          };
          this.scale.on('resize', this._onResizeShuffle);

          // Cleanup on shutdown/destroy
          const offAll = () => {
            try { if (this._onResizeShuffle) { this.scale.off('resize', this._onResizeShuffle); this._onResizeShuffle = null; } } catch {}
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
        handleShuffle() { this.rounds = buildRounds(20); this.roundIndex = 0; this.perRoundMistake = false; this.perfectRounds = 0; this.longestPerfectStreak = 0; this.currentPerfectStreak = 0; this.showRound(); }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let hist = []; try { hist = JSON.parse(localStorage.getItem('game5_history') || '[]'); } catch (e) { hist = []; }
            hist.push(this.perfectRounds); localStorage.setItem('game5_history', JSON.stringify(hist.slice(-20)));
            this.scene.start('SummaryScene', { correct: this.perfectRounds, total: this.rounds.length }); return;
          }

          // Clear prior UI
          this.optionButtons.forEach((b) => b.destroy()); this.optionButtons = []; this.itemSprite?.destroy(); this.perRoundMistake = false;
          // Reset per-round lock
          this.roundLocked = false;

          const round = this.rounds[this.roundIndex];
          this.progressText.setText(`${this.roundIndex + 1} / ${this.rounds.length}`);
          // Set the per-round prompt text so it's visible
          if (this.promptText) {
            this.promptText.setText('Which category does this item belong to?');
          }

          // Target item (center/top)
          const imgSize = Math.min(this.scale.width, this.scale.height) * 0.25;
          this.itemSprite = this.add.image(this.scale.width / 2, this.scale.height / 2.75, round.item.imagePath).setDisplaySize(imgSize, imgSize).setOrigin(0.5);
          this.tweens.add({ targets: this.itemSprite, y: '+=8', duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

          // Build options with capped width and wrapping to prevent overlap
          const options = round.options; const count = options.length;
          const areaW = this.scale.width * 0.9; // usable width
          const colGap = Math.max(14, Math.min(24, this.scale.width * 0.02));
          const perWidth = Math.max(140, Math.min(280, areaW / count - colGap));
          const centerY = this.scale.height * 0.70;
          const startX = this.scale.width / 2 - ((count - 1) * (areaW / count)) / 2;

          options.forEach((label, idx) => {
            const colCenter = startX + idx * (areaW / count);
            const btn = this.createTextButton(colCenter, centerY, label, perWidth);
            // Attach pointerdown to both text & bg like Game 1
            btn.meta?.addPointerDown?.(() => {
              if (this.roundLocked) return; // prevent double scoring
              const isCorrect = label === round.correct;
              if (isCorrect) {
                this.roundLocked = true; // lock round immediately
                // disable all buttons to prevent further clicks
                this.optionButtons.forEach((b) => { try { b.meta?.disable?.(); } catch {} try { b.disableInteractive?.(); } catch {} });
                new Audio(PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)).play();
                if (!this.perRoundMistake) { this.perfectRounds += 1; this.currentPerfectStreak += 1; this.longestPerfectStreak = Math.max(this.longestPerfectStreak, this.currentPerfectStreak); } else { this.currentPerfectStreak = 0; }
                this.tweens.add({ targets: btn, scale: 1.15, duration: 220, ease: 'Circ.easeOut', yoyo: true });
                this.time.delayedCall(500, () => { this.roundIndex += 1; this.showRound(); });
              } else {
                new Audio(PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)).play(); this.perRoundMistake = true; this.currentPerfectStreak = 0; this.tweens.add({ targets: btn, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
              }
            });
            this.optionButtons.push(btn);
          });

          // Save a layout fn to recompute positions on resize
          this.layoutOptionButtons = () => {
            if (!this.optionButtons || this.optionButtons.length !== count) return;
            const areaW2 = this.scale.width * 0.9; const perWidth2 = Math.max(140, Math.min(280, areaW2 / count - colGap));
            const centerY2 = this.scale.height * 0.70; const startX2 = this.scale.width / 2 - ((count - 1) * (areaW2 / count)) / 2;
            this.optionButtons.forEach((btn, i) => { btn.x = startX2 + i * (areaW2 / count); btn.y = centerY2; btn.meta?.resize?.(perWidth2); });
          };
        }

        createTextButton(x, y, label, maxWidth) {
          const targetWidth = Math.max(140, Math.min(maxWidth || 260, 400));
          const text = this.add.text(0, 0, label, {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.max(18, Math.min(28, this.scale.height * 0.045))}px`,
            color: '#042539',
            align: 'center',
            wordWrap: { width: targetWidth - 40, useAdvancedWrap: true },
          }).setOrigin(0.5, 0.5);

          let width = targetWidth;
          let height = Math.max(44, text.height + 18);

          const bg = this.add.graphics();
          const drawDefault = () => {
            bg.clear();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);
          };
          const drawHover = () => {
            // Keep geometry constant on hover to avoid hit-area mismatch/flicker
            bg.clear();
            bg.fillStyle(0x57C785, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
            // Keep stroke thickness identical to default to prevent border shift
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);
          };
          drawDefault();

          const ct = this.add.container(x, y, [bg, text]);
          ct.setSize(width, height);

          // Centered hit zone (avoids Graphics/Container hitbox quirks)
          const hit = this.add.zone(0, 0, width, height).setOrigin(0.5);
          ct.add(hit);
          hit.setInteractive({ cursor: 'pointer' });

          let isHover = false;
          let scaleTween = null;

          const hoverIn = () => {
            if (isHover) return;
            isHover = true;
            if (scaleTween) scaleTween.stop();
            drawHover();
            scaleTween = this.tweens.add({
              targets: text,
              scale: 1.1,
              duration: 200,
              onComplete: () => { if (isHover) drawHover(); },
            });
          };
          const hoverOut = () => {
            if (!isHover) return;
            isHover = false;
            if (scaleTween) scaleTween.stop();
            scaleTween = this.tweens.add({ targets: text, scale: 1.0, duration: 200 });
            drawDefault();
          };

          hit.on('pointerover', hoverIn);
          hit.on('pointerout', hoverOut);

          // Allow resize to adjust wrapping width and update hit area
          ct.meta = {
            addPointerDown: (cb) => { hit.on('pointerdown', cb); },
            resize: (newMaxWidth) => {
              const newW = Math.max(140, Math.min(newMaxWidth || 260, 400));
              text.setStyle({ wordWrap: { width: newW - 40, useAdvancedWrap: true } });
              text.setText(text.text);

              const newH = Math.max(44, text.height + 18);
              width = newW; height = newH;
              ct.setSize(newW, newH);
              drawDefault();
              if (isHover) drawHover();
              hit.setSize(newW, newH);
            },
            disable: () => { try { hit.disableInteractive(); } catch {} },
          };

          return ct;
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) { this.correct = data.correct || 0; this.total = data.total || 0; try { this.history = JSON.parse(localStorage.getItem('game5_history') || '[]'); } catch (e) { this.history = []; } this.localHistory = this.history.slice(-5); }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() { /* eslint-disable no-undef */ WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { const W = this.scale.width; const H = this.scale.height; buildSummaryUI(this, { correct: this.correct, total: this.total, history: this.localHistory, onRestart: () => this.scene.start('ClassifyScene'), texts: { heading: `You got ${this.correct} correct on first try!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true }); } }); /* eslint-enable */ }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, ClassifyScene, SummaryScene],
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

export default Game5;
