import React, { useLayoutEffect, useRef } from "react";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { buildSummaryUI } from "./SummaryUI";
import { getDimOverlayStyle } from "./GameTheme";
import { QUESTIONS_PER_RUN } from "./GameConfig";

// Use QuestionUtils for dataset and preloading
import {
  itemsFor,
  getAllKeysForType,
  getAllIconKeys,
  pickItemsFromType,
} from "./QuestionUtils";
import { getAllClassAssets, convertToGame6Format } from "./AssetClassMapping";

// Game 6 — MCQ Clickable Classes (Select-All by class)
// - Show a class (e.g., Vehicles) and 8 item images
// - Kid selects all items that belong to that class, then presses Confirm
// - Confirm/selection logic mirrors Game 2
// - Score counts perfect rounds (all correct on first confirm)
// - Summary heading/graph matches Game 1/2/4/5

// Helper: prettify names from image keys
function prettyName(key) {
  const map = {
    ball2: "Ball",
    paperplane: "Paper Plane",
    snowglobe: "Snow Globe",
    toothbrush: "Tooth Brush",
    comb: "Comb",
    paintbrush: "Paint Brush",
    scissor: "Scissors",
  };
  if (map[key]) return map[key];
  // Title Case the key
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function toItem(imageKey, nameLookup) {
  return {
    name: nameLookup.get(imageKey) ?? prettyName(imageKey),
    image: imageKey,
  };
}

// Build definitions from mapping file
const CLASS_DEFS = convertToGame6Format(); // [{ cls, items: [imagePath,...] }]
const NAME_BY_IMAGE = new Map(
  getAllClassAssets().map((a) => [a.imagePath, a.name])
);

// We will preload all icons via QuestionUtils to ensure all needed assets are available

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build rounds using QuestionUtils: pick a class, 3–4 correct + fill to 8 with wrong, with strict non-overlap
function buildRounds(limit = 20) {
  // Build many rounds across classes ensuring no repeated class key per session
  const rounds = [];
  const chosenKeys = new Set();
  const allKeys = getAllKeysForType("class") || [];
  const keysShuffled = shuffle(allKeys);

  for (const key of keysShuffled) {
    if (rounds.length >= limit) break;
    if (chosenKeys.has(key)) continue;

    const correctPool = itemsFor("class", key) || [];
    // Prefer 3–4 correct like the original logic
    const maxPossible = Math.min(correctPool.length, 4);
    if (maxPossible < 3) continue; // need at least 3 correct to match design
    const target = Math.random() < 0.5 ? 3 : 4;
    const numCorrect = Math.min(maxPossible, target);
    const correctImgs = shuffle(correctPool).slice(0, numCorrect);

    // Build wrong set from ALL OTHER class pools without overlap
    const correctSet = new Set(correctPool);
    const wrongSet = new Set();
    for (const other of allKeys) {
      if (other === key) continue;
      const pool = itemsFor("class", other) || [];
      for (const img of pool) {
        if (!correctSet.has(img)) wrongSet.add(img);
      }
    }
    const needWrong = Math.max(0, 8 - correctImgs.length);
    const wrongPool = Array.from(wrongSet);
    if (wrongPool.length < needWrong) continue;

    const wrongImgs = shuffle(wrongPool).slice(0, needWrong);

    const correctObjs = correctImgs.map((k) => toItem(k, NAME_BY_IMAGE));
    const wrongObjs = wrongImgs.map((k) => toItem(k, NAME_BY_IMAGE));
    const options = shuffle([...correctObjs, ...wrongObjs]);

    rounds.push({
      cls: key,
      prompt: `Select all that are ${key}!`,
      correct: new Set(correctObjs.map((i) => i.name)),
      options,
    });
    chosenKeys.add(key);
  }

  // Fallback: if still short, use pickItemsFromType but avoid repeating class keys
  if (rounds.length < limit) {
    let guard = 0;
    while (rounds.length < limit && guard < 300) {
      guard += 1;
      const target = Math.random() < 0.5 ? 3 : 4;
      const pick = pickItemsFromType({
        type: "class",
        numCorrect: target,
        numWrong: Math.max(0, 8 - target),
      });
      if (!pick) continue;
      if (chosenKeys.has(pick.key)) continue;
      if (!Array.isArray(pick.correctImgs) || pick.correctImgs.length < 3)
        continue;

      const correctObjs = pick.correctImgs.map((k) => toItem(k, NAME_BY_IMAGE));
      const wrongObjs = (pick.wrongImgs || []).map((k) =>
        toItem(k, NAME_BY_IMAGE)
      );
      const options = shuffle([...correctObjs, ...wrongObjs]);

      rounds.push({
        cls: pick.key,
        prompt: `Select all that are ${pick.key}!`,
        correct: new Set(correctObjs.map((i) => i.name)),
        options,
      });
      chosenKeys.add(pick.key);
    }
  }

  return rounds.slice(0, limit);
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
  backgroundImage: "url(/Games/backgrounds/hospital.jpg)",
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

export function Game6() {
  const containerRef = useRef();
  const phaserRef = useRef();
  const resizeObserverRef = useRef();
  const listenersRef = useRef({ update: null });

  useLayoutEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    import("phaser").then((PhaserLib) => {
      if (!mounted || !container) return;
      const PhaserGame = PhaserLib.default;
      phaserRef.current?.destroy(true);

      // New Preload Scene (like Games 2-5) with DPR-aware sizing
      class PreloadScene extends PhaserGame.Scene {
        constructor() {
          super({ key: "PreloadScene" });
        }
        preload() {
          const W = this.scale.width;
          const H = this.scale.height;
          const dpr = window.devicePixelRatio || 1;
          const px = (n) => n * dpr;
          const COLOR_DARK = 0x042539;
          const COLOR_ACCENT = 0x57c785;
          const COLOR_ACCENT_2 = 0xf9644d;

          const panel = this.add.graphics();
          const panelW = Math.min(W * 0.7, 560 * dpr);
          const panelH = Math.min(H * 0.24, 180 * dpr);
          panel.fillStyle(0xffffff, 0.12);
          panel.fillRoundedRect(
            (W - panelW) / 2,
            (H - panelH) / 2,
            panelW,
            panelH,
            px(18)
          );
          panel.lineStyle(px(4), COLOR_DARK, 1);
          panel.strokeRoundedRect(
            (W - panelW) / 2,
            (H - panelH) / 2,
            panelW,
            panelH,
            px(18)
          );

          this.add
            .text(W / 2, H / 2 - panelH * 0.28, "Loading...", {
              fontFamily: "Fredoka One",
              fontSize: `${Math.max(18, Math.min(36, (H / dpr) * 0.055))}px`,
              color: "#ffffff",
              stroke: "#1e607d",
              strokeThickness: px(3),
              align: "center",
            })
            .setOrigin(0.5)
            .setResolution(dpr);

          const barW = panelW * 0.78;
          const barH = Math.max(px(12), Math.min(px(18), H * 0.025));
          const barX = (W - barW) / 2;
          const barY = H / 2 + barH * 0.5;
          const barBg = this.add.graphics();
          barBg.fillStyle(0xffffff, 0.25);
          barBg.fillRoundedRect(barX, barY, barW, barH, px(10));
          barBg.lineStyle(px(3), COLOR_DARK, 1);
          barBg.strokeRoundedRect(barX, barY, barW, barH, px(10));
          const barFill = this.add.graphics();
          const percentText = this.add
            .text(W / 2, barY + barH * 2, "0%", {
              fontFamily: "Fredoka One",
              fontSize: `${Math.max(14, Math.min(22, (H / dpr) * 0.035))}px`,
              color: "#ffffff",
              stroke: "#1e607d",
              strokeThickness: px(2),
            })
            .setOrigin(0.5)
            .setResolution(dpr);

          this.load.script(
            "webfont",
            "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          );
          // Preload all icons referenced across mappings to guarantee availability
          try {
            getAllIconKeys().forEach((key) =>
              this.load.image(
                key,
                `/Games/icons/${encodeURIComponent(key)}.png`
              )
            );
          } catch {}

          this.prog = { v: 0 };
          const drawBar = (p) => {
            const w = Math.max(0, Math.min(1, p)) * barW;
            barFill.clear();
            barFill.fillStyle(COLOR_ACCENT, 0.95);
            barFill.fillRoundedRect(barX, barY, w, barH, px(10));
            barFill.lineStyle(px(2), COLOR_DARK, 1);
            barFill.strokeRoundedRect(
              barX,
              barY,
              Math.max(w, px(2)),
              barH,
              px(10)
            );
            if (w > px(8)) {
              const t = (this.time.now % 1200) / 1200;
              const sheenWidth = Math.max(px(30), Math.min(px(80), w * 0.25));
              const sxRaw = barX - px(60) + (w + px(120)) * t;
              const startX = Math.max(barX, sxRaw);
              const endX = Math.min(barX + w, sxRaw + sheenWidth);
              const cw = endX - startX;
              if (cw > 0) {
                barFill.fillStyle(0xffffff, 0.2);
                barFill.beginPath();
                barFill.moveTo(startX, barY);
                barFill.lineTo(startX + Math.min(px(16), cw * 0.25), barY);
                barFill.lineTo(startX + cw, barY + barH);
                barFill.lineTo(
                  startX + Math.max(0, cw - Math.min(px(16), cw * 0.25)),
                  barY + barH
                );
                barFill.closePath();
                barFill.fillPath();
                barFill.fillStyle(COLOR_ACCENT_2, 0.12);
                barFill.fillRect(
                  Math.max(barX, endX - px(2)),
                  barY + px(2),
                  px(2),
                  barH - px(4)
                );
              }
            }
          };
          drawBar(0);
          this.sheenTick = this.time.addEvent({
            delay: 40,
            loop: true,
            callback: () => drawBar(this.prog.v),
          });

          this.load.on("progress", (value) => {
            if (this.progressTween) this.progressTween.remove();
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
            const WF = window.WebFont;
            if (WF && WF.load) {
              WF.load({
                google: { families: ["Fredoka One"] },
                active: () => {
                  scene.sheenTick?.remove();
                  scene.scene.start("ClassSelectAllScene");
                },
                inactive: () => {
                  scene.sheenTick?.remove();
                  scene.scene.start("ClassSelectAllScene");
                },
              });
            } else {
              scene.sheenTick?.remove();
              scene.scene.start("ClassSelectAllScene");
            }
          });
        }
      }

      class ClassSelectAllScene extends PhaserGame.Scene {
        constructor() {
          super({ key: "ClassSelectAllScene" });
        }

        init() {
          this.dpr = window.devicePixelRatio || 1;
          this.px = (n) => n * this.dpr;
          this.rounds = buildRounds(QUESTIONS_PER_RUN);
          this.roundIndex = 0;
          this.perfectRounds = 0;
          this.optionContainers = [];
          this.selected = new Set();
          this.roundComplete = false;
          this.firstAttempt = true;
          this.correctFirstTry = 0;

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

        preload() {}

        create() {
          // Font already loaded in PreloadScene
          this.setupUI();
          this.showRound();
        }

        cssDims() {
          return {
            cssW: this.scale.width / this.dpr,
            cssH: this.scale.height / this.dpr,
          };
        }

        setupUI() {
          const { cssH, cssW } = this.cssDims();

          // Prompt
          const qFontCss = Math.max(18, Math.min(40, cssH * 0.075));
          this.promptText = this.add
            .text(
              this.scale.width / 2,
              Math.max(this.px(28), this.scale.height * 0.08),
              "",
              {
                fontFamily: "Fredoka One",
                fontSize: `${qFontCss * this.dpr}px`,
                color: "#ffffff",
                stroke: "#042539",
                strokeThickness: this.px(4),
                align: "center",
                wordWrap: { width: cssW * 0.9 * this.dpr },
              }
            )
            .setOrigin(0.5)
            .setShadow(2, 2, "rgba(0,0,0,0.4)", 6);
          // Ensure prompt renders above option grid
          this.promptText.setDepth(900);

          // Progress
          const pFontCss = Math.max(14, Math.min(30, cssH * 0.055));
          this.progressText = this.add
            .text(
              this.scale.width / 12,
              Math.max(this.px(24), this.scale.height * 0.075),
              "",
              {
                fontFamily: "Fredoka One",
                fontSize: `${pFontCss * this.dpr}px`,
                color: "#ffffff",
                stroke: "#042539",
                strokeThickness: this.px(3),
              }
            )
            .setOrigin(0.5)
            .setShadow(2, 2, "rgba(0,0,0,0.4)", 6);
          // Ensure progress renders above option grid
          this.progressText.setDepth(1000);

          // Confirm button (DPR-aware)
          this.confirmBtn = this.buildConfirmButton();
          this.positionConfirmButton();
          // Keep confirm visible over grid
          this.confirmBtn.setDepth(1000);

          // Shuffle button
          this.createShuffleButton();
          // Keep shuffle visible over grid
          if (this.shuffleBtn) this.shuffleBtn.setDepth(1000);

          // Initial top layout to avoid overlap
          this.layoutTopUI?.();

          // Unified resize handler
          this._onResize = () => {
            this.positionConfirmButton();
            this.layoutTopUI?.();
            this.layoutOptionGrid?.();
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

        // Top bar layout akin to Game 4
        layoutTopUI() {
          if (!this.promptText || !this.progressText) return;
          const cssW = this.scale.width / this.dpr;
          const cssH = this.scale.height / this.dpr;

          // Progress font scales by both height and width
          const pFontCss = Math.max(
            12,
            Math.min(28, Math.min(cssH * 0.05, cssW * 0.06))
          );
          this.progressText.setFontSize(pFontCss * this.dpr);

          // Shuffle sizing and placement
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
            text.setFontSize(sFontCss * this.dpr);
            const width = text.width + 32;
            const height = text.height + 16;
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            bg.lineStyle(this.px(4), 0x042539, 1);
            bg.strokeRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            this.shuffleBtn.setSize(width, height);
            // Track computed size for later layout measurements
            this.shuffleBtn.meta.w = width;
            this.shuffleBtn.meta.h = height;
            this.shuffleBtn.x = this.scale.width - this.px(20) - width / 2;
          }

          // Use tracked shuffle height if available
          const shuffleH =
            this.shuffleBtn && this.shuffleBtn.meta?.h
              ? this.shuffleBtn.meta.h
              : this.shuffleBtn
              ? this.shuffleBtn.height
              : 0;
          const topBarH = Math.max(this.progressText.height, shuffleH);
          const topPadCss = Math.max(12, cssH * 0.025); // slightly larger safe padding for small screens
          const yCenter = topPadCss * this.dpr + topBarH / 2;
          this.progressText.y = yCenter;
          if (this.shuffleBtn) this.shuffleBtn.y = yCenter;

          const qFontCss = Math.max(
            16,
            Math.min(36, Math.min(cssH * 0.075, cssW * 0.08))
          );
          this.promptText.setFontSize(qFontCss * this.dpr);
          this.promptText.setStyle({
            wordWrap: { width: cssW * 0.9 * this.dpr },
          });

          const marginCss = Math.max(12, cssH * 0.02);
          const topBarBottom = yCenter + topBarH / 2;
          this.promptText.setPosition(
            this.scale.width / 2,
            topBarBottom + marginCss * this.dpr
          );
        }

        positionConfirmButton() {
          if (!this.confirmBtn) return;
          const btnY = this.scale.height * 0.9;
          this.confirmBtn.y = btnY;
          this.confirmBtn.x = this.scale.width / 2;
        }

        buildConfirmButton() {
          const { cssW, cssH } = this.cssDims();
          const cssWBtn = Math.min(260, cssW * 0.4);
          const cssHBtn = Math.max(48, cssH * 0.09);
          const w = cssWBtn * this.dpr;
          const h = cssHBtn * this.dpr;
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
          const label = this.add
            .text(0, 0, "Confirm", {
              fontFamily: "Fredoka One",
              fontSize: `${labelFsCss * this.dpr}px`,
              color: "#fff",
            })
            .setOrigin(0.5);
          const ct = this.add.container(
            this.scale.width / 2,
            this.scale.height * 0.9,
            [g, label]
          );
          ct.meta = { draw, label, enabled: false, g, w, h, cssWBtn, cssHBtn };
          ct.setSize(w, h);
          ct.setInteractive({ useHandCursor: true });
          ct.on("pointerover", () => {
            if (ct.meta.enabled)
              this.tweens.add({ targets: ct, scale: 1.05, duration: 160 });
          });
          ct.on("pointerout", () => {
            if (ct.meta.enabled)
              this.tweens.add({ targets: ct, scale: 1.0, duration: 160 });
          });
          ct.on("pointerdown", () => {
            if (ct.meta.enabled) this.evaluateSelection();
          });
          ct.disable = () => {
            ct.meta.enabled = false;
            draw(false);
          };
          ct.enable = () => {
            ct.meta.enabled = true;
            draw(true);
          };
          ct.setEvaluating = (flag) => draw(ct.meta.enabled, flag);
          ct.disable();
          return ct;
        }

        updateConfirmButtonStyle() {
          if (!this.confirmBtn) return;
          const { cssW, cssH } = this.cssDims();
          const cssWBtn = Math.min(260, cssW * 0.4);
          const cssHBtn = Math.max(48, cssH * 0.09);
          const w = cssWBtn * this.dpr;
          const h = cssHBtn * this.dpr;
          this.confirmBtn.meta.w = w;
          this.confirmBtn.meta.h = h;
          this.confirmBtn.meta.cssWBtn = cssWBtn;
          this.confirmBtn.meta.cssHBtn = cssHBtn;
          const { g, draw, label } = this.confirmBtn.meta;
          this.confirmBtn.setSize(w, h);
          draw(this.confirmBtn.meta.enabled);
          label.setStyle({
            fontSize: `${Math.max(20, cssHBtn * 0.42) * this.dpr}px`,
          });
        }

        enableConfirmIfNeeded() {
          if (!this.confirmBtn) return;
          if (this.roundComplete) return this.confirmBtn.disable();
          if (this.selected.size > 0) this.confirmBtn.enable();
          else this.confirmBtn.disable();
        }

        createShuffleButton() {
          const cssW = this.scale.width / this.dpr;
          const cssH = this.scale.height / this.dpr;
          const sFontCss = Math.max(
            14,
            Math.min(24, Math.min(cssH * 0.045, cssW * 0.05))
          );
          const text = this.add
            .text(0, 0, "Shuffle", {
              fontFamily: "Fredoka One",
              fontSize: `${sFontCss * this.dpr}px`,
              color: "#042539",
            })
            .setOrigin(0.5);
          const width = text.width + 32;
          const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6);
          bg.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            this.px(12)
          );
          bg.lineStyle(this.px(4), 0x042539, 1);
          bg.strokeRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            this.px(12)
          );
          const x = this.scale.width - this.px(20) - width / 2;
          const y = Math.max(
            this.px(10) + height / 2,
            this.scale.height * 0.04 + height / 2
          );
          const container = this.add.container(x, y, [bg, text]);
          container.setSize(width, height);
          container.setInteractive({ useHandCursor: true });
          // Track size for layout use
          container.meta = { bg, text, w: width, h: height };

          container.on("pointerover", () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 200 });
            bg.clear();
            bg.fillStyle(0x57c785, 0.8);
            bg.fillRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            bg.lineStyle(this.px(6), 0x042539, 1);
            bg.strokeRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            text.setColor("#ffffff");
          });

          container.on("pointerout", () => {
            this.tweens.add({ targets: container, scale: 1, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.6);
            bg.fillRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            bg.lineStyle(this.px(4), 0x042539, 1);
            bg.strokeRoundedRect(
              -width / 2,
              -height / 2,
              width,
              height,
              this.px(12)
            );
            text.setColor("#042539");
          });

          container.on("pointerdown", () => {
            this.tweens.add({
              targets: container,
              scale: 1.1,
              duration: 300,
              ease: "Circ.easeInOut",
              onComplete: () => this.handleShuffle(),
            });
          });

          this.shuffleBtn = container;
        }

        handleShuffle() {
          this.rounds = buildRounds(QUESTIONS_PER_RUN);
          this.roundIndex = 0;
          this.firstAttempt = true;
          this.correctFirstTry = 0;
          this.showRound();
        }

        // Compute 4x2 grid area (dynamic: avoids overlapping the top bar and confirm button)
        computeGrid() {
          const cols = 4;
          const rows = 2;
          const areaW = this.scale.width * 0.9;

          // Determine safe top bound: below progress/shuffle and prompt
          const safePadTop = this.px(12);
          let topBound = safePadTop;
          if (this.progressText)
            topBound = Math.max(
              topBound,
              this.progressText.y + this.progressText.height / 2 + this.px(8)
            );
          if (this.shuffleBtn) {
            const shH = this.shuffleBtn.meta?.h || this.shuffleBtn.height || 0;
            topBound = Math.max(
              topBound,
              this.shuffleBtn.y + shH / 2 + this.px(8)
            );
          }
          if (this.promptText)
            topBound = Math.max(
              topBound,
              this.promptText.y + this.promptText.height / 2 + this.px(12)
            );

          // Determine safe bottom bound: above confirm button
          const safePadBottom = this.px(12);
          let bottomBound = this.scale.height - safePadBottom;
          if (this.confirmBtn?.meta?.h)
            bottomBound = Math.min(
              bottomBound,
              this.confirmBtn.y - this.confirmBtn.meta.h / 2 - this.px(12)
            );

          // Ensure a reasonable area and clamp
          const totalAvail = Math.max(this.px(140), bottomBound - topBound);
          const areaH = Math.min(
            totalAvail,
            Math.max(this.scale.height * 0.62, totalAvail)
          );
          const startY = topBound; // start right below the header/prompt region

          const cellW = areaW / cols;
          const cellH = (bottomBound - startY) / rows;
          return {
            cols,
            rows,
            areaW,
            areaH: bottomBound - startY,
            startY,
            cellW,
            cellH,
          };
        }

        layoutOptionGrid() {
          if (!this.optionContainers || this.optionContainers.length === 0)
            return;
          const cssH = this.scale.height / this.dpr;
          const { cols, startY, cellW, cellH } = this.computeGrid();
          const imgSize = Math.min(cellW, cellH) * 0.55;
          const lblFontCss = Math.max(12, Math.min(22, cssH * 0.035));

          this.optionContainers.forEach((container) => {
            const idx = container.meta.idx || 0;
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const x =
              this.scale.width / 2 - (cellW * cols) / 2 + cellW * c + cellW / 2;
            const y = startY + cellH * r + cellH / 2;
            container.setPosition(x, y);

            container.meta.sprite
              .setDisplaySize(imgSize, imgSize)
              .setPosition(0, -this.px(10));
            container.meta.label
              .setFontSize(lblFontCss * this.dpr)
              .setPosition(0, imgSize / 2 - 0)
              .setStyle({ strokeThickness: this.px(4) });

            container.meta.radius = imgSize / 2 + this.px(10);
            const { ring } = container.meta;
            if (ring.alpha > 0 && container.meta.ringColor) {
              ring.clear();
              ring.lineStyle(
                container.meta.ringWidth || this.px(6),
                container.meta.ringColor,
                1
              );
              ring.strokeCircle(0, -this.px(10), container.meta.radius);
            }

            const hitW = imgSize + this.px(30);
            const hitH = imgSize + container.meta.label.height + this.px(20);
            container.setSize(hitW, hitH);
            if (container.meta.zone)
              container.meta.zone.setSize(hitW, hitH).setPosition(0, 0);
          });
        }

        showRound() {
          if (this.roundIndex >= this.rounds.length) {
            // Save perfect rounds to history and show summary
            let hist = [];
            try {
              hist = JSON.parse(localStorage.getItem("game6_history") || "[]");
            } catch (e) {
              hist = [];
            }
            hist.push(this.correctFirstTry);
            localStorage.setItem(
              "game6_history",
              JSON.stringify(hist.slice(-20))
            );

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

          const { cols, startY, cellW, cellH } = this.computeGrid();

          const round = this.rounds[this.roundIndex];
          this.promptText.setText(round.prompt);
          this.progressText.setText(
            `${this.roundIndex + 1} / ${this.rounds.length}`
          );
          this.layoutTopUI?.();

          round.options.forEach((opt, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const x =
              this.scale.width / 2 - (cellW * cols) / 2 + cellW * c + cellW / 2;
            const y = startY + cellH * r + cellH / 2;

            const container = this.add.container(x, y);
            const imgSize = Math.min(cellW, cellH) * 0.55;

            const sprite = this.add
              .image(0, -this.px(10), opt.image)
              .setDisplaySize(imgSize, imgSize)
              .setOrigin(0.5);

            const ring = this.add.graphics();
            const radius = imgSize / 2 + this.px(10);
            ring.setAlpha(0);

            const cssH = this.scale.height / this.dpr;
            const lblFontCss = Math.max(12, Math.min(22, cssH * 0.035));
            const label = this.add
              .text(0, imgSize / 2 - 0, opt.name, {
                fontFamily: "Fredoka One",
                fontSize: `${lblFontCss * this.dpr}px`,
                color: "#ffffff",
                align: "center",
                stroke: "#042539",
                strokeThickness: this.px(4),
              })
              .setOrigin(0.5, 0);

            container.add([ring, sprite, label]);
            container.meta = {
              itemName: opt.name,
              imageKey: opt.image,
              sprite,
              ring,
              label,
              radius,
              ringColor: undefined,
              ringWidth: this.px(6),
              idx,
            };

            // Accurate hit area via centered Zone (aligns with visual bounds)
            const hitW = imgSize + this.px(30);
            const hitH = imgSize + label.height + this.px(20);
            container.setSize(hitW, hitH);
            const zone = this.add.zone(0, 0, hitW, hitH).setOrigin(0.5);
            zone.setInteractive({ useHandCursor: true });
            container.add(zone);
            container.meta.zone = zone;

            const hoverIn = () => {
              if (this.roundComplete) return;
              if (!this.selected.has(opt.name))
                this.tweens.add({
                  targets: container,
                  scale: 1.06,
                  duration: 140,
                });
            };
            const hoverOut = () => {
              if (this.roundComplete) return;
              if (!this.selected.has(opt.name))
                this.tweens.add({
                  targets: container,
                  scale: 1.0,
                  duration: 140,
                });
            };

            zone.on("pointerover", hoverIn);
            zone.on("pointerout", hoverOut);
            zone.on("pointerdown", () => this.toggleSelect(container));

            this.optionContainers.push(container);
          });
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
          // Red ring on selection (like Game 2)
          container.meta.ringColor = 0xf9644d;
          container.meta.ringWidth = this.px(6);
          ring.lineStyle(container.meta.ringWidth, container.meta.ringColor, 1);
          ring.strokeCircle(0, -this.px(10), container.meta.radius);
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
              container.meta.ringColor = undefined;
            },
          });
        }

        evaluateSelection() {
          if (this.roundComplete) return;
          if (!this.confirmBtn || !this.confirmBtn.meta.enabled) return;

          const round = this.rounds[this.roundIndex];
          const correctSet = round.correct; // set of names

          let anyWrong = false;
          let anyMissing = false;
          this.selected.forEach((sel) => {
            if (!correctSet.has(sel)) anyWrong = true;
          });
          correctSet.forEach((c) => {
            if (!this.selected.has(c)) anyMissing = true;
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
              ct.meta.ringColor = color;
              ct.meta.ringWidth = this.px(8);
              ring.lineStyle(ct.meta.ringWidth, color, 1);
              ring.strokeCircle(0, -this.px(10), ct.meta.radius);
              if (!isCorrect)
                this.tweens.add({
                  targets: ct,
                  x: "+=6",
                  duration: 60,
                  yoyo: true,
                  repeat: 2,
                });
            } else {
              ring.setAlpha(0);
              ct.meta.ringColor = undefined;
            }
          });

          if (!anyWrong && !anyMissing) {
            new Audio(
              PhaserGame.Utils.Array.GetRandom(this.correctAudioFiles)
            ).play();
            if (this.firstAttempt) this.correctFirstTry += 1;
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
            new Audio(
              PhaserGame.Utils.Array.GetRandom(this.wrongAudioFiles)
            ).play();
            this.firstAttempt = false;
            // Remove wrong selections only, keep correct ones selected
            const toRemove = [];
            this.selected.forEach((sel) => {
              if (!correctSet.has(sel)) toRemove.push(sel);
            });
            toRemove.forEach((r) => this.selected.delete(r));
            this.time.delayedCall(220, () => {
              this.optionContainers.forEach((ct) => {
                if (toRemove.includes(ct.meta.itemName))
                  this.animateDeselection(ct);
              });
              this.enableConfirmIfNeeded();
            });
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
              localStorage.getItem("game6_history") || "[]"
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
          const W = this.scale.width;
          const H = this.scale.height;
          const renderSummary = () => {
            buildSummaryUI(this, {
              correct: this.correct,
              total: this.total,
              history: this.localHistory,
              onRestart: () => {
                const fn = this.game?.reactHandleShuffle;
                if (typeof fn === "function") {
                  fn();
                } else {
                  this.scene.start("ClassSelectAllScene");
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
          };

          const WF = window.WebFont;
          if (WF && WF.load) {
            WF.load({
              google: { families: ["Fredoka One"] },
              active: renderSummary,
              inactive: renderSummary,
            });
          } else {
            renderSummary();
          }
        }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, ClassSelectAllScene, SummaryScene],
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

      // Expose a regeneration hook for SummaryUI Play Again
      phaserRef.current.reactHandleShuffle = () => {
        try {
          phaserRef.current.scene.stop("SummaryScene");
        } catch {}
        try {
          phaserRef.current.scene.stop("ClassSelectAllScene");
        } catch {}
        phaserRef.current.scene.start("ClassSelectAllScene");
      };

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
      const fn = listenersRef.current.update;
      if (fn) {
        if (window.visualViewport)
          window.visualViewport.removeEventListener("resize", fn);
        window.removeEventListener("resize", fn);
      }
      phaserRef.current?.destroy(true);
    };
  }, []);

  return (
    <div>
      <GameContainer>
        {/* Place board fully below fixed navbar and prevent scrollbars */}
        <div
          className="w-full flex justify-center items-center"
          style={{
            height: "calc(100vh - 96px)",
            marginTop: "96px",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <GameBoard ref={containerRef} />
        </div>
      </GameContainer>
    </div>
  );
}

export default Game6;
