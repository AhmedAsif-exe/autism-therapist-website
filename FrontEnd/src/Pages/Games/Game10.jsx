import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
import { getAllClasses, getAssetsForClass } from './AssetClassMapping';
import { getAllFunctions, getAssetsForFunction } from './AssetFunctionMapping';
import { getAllFeatures, getAssetsForFeature } from './AssetFeatureMapping';
import { pickItemsFromType, getAllIconKeys as getPreloadIconKeys, getAllKeysForType, itemsFor } from './QuestionUtils';

// Game 10 — Random Rotation (Time Trial)
// Mix of question types from Games 1–9. Answer as many as possible before the timer ends.

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Round builders
function buildOddOneRound() {
  const types = ['function', 'feature', 'class'];
  const type = choice(types);
  const picked = pickItemsFromType({ type, numCorrect: 3, numWrong: 1 });
  if (!picked) return null;
  const items = shuffle([
    ...picked.correctImgs.map(img => ({ img, isOdd: false })),
    ...picked.wrongImgs.map(img => ({ img, isOdd: true })),
  ]);
  return { kind: 'odd', type, key: picked.key, items, prompt: `Which item does NOT belong?` };
}

function buildMCQRound(type) {
  // Choose a key with at least 1 image, options are keys (no overlap issue for MCQ labels)
  const keys = shuffle(getAllKeysForType(type));
  if (keys.length < 3) return null;
  const correctKey = keys[0];
  const distractors = [keys[1], keys[2]];
  const imgs = itemsFor(type, correctKey);
  const img = choice(imgs);
  if (!img) return null;
  const options = shuffle([correctKey, ...distractors]);
  const promptByType = {
    function: 'What is the function of this?',
    feature: 'What feature describes this?',
    class: 'Which class/category is this?',
  };
  return { kind: 'mcq', type, key: correctKey, img, options, prompt: promptByType[type] || 'Choose the correct answer' };
}

function pickTypeWithEnough(minCorrect = 2) {
  const types = ['function', 'feature', 'class'];
  const eligible = types.filter(t => getAllKeysForType(t).some(k => (itemsFor(t, k) || []).length >= minCorrect));
  return choice(eligible.length ? eligible : types);
}
function buildSelectAllRound() {
  const type = pickTypeWithEnough(2);
  const picked = pickItemsFromType({ type, numCorrect: 2, numWrong: 2 });
  if (!picked) return null;
  const items = shuffle([
    ...picked.correctImgs.map(img => ({ img, correct: true })),
    ...picked.wrongImgs.map(img => ({ img, correct: false })),
  ]);
  return { kind: 'select', type, key: picked.key, items, prompt: `Select all that belong to the ${type} "${picked.key}"` };
}
function buildDragRound() {
  const type = pickTypeWithEnough(2);
  const picked = pickItemsFromType({ type, numCorrect: 2, numWrong: 2 });
  if (!picked) return null;
  const items = shuffle([
    ...picked.correctImgs.map(img => ({ img, correct: true })),
    ...picked.wrongImgs.map(img => ({ img, correct: false })),
  ]);
  return { kind: 'drag', type, key: picked.key, items, prompt: `Drag the items that belong to the ${type} "${picked.key}" into the box` };
}

// Build one random rotation round
function buildRotationRoundRandom() {
  const templates = ['mcq-function', 'mcq-feature', 'mcq-class', 'odd', 'select', 'drag'];
  let round = null; let guard = 0;
  while (!round && guard < 16) {
    const t = choice(templates);
    if (t === 'odd') round = buildOddOneRound();
    else if (t === 'select') round = buildSelectAllRound();
    else if (t === 'drag') round = buildDragRound();
    else if (t.startsWith('mcq-')) round = buildMCQRound(t.split('-')[1]);
    guard++;
  }
  return round;
}

// Build a pool of unique questions to cycle through
function buildRotationRounds(limit) {
  const seen = new Set();
  const rounds = [];
  let guard = 0;
  while (rounds.length < limit && guard < limit * 40) {
    const r = buildRotationRoundRandom();
    if (r && r.kind && r.type && (r.key != null)) {
      const sig = `${r.kind}:${r.type}:${r.key}`;
      if (!seen.has(sig)) { seen.add(sig); rounds.push(r); }
    }
    guard++;
  }
  return rounds;
}

// Styled containers like other games
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
  backgroundColor: '#f2f4f7', // solid soft grey for Game 10
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

export function Game10() {
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
            fontFamily: 'Fredoka One', fontSize: `${Math.max(18, Math.min(36, H * 0.055))}px`, color: '#ffffff', stroke: '#1e607d', strokeThickness: 3, align: 'center',
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
          getPreloadIconKeys().forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`));
          // Audio
          ['/Games/audio/right1.mp3','/Games/audio/right2.mp3','/Games/audio/right3.mp3','/Games/audio/wrong1.mp3','/Games/audio/wrong2.mp3'].forEach((u) => this.load.audio(u, u));

          this.prog = { v: 0 };
          const drawBar = (p) => { const w = Math.max(0, Math.min(1, p)) * barW; barFill.clear(); barFill.fillStyle(COLOR_ACCENT, 0.95); barFill.fillRoundedRect(barX, barY, w, barH, 10); barFill.lineStyle(2, COLOR_DARK, 1); barFill.strokeRoundedRect(barX, barY, Math.max(w, 2), barH, 10); };
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
            WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('RotationScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('RotationScene'); } });
          });
        }
      }

      class RotationScene extends PhaserGame.Scene {
        constructor() { super({ key: 'RotationScene' }); }
        init() {
          this.score = 0;
          this.sessionSeconds = 90; // default
          this.endTime = 0;
          this.correctAudioFiles = [ '/Games/audio/right1.mp3', '/Games/audio/right2.mp3', '/Games/audio/right3.mp3' ];
          this.wrongAudioFiles = [ '/Games/audio/wrong1.mp3', '/Games/audio/wrong2.mp3' ];
          this.activeRoundCleanup = null; // function to cleanup current round
          // SFX toggle
          this.sfxEnabled = true; try { const saved = localStorage.getItem('game_sfx_enabled'); if (saved !== null) this.sfxEnabled = saved === 'true'; } catch {}
          this.remainingMs = null; // for pause/resume
          // Precompute pool size based on duration (unique questions cycled)
          this.roundPool = [];
          this.roundIndex = 0;
          // Prevent repeated scoring within a single round
          this.roundLocked = false;
        }
        preload() {}
        create() {
          // UI Texts
          const pFont = Math.max(16, Math.min(32, this.scale.height * 0.055));
          this.scoreText = this.add.text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '0', { fontFamily: 'Fredoka One', fontSize: `${pFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 5 }).setOrigin(0.5).setShadow(2,2,'rgba(0,0,0,0.4)',6);

          // Timer Bar
          this.timerBg = this.add.graphics();
          this.timerFill = this.add.graphics();
          this.drawTimer = () => {
            const W = this.scale.width; const H = this.scale.height; const barW = Math.min(W * 0.56, 520); const barH = Math.max(12, Math.min(20, H * 0.03));
            const x = (W - barW) / 2; const y = Math.max(18, H * 0.06);
            const t = Math.max(0, this.endTime - this.time.now); const frac = Math.max(0, Math.min(1, t / (this.sessionSeconds * 1000)));
            this.timerBg.clear(); this.timerBg.fillStyle(0xffffff, 0.28); this.timerBg.fillRoundedRect(x, y, barW, barH, 10); this.timerBg.lineStyle(3, 0x042539, 1); this.timerBg.strokeRoundedRect(x, y, barW, barH, 10);
            this.timerFill.clear(); this.timerFill.fillStyle(0x57C785, 0.95); this.timerFill.fillRoundedRect(x, y, Math.max(0, frac * barW), barH, 10); this.timerFill.lineStyle(2, 0x042539, 1); this.timerFill.strokeRoundedRect(x, y, Math.max(2, frac * barW), barH, 10);
          };

          // Prompt text
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, this.scale.height / 6, '', { fontFamily: 'Fredoka One', fontSize: `${qFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 6, align: 'center', wordWrap: { width: this.scale.width * 0.9 } }).setOrigin(0.5).setShadow(2,2,'rgba(0,0,0,0.4)',6);

          // Buttons: Help, Audio (Shuffle removed)
          this.createHelpButton();
          this.createAudioToggleButton();
          this.positionButtons();

          // Resize handling
          this.onResizeHandler = () => {
            try { this.positionButtons && this.positionButtons(); } catch {}
            try { this.promptText && this.promptText.setY(Math.max(28, this.scale.height * 0.14)); } catch {}
            try { this.scoreText && this.scoreText.setY(Math.max(24, this.scale.height * 0.075)); } catch {}
            try { this.drawTimer && this.drawTimer(); } catch {}
            try { this.layoutRound && this.layoutRound(); } catch {}
            try { this.layoutHelpOverlay && this.layoutHelpOverlay(); } catch {}
          };
          this.scale.on('resize', this.onResizeHandler, this);
          const off = () => { try { this.scale?.off('resize', this.onResizeHandler, this); } catch {} };
          this.events.once('shutdown', off);
          this.events.once('destroy', off);

          // Show Help first, then start session
          this.showHowToOverlay({ startNew: true });
        }

        // Audio helper
        playSfx(key) { if (!this.sfxEnabled) return; try { this.sound?.play(key); } catch { try { new Audio(key).play(); } catch {} } }

        // Buttons
        createHelpButton() {
          const sFontSize = Math.max(14, Math.min(24, this.scale.height * 0.045));
          const text = this.add.text(0, 0, 'Help', { fontFamily: 'Fredoka One', fontSize: `${sFontSize}px`, color: '#042539' }).setOrigin(0.5);
          const width = text.width + 28; const height = text.height + 16;
          const bg = this.add.graphics(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
          const container = this.add.container(0, 0, [bg, text]); container.setSize(width, height); container.setInteractive({ useHandCursor: true });
          container.on('pointerover', () => { this.tweens.add({ targets: container, scale: 1.05, duration: 200 }); bg.clear(); bg.fillStyle(0x57C785, 0.8); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(6, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12); text.setColor('#ffffff'); });
          container.on('pointerout', () => { this.tweens.add({ targets: container, scale: 1, duration: 200 }); bg.clear(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12); text.setColor('#042539'); });
          container.on('pointerdown', () => { this.tweens.add({ targets: container, scale: 1.1, duration: 220, ease: 'Sine.easeOut', yoyo: true, onComplete: () => this.pauseAndShowHelp() }); });
          container.meta = { width, height }; this.helpBtn = container;
        }
        createAudioToggleButton() {
          const sFontSize = Math.max(14, Math.min(24, this.scale.height * 0.045));
          const label = () => (this.sfxEnabled ? 'SFX On' : 'SFX Off');
          const text = this.add.text(0, 0, label(), { fontFamily: 'Fredoka One', fontSize: `${sFontSize}px`, color: '#042539' }).setOrigin(0.5);
          const width = text.width + 28; const height = text.height + 16;
          const bg = this.add.graphics();
          const draw = (hover=false) => { bg.clear(); bg.fillStyle(hover ? 0x57C785 : 0xffffff, hover ? 0.8 : 0.6); bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12); text.setColor(hover ? '#ffffff' : '#042539'); };
          draw(false);
          const container = this.add.container(0, 0, [bg, text]); container.setSize(width, height); container.setInteractive({ useHandCursor: true });
          container.on('pointerover', () => { this.tweens.add({ targets: container, scale: 1.05, duration: 200 }); draw(true); });
          container.on('pointerout', () => { this.tweens.add({ targets: container, scale: 1, duration: 200 }); draw(false); });
          container.on('pointerdown', () => { this.sfxEnabled = !this.sfxEnabled; try { localStorage.setItem('game_sfx_enabled', this.sfxEnabled ? 'true' : 'false'); } catch {} text.setText(label()); const nw = text.width + 28; container.setSize(nw, height); container.meta.width = nw; bg.clear(); draw(false); this.positionButtons(); });
          container.meta = { width, height }; this.audioBtn = container;
        }
        positionButtons() {
          const margin = 12;
          // Place Help at the top-right
          if (this.helpBtn) {
            const width = this.helpBtn.meta.width; const height = this.helpBtn.meta.height;
            this.helpBtn.x = this.scale.width - 20 - width / 2;
            this.helpBtn.y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          }
          // Place Audio left of Help
          if (this.audioBtn) {
            const height = this.audioBtn.meta.height; const width = this.audioBtn.meta.width;
            const prevWidth = this.helpBtn?.meta?.width || 0; const prevX = this.helpBtn?.x || (this.scale.width - 20 - prevWidth/2);
            this.audioBtn.x = prevX - (prevWidth/2) - margin - (width/2);
            this.audioBtn.y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          }
        }

        startSession() {
          // cleanup any overlay if present
          this.destroyHelpOverlay?.();
          this.score = 0;
          this.scoreText.setText('0');
          this.endTime = this.time.now + this.sessionSeconds * 1000;
          this.drawTimer();
          this.timerEvent?.remove();
          this.timerEvent = this.time.addEvent({ delay: 100, loop: true, callback: () => {
            if (this.time.now >= this.endTime) { this.timerEvent.remove(); this.endSession(); return; }
            this.drawTimer();
          }});
          // Build a unique pool sized as duration/2 seconds
          const poolSize = Math.max(1, Math.floor(this.sessionSeconds / 2));
          this.roundPool = buildRotationRounds(poolSize);
          this.roundIndex = 0;
          this.nextRound();
        }

        pauseAndShowHelp() {
          // Pause timer if running
          if (this.timerEvent) { try { this.timerEvent.remove(); } catch {} this.timerEvent = null; }
          this.remainingMs = Math.max(0, this.endTime - this.time.now);
          this.showHowToOverlay({ resume: true });
        }

        resumeSession() {
          this.destroyHelpOverlay?.();
          const rem = (this.remainingMs == null ? this.sessionSeconds * 1000 : this.remainingMs);
          this.endTime = this.time.now + rem;
          this.drawTimer();
          this.timerEvent?.remove();
          this.timerEvent = this.time.addEvent({ delay: 100, loop: true, callback: () => {
            if (this.time.now >= this.endTime) { this.timerEvent.remove(); this.endSession(); return; }
            this.drawTimer();
          }});
          // If no active round objects, start one
          if (!this.layoutRound && !this.activeRoundCleanup) this.nextRound();
        }

        destroyHelpOverlay() {
          if (!this.helpOverlay) return;
          const { bg, panel, heading, bodyText, btn, group } = this.helpOverlay;
          [bg, panel, heading, bodyText, btn, group].forEach(el => { try { el?.destroy(); } catch {} });
          this.helpOverlay = null;
        }

        showHowToOverlay({ startNew = false, resume = false } = {}) {
          // Create overlay UI
          const W = this.scale.width; const H = this.scale.height;
          const bg = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.45).setInteractive();
          const panelW = Math.min(W * 0.8, 640); const panelH = Math.min(H * 0.6, 420);
          const panel = this.add.graphics(); panel.fillStyle(0xffffff, 0.9); panel.fillRoundedRect((W-panelW)/2, (H-panelH)/2, panelW, panelH, 18); panel.lineStyle(4, 0x042539, 1); panel.strokeRoundedRect((W-panelW)/2, (H-panelH)/2, panelW, panelH, 18);
          const heading = this.add.text(W/2, H/2 - panelH/2 + 48, 'How to Play', { fontFamily: 'Fredoka One', fontSize: `${Math.max(22, Math.min(34, H*0.06))}px`, color: '#042539' }).setOrigin(0.5);
          const lines = [
            '• Answer as many as you can before time runs out.',
            '• Question types: MCQ, Odd One Out, Select All, Drag & Drop.',
            '• Tap/click the correct option. Wrong picks shake.'
          ];
          const bodyText = this.add.text(W/2, H/2 - 10, lines.join('\n'), { fontFamily: 'Fredoka One', fontSize: `${Math.max(14, Math.min(20, H*0.035))}px`, color: '#042539', align: 'center' }).setOrigin(0.5);
          // Button
          const btnLabel = startNew ? 'Start' : (resume ? 'Resume' : 'Close');
          const btnText = this.add.text(0, 0, btnLabel, { fontFamily: 'Fredoka One', fontSize: `${Math.max(16, Math.min(24, H*0.045))}px`, color: '#042539' }).setOrigin(0.5);
          const btnW = btnText.width + 40; const btnH = btnText.height + 18;
          const btnBg = this.add.graphics(); btnBg.fillStyle(0x57C785, 0.9); btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 12); btnBg.lineStyle(4, 0x042539, 1); btnBg.strokeRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 12);
          const btn = this.add.container(W/2, H/2 + panelH/2 - 50, [btnBg, btnText]); btn.setSize(btnW, btnH); btn.setInteractive({ useHandCursor: true });
          btn.on('pointerover', () => { this.tweens.add({ targets: btn, scale: 1.05, duration: 150 }); });
          btn.on('pointerout', () => { this.tweens.add({ targets: btn, scale: 1, duration: 150 }); });
          btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 1.1, duration: 200, ease: 'Sine.easeOut', yoyo: true, onComplete: () => {
              if (startNew) this.startSession(); else if (resume) this.resumeSession(); else this.destroyHelpOverlay();
            } });
          });

          const group = this.add.container(0,0, []); // placeholder if needed for future elements
          this.helpOverlay = { bg, panel, heading, bodyText, btn, group, panelW, panelH };
          this.layoutHelpOverlay = () => {
            const W2 = this.scale.width; const H2 = this.scale.height; const panelW2 = Math.min(W2 * 0.8, 640); const panelH2 = Math.min(H2 * 0.6, 420);
            bg.setPosition(W2/2, H2/2); bg.setSize(W2, H2);
            panel.clear(); panel.fillStyle(0xffffff, 0.9); panel.fillRoundedRect((W2-panelW2)/2, (H2-panelH2)/2, panelW2, panelH2, 18); panel.lineStyle(4, 0x042539, 1); panel.strokeRoundedRect((W2-panelW2)/2, (H2-panelH2)/2, panelW2, panelH2, 18);
            heading.setPosition(W2/2, H2/2 - panelH2/2 + 48);
            bodyText.setPosition(W2/2, H2/2 - 10);
            btn.setPosition(W2/2, H2/2 + panelH2/2 - 50);
          };
        }

        endSession() {
          try {
            let hist = []; try { hist = JSON.parse(localStorage.getItem('game10_history') || '[]'); } catch {}
            hist.push(this.score); localStorage.setItem('game10_history', JSON.stringify(hist.slice(-20)));
          } catch {}
          this.scene.start('SummaryScene', { score: this.score });
        }

        nextRound() {
          if (this.time.now >= this.endTime) { this.endSession(); return; }
          // cleanup previous round
          if (typeof this.activeRoundCleanup === 'function') {
            try { this.activeRoundCleanup(); } catch {}
            this.activeRoundCleanup = null;
          }
          // Reset round lock each time we advance
          this.roundLocked = false;
          // If pool is empty, try to rebuild once; otherwise end
          if (!this.roundPool || this.roundPool.length === 0) {
            const poolSize = Math.max(1, Math.floor(this.sessionSeconds / 2));
            this.roundPool = buildRotationRounds(poolSize);
            this.roundIndex = 0;
            if (!this.roundPool.length) { this.endSession(); return; }
          }
          // Pull next round from pool and cycle
          const idx = this.roundIndex % this.roundPool.length;
          const round = this.roundPool[idx];
          this.roundIndex = (this.roundIndex + 1) % Math.max(1, this.roundPool.length);
          if (!round) { this.endSession(); return; }
          this.renderRound(round);
        }

        renderRound(round) {
          this.promptText.setText(round.prompt || '');
          // Delegate
          if (round.kind === 'mcq') this.renderMCQ(round);
          else if (round.kind === 'odd') this.renderOdd(round);
          else if (round.kind === 'select') this.renderSelect(round);
          else if (round.kind === 'drag') this.renderDrag(round);
        }

        // MCQ rendering: central image + 3 option buttons below
        renderMCQ(round) {
          const W = this.scale.width; const H = this.scale.height;
          const centerY = H * 0.5;
          const imgSize = Math.min(W, H) * 0.32;

          const img = this.add.image(W/2, centerY - imgSize*0.1, round.img).setOrigin(0.5);
          img.setDisplaySize(imgSize, imgSize);
          let baseScaleX = img.scaleX, baseScaleY = img.scaleY;

          const buttons = [];
          const optFont = Math.max(14, Math.min(22, H * 0.04));
          const spacing = Math.min(W * 0.26, 260);
          const startX = W/2 - spacing;
          const y = centerY + imgSize * 0.6;

          const makeButton = (label, idx) => {
            const text = this.add.text(0, 0, label, { fontFamily: 'Fredoka One', fontSize: `${optFont}px`, color: '#042539' }).setOrigin(0.5);
            const width = text.width + 28; const height = text.height + 14;
            const bg = this.add.graphics();
            const draw = (hover=false, correct=false) => { bg.clear(); const fill = correct ? 0x57C785 : (hover ? 0x57C785 : 0xffffff); const alpha = correct ? 0.9 : (hover ? 0.8 : 0.6); bg.fillStyle(fill, alpha); bg.fillRoundedRect(-width/2, -height/2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width/2, -height/2, width, height, 12); text.setColor(hover || correct ? '#ffffff' : '#042539'); };
            draw(false);
            const ct = this.add.container(startX + idx * spacing, y, [bg, text]);
            ct.setSize(width, height); ct.setInteractive({ useHandCursor: true });
            ct.meta = { isHover: false };
            ct.on('pointerover', () => { ct.meta.isHover = true; draw(true); this.tweens.add({ targets: ct, scale: 1.05, duration: 180 }); });
            ct.on('pointerout', () => { ct.meta.isHover = false; draw(false); this.tweens.add({ targets: ct, scale: 1, duration: 180 }); });
            // Guard against spamming
            ct.on('pointerdown', () => { handlePick(label, ct, draw); });
            return { ct, draw };
          };

          const handlePick = (label, ct, draw) => {
            if (this.roundLocked) return; // already resolved
            if (label === round.key) {
              this.roundLocked = true; // lock immediately on correct
              this.playSfx(choice(this.correctAudioFiles));
              this.score += 1; this.scoreText.setText(String(this.score));
              draw(true, true);
              // Animate both button and image immediately (no waiting)
              this.tweens.add({ targets: ct, scale: 1.1, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 0 });
              this.tweens.add({ targets: img, scaleX: baseScaleX * 1.12, scaleY: baseScaleY * 1.12, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 0, onComplete: () => { img.scaleX = baseScaleX; img.scaleY = baseScaleY; } });
              this.time.delayedCall(600, () => this.nextRound());
            } else {
              this.playSfx(choice(this.wrongAudioFiles));
              // No expand on wrong; only shake
              this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
            }
          };

          round.options.forEach((op, i) => buttons.push(makeButton(String(op), i)));

          // Cleanup + layout — keep hover state
          this.layoutRound = () => {
            const W2 = this.scale.width; const H2 = this.scale.height; const imgSize2 = Math.min(W2, H2) * 0.32; const spacing2 = Math.min(W2 * 0.26, 260); const startX2 = W2/2 - spacing2; const y2 = H2 * 0.5 + imgSize2 * 0.6; img.setPosition(W2/2, H2*0.5 - imgSize2*0.1); img.setDisplaySize(imgSize2, imgSize2); baseScaleX = img.scaleX; baseScaleY = img.scaleY; buttons.forEach((b, i) => { const text = b.ct.list[1]; const width = text.width + 28; const height = text.height + 14; b.ct.setPosition(startX2 + i * spacing2, y2); b.ct.setSize(width, height); b.draw(!!b.ct.meta?.isHover); }); };
          this.activeRoundCleanup = () => { try { img.destroy(); } catch {} buttons.forEach(b => { try { b.ct.destroy(); } catch {} }); };
        }

        // Odd-One-Out rendering (borrowed style from Game 9)
        renderOdd(round) {
          const W = this.scale.width; const H = this.scale.height;
          const areaW = W * 0.86; const size = Math.min(W, H) * 0.22; const centerY = H * 0.5; const count = round.items.length; const startX = W/2 - ((count-1) * (areaW / count)) / 2;

          const cards = [];

          const makeCard = (x, y, imageKey, isOdd) => {
            const bg = this.add.graphics();
            const drawDefault = () => { bg.clear(); bg.fillStyle(0xffffff, 0.8); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16); };
            const drawHover = (correct=false) => { bg.clear(); const fill = 0x57C785; const alpha = correct ? 0.85 : 0.8; bg.fillStyle(fill, alpha); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16); };
            drawDefault();
            const img = this.add.image(0,0,imageKey).setOrigin(0.5); img.setDisplaySize(size*0.78, size*0.78);
            let baseScaleX = img.scaleX, baseScaleY = img.scaleY;
            const ct = this.add.container(x, y, [bg, img]); ct.setSize(size, size);
            const hit = this.add.zone(0,0,size,size).setOrigin(0.5); ct.add(hit); hit.setInteractive({ cursor: 'pointer' });
            let isHover = false; let scaleTween = null;
            const hoverIn = () => { isHover = true; drawHover(false); if (scaleTween) scaleTween.stop(); scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX*1.06, scaleY: baseScaleY*1.06, duration: 180, ease: 'Sine.easeOut' }); };
            const hoverOut = () => { isHover = false; drawDefault(); if (scaleTween) scaleTween.stop(); scaleTween = this.tweens.add({ targets: img, scaleX: baseScaleX, scaleY: baseScaleY, duration: 180, ease: 'Sine.easeOut' }); };
            hit.on('pointerover', hoverIn); hit.on('pointerout', hoverOut);
            const onCorrect = () => { this.playSfx(choice(this.correctAudioFiles)); this.score += 1; this.scoreText.setText(String(this.score)); drawHover(true); this.tweens.add({ targets: img, scaleX: baseScaleX*1.12, scaleY: baseScaleY*1.12, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 0, onComplete: () => { img.scaleX = baseScaleX; img.scaleY = baseScaleY; } }); this.time.delayedCall(600, () => this.nextRound()); };
            const onWrong = () => { this.playSfx(choice(this.wrongAudioFiles)); this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 }); };
            hit.on('pointerdown', () => { if (this.roundLocked) return; if (isOdd) { this.roundLocked = true; onCorrect(); } else { onWrong(); } });
            return ct;
          };

          round.items.forEach((it, idx) => { const x = startX + idx * (areaW / count); cards.push(makeCard(x, centerY, it.img, it.isOdd)); });

          this.layoutRound = () => { const W2 = this.scale.width; const H2 = this.scale.height; const areaW2 = W2 * 0.86; const size2 = Math.min(W2, H2) * 0.22; const centerY2 = H2 * 0.5; const startX2 = W2/2 - ((count-1) * (areaW2 / count)) / 2; cards.forEach((c, i) => { if (!c || !c.scene) return; c.x = startX2 + i * (areaW2 / count); c.y = centerY2; }); };
          this.activeRoundCleanup = () => { cards.forEach(c => { try { c.destroy(); } catch {} }); };
        }

        // New: Select-All (multiple correct) rendering
        renderSelect(round) {
          const W = this.scale.width; const H = this.scale.height;
          const areaW = W * 0.86; const size = Math.min(W, H) * 0.22; const centerY = H * 0.52; const count = round.items.length; const startX = W/2 - ((count-1) * (areaW / count)) / 2;

          const cards = [];
          const correctSet = new Set(round.items.map((it, idx) => it.correct ? idx : -1).filter(i => i !== -1));

          const makeCard = (x, y, imageKey, idx) => {
            const bg = this.add.graphics();
            const drawDefault = () => { bg.clear(); bg.fillStyle(0xffffff, 0.8); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16); };
            const drawActive = () => { bg.clear(); bg.fillStyle(0x57C785, 0.85); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16); };
            drawDefault();
            const img = this.add.image(0,0,imageKey).setOrigin(0.5); img.setDisplaySize(size*0.78, size*0.78);
            const ct = this.add.container(x, y, [bg, img]); ct.setSize(size, size);
            const hit = this.add.zone(0,0,size,size).setOrigin(0.5); ct.add(hit); hit.setInteractive({ cursor: 'pointer' });
            ct.meta = { selected: false };
            const refresh = () => { ct.meta.selected ? drawActive() : drawDefault(); };
            hit.on('pointerover', () => { if (!ct.meta.selected) { bg.clear(); bg.fillStyle(0x57C785, 0.8); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16); }});
            hit.on('pointerout', () => refresh());
            hit.on('pointerdown', () => { if (this.roundLocked) return; ct.meta.selected = !ct.meta.selected; refresh(); });
            return ct;
          };

          round.items.forEach((it, idx) => { const x = startX + idx * (areaW / count); cards.push(makeCard(x, centerY, it.img, idx)); });

          // Confirm button
          const makeConfirmButton = () => {
            const sFont = Math.max(16, Math.min(24, H * 0.045));
            const label = 'Confirm';
            const text = this.add.text(0, 0, label, { fontFamily: 'Fredoka One', fontSize: `${sFont}px`, color: '#042539' }).setOrigin(0.5);
            const width = text.width + 36; const height = text.height + 16;
            const bg = this.add.graphics();
            const draw = (hover=false, disabled=false) => { bg.clear(); const fill = disabled ? 0x8aa3b5 : (hover ? 0x57C785 : 0xffffff); const alpha = disabled ? 0.6 : (hover ? 0.85 : 0.6); bg.fillStyle(fill, alpha); bg.fillRoundedRect(-width/2, -height/2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width/2, -height/2, width, height, 12); text.setColor(disabled || hover ? '#ffffff' : '#042539'); };
            draw(false, false);
            const btnY = Math.min(H - 50, H * 0.88);
            const ct = this.add.container(W/2, btnY, [bg, text]); ct.setSize(width, height); ct.setInteractive({ useHandCursor: true });
            ct.meta = { width, height, disabled: false };
            const hoverIn = () => { if (ct.meta.disabled) return; this.tweens.add({ targets: ct, scale: 1.05, duration: 150 }); draw(true, false); };
            const hoverOut = () => { if (ct.meta.disabled) return; this.tweens.add({ targets: ct, scale: 1, duration: 150 }); draw(false, false); };
            ct.on('pointerover', hoverIn);
            ct.on('pointerout', hoverOut);
            ct.on('pointerdown', () => {
              if (this.roundLocked || ct.meta.disabled) return;
              // Compare selections
              const sel = new Set(cards.map((c, i) => c.meta.selected ? i : -1).filter(i => i !== -1));
              const sameSize = sel.size === correctSet.size; let equal = sameSize;
              if (equal) { for (const v of sel) { if (!correctSet.has(v)) { equal = false; break; } } }
              if (equal) {
                this.roundLocked = true;
                ct.meta.disabled = true; draw(false, true);
                this.playSfx(choice(this.correctAudioFiles));
                this.score += 1; this.scoreText.setText(String(this.score));
                // Animate only correct selected cards
                cards.forEach((c, i) => { if (c.meta.selected && correctSet.has(i)) { const img = c.list[1]; if (img) this.tweens.add({ targets: img, scaleX: img.scaleX * 1.12, scaleY: img.scaleY * 1.12, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 0 }); } });
                this.time.delayedCall(600, () => this.nextRound());
              } else {
                this.playSfx(choice(this.wrongAudioFiles));
                this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2 });
              }
            });
            return ct;
          };

          const confirmBtn = makeConfirmButton();

          this.layoutRound = () => {
            const W2 = this.scale.width; const H2 = this.scale.height; const areaW2 = W2 * 0.86; const size2 = Math.min(W2, H2) * 0.22; const centerY2 = H2 * 0.52; const startX2 = W2/2 - ((count-1) * (areaW2 / count)) / 2;
            cards.forEach((c, i) => { if (!c || !c.scene) return; c.x = startX2 + i * (areaW2 / count); c.y = centerY2; c.setSize(size2, size2); });
            if (confirmBtn && confirmBtn.scene) { confirmBtn.x = W2/2; confirmBtn.y = Math.min(H2 - 50, H2 * 0.88); }
          };

          this.activeRoundCleanup = () => { try { confirmBtn.destroy(); } catch {} cards.forEach(c => { try { c.destroy(); } catch {} }); };
        }

        // Drag & Drop rendering (drop zone enlarged and moved to bottom)
        renderDrag(round) {
          const W = this.scale.width; const H = this.scale.height;
          const areaW = W * 0.86; const size = Math.min(W, H) * 0.2; const centerY = H * 0.5; const count = round.items.length; const startX = W/2 - ((count-1) * (areaW / count)) / 2;

          // Bottom drop zone
          let zoneW = Math.min(W * 0.7, W - 80);
          let zoneH = Math.max(100, Math.min(180, H * 0.22));
          let zoneY = H - Math.max(70, H * 0.12) - zoneH/2; // near bottom with margin
          const zoneX = W/2;

          const zoneG = this.add.graphics(); zoneG.fillStyle(0xffffff, 0.25); zoneG.fillRoundedRect(zoneX - zoneW/2, zoneY - zoneH/2, zoneW, zoneH, 14); zoneG.lineStyle(4, 0x042539, 1); zoneG.strokeRoundedRect(zoneX - zoneW/2, zoneY - zoneH/2, zoneW, zoneH, 14);
          const zoneLabel = this.add.text(zoneX, zoneY, 'Drop correct items here', { fontFamily: 'Fredoka One', fontSize: `${Math.max(14, Math.min(22, H*0.04))}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 4 }).setOrigin(0.5).setShadow(2,2,'rgba(0,0,0,0.35)',6);
          const zoneRect = new PhaserGame.Geom.Rectangle(zoneX - zoneW/2, zoneY - zoneH/2, zoneW, zoneH);

          const items = []; let placed = 0; const need = round.items.filter(i => i.correct).length;

          const makeDraggable = (x, y, imageKey, correct) => {
            const img = this.add.image(0,0,imageKey).setOrigin(0.5); img.setDisplaySize(size*0.78, size*0.78);
            const bg = this.add.graphics(); bg.fillStyle(0xffffff, 0.8); bg.fillRoundedRect(-size/2, -size/2, size, size, 16); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-size/2, -size/2, size, size, 16);
            const ct = this.add.container(x, y, [bg, img]); ct.setSize(size, size); ct.setInteractive({ draggable: true, useHandCursor: true }); this.input.setDraggable(ct);
            ct.meta = { homeX: x, homeY: y, correct, inZone: false };
            ct.on('dragstart', () => { this.tweens.add({ targets: ct, scale: 1.06, duration: 150 }); });
            ct.on('drag', (pointer, dragX, dragY) => { ct.x = dragX; ct.y = dragY; });
            ct.on('dragend', () => {
              const cx = ct.x, cy = ct.y;
              if (PhaserGame.Geom.Rectangle.Contains(zoneRect, cx, cy)) {
                if (correct && !ct.meta.inZone) {
                  ct.meta.inZone = true; placed += 1; this.tweens.add({ targets: ct, scale: 1, duration: 150 });
                  // Snap into zone on a simple grid
                  const col = (placed - 1) % 5; const row = Math.floor((placed - 1) / 5);
                  const cellW = Math.min(size * 0.9, zoneW / 6); const cellH = Math.min(size * 0.9, zoneH / 3);
                  const offsetX = (col - 2) * (cellW * 1.1);
                  const offsetY = (row - 0) * (cellH * 1.1) - cellH * 0.4;
                  this.tweens.add({ targets: ct, x: zoneX + offsetX, y: zoneY + offsetY, duration: 220, ease: 'Sine.easeOut' });
                  if (placed >= need) { this.playSfx(choice(this.correctAudioFiles)); this.score += 1; this.scoreText.setText(String(this.score)); this.time.delayedCall(600, () => this.nextRound()); }
                } else {
                  // Wrong item dropped
                  this.playSfx(choice(this.wrongAudioFiles)); this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2, onComplete: () => { this.tweens.add({ targets: ct, x: ct.meta.homeX, y: ct.meta.homeY, duration: 200, ease: 'Sine.easeOut' }); } });
                }
              } else {
                // Return home
                this.tweens.add({ targets: ct, scale: 1, duration: 150 });
                this.tweens.add({ targets: ct, x: ct.meta.homeX, y: ct.meta.homeY, duration: 200, ease: 'Sine.easeOut' });
              }
            });
            return ct;
          };

          round.items.forEach((it, idx) => { const x = startX + idx * (areaW / count); items.push(makeDraggable(x, centerY, it.img, it.correct)); });

          this.layoutRound = () => {
            const W2 = this.scale.width; const H2 = this.scale.height; const areaW2 = W2 * 0.86; const size2 = Math.min(W2, H2) * 0.2; const centerY2 = H2 * 0.45; const startX2 = W2/2 - ((count-1) * (areaW2 / count)) / 2;
            zoneW = Math.min(W2 * 0.7, W2 - 80); zoneH = Math.max(100, Math.min(180, H2 * 0.22)); zoneY = H2 - Math.max(70, H2 * 0.12) - zoneH/2; const zoneX2 = W2/2;
            zoneG.clear(); zoneG.fillStyle(0xffffff, 0.25); zoneG.fillRoundedRect(zoneX2 - zoneW/2, zoneY - zoneH/2, zoneW, zoneH, 14); zoneG.lineStyle(4, 0x042539, 1); zoneG.strokeRoundedRect(zoneX2 - zoneW/2, zoneY - zoneH/2, zoneW, zoneH, 14);
            zoneLabel.setPosition(zoneX2, zoneY);
            PhaserGame.Geom.Rectangle.SetTo(zoneRect, zoneX2 - zoneW/2, zoneY - zoneH/2, zoneW, zoneH);
            items.forEach((c, i) => { if (!c || !c.scene) return; if (!c.meta.inZone) { c.meta.homeX = startX2 + i * (areaW2 / count); c.meta.homeY = centerY2; this.tweens.add({ targets: c, x: c.meta.homeX, y: c.meta.homeY, duration: 200, ease: 'Sine.easeOut' }); } });
          };

          this.activeRoundCleanup = () => { [zoneG, zoneLabel].forEach(el => { try { el.destroy(); } catch {} }); items.forEach(c => { try { c.destroy(); } catch {} }); };
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) { this.score = (data && (data.score ?? data.correct)) || 0; try { this.history = JSON.parse(localStorage.getItem('game10_history') || '[]'); } catch (e) { this.history = []; } this.localHistory = this.history.slice(-5); }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() { /* eslint-disable no-undef */ WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { const W = this.scale.width; const H = this.scale.height; buildSummaryUI(this, { correct: this.score, total: undefined, history: this.localHistory, onRestart: () => this.scene.start('RotationScene'), texts: { heading: `You scored ${this.score}!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Last 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true }); } }); /* eslint-enable */ }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = { type: PhaserGame.AUTO, parent: container, transparent: true, scene: [PreloadScene, RotationScene, SummaryScene], scale: { mode: PhaserGame.Scale.NONE, width: container.clientWidth * ratio, height: container.clientHeight * ratio }, callbacks: { postBoot: (game) => { game.canvas.style.width = `${container.clientWidth}px`; game.canvas.style.height = `${container.clientHeight}px`; } } };

      phaserRef.current = new PhaserGame.Game(config);

      resizeObserverRef.current = new ResizeObserver(() => { if (!phaserRef.current) return; const w = container.clientWidth; const h = container.clientHeight; phaserRef.current.scale.resize(w * ratio, h * ratio); phaserRef.current.canvas.style.width = `${w}px`; phaserRef.current.canvas.style.height = `${h}px`; });
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

export default Game10;
