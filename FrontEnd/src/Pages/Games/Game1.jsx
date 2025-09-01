'use client';

import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import PageTemplate from 'Utils/PageTemplate';
import bannerImage from 'Assets/Images/banner.png';
import { buildProgressGraph } from './ProgressGraph';
import { buildSummaryUI } from './SummaryUI';
import { FUNCTION_ASSET_MAPPINGS, getAllFunctions, getAssetsForFunction } from './AssetFunctionMapping';
import { pickMCQUniqueForType } from './QuestionUtils';
import { getDimOverlayStyle } from './GameTheme';
import { QUESTIONS_PER_RUN } from './GameConfig';

// Generate questions from function mappings
function generateQuestions() {
  const questions = [];
  const usedImages = new Set();
  let attempts = 0;
  const MAX_ATTEMPTS = 300; // be generous to find unique items up to QUESTIONS_PER_RUN

  while (questions.length < QUESTIONS_PER_RUN && attempts < MAX_ATTEMPTS) {
    attempts += 1;
    const picked = pickMCQUniqueForType('function', 3);
    if (!picked) break;
    if (usedImages.has(picked.img)) continue; // ensure distinct item per question

    usedImages.add(picked.img);
    const itemName = picked.img.charAt(0).toUpperCase() + picked.img.slice(1);
    questions.push({
      item: picked.img,
      itemName,
      correct: picked.key,
      options: picked.options,
      prompt: `What do you do with ${itemName}?`,
    });
  }
  return questions;
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ReceptiveFunctionGame() {
  const containerRef = useRef();
  const phaserRef = useRef();
  const resizeObserverRef = useRef();
  const [questions, setQuestions] = useState(() => shuffleArray(generateQuestions()));
  
  // Get all function names as options
  const allOptions = getAllFunctions();

  // Styled components matching site design
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
    backgroundImage: 'url(/Games/backgrounds/kitchenrender.jpg)',
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
    // Add dim overlay so the background is opaque/dimmed under the game content
    ...getDimOverlayStyle(),
  }));

  useLayoutEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    import('phaser').then((PhaserLib) => {
      if (!isMounted || !container) return;
      const PhaserGame = PhaserLib.default;
      phaserRef.current?.destroy(true);

      const handleShuffle = () => {
        const newQuestions = shuffleArray(generateQuestions());
        setQuestions(newQuestions);
        // Restart the scene to reload assets for new questions
        if (phaserRef.current?.scene?.getScene('MainScene')) {
          phaserRef.current.scene.start('MainScene');
        }
      };

      class MainScene extends PhaserGame.Scene {
        constructor() {
          super({ key: 'MainScene' });
        }

        init() {
          this.qIndex = 0; // Start from question 0
          this.totalCorrect = 0;
          this.currentQuestion = 1;
          this.currentQuestionText = null;
          this.firstAttempt = true;
          this.questionText = null;
          this.iconImage = null;
          this.optionContainers = [];
          this.shuffleBtn = null;
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

        preload() {
          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
          const neededAssets = new Set();
          questions.forEach(q => { neededAssets.add(q.item); });
          neededAssets.forEach(imagePath => { this.load.image(imagePath, `/Games/icons/${imagePath}.png`); });
        }

        create() {
          this.game.canvas.style.backgroundColor = 'transparent';
          const wf = typeof window !== 'undefined' ? window.WebFont : undefined;
          if (wf && typeof wf.load === 'function') {
            wf.load({
              google: { families: ['Fredoka One'] },
              active: () => {
                this.setupScene();
                this.createShuffleButton();
                this.showQuestion();
                this.attachResize();
              },
            });
          } else {
            // Fallback if WebFont is unavailable
            this.setupScene();
            this.createShuffleButton();
            this.showQuestion();
            this.attachResize();
          }
        }

        attachResize() {
          // Re-layout everything on game-size changes
          this.scale.on('resize', this.handleResize, this);
          const off = () => { try { this.scale?.off('resize', this.handleResize, this); } catch {} };
          this.events.once('shutdown', off);
          this.events.once('destroy', off);
        }

        handleResize() {
          // Recompute fonts/sizes/positions consistently
          this.layoutTopBar?.();
          this.layoutIcon();
          this.layoutOptions();
        }

        setupScene() {
          // Compute CSS-pixel-based sizes, then scale by DPR for internal canvas
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;

          // Responsive font size for question text (top-center)
          const qFontSizeCss = Math.max(16, Math.min(36, cssH * 0.07));
          this.questionText = this.add
            .text(this.scale.width / 2, Math.max(24, this.scale.height * 0.07), '', {
              fontFamily: 'Fredoka One',
              fontSize: `${qFontSizeCss * dpr}px`,
              color: '#fff',
              stroke: '#042539',
              strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6);
          // Ensure crisp text at high DPR without affecting layout size
          this.questionText.setResolution(dpr);

          // Responsive font size for current question text (top-left)
          const cqFontSizeCss = Math.max(12, Math.min(28, cssH * 0.05));
          this.currentQuestionText = this.add.text(
            Math.max(20, this.scale.width * 0.06),
            Math.max(20, this.scale.height * 0.07),
            '',
            {
              fontFamily: 'Fredoka One',
              fontSize: `${cqFontSizeCss * dpr}px`,
              color: '#fff',
              stroke: '#042539',
              strokeThickness: 6,
            }
          )
            .setOrigin(0, 0.5)
            .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6);
          this.currentQuestionText.setResolution(dpr);

          // Initial layout to avoid overlaps at startup
          this.layoutTopBar?.();
        }

        // New: robust top-bar layout to prevent overlap on small screens
        layoutTopBar() {
          if (!this.questionText || !this.currentQuestionText) return;

          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssW = this.scale.width / dpr;
          const cssH = this.scale.height / dpr;

          // Progress (left) font scales with both width and height
          const progFontCss = Math.max(12, Math.min(28, Math.min(cssH * 0.05, cssW * 0.06)));
          this.currentQuestionText.setFontSize(progFontCss * dpr);

          // Shuffle button (right): resize text and redraw background
          if (this.shuffleBtn && this.shuffleBtn.meta?.text && this.shuffleBtn.meta?.bg) {
            const sFontCss = Math.max(12, Math.min(24, Math.min(cssH * 0.045, cssW * 0.05)));
            const text = this.shuffleBtn.meta.text;
            const bg = this.shuffleBtn.meta.bg;
            text.setFontSize(sFontCss * dpr);
            const width = text.width + 32;
            const height = text.height + 16;
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            this.shuffleBtn.setSize(width, height);
            // Right align with safe margin
            this.shuffleBtn.x = this.scale.width - 20 - width / 2;
          }

          // Compute unified top bar height
          const shuffleH = this.shuffleBtn ? this.shuffleBtn.height : 0;
          const topBarH = Math.max(this.currentQuestionText.height, shuffleH);
          const topPadCss = Math.max(8, cssH * 0.015);
          const yCenter = topPadCss * dpr + topBarH / 2;

          // Place progress (left) and shuffle (right)
          const leftMarginCss = Math.max(16, cssW * 0.06);
          this.currentQuestionText.setPosition(leftMarginCss * dpr, yCenter);
          if (this.shuffleBtn) this.shuffleBtn.y = yCenter;

          // Prompt sizing and wrap
          const qFontCss = Math.max(16, Math.min(36, Math.min(cssH * 0.07, cssW * 0.08)));
          this.questionText.setFontSize(qFontCss * dpr);
          this.questionText.setStyle({ wordWrap: { width: cssW * 0.9 * dpr } });

          // Place prompt below the top bar with margin
          const marginCss = Math.max(10, cssH * 0.02);
          const topBarBottom = yCenter + topBarH / 2;
          this.questionText.setPosition(this.scale.width / 2, topBarBottom + marginCss * dpr);
        }

        layoutTexts() {
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;
          const qFontSizeCss = Math.max(16, Math.min(36, cssH * 0.07));
          this.questionText.setFontSize(qFontSizeCss * dpr);
          this.questionText.setPosition(this.scale.width / 2, Math.max(24, this.scale.height * 0.07));

          const cqFontSizeCss = Math.max(12, Math.min(28, cssH * 0.05));
          this.currentQuestionText.setFontSize(cqFontSizeCss * dpr);
          this.currentQuestionText.setPosition(Math.max(20, this.scale.width * 0.06), Math.max(20, this.scale.height * 0.07));
        }

        createShuffleButton() {
          // Responsive font size for shuffle button (top-right)
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;
          const sFontSizeCss = Math.max(14, Math.min(24, cssH * 0.045));
          const text = this.add.text(0, 0, 'Shuffle', {
            fontFamily: 'Fredoka One',
            fontSize: `${sFontSizeCss * dpr}px`,
            color: '#042539',
          }).setOrigin(0.5);
          // DPR-aware crispness
          text.setResolution(dpr);

          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
          bg.lineStyle(4, 0x042539, 1);
          bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

          const x = this.scale.width - 20 - width / 2;
          const y = Math.max(10 + height / 2, this.scale.height * 0.06);
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
              onComplete: () => {
                handleShuffle();
              }
            });
          });

          container.meta = { bg, text };
          this.shuffleBtn = container;
        }

        layoutShuffle() {
          if (!this.shuffleBtn) return;
          const text = this.shuffleBtn.meta.text;
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;
          // Update font size based on current height in CSS px
          const sFontSizeCss = Math.max(14, Math.min(24, cssH * 0.045));
          text.setFontSize(sFontSizeCss * dpr);
          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.shuffleBtn.meta.bg;
          bg.clear();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
          bg.lineStyle(4, 0x042539, 1);
          bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
          this.shuffleBtn.setSize(width, height);
          this.shuffleBtn.x = this.scale.width - 20 - width / 2;
          this.shuffleBtn.y = Math.max(10 + height / 2, this.scale.height * 0.06);
        }

        layoutIcon() {
          if (!this.iconImage) return;
          // DPR-independent icon sizing: compute in CSS px, then multiply by DPR for internal pixels
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssMin = Math.min(this.scale.width / dpr, this.scale.height / dpr);
          const iconSizeCss = Math.max(48, Math.min(cssMin * 0.22, 200)); // caps in CSS px
          const iconSize = iconSizeCss * dpr; // convert to device px for Phaser
          this.iconImage.setDisplaySize(iconSize, iconSize);
          this.iconImage.setPosition(this.scale.width / 2, this.scale.height * 0.48);
        }

        layoutOptions() {
          if (!this.optionContainers?.length) return;
          const MCQ_COUNT = this.optionContainers.length;
          const spacing = this.scale.width / (MCQ_COUNT + 1);
          const baseY = this.scale.height * 0.9;

          // DPR-aware sizing: make each option exactly 1/6th of the container width
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssW = this.scale.width / dpr;
          const cssH = this.scale.height / dpr;
          const optWidthCss = cssW / 6; // exactly 1/6th of container width
          // Slightly reduce height vs before: 42% of width, clamped
          const optHeightCss = Math.max(36, Math.min(optWidthCss * 0.42, 84));
          const optWidth = optWidthCss * dpr;
          const optHeight = optHeightCss * dpr;

          this.optionContainers.forEach((container, idx) => {
            const text = container.meta?.text;
            const bg = container.meta?.bg;
            if (!text || !bg) return;

            // Update font size using CSS px baseline then shrink-to-fit within option width
            // Slightly larger base on small screens
            const optFontSizeCss = Math.max(14, Math.min(30, cssH * 0.055));
            text.setFontSize(optFontSizeCss * dpr);
            text.setScale(1); // reset any previous scaling before measuring
            // Compute shrink in CSS px to be DPR-independent with dynamic padding for small widths
            const padCss = Math.max(6, Math.min(16, optWidthCss * 0.1)); // 10% width, clamped
            const maxTextWidthCss = optWidthCss - padCss * 2;
            const textWidthCss = text.width / dpr;
            const shrink = Math.min(1, maxTextWidthCss / Math.max(1, textWidthCss));
            text.setScale(shrink);
            container.meta.textScaleBase = shrink;

            // Redraw background with constant size (ellipse for rounded look) and semi-transparent fill
            bg.clear();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillEllipse(0, 0, optWidth, optHeight);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeEllipse(0, 0, optWidth, optHeight);

            // Keep meta up to date for hover handlers
            container.meta.optW = optWidth;
            container.meta.optH = optHeight;

            // Update container size and position; set interactive on bg with centered ellipse
            container.setSize(optWidth, optHeight);
            bg.setInteractive(
              new PhaserGame.Geom.Ellipse(0, 0, optWidth, optHeight),
              PhaserGame.Geom.Ellipse.Contains
            );
            const x = spacing * (idx + 1);
            container.setPosition(x, baseY);
          });
        }

        showQuestion() {
          // Remove noisy logs
          if (this.qIndex >= QUESTIONS_PER_RUN) { // End after configured number of questions
            let h = [];
            try {
              h = JSON.parse(localStorage.getItem('game1_history') || '[]');
            } catch (e) {
              h = [];
            }
            h.push(this.totalCorrect);
            localStorage.setItem('game1_history', JSON.stringify(h.slice(-20)));

            this.scene.start('SummaryScene', {
              correct: this.totalCorrect,
              total: QUESTIONS_PER_RUN, // Use configured question count
            });
            return;
          }

          this.firstAttempt = true;
          this.iconImage?.destroy();
          const q = questions[this.qIndex];
          const questionPrompt = q.prompt || `What do you do with ${q.itemName}?`;
          this.questionText.setText(questionPrompt);
          this.currentQuestionText.setText(`${this.currentQuestion} / ${QUESTIONS_PER_RUN}`);
          this.optionContainers.forEach(container => container.destroy());
          this.optionContainers = [];

          const iconSize = Math.max(48, Math.min(Math.min(this.scale.width, this.scale.height) * 0.22, 200));
          this.iconImage = this.add
            .image(this.scale.width / 2, this.scale.height * 0.48, q.item)
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5);
          this.tweens.add({
            targets: this.iconImage,
            x: '+=10',
            y: '+=6',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });

          // Generate MCQ options from precomputed unique options
          const mcqOptions = shuffleArray(q.options || [q.correct, ...shuffleArray(allOptions.filter(o => o !== q.correct)).slice(0,2)]);

          const spacing = this.scale.width / (mcqOptions.length + 1);
          const baseY = this.scale.height * 0.9;

          // DPR-aware option sizing: constant width (1/6th of container) with slightly reduced height
          const dpr = this.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
          const cssW = this.scale.width / dpr;
          const cssH = this.scale.height / dpr;
          const optWidthCss = cssW / 6; // exactly 1/6th
          const optHeightCss = Math.max(36, Math.min(optWidthCss * 0.42, 84));
          const optWidth = optWidthCss * dpr;
          const optHeight = optHeightCss * dpr;

          mcqOptions.forEach((label, i) => {
            const x = spacing * (i + 1);
            // Base font size in CSS px, then shrink-to-fit
            const optFontSizeCss = Math.max(14, Math.min(30, cssH * 0.055));
            const text = this.add
              .text(0, 0, label, {
                fontFamily: 'Fredoka One',
                fontSize: `${optFontSizeCss * dpr}px`,
                color: '#fff',
                stroke: '#042539',
                strokeThickness: 4,
              })
              .setOrigin(0.5)
              .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 4);
            // DPR-aware crispness for option text
            text.setResolution(dpr);

            // Shrink-to-fit the available width minus padding (computed in CSS px)
            const padCss = Math.max(6, Math.min(16, optWidthCss * 0.1));
            const maxTextWidthCss = optWidthCss - padCss * 2;
            const textWidthCss = text.width / dpr;
            const shrink = Math.min(1, maxTextWidthCss / Math.max(1, textWidthCss));
            text.setScale(shrink);

            // Background graphics sized to constant size with semi-transparency
            const bg = this.add.graphics();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillEllipse(0, 0, optWidth, optHeight);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeEllipse(0, 0, optWidth, optHeight);
            bg.setDepth(text.depth - 1);

            // Container to group bg+text
            const container = this.add.container(x, baseY, [bg, text]);
            container.meta = { bg, text, optW: optWidth, optH: optHeight, textScaleBase: shrink };
            container.setSize(optWidth, optHeight);
            // Centered ellipse hit area on bg (container uses top-left origin for hits)
            bg.setInteractive(
              new PhaserGame.Geom.Ellipse(0, 0, optWidth, optHeight),
              PhaserGame.Geom.Ellipse.Contains
            );
            this.optionContainers.push(container);

            // Hover effects use constant size from meta and preserve shrink scale
            const hoverIn = () => {
              const baseScale = container.meta?.textScaleBase || 1;
              this.tweens.add({ targets: text, scale: baseScale * 1.1, duration: 200 });
              const w = container.meta?.optW || optWidth;
              const h = container.meta?.optH || optHeight;
              bg.clear();
              bg.fillStyle(0x57C785, 0.8);
              bg.fillEllipse(0, 0, w + 4, h + 4);
              bg.lineStyle(6, 0x042539, 1);
              bg.strokeEllipse(0, 0, w + 4, h + 4);
              try { this.game.canvas.style.cursor = 'pointer'; } catch {}
            };

            const hoverOut = () => {
              const baseScale = container.meta?.textScaleBase || 1;
              this.tweens.add({ targets: text, scale: baseScale, duration: 200 });
              const w = container.meta?.optW || optWidth;
              const h = container.meta?.optH || optHeight;
              bg.clear();
              bg.fillStyle(0xffffff, 0.8);
              bg.fillEllipse(0, 0, w, h);
              bg.lineStyle(4, 0x042539, 1);
              bg.strokeEllipse(0, 0, w, h);
              try { this.game.canvas.style.cursor = 'default'; } catch {}
            };

            const onDown = () => this.checkAnswer(label, q.correct, container);

            // Attach events to bg (the interactive object)
            bg.on('pointerover', hoverIn);
            bg.on('pointerout', hoverOut);
            bg.on('pointerdown', onDown);
          });

          // Final layout pass to ensure consistent positions and no overlap
          this.layoutTopBar?.();
          this.layoutIcon();
          this.layoutOptions();
        }

        checkAnswer(label, correct, container) {
          if (container.isAnimating) return;

          const isCorrect = label === correct;
          const files = isCorrect ? this.correctAudioFiles : this.wrongAudioFiles;
          new Audio(PhaserGame.Utils.Array.GetRandom(files)).play();

          container.isAnimating = true;

          if (isCorrect) {
            // Count as correct only if it's the first attempt for this question
            if (this.firstAttempt) {
              this.totalCorrect += 1;
            }
            
            this.tweens.add({
              targets: container,
              scale: 1.25,
              duration: 300,
              ease: 'Circ.easeInOut',
              onComplete: () => {
                this.tweens.add({
                  targets: container,
                  scale: 1,
                  duration: 300,
                  ease: 'Circ.easeInOut',
                  onComplete: () => {
                    container.isAnimating = true;
                    this.qIndex += 1;
                    this.currentQuestion += 1;
                    this.showQuestion();
                  }
                });
              }
            });
          } else {
            // Mark that this is no longer the first attempt
            this.firstAttempt = false;
            
            this.tweens.add({
              targets: container,
              x: '+=5',
              duration: 50,
              yoyo: true,
              repeat: 2,
              onComplete: () => {
                container.isAnimating = false;
              }
            });
          }
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() {
          super({ key: 'SummaryScene' });
        }

        init(data) {
          this.correct = data.correct || 0;
          this.total = data.total || 0;
          
          try {
            this.history = JSON.parse(localStorage.getItem('game1_history') || '[]');
          } catch (e) {
            this.history = [];
          }
          
          this.localHistory = this.history.slice(-5);
        }

        preload() {
          this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        }

        create() {
          this.game.canvas.style.backgroundColor = 'transparent';

          const wf = typeof window !== 'undefined' ? window.WebFont : undefined;
          if (wf && typeof wf.load === 'function') {
            wf.load({
              google: { families: ['Fredoka One'] },
              active: () => {
                this.setupSummary();
              },
            });
          } else {
            // Fallback if WebFont is unavailable
            this.setupSummary();
          }
        }

        setupSummary() {
          // Use shared Summary UI builder to render heading, restart button, and graph
          buildSummaryUI(this, {
            correct: this.correct,
            total: this.total,
            history: this.localHistory,
            onRestart: () => {
              const fn = this.game?.reactHandleShuffle;
              if (typeof fn === 'function') {
                fn();
              } else {
                this.scene.start('MainScene');
              }
            },
            texts: {
              heading: `You got ${this.correct} correct on first try!`,
              playAgain: 'Play Again',
            },
            graph: {
              x: this.scale.width / 2,
              y: this.scale.height / 2 + 150,
              width: 400,
              height: 250,
              titleText: 'Progress Over Past 5 Attempts',
              entrance: { fromYOffset: 300, delay: 200 },
            },
          });
        }
      }

      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [MainScene, SummaryScene],
        scale: {
          mode: PhaserGame.Scale.NONE,
          width: container.clientWidth * (window.devicePixelRatio || 1),
          height: container.clientHeight * (window.devicePixelRatio || 1),
        },
        callbacks: {
          postBoot: (game) => {
            game.canvas.style.width = `${container.clientWidth}px`;
            game.canvas.style.height = `${container.clientHeight}px`;
          },
        },
      };

      phaserRef.current = new PhaserGame.Game(config);
      // Expose shuffle/regenerate to SummaryScene via the game instance
      phaserRef.current.reactHandleShuffle = handleShuffle;

      resizeObserverRef.current = new ResizeObserver(() => {
        if (!phaserRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        const ratio = window.devicePixelRatio || 1; // update on zoom changes
        phaserRef.current.scale.resize(w * ratio, h * ratio);
        phaserRef.current.canvas.style.width = `${w}px`;
        phaserRef.current.canvas.style.height = `${h}px`;
      });
      resizeObserverRef.current.observe(container);
    });

    return () => {
      isMounted = false;
      resizeObserverRef.current?.disconnect();
      phaserRef.current?.destroy(true);
    };
  }, [questions]);

  return (
    <div>
      <GameContainer>
        {/* Make sure the Phaser board fits fully within the viewport without scrollbars */}
        <div
          className="w-full flex justify-center items-center"
          style={{ paddingTop: '2rem', overflow: 'hidden' }}
        >
          <GameBoard ref={containerRef} />
        </div>
      </GameContainer>
    </div>
  );
}