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

// Generate questions from function mappings
function generateQuestions() {
  const questions = [];
  const usedImages = new Set();
  let attempts = 0;
  const MAX_ATTEMPTS = 300; // be generous to find 20 unique items

  while (questions.length < 20 && attempts < MAX_ATTEMPTS) {
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
              },
            });
          } else {
            // Fallback if WebFont is unavailable
            this.setupScene();
            this.createShuffleButton();
            this.showQuestion();
          }
        }

        setupScene() {
          // Responsive font size for question text
          const qFontSize = Math.max(16, Math.min(36, this.scale.height * 0.07));
          this.questionText = this.add
            .text(this.scale.width / 2, Math.max(24, this.scale.height * 0.07), '', {
              fontFamily: 'Fredoka One',
              fontSize: `${qFontSize}px`,
              color: '#fff',
              stroke: '#042539',
              strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6);

          // Responsive font size for current question text
          const cqFontSize = Math.max(12, Math.min(32, this.scale.height * 0.055));
          this.currentQuestionText = this.add.text(
            this.scale.width / 10, Math.max(20, this.scale.height * 0.07), '', {
              fontFamily: 'Fredoka One',
              fontSize: `${cqFontSize}px`,
              color: '#fff',
              stroke: '#042539',
              strokeThickness: 6,
            }).setOrigin(0.5)
            .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6);
        }

        createShuffleButton() {
          // Responsive font size for shuffle button
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

          // Responsive y-position for shuffle button
          const x = this.scale.width - 20 - width / 2;
          const y = Math.max(10 + height / 2, this.scale.height * 0.04 + height / 2);
          const container = this.add.container(x, y, [bg, text]);
          container.setSize(width, height);
          container.setInteractive();

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
        }

        showQuestion() {
          console.log(this.totalCorrect);
          if (this.qIndex >= 20) { // Fixed to 20 questions
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
              total: 20, // Always 20 questions
            });
            return;
          }

          this.firstAttempt = true;
          this.iconImage?.destroy();
          const q = questions[this.qIndex];
          const questionPrompt = q.prompt || `What do you do with ${q.itemName}?`;
          this.questionText.setText(questionPrompt);
          this.currentQuestionText.setText(`${this.currentQuestion} / 20`);
          this.optionContainers.forEach(container => container.destroy());
          this.optionContainers = [];

          const iconSize = Math.max(48, Math.min(Math.min(this.scale.width, this.scale.height) * 0.2, 180));
          this.iconImage = this.add
            .image(this.scale.width / 2, this.scale.height / 2 - iconSize / 2 - 20, q.item)
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5);
          this.tweens.add({
            targets: this.iconImage,
            x: '+=10',
            y: '+=10',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });

          // Generate MCQ options from precomputed unique options
          const mcqOptions = shuffleArray(q.options || [q.correct, ...shuffleArray(allOptions.filter(o => o !== q.correct)).slice(0,2)]);

          const spacing = this.scale.width / (mcqOptions.length + 1);
          // Responsive y-position for options (never off-canvas)
          const y = Math.min(this.scale.height * 0.85, this.scale.height - 40);

          mcqOptions.forEach((label, i) => {
            const x = spacing * (i + 1);
            // Responsive font size for options
            const optFontSize = Math.max(12, Math.min(28, this.scale.height * 0.045));
            const text = this.add
              .text(0, 0, label, {
                fontFamily: 'Fredoka One',
                fontSize: `${optFontSize}px`,
                color: '#fff',
                stroke: '#042539',
                strokeThickness: 4,
              })
              .setOrigin(0.5)
              .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 4);

            const width = text.width + 32;
            const height = text.height + 20;
            const bg = this.add.graphics();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillEllipse(0, 0, width, height);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeEllipse(0, 0, width, height);
            bg.setDepth(text.depth - 1);

            text.setInteractive({ useHandCursor: true });

            const container = this.add.container(x, y, [bg, text]);
            this.optionContainers.push(container);

            const hoverIn = () => {
              this.tweens.add({ targets: text, scale: 1.1, duration: 200 });
              bg.clear();
              bg.fillStyle(0x57C785, 0.8);
              bg.fillEllipse(0, 0, width + 4, height + 4);
              bg.lineStyle(6, 0x042539, 1);
              bg.strokeEllipse(0, 0, width + 4, height + 4);
            };

            const hoverOut = () => {
              this.tweens.add({ targets: text, scale: 1, duration: 200 });
              bg.clear();
              bg.fillStyle(0xffffff, 0.8);
              bg.fillEllipse(0, 0, width, height);
              bg.lineStyle(4, 0x042539, 1);
              bg.strokeEllipse(0, 0, width, height);
            };

            text.on('pointerover', hoverIn);
            bg.setInteractive(new PhaserGame.Geom.Ellipse(x, y, width, height), PhaserGame.Geom.Ellipse.Contains);
            bg.on('pointerover', hoverIn);
            text.on('pointerout', hoverOut);
            bg.on('pointerout', hoverOut);

            const onDown = () => this.checkAnswer(label, q.correct, container);
            text.on('pointerdown', onDown);
            bg.on('pointerdown', onDown);
          });
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
            onRestart: () => this.scene.start('MainScene'),
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

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [MainScene, SummaryScene],
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
        if (!phaserRef.current?.scene?.isActive()) return;

        const w = container.clientWidth;
        const h = container.clientHeight;
        phaserRef.current?.scale.resize(w * ratio, h * ratio);
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
        <div className="pt-24 w-full flex justify-center items-center">
          <GameBoard ref={containerRef} />
        </div>
      </GameContainer>
    </div>
  );
}