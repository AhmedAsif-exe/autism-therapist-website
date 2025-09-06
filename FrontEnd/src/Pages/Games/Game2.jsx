import React, { useLayoutEffect, useRef } from "react";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { buildProgressGraph } from "./ProgressGraph";
import { buildSummaryUI } from "./SummaryUI";
import { getDimOverlayStyle } from "./GameTheme";
import { QUESTIONS_PER_RUN } from "./GameConfig";

// Remove bespoke Game2 mappings and use shared QuestionUtils to avoid overlaps
import {
  pickItemsFromType,
  getAllIconKeys,
  getAllKeysForType,
  itemsFor,
} from "./QuestionUtils";
import { getAllAssets } from "./AssetFunctionMapping";

// Build a quick lookup for display names by imagePath
const NAME_BY_IMAGE = (() => {
  try {
    const map = new Map();
    getAllAssets().forEach((a) => {
      if (a?.imagePath) map.set(a.imagePath, a.name || a.imagePath);
    });
    return map;
  } catch {
    return new Map();
  }
})();

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Create neutral, grammatically safe prompts for any function key
function buildPromptForFunction(fnKey) {
  return `Select all items related to "${fnKey}"`;
}

const GameContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  background:
    "linear-gradient(135deg, rgba(4, 37, 57, 0.1) 0%, rgba(87, 199, 133, 0.05) 50%, rgba(249, 117, 68, 0.05) 100%)",
}));

const GameBoard = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: "1000px",
  minWidth: "280px",
  aspectRatio: "4/3",
  backgroundImage: "url(/Games/backgrounds/park.jpg)", // updated background
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.2)",
  backdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  ...getDimOverlayStyle(),
}));

export function Game2() {
  const containerRef = useRef();
  const phaserRef = useRef();
  const resizeObserverRef = useRef();

  useLayoutEffect(() => {
    let mounted = true;

    const container = containerRef.current;

    if (!container) {
      return;
    }

    import("phaser").then((PhaserLib) => {
      if (!mounted || !container) {
        return;
      }

      const PhaserGame = PhaserLib.default;

      phaserRef.current?.destroy(true);

      // Preloader scene with themed loading UI
      class PreloadScene extends PhaserGame.Scene {
        constructor() {
          super({ key: "PreloadScene" });
        }

        preload() {
          const W = this.scale.width;
          const H = this.scale.height;
          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssW = W / dpr;
          const cssH = H / dpr;

          // Colors to match the app
          const COLOR_DARK = 0x042539; // dark stroke
          const COLOR_ACCENT = 0x57c785; // green
          const COLOR_ACCENT_2 = 0xf9644d; // orange

          // Dim overlay card
          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560);
          const panelH = Math.min(H * 0.24, 180);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect(
            (W - panelW) / 2,
            (H - panelH) / 2,
            panelW,
            panelH,
            18
          );
          panel.lineStyle(4, COLOR_DARK, 1);
          panel.strokeRoundedRect(
            (W - panelW) / 2,
            (H - panelH) / 2,
            panelW,
            panelH,
            18
          );

          // Queue small logo early so it appears quickly
          this.load.image("preload_logo", "/logo512.png");

          const titleFsCss = Math.max(18, Math.min(36, cssH * 0.055));
          const title = this.add
            .text(W / 2, H / 2 - panelH * 0.28, "Loading...", {
              fontFamily: "Fredoka One",
              fontSize: `${titleFsCss * dpr}px`,
              color: "#ffffff",
              stroke: "#1e607d",
              strokeThickness: 3,
              align: "center",
            })
            .setOrigin(0.5);

          // Loading bar track
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

          const percentFsCss = Math.max(14, Math.min(22, cssH * 0.035));
          const percentText = this.add
            .text(W / 2, barY + barH * 2, "0%", {
              fontFamily: "Fredoka One",
              fontSize: `${percentFsCss * dpr}px`,
              color: "#ffffff",
              stroke: "#1e607d",
              strokeThickness: 2,
            })
            .setOrigin(0.5);

          // Helper to draw fill with sheen
          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW;
            barFill.clear();

            // main green fill
            barFill.fillStyle(COLOR_ACCENT, 0.95);
            barFill.fillRoundedRect(barX, barY, w, barH, 10);
            barFill.lineStyle(2, COLOR_DARK, 1);
            barFill.strokeRoundedRect(barX, barY, Math.max(w, 2), barH, 10);

            // animated sheen across the filled area
            if (w > 8) {
              const t = (this.time.now % 1200) / 1200; // 0..1 loop
              const sheenWidth = Math.max(30, Math.min(80, w * 0.25));
              const sxRaw = barX - 60 + (w + 120) * t; // start off left, sweep to right

              // clip sheen to filled width
              const startX = Math.max(barX, sxRaw);
              const endX = Math.min(barX + w, sxRaw + sheenWidth);
              const cw = endX - startX;

              if (cw > 0) {
                barFill.fillStyle(0xffffff, 0.2);
                barFill.beginPath();
                barFill.moveTo(startX, barY);
                barFill.lineTo(startX + Math.min(16, cw * 0.25), barY);
                barFill.lineTo(startX + cw, barY + barH);
                barFill.lineTo(
                  startX + Math.max(0, cw - Math.min(16, cw * 0.25)),
                  barY + barH
                );
                barFill.closePath();
                barFill.fillPath();

                // subtle orange edge for depth
                barFill.fillStyle(COLOR_ACCENT_2, 0.12);
                barFill.fillRect(
                  Math.max(barX, endX - 2),
                  barY + 2,
                  2,
                  barH - 4
                );
              }
            }
          };

          // Initial draw and lightweight ticker to keep sheen moving
          drawBar(0);
          this.sheenTick = this.time.addEvent({
            delay: 40,
            loop: true,
            callback: () => drawBar(this.prog.v),
          });

          // Queue loads: webfont script + all icons used across all questions
          this.load.script(
            "webfont",
            "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          );

          // Preload all known icon keys from mappings so any question built at runtime has assets
          const neededAssets = getAllIconKeys();
          neededAssets.forEach((imagePath) => {
            this.load.image(imagePath, `/Games/icons/${imagePath}.png`);
          });

          // Smooth progress tweening
          this.load.on("progress", (value) => {
            if (this.progressTween) {
              this.progressTween.remove();
            }
            const start = this.prog.v;
            const dist = Math.abs(value - start);
            this.progressTween = this.tweens.add({
              targets: this.prog,
              v: value,
              duration: Math.max(200, Math.min(700, 800 * dist)),
              ease: "Sine.easeOut",
              onUpdate: () => {
                drawBar(this.prog.v);
                percentText.setText(`${Math.round(this.prog.v * 100)}%`);
              },
            });
          });

          this.load.once("complete", () => {
            const scene = this;
            const wf =
              typeof window !== "undefined" ? window.WebFont : undefined;
            if (wf && typeof wf.load === "function") {
              wf.load({
                google: { families: ["Fredoka One"] },
                active: () => {
                  if (scene.sheenTick) {
                    scene.sheenTick.remove();
                  }
                  scene.scene.start("SelectAllScene");
                },
                inactive: () => {
                  // Start anyway if font fails; UI will fallback to default font
                  if (scene.sheenTick) {
                    scene.sheenTick.remove();
                  }
                  scene.scene.start("SelectAllScene");
                },
              });
            } else {
              // Fallback if WebFont is unavailable
              if (scene.sheenTick) {
                scene.sheenTick.remove();
              }
              scene.scene.start("SelectAllScene");
            }
          });
        }
      }

      class SelectAllScene extends PhaserGame.Scene {
        constructor() {
          super({ key: "SelectAllScene" });
        }

        // Build unique rounds (no repeated function key; each question distinct)
        buildUniqueRounds(limit = 20) {
          const rounds = [];
          const chosenKeys = new Set();
          const allKeys = getAllKeysForType("function");
          const keysShuffled = shuffle(allKeys);

          for (const key of keysShuffled) {
            if (rounds.length >= limit) break;
            if (chosenKeys.has(key)) continue;

            const correctPool = itemsFor("function", key) || [];
            const maxPossible = Math.min(correctPool.length, 4);
            if (maxPossible < 2) continue; // need at least 2 correct items

            // Pick 2..min(4, pool)
            const target = 2 + Math.floor(Math.random() * 3); // 2..4
            const numCorrect = Math.min(maxPossible, target);
            const correctImgs = shuffle(correctPool).slice(0, numCorrect);

            // Build wrong pool from other keys excluding overlaps with the ENTIRE key pool
            const keySet = new Set(correctPool);
            const wrongSet = new Set();
            for (const other of allKeys) {
              if (other === key) continue;
              const pool = itemsFor("function", other) || [];
              for (const img of pool) {
                if (!keySet.has(img)) wrongSet.add(img);
              }
            }
            const totalOptions = 8;
            const needWrong = totalOptions - correctImgs.length;
            const wrongPool = Array.from(wrongSet);
            if (wrongPool.length < needWrong) continue;
            const wrongImgs = shuffle(wrongPool).slice(0, needWrong);

            const correct = correctImgs.map((img) => ({
              name: NAME_BY_IMAGE.get(img) || img,
              imagePath: img,
            }));
            const incorrect = wrongImgs.map((img) => ({
              name: NAME_BY_IMAGE.get(img) || img,
              imagePath: img,
            }));

            rounds.push({
              fn: key,
              correct,
              allOptions: shuffle([...correct, ...incorrect]),
              prompt: buildPromptForFunction(key),
            });
            chosenKeys.add(key);
          }

          // Fallback: if not enough, try building more via pickItemsFromType without duplicating same key
          if (rounds.length < limit) {
            let guard = 0;
            while (rounds.length < limit && guard < 200) {
              guard++;
              const target = 2 + Math.floor(Math.random() * 3);
              const pick = pickItemsFromType({
                type: "function",
                numCorrect: target,
                numWrong: Math.max(0, 8 - target),
              });
              if (!pick) continue;
              const { key, correctImgs, wrongImgs } = pick;
              if (rounds.some((r) => r.fn === key)) continue; // still avoid repeating same function
              const correct = correctImgs.map((img) => ({
                name: NAME_BY_IMAGE.get(img) || img,
                imagePath: img,
              }));
              const incorrect = wrongImgs.map((img) => ({
                name: NAME_BY_IMAGE.get(img) || img,
                imagePath: img,
              }));
              rounds.push({
                fn: key,
                correct,
                allOptions: shuffle([...correct, ...incorrect]),
                prompt: buildPromptForFunction(key),
              });
            }
          }

          return rounds.slice(0, limit);
        }

        init() {
          // Build rounds using QuestionUtils to ensure no overlaps and no repeated categories
          this.rounds = this.buildUniqueRounds(QUESTIONS_PER_RUN);
          this.roundIndex = 0;

          // count of perfect rounds (all correct on first confirm, no mistakes)
          this.correctFirstTry = 0;
          this.optionContainers = [];
          this.selected = new Set();
          this.firstAttempt = true;
          this.roundComplete = false;
          this.confirmBtn = null;

          this.correctAudioFiles = [
            "/Games/audio/right1.mp3",
            "/Games/audio/right2.mp3",
            "/Games/audio/right3.mp3",
          ];

          this.wrongAudioFiles = [
            "/Games/audio/wrong1.mp3",
            "/Games/audio/wrong2.mp3",
          ];
        }

        // No asset loading here; everything is handled by PreloadScene
        preload() {}

        create() {
          this.setupUI();
          this.showRound();
        }

        setupUI() {
          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssW = this.scale.width / dpr;
          const cssH = this.scale.height / dpr;

          const qFontCss = Math.max(18, Math.min(40, cssH * 0.075));

          this.promptText = this.add
            .text(
              this.scale.width / 2,
              Math.max(30, this.scale.height * 0.08),
              "",
              {
                fontFamily: "Fredoka One",
                fontSize: `${qFontCss * dpr}px`,
                color: "#ffffff",
                stroke: "#1e607d",
                strokeThickness: 4,
                align: "center",
                wordWrap: { width: cssW * 0.9 * dpr },
              }
            )
            .setOrigin(0.5)
            .setShadow(2, 2, "rgba(0,0,0,0.35)", 6);

          const pFontCss = Math.max(14, Math.min(30, cssH * 0.055));

          this.progressText = this.add
            .text(
              this.scale.width / 12,
              Math.max(25, this.scale.height * 0.075),
              "",
              {
                fontFamily: "Fredoka One",
                fontSize: `${pFontCss * dpr}px`,
                color: "#ffffff",
                stroke: "#1e607d",
                strokeThickness: 3,
              }
            )
            .setOrigin(0.5)
            .setShadow(2, 2, "rgba(0,0,0,0.35)", 6);

          // Confirm button (single instance, reused each round)
          this.confirmBtn = this.buildConfirmButton();

          this.positionConfirmButton();

          // Add shuffle button
          this.createShuffleButton();

          // Initial layout to avoid overlaps
          this.layoutTopUI?.();

          // Use stored refs so we can detach on shutdown/destroy
          this._onResize = () => {
            this.positionConfirmButton();
            this.layoutTopUI?.();
          };
          this.scale.on("resize", this._onResize);
          const offAll = () => {
            try {
              if (this._onResize) {
                this.scale.off("resize", this._onResize);
                this._onResize = null;
              }
            } catch {}
          };
          this.events.once("shutdown", offAll);
          this.events.once("destroy", offAll);
        }

        positionConfirmButton() {
          if (!this.confirmBtn) {
            return;
          }

          const btnY = this.scale.height * 0.9;

          this.confirmBtn.y = btnY;
          this.confirmBtn.x = this.scale.width / 2;
        }

        // New: robust top-bar layout that scales fonts by both CSS width and height
        layoutTopUI() {
          if (!this.promptText || !this.progressText) return;
          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssW = this.scale.width / dpr;
          const cssH = this.scale.height / dpr;

          // Scale by both height and width so narrow devices downscale appropriately
          const pFontCss = Math.max(
            12,
            Math.min(28, Math.min(cssH * 0.05, cssW * 0.06))
          );
          this.progressText.setFontSize(pFontCss * dpr);

          // Shuffle button text size and redraw
          if (
            this.shuffleBtn &&
            this.shuffleBtn.meta?.text &&
            this.shuffleBtn.meta?.bg
          ) {
            const sFontCss = Math.max(
              12,
              Math.min(24, Math.min(cssH * 0.045, cssW * 0.05))
            );
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
            // Right-align within safe margin
            this.shuffleBtn.x = this.scale.width - 20 - width / 2;
          }

          // Compute top bar height (max of left progress and right shuffle)
          const shuffleH = this.shuffleBtn ? this.shuffleBtn.height : 0;
          const topBarH = Math.max(this.progressText.height, shuffleH);
          const topPadCss = Math.max(8, cssH * 0.015);
          const yCenter = topPadCss * dpr + topBarH / 2;

          // Vertically center both within top bar
          this.progressText.y = yCenter;
          if (this.shuffleBtn) this.shuffleBtn.y = yCenter;

          // Prompt sizing: reduce on narrow screens as well
          const qFontCss = Math.max(
            16,
            Math.min(36, Math.min(cssH * 0.075, cssW * 0.08))
          );
          this.promptText.setFontSize(qFontCss * dpr);
          this.promptText.setStyle({ wordWrap: { width: cssW * 0.9 * dpr } });

          // Place prompt below the top bar with margin to avoid overlap
          const marginCss = Math.max(10, cssH * 0.02);
          const topBarBottom = yCenter + topBarH / 2;
          this.promptText.setPosition(
            this.scale.width / 2,
            topBarBottom + marginCss * dpr
          );
        }

        buildConfirmButton() {
          const w = Math.min(260, this.scale.width * 0.4);
          const h = Math.max(48, this.scale.height * 0.09);

          const g = this.add.graphics();

          const draw = (enabled, evaluating = false) => {
            g.clear();

            const fill = !enabled ? 0x8aa3b5 : evaluating ? 0x57c785 : 0xf9644d;

            g.fillStyle(fill, 0.92);
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
            g.lineStyle(4, 0x042539, 1);
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
          };

          draw(false);

          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;
          const btnHCss = Math.max(48, cssH * 0.09);
          const labelFsCss = Math.max(20, btnHCss * 0.42);

          const label = this.add
            .text(0, 0, "Confirm", {
              fontFamily: "Fredoka One",
              fontSize: `${labelFsCss * dpr}px`,
              color: "#fff",
            })
            .setOrigin(0.5);

          const ct = this.add.container(
            this.scale.width / 2,
            this.scale.height * 0.9,
            [g, label]
          );

          ct.meta = { draw, label, enabled: false };

          ct.setSize(w, h);
          ct.setInteractive({ useHandCursor: true });

          ct.on("pointerover", () => {
            if (ct.meta.enabled) {
              this.tweens.add({ targets: ct, scale: 1.05, duration: 160 });
            }
          });

          ct.on("pointerout", () => {
            if (ct.meta.enabled) {
              this.tweens.add({ targets: ct, scale: 1.0, duration: 160 });
            }
          });

          ct.on("pointerdown", () => {
            if (ct.meta.enabled) {
              this.evaluateSelection();
            }
          });

          ct.disable = () => {
            ct.meta.enabled = false;
            draw(false);
          };

          ct.enable = () => {
            ct.meta.enabled = true;
            draw(true);
          };

          ct.setEvaluating = (flag) => {
            draw(ct.meta.enabled, flag);
          };

          ct.disable();

          return ct;
        }

        createShuffleButton() {
          // Responsive font size for shuffle button
          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;
          const sFontCss = Math.max(14, Math.min(24, cssH * 0.045));
          const text = this.add
            .text(0, 0, "Shuffle", {
              fontFamily: "Fredoka One",
              fontSize: `${sFontCss * dpr}px`,
              color: "#042539",
            })
            .setOrigin(0.5);

          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
          bg.lineStyle(4, 0x042539, 1);
          bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

          // Responsive position for shuffle button
          const x = this.scale.width - 20 - width / 2;
          const y = Math.max(
            10 + height / 2,
            this.scale.height * 0.04 + height / 2
          );
          const container = this.add.container(x, y, [bg, text]);
          container.setSize(width, height);
          container.setInteractive({ useHandCursor: true });

          container.on("pointerover", () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 200 });
            bg.clear();
            bg.fillStyle(0x57c785, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            bg.lineStyle(6, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            text.setColor("#ffffff");
          });

          container.on("pointerout", () => {
            this.tweens.add({ targets: container, scale: 1, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            bg.lineStyle(4, 0x042539, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
            text.setColor("#042539");
          });

          container.on("pointerdown", () => {
            this.tweens.add({
              targets: container,
              scale: 1.1,
              duration: 300,
              ease: "Circ.easeInOut",
              onComplete: () => {
                this.handleShuffle();
              },
            });
          });

          // Store for responsive layout updates
          container.meta = { bg, text };
          this.shuffleBtn = container;
        }

        handleShuffle() {
          // Regenerate questions with new shuffled order using QuestionUtils, still unique per game
          this.rounds = this.buildUniqueRounds(QUESTIONS_PER_RUN);

          // Reset to first question
          this.roundIndex = 0;
          this.correctFirstTry = 0;

          // Show the new first round
          this.showRound();
        }

        enableConfirmIfNeeded() {
          if (!this.confirmBtn) {
            return;
          }

          if (this.roundComplete) {
            this.confirmBtn.disable();
            return;
          }

          if (this.selected.size > 0) {
            this.confirmBtn.enable();
          } else {
            this.confirmBtn.disable();
          }
        }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            let h = [];

            try {
              h = JSON.parse(localStorage.getItem("game2_history") || "[]");
            } catch (e) {
              h = [];
            }

            h.push(this.correctFirstTry);

            localStorage.setItem("game2_history", JSON.stringify(h.slice(-20)));

            this.scene.start("SummaryScene", {
              correct: this.correctFirstTry,
              total: this.rounds.length,
            });

            return;
          }

          // Reset state
          this.firstAttempt = true;
          this.roundComplete = false;
          this.selected.clear();

          this.optionContainers.forEach((c) => c.destroy());

          this.optionContainers = [];

          this.enableConfirmIfNeeded();

          const round = this.rounds[this.roundIndex];

          this.promptText.setText(round.prompt);
          this.progressText.setText(
            `${this.roundIndex + 1} / ${this.rounds.length}`
          );

          // Ensure top elements are laid out (prevents overlap on small screens)
          this.layoutTopUI?.();

          // SHUFFLE OPTIONS EVERY TIME THEY'RE DISPLAYED
          const shuffledOptions = shuffle([...round.allOptions]);

          // Layout: 8 items => 2 rows x 4 cols (images only, no text)
          const cols = 4;
          const rows = 2;

          const areaW = this.scale.width * 0.9;
          const areaH = this.scale.height * 0.55;
          const startY = this.scale.height / 2 - areaH / 2 + 10;
          const cellW = areaW / cols;
          const cellH = areaH / rows;

          const dpr =
            this.game?.renderer?.resolution ||
            (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
          const cssH = this.scale.height / dpr;

          // Use the shuffled options instead of round.allOptions
          shuffledOptions.forEach((opt, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;

            const x = this.scale.width / 2 - areaW / 2 + cellW * c + cellW / 2;

            const baseY = startY + cellH * r + cellH / 2;

            // Keep the same altitude for all items in the row
            const y = baseY;

            const container = this.add.container(x, y);

            // Image
            const imgSize = Math.min(cellW, cellH) * 0.55;

            const sprite = this.add
              .image(0, -10, opt.imagePath)
              .setDisplaySize(imgSize, imgSize)
              .setOrigin(0.5);

            // Selection ring (graphics) initially hidden
            const ring = this.add.graphics();
            const radius = sprite.displayWidth / 2 + 10;

            ring.lineStyle(6, 0x57c785, 1);
            ring.strokeCircle(0, -10, radius);
            ring.setAlpha(0);

            const lblFontCss = Math.max(12, Math.min(22, cssH * 0.035));

            const label = this.add
              .text(0, imgSize / 2 - 0, opt.name, {
                fontFamily: "Fredoka One",
                fontSize: `${lblFontCss * dpr}px`,
                color: "#ffffff",
                align: "center",
                stroke: "#042539",
                strokeThickness: 4,
              })
              .setOrigin(0.5, 0);

            container.add([ring, sprite, label]);

            container.meta = {
              itemName: opt.name,
              imageKey: opt.imagePath,
              sprite,
              ring,
              label,
              radius,
            };

            container.setSize(imgSize + 30, imgSize + label.height + 20);

            container.setInteractive({ useHandCursor: true });

            const hoverIn = () => {
              if (this.roundComplete) {
                return;
              }

              if (!this.selected.has(opt.name)) {
                this.tweens.add({
                  targets: container,
                  scale: 1.06,
                  duration: 140,
                });
              }
            };

            const hoverOut = () => {
              if (this.roundComplete) {
                return;
              }

              if (!this.selected.has(opt.name)) {
                this.tweens.add({
                  targets: container,
                  scale: 1.0,
                  duration: 140,
                });
              }
            };

            container.on("pointerover", hoverIn);
            container.on("pointerout", hoverOut);
            container.on("pointerdown", () => this.toggleSelect(container));

            this.optionContainers.push(container);
          });
        }

        toggleSelect(container) {
          if (this.roundComplete) {
            return;
          }

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
          ring.lineStyle(6, 0xf9644d, 1);
          ring.strokeCircle(0, -10, container.meta.radius);

          this.tweens.add({
            targets: container,
            scale: 1.12,
            duration: 200,
            ease: "Back.easeOut",
          });
        }

        animateDeselection(container) {
          const { ring } = container.meta;

          this.tweens.add({
            targets: container,
            scale: 1.0,
            duration: 160,
            onComplete: () => {
              ring.setAlpha(0);
            },
          });
        }

        evaluateSelection() {
          if (this.roundComplete) {
            return; // guard
          }

          if (!this.confirmBtn || !this.confirmBtn.meta.enabled) {
            return;
          }

          const round = this.rounds[this.roundIndex];
          const correctSet = new Set(round.correct.map((item) => item.name)); // Updated to extract names from correct items

          let anyWrong = false;
          let anyMissing = false;

          // Determine wrong and missing
          this.selected.forEach((sel) => {
            if (!correctSet.has(sel)) {
              anyWrong = true;
            }
          });

          round.correct.forEach((correctItem) => {
            if (!this.selected.has(correctItem.name)) {
              // Updated to use correctItem.name
              anyMissing = true;
            }
          });

          // Visual feedback
          this.optionContainers.forEach((ct) => {
            const item = ct.meta.itemName;
            const isSelected = this.selected.has(item);
            const isCorrect = correctSet.has(item);
            const { ring } = ct.meta;

            if (isSelected) {
              ring.setAlpha(1);
              ring.clear();

              const color = isCorrect ? 0x57c785 : 0xf9644d;

              ring.lineStyle(8, color, 1);
              ring.strokeCircle(0, -10, ct.meta.radius);

              if (!isCorrect) {
                this.tweens.add({
                  targets: ct,
                  x: "+=6",
                  duration: 60,
                  yoyo: true,
                  repeat: 2,
                });
              }
            } else {
              // Not selected: fade ring if previously selected
              ring.setAlpha(0);
            }
          });

          if (!anyWrong && !anyMissing) {
            // Success
            new Audio(
              PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)
            ).play();

            if (this.firstAttempt) {
              this.correctFirstTry += 1;
            }

            this.roundComplete = true;
            this.confirmBtn.disable();

            // Celebrate correct ones
            this.optionContainers.forEach((ct) => {
              if (correctSet.has(ct.meta.itemName)) {
                this.tweens.add({
                  targets: ct,
                  scale: 1.25,
                  duration: 260,
                  yoyo: true,
                });
              }
            });

            this.time.delayedCall(850, () => {
              this.roundIndex += 1;
              this.showRound();
            });
          } else {
            // Incorrect attempt
            this.firstAttempt = false;

            new Audio(
              PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)
            ).play();

            // Remove wrong selections so user can try again
            const toRemove = [];

            this.selected.forEach((sel) => {
              if (!correctSet.has(sel)) {
                toRemove.push(sel);
              }
            });

            toRemove.forEach((r) => this.selected.delete(r));

            // Animate deselection of wrong ones (after shake)
            this.time.delayedCall(220, () => {
              this.optionContainers.forEach((ct) => {
                if (toRemove.includes(ct.meta.itemName)) {
                  this.animateDeselection(ct);
                }
              });

              this.enableConfirmIfNeeded();
            });

            // Optionally hint missing correct items (pulse)
            // this.optionContainers.forEach(ct => {
            //   if (correctSet.has(ct.meta.item) && !this.selected.has(ct.meta.item))
            //     this.tweens.add({ targets: ct, scale:1.1, duration:180, yoyo:true });
            // });
          }
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() {
          super({ key: "SummaryScene" });
        }

        init(data) {
          this.correct = data.correct || 0;
          this.total = data.total || 0;

          try {
            this.history = JSON.parse(
              localStorage.getItem("game2_history") || "[]"
            );
          } catch (e) {
            this.history = [];
          }

          this.localHistory = this.history.slice(-5);
        }

        preload() {
          this.load.script(
            "webfont",
            "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          );
        }

        create() {
          const wf = typeof window !== "undefined" ? window.WebFont : undefined;
          if (wf && typeof wf.load === "function") {
            wf.load({
              google: { families: ["Fredoka One"] },
              active: () => this.build(),
              inactive: () => this.build(),
            });
          } else {
            // Fallback if WebFont is unavailable
            this.build();
          }
        }

        build() {
          const W = this.scale.width;
          const H = this.scale.height;

          // Use shared Summary UI only (no extra panel, no duplicate heading, no stat boxes)
          buildSummaryUI(this, {
            correct: this.correct,
            total: this.total,
            history: this.localHistory,
            onRestart: () => {
              const fn = this.game?.reactHandleShuffle;
              if (typeof fn === "function") {
                fn();
              } else {
                this.scene.start("SelectAllScene");
              }
            },
            texts: {
              heading: `You got ${this.correct} correct on first try!`,
              playAgain: "Play Again",
            },
            graph: {
              x: W / 2,
              y: H / 2 + 150,
              width: 400,
              height: 250,
              titleText: "Progress Over Past 5 Attempts",
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
        scene: [PreloadScene, SelectAllScene, SummaryScene],
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

      // Expose a regeneration hook so SummaryUI Play Again triggers fresh rounds rather than only restarting
      phaserRef.current.reactHandleShuffle = () => {
        try {
          phaserRef.current.scene.stop("SummaryScene");
        } catch {}
        try {
          phaserRef.current.scene.stop("SelectAllScene");
        } catch {}
        phaserRef.current.scene.start("SelectAllScene");
      };

      resizeObserverRef.current = new ResizeObserver(() => {
        if (!phaserRef.current) {
          return;
        }

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

export default Game2;
