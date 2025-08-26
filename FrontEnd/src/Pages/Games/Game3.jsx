import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
import { getAllFeatureAssets } from './AssetFeatureMapping';
import { pickItemsFromType, getAllIconKeys } from './QuestionUtils';
import { getDimOverlayStyle } from './GameTheme';

// Receptive Identification of Feature (Game 3)
// Shows 3 image options with labels and asks: "Which item has/is [feature]?"
// - 20 rounds per session
// - Score counts only first-try correct answers
// - Summary uses shared ProgressGraph via SummaryUI

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper to format prompts nicely from feature names like "Have letters" or "Are red"
function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
function formatFeatureQuestion(featureName) {
  if (!featureName) return 'Which item is correct?';
  const s = featureName.trim();
  if (s.startsWith('Have ')) {
    const rest = s.slice(5);
    return `Which item has ${lowerFirst(rest)}?`;
  }
  if (s.startsWith('Are ')) {
    const rest = s.slice(4);
    return `Which item is ${lowerFirst(rest)}?`;
  }
  // Fallback
  return `Which item has ${lowerFirst(s)}?`;
}

// Build a name lookup from feature mappings (labels for option cards)
const FEATURE_ASSETS = getAllFeatureAssets();
const NAME_BY_KEY = new Map(FEATURE_ASSETS.map(a => [a.imagePath, a.name]));

// Preload all known icons (across types) to avoid missing assets
const ALL_ICON_KEYS = getAllIconKeys();

// Build N unique rounds using QuestionUtils; ensure no repeated feature or correct image per session
function buildRoundsUnique(limit = 20) {
  const rounds = [];
  const usedFeatures = new Set();
  const usedCorrectImgs = new Set();
  let attempts = 0;

  while (rounds.length < limit && attempts < 800) {
    attempts += 1;
    const res = pickItemsFromType({ type: 'feature', numCorrect: 1, numWrong: 2 });
    if (!res) break;

    const feature = res.key;
    const correctImg = res.correctImgs?.[0];
    if (!feature || !correctImg) continue;

    // Enforce uniqueness per session
    if (usedFeatures.has(feature)) continue;
    if (usedCorrectImgs.has(correctImg)) continue;

    const optionKeys = shuffle([correctImg, ...res.wrongImgs]);
    const options = optionKeys.map(k => ({ name: NAME_BY_KEY.get(k) || k, imagePath: k }));

    rounds.push({
      feature,
      prompt: formatFeatureQuestion(feature),
      correctKey: correctImg,
      options,
    });

    usedFeatures.add(feature);
    usedCorrectImgs.add(correctImg);
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
  background: 'linear-gradient(135deg, rgba(4, 37, 57, 0.1) 0%, rgba(87, 199, 133, 0.05) 50%, rgba(249, 117, 68, 0.05) 100%)',
}));

const GameBoard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '1000px',
  minWidth: '280px',
  aspectRatio: '4/3',
  backgroundImage: 'url(/Games/backgrounds/pool.jpg)',
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

export function Game3() {
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

      // Preloader with themed progress (no bouncing logo)
      class PreloadScene extends PhaserGame.Scene {
        constructor() {
          super({ key: 'PreloadScene' });
        }

        preload() {
          const W = this.scale.width;
          const H = this.scale.height;

          const COLOR_DARK = 0x042539;
          const COLOR_ACCENT = 0x57c785;
          const COLOR_ACCENT_2 = 0xf9644d;

          // Panel
          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560);
          const panelH = Math.min(H * 0.24, 180);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18);
          panel.lineStyle(4, COLOR_DARK, 1);
          panel.strokeRoundedRect((W - panelW) / 2, (H - panelH) / 2, panelW, panelH, 18);

          const title = this.add.text(W / 2, H / 2 - panelH * 0.28, 'Loading...', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.max(18, Math.min(36, H * 0.055))}px`,
            color: '#ffffff',
            stroke: '#1e607d',
            strokeThickness: 3,
            align: 'center',
          }).setOrigin(0.5);

          // Bar
          const barW = panelW * 0.78;
          const barH = Math.max(12, Math.min(18, H * 0.025));
          const barX = (W - barW) / 2;
          const barY = H / 2 + barH * 0.5;

          const barBg = this.add.graphics();
          barBg.fillStyle(0xffffff, 0.25);
          barBg.fillRoundedRect(barX, barY, barW, barH, 10);
          barBg.lineStyle(3, COLOR_DARK, 1);
          barBg.strokeRoundedRect(barX, barY, barW, barH, 10);

          const barFill = this.add.graphics();
          const percentText = this.add.text(W / 2, barY + barH * 2, '0%', {
            fontFamily: 'Fredoka One',
            fontSize: `${Math.max(14, Math.min(22, H * 0.035))}px`,
            color: '#ffffff',
            stroke: '#1e607d',
            strokeThickness: 2,
          }).setOrigin(0.5);

          // Load webfont script and ALL icon assets
          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
          ALL_ICON_KEYS.forEach((key) => {
            this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`);
          });

          // Sheen + smooth progress
          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW;
            barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95);
            barFill.fillRoundedRect(barX, barY, w, barH, 10);
            barFill.lineStyle(2, COLOR_DARK, 1);
            barFill.strokeRoundedRect(barX, barY, Math.max(w, 2), barH, 10);
            // sheen
            if (w > 8) {
              const t = (this.time.now % 1200) / 1200;
              const sheenWidth = Math.max(30, Math.min(80, w * 0.25));
              const sxRaw = barX - 60 + (w + 120) * t;
              const startX = Math.max(barX, sxRaw);
              const endX = Math.min(barX + w, sxRaw + sheenWidth);
              const cw = endX - startX;
              if (cw > 0) {
                barFill.fillStyle(0xffffff, 0.2);
                barFill.beginPath();
                barFill.moveTo(startX, barY);
                barFill.lineTo(startX + Math.min(16, cw * 0.25), barY);
                barFill.lineTo(startX + cw, barY + barH);
                barFill.lineTo(startX + Math.max(0, cw - Math.min(16, cw * 0.25)), barY + barH);
                barFill.closePath();
                barFill.fillPath();
                barFill.fillStyle(0xf9644d, 0.12);
                barFill.fillRect(Math.max(barX, endX - 2), barY + 2, 2, barH - 4);
              }
            }
          };
          drawBar(0);
          this.sheenTick = this.time.addEvent({ delay: 40, loop: true, callback: () => drawBar(this.prog.v) });

          this.load.on('progress', (value) => {
            if (this.progressTween) this.progressTween.remove();
            const start = this.prog.v;
            const dist = Math.abs(value - start);
            this.progressTween = this.tweens.add({
              targets: this.prog,
              v: value,
              duration: Math.max(200, Math.min(700, 800 * dist)),
              ease: 'Sine.easeOut',
              onUpdate: () => {
                drawBar(this.prog.v);
                percentText.setText(`${Math.round(this.prog.v * 100)}%`);
              },
            });
          });

          this.load.once('complete', () => {
            const scene = this;
            // eslint-disable-next-line no-undef
            WebFont.load({
              google: { families: ['Fredoka One'] },
              active: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureScene'); },
              inactive: () => { scene.sheenTick?.remove(); scene.scene.start('FeatureScene'); },
            });
          });
        }
      }

      class FeatureScene extends PhaserGame.Scene {
        constructor() {
          super({ key: 'FeatureScene' });
        }

        init() {
          // 20 questions (unique by feature and correct image)
          this.rounds = buildRoundsUnique(20);
          this.roundIndex = 0;
          this.firstAttempt = true;
          this.score = 0;
          this.optionContainers = [];
          // Prevent multiple scoring from repeated clicks within a round
          this.roundLocked = false;

          this.correctAudioFiles = [
            '/Games/audio/right1.mp3',
            '/Games/audio/right2.mp3',
            '/Games/audio/right3.mp3',
          ];
          this.wrongAudioFiles = [
            '/Games/audio/wrong1.mp3',
            '/Games/audio/wrong2.mp3',
          ];
        }

        // No asset loading here; handled by PreloadScene
        preload() {}

        create() {
          this.setupUI();
          this.showRound();
        }

        setupUI() {
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));

          this.promptText = this.add
            .text(this.scale.width / 2, Math.max(28, this.scale.height * 0.08), '', {
              fontFamily: 'Fredoka One',
              fontSize: `${qFont}px`,
              color: '#ffffff',
              stroke: '#042539',
              strokeThickness: 6,
              align: 'center',
              wordWrap: { width: this.scale.width * 0.9 },
            })
            .setOrigin(0.5)
            .setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          const pFont = Math.max(14, Math.min(28, this.scale.height * 0.05));
          this.progressText = this.add
            .text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '', {
              fontFamily: 'Fredoka One',
              fontSize: `${pFont}px`,
              color: '#ffffff',
              stroke: '#042539',
              strokeThickness: 5,
            })
            .setOrigin(0.5)
            .setShadow(2, 2, 'rgba(0,0,0,0.4)', 6);

          // Shuffle button like Game 2
          this.createShuffleButton();
          // Attach resize with a stored ref so we can detach on shutdown
          this._onResizeRef = () => this.positionShuffleButton();
          this.scale.on('resize', this._onResizeRef);
          this.events.once('shutdown', () => { try { if (this._onResizeRef) { this.scale.off('resize', this._onResizeRef); this._onResizeRef = null; } } catch {} });
          this.events.once('destroy', () => { try { if (this._onResizeRef) { this.scale.off('resize', this._onResizeRef); this._onResizeRef = null; } } catch {} });
        }

        positionShuffleButton() {
          if (!this.shuffleBtn) return;
          const width = this.shuffleBtn.meta.width;
          const height = this.shuffleBtn.meta.height;
          const x = this.scale.width - 20 - width / 2;
          const y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          this.shuffleBtn.x = x;
          this.shuffleBtn.y = y;
        }

        createShuffleButton() {
          const sFontSize = Math.max(14, Math.min(24, this.scale.height * 0.045));
          const text = this.add.text(0, 0, 'Shuffle', {
            fontFamily: 'Fredoka One',
            fontSize: `${sFontSize}px`,
            color: '#042539',
          }).setOrigin(0.5);

          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
          bg.lineStyle(4, 0x042539, 1);
          bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

          const x = this.scale.width - 20 - width / 2;
          const y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          const container = this.add.container(x, y, [bg, text]);
          container.setSize(width, height);
          container.setInteractive({ useHandCursor: true });

          container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 200 });
            bg.clear();
            bg.fillStyle(0x57C785, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            bg.lineStyle(6, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            text.setColor('#ffffff');
          });
          container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
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

          container.meta = { width, height };
          this.shuffleBtn = container;
        }

        handleShuffle() {
          this.rounds = buildRoundsUnique(20);
          this.roundIndex = 0;
          this.firstAttempt = true;
          this.score = 0;
          this.showRound();
        }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let hist = [];
            try {
              hist = JSON.parse(localStorage.getItem('game3_history') || '[]');
            } catch (e) {
              hist = [];
            }
            hist.push(this.score);
            localStorage.setItem('game3_history', JSON.stringify(hist.slice(-20)));

            this.scene.start('SummaryScene', {
              correct: this.score,
              total: this.rounds.length,
            });
            return;
          }

          // Reset per-round state/lock
          this.firstAttempt = true;
          this.roundLocked = false;
          this.optionContainers.forEach((c) => c.destroy());
          this.optionContainers = [];

          const round = this.rounds[this.roundIndex];
          this.promptText.setText(formatFeatureQuestion(round.feature));
          this.progressText.setText(`${this.roundIndex + 1} / ${this.rounds.length}`);

          // Layout: 3 options horizontally centered
          const options = round.options;
          const spacing = this.scale.width / (options.length + 1);
          const areaH = this.scale.height * 0.55;
          const y = this.scale.height / 2 + areaH / 4;

          options.forEach((opt, i) => {
            const x = spacing * (i + 1);
            const container = this.add.container(x, y);

            const imgBase = Math.min(this.scale.width, this.scale.height);
            const imgSize = Math.min(imgBase * 0.18, 150);
            const sprite = this.add
              .image(0, -10, opt.imagePath)
              .setDisplaySize(imgSize, imgSize)
              .setOrigin(0.5);

            const lblFont = Math.max(12, Math.min(20, this.scale.height * 0.03));
            const label = this.add
              .text(0, imgSize / 2 - 0, opt.name, {
                fontFamily: 'Fredoka One',
                fontSize: `${lblFont}px`,
                color: '#ffffff',
                align: 'center',
                stroke: '#042539',
                strokeThickness: 4,
              })
              .setOrigin(0.5, 0)
              .setShadow(2, 2, 'rgba(0,0,0,0.45)', 4);

            container.add([sprite, label]);
            container.setSize(imgSize + 30, imgSize + label.height + 20);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
              this.tweens.add({ targets: container, scale: 1.06, duration: 140 });
            });
            container.on('pointerout', () => {
              this.tweens.add({ targets: container, scale: 1.0, duration: 140 });
            });

            const onDown = () => this.checkAnswer(round, opt.imagePath, container);
            container.on('pointerdown', onDown);

            this.optionContainers.push(container);
          });
        }

        checkAnswer(round, chosenKey, container) {
          // Block if round already resolved or this container is mid animation
          if (this.roundLocked || container.isAnimating) return;

          const isCorrect = chosenKey === round.correctKey;
          const files = isCorrect ? this.correctAudioFiles : this.wrongAudioFiles;
          new Audio(PhaserGame.Utils.Array.GetRandom(files)).play();

          container.isAnimating = true;

          if (isCorrect) {
            // Lock the round immediately to prevent score spamming
            this.roundLocked = true;
            // Optionally disable further interactions on all options
            this.optionContainers.forEach((c) => { try { c.disableInteractive(); } catch {} });

            if (this.firstAttempt) this.score += 1;
            // Celebrate: scale up then down, then advance
            this.tweens.add({
              targets: container,
              scale: { from: 1, to: 1.12 },
              duration: 180,
              yoyo: true,
              ease: 'Back.easeOut',
              onComplete: () => {
                container.isAnimating = false;
                this.roundIndex += 1;
                this.time.delayedCall(200, () => this.showRound());
              },
            });
          } else {
            // First wrong removes first-try credit
            this.firstAttempt = false;
            // Shake animation + slight red flash
            this.tweens.add({
              targets: container,
              angle: { from: -4, to: 4 },
              duration: 60,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: 2,
              onStart: () => {
                container.setAlpha(0.8);
              },
              onComplete: () => {
                container.setAlpha(1);
                container.angle = 0;
                container.isAnimating = false;
              },
            });
          }
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) {
          this.correct = data.correct || 0;
          this.total = data.total || 0;
          try {
            this.history = JSON.parse(localStorage.getItem('game3_history') || '[]');
          } catch (e) {
            this.history = [];
          }
          this.localHistory = this.history.slice(-5);
        }
        preload() {
          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        }
        create() {
          // eslint-disable-next-line no-undef
          WebFont.load({ google: { families: ['Fredoka One'] }, active: () => this.build() });
        }
        build() {
          const W = this.scale.width; const H = this.scale.height;
          buildSummaryUI(this, {
            correct: this.correct,
            total: this.total,
            history: this.localHistory,
            onRestart: () => this.scene.start('FeatureScene'),
            texts: {
              heading: `You got ${this.correct} correct on first try!`,
              playAgain: 'Play Again',
            },
            graph: {
              x: W / 2,
              y: H / 2 + 150,
              width: 400,
              height: 250,
              titleText: 'Progress Over Past 5 Attempts',
              entrance: { fromYOffset: 300, delay: 200 },
            },
            renderHeading: true,
          });
        }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, FeatureScene, SummaryScene],
        scale: {
          mode: PhaserGame.Scale.NONE,
          width: container.clientWidth * ratio,
          height: container.clientHeight * ratio,
        },
        callbacks: {
          postBoot: (game) => {
            game.canvas.style.width = `${container.clientWidth}px`;
            game.canvas.style.height = `${container.clientHeight}px`;
          },
        },
      };

      phaserRef.current = new PhaserGame.Game(config);

      resizeObserverRef.current = new ResizeObserver(() => {
        if (!phaserRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        phaserRef.current.scale.resize(w * ratio, h * ratio);
        phaserRef.current.canvas.style.width = `${w}px`;
        phaserRef.current.canvas.style.height = `${h}px`;
      });
      resizeObserverRef.current.observe(container);
    });

    return () => {
      mounted = false;
      resizeObserverRef.current?.disconnect();
      phaserRef.current?.destroy(true);
    };
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

export default Game3;
