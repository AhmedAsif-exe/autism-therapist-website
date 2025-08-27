import React, { useLayoutEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildSummaryUI } from './SummaryUI';
import { getAllClassAssets, convertToGame6Format } from './AssetClassMapping';
import { getAllAssets as getAllFunctionAssets } from './AssetFunctionMapping';
import { getAllFeatureAssets } from './AssetFeatureMapping';
import { pickItemsFromType, getAllIconKeys } from './QuestionUtils';

// Game 7 — Drag & Drop (Function, Feature, Class)
// - 20 trials, each with a prompt and 6 draggable items (3 correct + 3 incorrect)
// - Left side: drop zone with prompt; Right side: draggable items
// - Preload with progress bar; Shuffle button regenerates trials
// - Voice-over for questions (SpeechSynthesis), praise on perfect first-try
// - Correct/Wrong sfx like other games
// - Optional speech recognition: say an item's name to auto-drop it (best-effort)

// Union of all assets referenced by Class, Function, and Feature mappings
const ALL_ASSETS = (() => {
  const map = new Map();
  try { getAllClassAssets().forEach(a => { if (a?.imagePath) map.set(a.imagePath, a); }); } catch {}
  try { getAllFunctionAssets().forEach(a => { if (a?.imagePath && !map.has(a.imagePath)) map.set(a.imagePath, a); }); } catch {}
  try { getAllFeatureAssets().forEach(a => { if (a?.imagePath && !map.has(a.imagePath)) map.set(a.imagePath, a); }); } catch {}
  return Array.from(map.values());
})();
const NAME_BY_KEY = new Map(ALL_ASSETS.map(a => [a.imagePath, a.name]));
const KEY_BY_NAME_LC = new Map(ALL_ASSETS.map(a => [a.name?.toLowerCase?.() || '', a.imagePath]));

// Disable speech dispatcher (TTS) and recognition
const ENABLE_SPEECH = false;

const CLASS_DEFS = convertToGame6Format(); // reuse mapping for class prompts

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

function item(key) { return { key, name: NAME_BY_KEY.get(key) || key } }

// Build 20 trials using QuestionUtils to ensure no overlap (3 correct + 3 wrong)
function buildTrials(limit = 20) {
  const trials = [];
  let guard = 0;
  const types = ['class', 'function', 'feature'];
  while (trials.length < limit && guard < limit * 10) {
    const type = choice(types);
    const pick = pickItemsFromType({ type, numCorrect: 3, numWrong: 3 });
    if (pick && pick.correctImgs?.length === 3 && pick.wrongImgs?.length === 3) {
      const prompt = type === 'function'
        ? `Drag items you can ${pick.key.toLowerCase()}.`
        : type === 'feature'
          ? `Drag items that ${pick.key.toLowerCase()}.`
          : `Drag the ${pick.key}.`;
      const options = shuffle([...pick.correctImgs, ...pick.wrongImgs]).map(k => item(k));
      trials.push({
        prompt,
        correctKeys: pick.correctImgs.slice(),
        options,
        bg: Math.floor(Math.random() * 360),
      });
    }
    guard += 1;
  }
  return trials.slice(0, limit);
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
  background: 'transparent',
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

export function Game7() {
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
          // Preload all icons via QuestionUtils to cover all game types
          try { getAllIconKeys().forEach((key) => this.load.image(key, `/Games/icons/${encodeURIComponent(key)}.png`)); } catch {}

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
            WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { scene.sheenTick?.remove(); scene.scene.start('DragDropScene'); }, inactive: () => { scene.sheenTick?.remove(); scene.scene.start('DragDropScene'); } });
          });
        }
      }

      class DragDropScene extends PhaserGame.Scene {
        constructor() {
          super({ key: 'DragDropScene' });
          this.isDragging = false;
          this.wasDragging = false;
          this.clickDown = null;
          this.clickThresholdMs = 250;
          this.clickMoveThreshold = 10;
          this.binSlots = [];
          this.binOccupancy = [];
          this._onResizeRef = null;
          // Prevent repeated scoring/evaluation
          this.evalInProgress = false;
          this.roundLocked = false;
        }
        // Helper: set hit area EXACTLY around the visible sprite + label (no padding)
        updateItemHitArea(ct) {
          if (!ct || !ct.scene) return; // object may be destroyed during scene switch
          if (!ct?.meta?.sprite || !ct?.meta?.label) return;
          const sprite = ct.meta.sprite;
          const label = ct.meta.label;
          try { sprite.removeInteractive(); } catch {}
          try { this.input.setDraggable(sprite, false); } catch {}
          const sW = sprite.displayWidth || sprite.width || 1;
          const sH = sprite.displayHeight || sprite.height || 1;
          const sLeft = (sprite.x || 0) - sW / 2;
          const sRight = (sprite.x || 0) + sW / 2;
          const sTop = (sprite.y || 0) - sH / 2;
          const sBottom = (sprite.y || 0) + sH / 2;
          const lblW = label.width || 1;
          const lblH = label.height || 1;
          const lblLeft = (label.x || 0) - lblW / 2;
          const lblRight = (label.x || 0) + lblW / 2;
          const lblTop = (label.y || 0);
          const lblBottom = (label.y || 0) + lblH;
          const left = Math.min(sLeft, lblLeft);
          const right = Math.max(sRight, lblRight);
          const top = Math.min(sTop, lblTop);
          const bottom = Math.max(sBottom, lblBottom);
          const width = Math.max(1, right - left);
          const height = Math.max(1, bottom - top);

          const inBin = !!ct.meta?.inBin;
          const locked = !!ct.meta?.lockedInBin;
           let          hitLeft = left + width * 0.5;
            let hitTop = top + height * 0.5;// - height * 0.1;
            let hitWidth = width; // * 1.25;
            let hitHeight = height;// * 1.25;

          if (!ct.scene) return; // guard again before touching input
          ct.setSize(hitWidth, hitHeight);
          if (ct.input && ct.input.hitArea && typeof ct.input.hitArea.setTo === 'function') {
            ct.input.hitArea.setTo(hitLeft, hitTop, hitWidth, hitHeight);
          } else {
            try { ct.removeInteractive(); } catch {}
            if (ct.scene) ct.setInteractive(new PhaserGame.Geom.Rectangle(hitLeft, hitTop, hitWidth, hitHeight), PhaserGame.Geom.Rectangle.Contains);
          }
          try { this.input.setDraggable(ct, !locked); } catch {}
          if (ct.input) { ct.input.cursor = locked ? 'default' : 'pointer'; }
        }
        // New helper: precise pointer-in-visual test to prevent hover flicker near offset edges
        isPointerInsideVisual(ct, pointer) {
          if (!ct?.meta?.sprite || !ct?.meta?.label || !pointer) return false;
          const sprite = ct.meta.sprite; const label = ct.meta.label;
          const sW = sprite.displayWidth || sprite.width || 1; const sH = sprite.displayHeight || sprite.height || 1;
          const sLeft = (sprite.x || 0) - sW / 2; const sRight = (sprite.x || 0) + sW / 2; const sTop = (sprite.y || 0) - sH / 2; const sBottom = (sprite.y || 0) + sH / 2;
          const lblW = label.width || 1; const lblH = label.height || 1; const lblLeft = (label.x || 0) - lblW / 2; const lblRight = (label.x || 0) + lblW / 2; const lblTop = (label.y || 0); const lblBottom = (label.y || 0) + lblH;
          const left = Math.min(sLeft, lblLeft); const right = Math.max(sRight, lblRight); const top = Math.min(sTop, lblTop); const bottom = Math.max(sBottom, lblBottom);
          const m = ct.getWorldTransformMatrix(); const p = new PhaserGame.Math.Vector2();
          m.applyInverse(pointer.worldX, pointer.worldY, p);
          return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom;
        }
        // Sticky drag support
        setSticky(ct, pointer) {
          if (!ct || ct.meta?.lockedInBin) return;
          try { this.input.setDraggable(ct, false); } catch {}
          this.stickyItem = ct;
          this.isDragging = true;
          this.children.bringToTop(ct);
          // Snap instantly to the pointer for immediate visual feedback
          ct.meta.stickyOffset = { dx: 0, dy: 0 };
          ct.x = pointer.worldX;
          ct.y = pointer.worldY;
          ct.setAlpha(0.95);
          this.tweens.add({ targets: ct, scale: 1.1, duration: 90, ease: 'Sine.easeOut' });
        }
        releaseSticky(pointer) {
          const ct = this.stickyItem; if (!ct) return;
          this.stickyItem = null; this.isDragging = false; ct.setAlpha(1);
          this.tweens.add({ targets: ct, scale: 1.0, duration: 90, ease: 'Sine.easeOut' });
          try { this.input.setDraggable(ct, !ct.meta?.lockedInBin); } catch {}
          const b = this.dropZone?.getBounds?.();
          if (b && PhaserGame.Geom.Rectangle.Contains(b, ct.x, ct.y)) {
            this.moveToBin(ct);
          } else {
            // Always send to shelf when released outside the bin, regardless of prior state
            this.returnToShelf(ct);
          }
        }
        toggleSticky(ct, pointer) { if (this.stickyItem === ct) { this.releaseSticky(pointer); } else { this.setSticky(ct, pointer); } }
        // Geometry helpers
        getShelfSize() {
          const cols = 2; const rows = 3;
          const areaW = this.scale.width * 0.42; const areaH = this.scale.height * 0.64;
          const cellW = areaW / cols; const cellH = areaH / rows;
          return Math.min(cellW, cellH) * 0.54;
        }
        computeBinSlots() {
          const { zoneW, zoneH } = this.dropMeta || {};
          if (!zoneW || !zoneH || !this.dropZone) return;
          const cols = 3; const rows = 2; const gap = 16;
          const size = Math.min((zoneW - gap * (cols + 1)) / cols, (zoneH - gap * (rows + 1)) / rows);
          const startX = this.dropZone.x - zoneW / 2 + gap + size / 2;
          const startY = this.dropZone.y - zoneH / 2 + gap + size / 2;
          this.binSlots = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              this.binSlots.push({ x: startX + c * (size + gap), y: startY + r * (size + gap), size });
            }
          }
          if (!Array.isArray(this.binOccupancy) || this.binOccupancy.length !== this.binSlots.length) {
            this.binOccupancy = new Array(this.binSlots.length).fill(null);
          }
        }
        init() {
          this.trials = buildTrials(20);
          this.index = 0; this.correctFirstTry = 0; this.firstAttempt = true;
          // Ensure locks are reset on scene start
          this.evalInProgress = false;
          this.roundLocked = false;
        }
        create() {
          this.bgGfx = this.add.graphics();
          // Make drag start feel immediate when holding and moving
          this.input.dragDistanceThreshold = 2; // pixels
          this.input.dragTimeThreshold = 0; // ms
          const qFont = Math.max(18, Math.min(40, this.scale.height * 0.075));
          this.promptText = this.add.text(this.scale.width / 2, Math.max(28, this.scale.height * 0.08), '', {
            fontFamily: 'Fredoka One', fontSize: `${qFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 6, align: 'center', wordWrap: { width: this.scale.width * 0.9 },
          }).setOrigin(0.5).setShadow(2,2,'rgba(0,0,0,0.4)',6);
          const pFont = Math.max(14, Math.min(28, this.scale.height * 0.05));
          this.progressText = this.add.text(this.scale.width / 12, Math.max(24, this.scale.height * 0.075), '', {
            fontFamily: 'Fredoka One', fontSize: `${pFont}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 5,
          }).setOrigin(0, 0.5);

          // UI controls
          this.createShuffleButton();
          this.buildDropZone();
          // Ensure shuffle is positioned and on top
          this.positionShuffleButton();
          this.shuffleBtn?.setDepth(10000);

          // Input handlers
          this.input.on('dragstart', (pointer, gameObject) => {
            if (this.stickyItem) return;
            const obj = gameObject.meta ? gameObject : (gameObject.parentContainer || gameObject);
            if (obj?.meta?.lockedInBin) return;
            this.isDragging = true; this.wasDragging = true; this.clickDown = null;
            this.children.bringToTop(obj);
            // Lock hover enlargement while dragging
            const bx = obj.meta.spriteBaseScaleX ?? obj.meta.sprite.scaleX;
            const by = obj.meta.spriteBaseScaleY ?? obj.meta.sprite.scaleY;
            obj.meta.hovered = true;
            obj.meta.sprite.setScale(bx * 1.06, by * 1.06);
          });
          this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.stickyItem) return;
            const obj = gameObject.meta ? gameObject : (gameObject.parentContainer || gameObject);
            if (obj?.meta?.lockedInBin) return;
            obj.x = dragX; obj.y = dragY;
          });
          this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (this.stickyItem) return; this.isDragging = false;
            const obj = gameObject.meta ? gameObject : (gameObject.parentContainer || gameObject);
            if (obj?.meta?.lockedInBin) { this.layoutBinItems?.(); return; }
            if (dropZone === this.dropZone) this.moveToBin(obj);
          });
          this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (this.stickyItem) return;
            this.isDragging = false; this.wasDragging = false;
            const obj = gameObject.meta ? gameObject : (gameObject.parentContainer || gameObject);
            if (!obj.meta?.hovered) {
              const bx = obj.meta?.spriteBaseScaleX ?? obj.meta?.sprite?.scaleX ?? 1;
              const by = obj.meta?.spriteBaseScaleY ?? obj.meta?.sprite?.scaleY ?? 1;
              obj.meta?.sprite?.setScale(bx, by);
            }
            if (obj?.meta?.lockedInBin) { this.layoutBinItems?.(); return; }
            if (!dropped) this.returnToShelf(obj);
          });
          // Sticky tap-to-toggle (no sticky on hold)
          this.input.on('gameobjectdown', (pointer, gameObject) => {
            const obj = gameObject.meta ? gameObject : gameObject.parentContainer; if (!obj?.meta?.key) return;
            this.clickDown = { obj, time: this.time.now, x: pointer.worldX, y: pointer.worldY };
          });
          this.input.on('gameobjectup', (pointer, gameObject) => {
            const obj = gameObject.meta ? gameObject : gameObject.parentContainer; if (!obj?.meta?.key) return;
            if (!obj?.input) { this.clickDown = null; return; }
            if (!this.clickDown || this.clickDown.obj !== obj) { this.clickDown = null; return; }
            const dt = this.time.now - this.clickDown.time; const dx = pointer.worldX - this.clickDown.x; const dy = pointer.worldY - this.clickDown.y;
            const moved = Math.hypot(dx, dy) > this.clickMoveThreshold;
            if (!this.wasDragging && dt <= this.clickThresholdMs && !moved) this.toggleSticky(obj, pointer);
            this.clickDown = null; this.wasDragging = false;
          });
          this.input.on('pointermove', (pointer) => {
            if (!this.stickyItem) return;
            // Follow the pointer center while in sticky mode (no offset)
            this.stickyItem.x = pointer.worldX;
            this.stickyItem.y = pointer.worldY;
          });

          // Confirm button
          this.confirmBtn = this.buildConfirmButton(); this.positionConfirmButton();
          // Resize listener with stored ref so we can detach on shutdown
          this._onResizeRef = () => { if (!this.sys || !this.sys.isActive) return; this.layout(); };
          this.scale.on('resize', this._onResizeRef);
          // Teardown listeners on shutdown/destroy
          this.events.once(PhaserGame.Scenes.Events.SHUTDOWN, () => this.teardown());
          this.events.once(PhaserGame.Scenes.Events.DESTROY, () => this.teardown());
          this.showTrial();
        }
        teardown() {
          try { if (this._onResizeRef) { this.scale.off('resize', this._onResizeRef); this._onResizeRef = null; } } catch {}
          try { this.input?.removeAllListeners(); } catch {}
          try { this.time?.removeAllEvents(); } catch {}
          try { this.tweens?.killAll(); } catch {}
          try { this.clearItems?.(); } catch {}
          try { this.dropZone?.destroy(); this.dropZone = null; } catch {}
          try { this.dropZoneGfx?.destroy(); this.dropZoneGfx = null; } catch {}
          try { this.dropLabel?.destroy(); this.dropLabel = null; } catch {}
          try { this.confirmBtn?.destroy(); this.confirmBtn = null; } catch {}
          try { this.shuffleBtn?.destroy(); this.shuffleBtn = null; } catch {}
        }
        // UI builders
        createShuffleButton() {
          const sFont = Math.max(14, Math.min(24, this.scale.height * 0.045));
          const text = this.add.text(0, 0, 'Shuffle', { fontFamily: 'Fredoka One', fontSize: `${sFont}px`, color: '#042539' }).setOrigin(0.5);
          const width = text.width + 32; const height = text.height + 16;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
          bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);

          const ct = this.add.container(0, 0, [bg, text]);
          ct.setSize(width, height); ct.setInteractive({ useHandCursor: true });
          ct.on('pointerover', () => { this.tweens.add({ targets: ct, scale: 1.05, duration: 200 }); bg.clear(); bg.fillStyle(0x57C785, 0.8); bg.fillRoundedRect(-width/2, -height/2, width, height, 12); bg.lineStyle(6, 0x042539, 1); bg.strokeRoundedRect(-width/2, -height/2, width, height, 12); text.setColor('#ffffff'); });
          ct.on('pointerout', () => { this.tweens.add({ targets: ct, scale: 1.0, duration: 200 }); bg.clear(); bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-width/2, -height/2, width, height, 12); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-width/2, -height/2, width, height, 12); text.setColor('#042539'); });
          ct.on('pointerdown', () => { this.tweens.add({ targets: ct, scale: 1.1, duration: 300, ease: 'Circ.easeInOut', onComplete: () => this.handleShuffle() }); });
          this.shuffleBtn = ct; this.shuffleBtn.meta = { width, height };
        }
        positionShuffleButton() { if (!this.shuffleBtn) return; const { width, height } = this.shuffleBtn.meta; this.shuffleBtn.x = this.scale.width - 16 - width / 2; this.shuffleBtn.y = 16 + height / 2; }

        buildConfirmButton() {
          const w = Math.min(260, this.scale.width * 0.4);
          const h = Math.max(48, this.scale.height * 0.09);
          const g = this.add.graphics();
          const draw = (enabled) => { g.clear(); const fill = !enabled ? 0x8aa3b5 : 0xf9644d; g.fillStyle(fill, 0.92); g.fillRoundedRect(-w/2, -h/2, w, h, 20); g.lineStyle(4, 0x042539, 1); g.strokeRoundedRect(-w/2, -h/2, w, h, 20); };
          draw(false);
          const label = this.add.text(0, 0, 'Confirm', { fontFamily: 'Fredoka One', fontSize: `${Math.max(20, h * 0.42)}px`, color: '#fff' }).setOrigin(0.5);
          const ct = this.add.container(this.scale.width/2, this.scale.height*0.9, [g, label]);
          ct.meta = { enabled: false, draw };
          ct.setSize(w, h); ct.setInteractive({ useHandCursor: true });
          ct.on('pointerover', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.05, duration: 160 }); });
          ct.on('pointerout', () => { if (ct.meta.enabled) this.tweens.add({ targets: ct, scale: 1.0, duration: 160 }); });
          ct.on('pointerdown', () => { if (ct.meta.enabled) this.evaluate(); });
          ct.enable = () => { ct.meta.enabled = true; draw(true); };
          ct.disable = () => { ct.meta.enabled = false; draw(false); };
          ct.disable();
          return ct;
        }
        positionConfirmButton() { if (!this.confirmBtn) return; this.confirmBtn.x = this.scale.width/2; this.confirmBtn.y = this.scale.height*0.93; }

        buildDropZone() {
          const W = this.scale.width; const H = this.scale.height;
          const zoneW = W * 0.42; const zoneH = H * 0.60; const x = W * 0.23; const y = H * 0.55;
          const g = this.add.graphics(); g.lineStyle(4, 0x042539, 1); g.strokeRoundedRect(x - zoneW/2, y - zoneH/2, zoneW, zoneH, 18);
          g.fillStyle(0xffffff, 0.08); g.fillRoundedRect(x - zoneW/2, y - zoneH/2, zoneW, zoneH, 18);
          const label = this.add.text(x, y - zoneH/2 - 18, 'Drop here', { fontFamily: 'Fredoka One', fontSize: `${Math.max(14, Math.min(22, H * 0.035))}px`, color: '#ffffff', stroke: '#042539', strokeThickness: 4 }).setOrigin(0.5);
          const zone = this.add.zone(x, y, zoneW, zoneH).setOrigin(0.5); zone.setInteractive({ dropZone: true });
          this.dropZone = zone; this.dropZoneGfx = g; this.dropLabel = label; this.dropMeta = { x, y, zoneW, zoneH };
          this.computeBinSlots();
        }
        buildMicButton() {
          const s = Math.max(24, this.scale.height * 0.035);
          const icon = this.add.text(0,0,'🎤',{ fontSize: `${s}px` }).setOrigin(0.5);
          const w = s + 18; const h = s + 12;
          const bg = this.add.graphics();
          bg.fillStyle(0xffffff, 0.6); bg.fillRoundedRect(-w/2, -h/2, w, h, 10); bg.lineStyle(4, 0x042539, 1); bg.strokeRoundedRect(-w/2, -h/2, w, h, 10);
          const ct = this.add.container(this.scale.width * 0.08, Math.max(24, this.scale.height * 0.08), [bg, icon]);
          ct.setSize(w, h); ct.setInteractive({ useHandCursor: true });
          ct.on('pointerover', () => { this.tweens.add({ targets: ct, scale: 1.05, duration: 160 }); });
          ct.on('pointerout', () => { this.tweens.add({ targets: ct, scale: 1.0, duration: 160 }); });
          ct.on('pointerdown', () => this.startSpeechRecognition());
          this.micBtn = ct; this.micBtn.meta = { w, h };
        }

        layout() {
          this.drawBackground(this.currentBgHue || 0);
          this.positionShuffleButton(); this.positionConfirmButton();
          if (this.isDragging) return;
          this.dropZoneGfx?.destroy(); this.dropLabel?.destroy(); this.dropZone?.destroy();
          this.buildDropZone();
          this.layoutItems?.();
          this.layoutBinItems?.();
        }

        drawBackground(h) {
          const W = this.scale.width; const H = this.scale.height;
          this.bgGfx.clear();
          // Monochrome: low saturation gradient-like bands
          const base = new PhaserGame.Display.Color.HSLToColor(h/360, 0.05, 0.9);
          this.bgGfx.fillStyle(base.color, 1);
          this.bgGfx.fillRect(0, 0, W, H);
          const band = new PhaserGame.Display.Color.HSLToColor(h/360, 0.06, 0.85);
          this.bgGfx.fillStyle(band.color, 1);
          this.bgGfx.fillRect(0, H*0.5, W, H*0.5);
        }

        handleShuffle() {
          this.trials = buildTrials(20);
          this.index = 0;
          this.correctFirstTry = 0;
          this.firstAttempt = true;
          // Reset locks on shuffle
          this.evalInProgress = false;
          this.roundLocked = false;
          this.showTrial();
        }

        showTrial() {
          this.stickyItem = null; this.isDragging = false; this.wasDragging = false; this.clickDown = null;
          // Reset locks for each new trial
          this.evalInProgress = false;
          this.roundLocked = false;
          if (this.index >= this.trials.length) { let hist = []; try { hist = JSON.parse(localStorage.getItem('game7_history') || '[]'); } catch (e) { hist = []; }
            hist.push(this.correctFirstTry); localStorage.setItem('game7_history', JSON.stringify(hist.slice(-20)));
            this.scene.start('SummaryScene', { correct: this.correctFirstTry, total: this.trials.length }); return; }
          const trial = this.trials[this.index]; this.currentBgHue = trial.bg; this.drawBackground(this.currentBgHue);
          this.promptText.setText(trial.prompt); this.progressText.setText(`${this.index + 1} / ${this.trials.length}`);
          this.speak(trial.prompt);
          this.clearItems?.(); this.shelf = []; this.binOccupancy = new Array(this.binSlots.length || 6).fill(null);
          const cols = 2; const rows = 3; const areaW = this.scale.width * 0.42; const areaH = this.scale.height * 0.64;
          const startX = this.scale.width * 0.76 - areaW/2; const startY = this.scale.height * 0.55 - areaH/2; const cellW = areaW / cols; const cellH = areaH / rows;
          const shelfSize = this.getShelfSize();
          trial.options.forEach((opt, idx) => {
            const r = Math.floor(idx / cols); const c = idx % cols;
            const x = startX + cellW * c + cellW/2; const y = startY + cellH * r + cellH/2;
            const ct = this.buildItem(opt, x, y, false);
            ct.meta.currentSize = shelfSize;
            ct.meta.sprite.setDisplaySize(shelfSize * 0.78, shelfSize * 0.78).setPosition(0, -8);
            ct.meta.spriteBaseScaleX = ct.meta.sprite.scaleX; ct.meta.spriteBaseScaleY = ct.meta.sprite.scaleY; ct.meta.hovered = false;
            ct.meta.label.setFontSize(Math.max(11, Math.min(18, this.scale.height * 0.028))).setPosition(0, shelfSize * 0.46);
            this.updateItemHitArea(ct); this.shelf.push(ct);
          });
          this.layoutItems = () => {
            const shelfSize2 = this.getShelfSize(); const cols2 = 2; const rows2 = 3;
            const areaW2 = this.scale.width * 0.42; const areaH2 = this.scale.height * 0.64;
            const startX2 = this.scale.width * 0.76 - areaW2/2; const startY2 = this.scale.height * 0.55 - areaH2/2; const cellW2 = areaW2 / cols2; const cellH2 = areaH2 / rows2;
            this.shelf.forEach((ct, i) => {
              if (!ct.meta.inBin) {
                const r2 = Math.floor(i / cols2); const c2 = i % cols2;
                ct.meta.homeX = startX2 + cellW2 * c2 + cellW2/2; ct.meta.homeY = startY2 + cellH2 * r2 + cellH2/2;
                this.tweens.add({ targets: ct, x: ct.meta.homeX, y: ct.meta.homeY, duration: 200 });
                ct.meta.currentSize = shelfSize2;
                ct.meta.sprite.setDisplaySize(shelfSize2 * 0.78, shelfSize2 * 0.78).setPosition(0, -8);
                ct.meta.spriteBaseScaleX = ct.meta.sprite.scaleX; ct.meta.spriteBaseScaleY = ct.meta.sprite.scaleY;
                ct.meta.label.setFontSize(Math.max(11, Math.min(18, this.scale.height * 0.028))).setPosition(0, shelfSize2 * 0.46);
                this.updateItemHitArea(ct);
              }
            });
          };
          this.layoutBinItems = () => {
            // Place each in-bin item at its assigned slot without reflowing others
            this.shelf.filter(ct => ct.meta.inBin && ct.meta.binSlot != null).forEach(ct => {
              const slot = this.binSlots[ct.meta.binSlot]; if (!slot) return;
              this.tweens.add({ targets: ct, x: slot.x, y: slot.y, duration: 220 });
              ct.meta.currentSize = slot.size;
              ct.meta.sprite.setDisplaySize(slot.size * 0.72, slot.size * 0.72).setPosition(0, -8);
              ct.meta.spriteBaseScaleX = ct.meta.sprite.scaleX; ct.meta.spriteBaseScaleY = ct.meta.sprite.scaleY;
              ct.meta.label.setFontSize(Math.max(11, Math.min(18, this.scale.height * 0.028))).setPosition(0, slot.size * 0.44);
              this.updateItemHitArea(ct);
            });
          };
          this.clearItems = () => { this.shelf?.forEach(ct => ct.destroy()); this.shelf = []; };
          this.enableConfirmIfNeeded();
        }
        buildItem(opt, x, y, inBin) {
          const sprite = this.add.image(0, -8, opt.key).setOrigin(0.5);
          const label = this.add.text(0, 42, opt.name, { fontFamily: 'Fredoka One', fontSize: `${Math.max(12, Math.min(22, this.scale.height * 0.035))}px`, color: '#000000', align: 'center' }).setOrigin(0.5, 0);
          const ring = this.add.graphics(); ring.setAlpha(0);
          const ct = this.add.container(x, y, [ring, sprite, label]);
          ct.meta = { key: opt.key, name: opt.name, sprite, label, ring, inBin: !!inBin, homeX: x, homeY: y, hovered: false, binSlot: null, lockedInBin: false };
          ct.setSize(sprite.width, sprite.height + 40);
          this.updateItemHitArea(ct);
          ct.off('pointerover'); ct.off('pointerout');
          ct.on('pointerover', () => {
            if (ct.meta.hovered) return; ct.meta.hovered = true;
            const bx = ct.meta.spriteBaseScaleX ?? sprite.scaleX; const by = ct.meta.spriteBaseScaleY ?? sprite.scaleY;
            sprite.setScale(bx * 1.06, by * 1.06);
          });
          ct.on('pointerout', (pointer) => {
            if (this.isPointerInsideVisual(ct, pointer)) return;
            if (this.isDragging || this.stickyItem === ct) return;
            ct.meta.hovered = false; const bx = ct.meta.spriteBaseScaleX ?? sprite.scaleX; const by = ct.meta.spriteBaseScaleY ?? sprite.scaleY;
            sprite.setScale(bx, by);
          });
          return ct;
        }
        moveToBin(ct) {
          if (ct.meta.inBin) return;
          ct.meta.inBin = true;
          // assign stable slot
          if (ct.meta.binSlot == null) {
            const idx = (this.binOccupancy.findIndex(v => v === null));
            ct.meta.binSlot = idx === -1 ? 0 : idx; // fallback if full
          }
          this.binOccupancy[ct.meta.binSlot] = ct;
          const slot = this.binSlots[ct.meta.binSlot];
          if (slot) {
            this.tweens.add({ targets: ct, x: slot.x, y: slot.y, duration: 220, ease: 'Sine.easeOut' });
            ct.meta.currentSize = slot.size;
            ct.meta.sprite.setDisplaySize(slot.size * 0.72, slot.size * 0.72).setPosition(0, -8);
            ct.meta.spriteBaseScaleX = ct.meta.sprite.scaleX; ct.meta.spriteBaseScaleY = ct.meta.sprite.scaleY;
            ct.meta.label.setFontSize(Math.max(11, Math.min(18, this.scale.height * 0.028))).setPosition(0, slot.size * 0.44);
            this.updateItemHitArea(ct);
          }
          this.tweens.add({ targets: ct, scale: 1.08, duration: 160, yoyo: true });
          this.enableConfirmIfNeeded();
        }
        returnToShelf(ct) {
          // Mark as out of bin immediately
          ct.meta.inBin = false;
          // free slot if it had one
          if (ct.meta.binSlot != null && Array.isArray(this.binOccupancy)) {
            if (this.binOccupancy[ct.meta.binSlot] === ct) this.binOccupancy[ct.meta.binSlot] = null;
            ct.meta.binSlot = null;
          }
          ct.meta.lockedInBin = false; // ensure unlocked once back on shelf
          const shelfSize = this.getShelfSize();
          ct.meta.currentSize = shelfSize;
          ct.meta.sprite.setDisplaySize(shelfSize * 0.78, shelfSize * 0.78).setPosition(0, -8);
          ct.meta.spriteBaseScaleX = ct.meta.sprite.scaleX; ct.meta.spriteBaseScaleY = ct.meta.sprite.scaleY;
          ct.meta.label.setFontSize(Math.max(11, Math.min(18, this.scale.height * 0.028))).setPosition(0, shelfSize * 0.46);
          this.updateItemHitArea(ct);
          this.tweens.killTweensOf(ct); // avoid conflicts
          this.tweens.add({ targets: ct, x: ct.meta.homeX, y: ct.meta.homeY, duration: 280, ease: 'Sine.easeInOut' });
          // Update confirm state after moving out
          this.enableConfirmIfNeeded();
        }
        enableConfirmIfNeeded() { const hasAny = this.shelf?.some(ct => ct.meta.inBin); if (hasAny) this.confirmBtn.enable(); else this.confirmBtn.disable(); }
        evaluate() {
          // Guard against spamming Confirm
          if (this.evalInProgress || this.roundLocked) return;
          this.evalInProgress = true;
          try { this.confirmBtn.disable(); } catch {}

          const trial = this.trials[this.index]; const correctSet = new Set(trial.correctKeys.map(k => NAME_BY_KEY.get(k)));
          let anyWrong = false; let anyMissing = false;
          this.shelf.forEach(ct => { ct.meta.ring.clear(); ct.meta.ring.setAlpha(0); });
          this.shelf.forEach(ct => {
            if (ct.meta.inBin) {
              const isCorrect = correctSet.has(ct.meta.name); const color = isCorrect ? 0x57c785 : 0xf9644d;
              ct.meta.ring.setAlpha(1); ct.meta.ring.lineStyle(8, color, 1);
              const r = Math.max(48, Math.min(64, (ct.meta.currentSize || 110) * 0.55));
              ct.meta.ring.strokeCircle(0, -8, r);
              if (!isCorrect) { anyWrong = true; /* shake handled below to avoid double-animation */ }
            }
          });
          trial.correctKeys.forEach(k => { const nm = NAME_BY_KEY.get(k); const selected = this.shelf.some(ct => ct.meta.inBin && ct.meta.name === nm); if (!selected) anyMissing = true; });
          if (!anyWrong && !anyMissing) {
            new Audio('/Games/audio/right1.mp3').play(); if (this.firstAttempt) this.correctFirstTry += 1;
            // Lock this round to prevent multiple increments
            this.roundLocked = true;
            // Celebrate: scale up then down, then advance
            this.shelf.forEach(ct => { if (ct.meta.inBin && correctSet.has(ct.meta.name)) this.tweens.add({ targets: ct, scale: 1.2, duration: 240, yoyo: true }); });
            this.time.delayedCall(800, () => { this.index += 1; this.firstAttempt = true; this.showTrial(); }); this.speak('Great job!');
          } else {
            new Audio('/Games/audio/wrong1.mp3').play(); this.firstAttempt = false;
            // Lock only the confirmed-correct items in the bin; they must stay
            const correctInBin = this.shelf.filter(ct => ct.meta.inBin && correctSet.has(ct.meta.name));
            correctInBin.forEach(ct => { ct.meta.lockedInBin = true; this.updateItemHitArea(ct); });
            // Smoothly shake then return wrong items to shelf without double moves
            const wrongs = this.shelf.filter(ct => ct.meta.inBin && !correctSet.has(ct.meta.name));
            wrongs.forEach(ct => {
              this.tweens.killTweensOf(ct);
              const shake = this.tweens.add({ targets: ct, x: '+=6', duration: 60, yoyo: true, repeat: 2, onComplete: () => {
                ct.meta.inBin = false; ct.meta.ring.setAlpha(0);
                this.returnToShelf(ct);
                this.enableConfirmIfNeeded();
              }});
            });
            // Allow evaluating again after handling wrongs
            this.evalInProgress = false;
          }
        }
        // Speech: prompt TTS and simple recognition
        speak(text) { if (!ENABLE_SPEECH) return; try { const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.0; u.volume = 1.0; window.speechSynthesis?.speak(u); } catch {} }
        startSpeechRecognition() {
          if (!ENABLE_SPEECH) return;
          const WSR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!WSR) return;
          try {
            const rec = new WSR();
            rec.lang = 'en-US';
            rec.maxAlternatives = 3;
            rec.interimResults = false;
            rec.continuous = false;
            rec.onresult = (e) => {
              const text = Array.from(e.results).map(r => r[0]?.transcript || '').join(' ').toLowerCase();
              // Match any item name in current options
              const trial = this.trials[this.index];
              trial.options.forEach(o => {
                const nm = o.name.toLowerCase();
                if (text.includes(nm)) {
                  const ct = this.shelf.find(c => c.meta.name.toLowerCase() === nm);
                  if (ct) this.moveToBin(ct);
                }
              });
            };
            rec.start();
          } catch { /* ignore */ }
        }
      }

      class SummaryScene extends PhaserGame.Scene {
        constructor() { super({ key: 'SummaryScene' }); }
        init(data) { this.correct = data.correct || 0; this.total = data.total || 0; try { this.history = JSON.parse(localStorage.getItem('game7_history') || '[]'); } catch (e) { this.history = []; } this.localHistory = this.history.slice(-5); }
        preload() { this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); }
        create() { /* eslint-disable no-undef */ WebFont.load({ google: { families: ['Fredoka One'] }, active: () => { const W = this.scale.width; const H = this.scale.height; buildSummaryUI(this, { correct: this.correct, total: this.total, history: this.localHistory, onRestart: () => { try { this.scene.stop('SummaryScene'); } catch {} try { this.scene.stop('DragDropScene'); } catch {} this.scene.start('DragDropScene'); }, texts: { heading: `You got ${this.correct} correct on first try!`, playAgain: 'Play Again' }, graph: { x: W / 2, y: H / 2 + 150, width: 400, height: 250, titleText: 'Progress Over Past 5 Attempts', entrance: { fromYOffset: 300, delay: 200 } }, renderHeading: true }); } }); /* eslint-enable */ }
      }

      const ratio = window.devicePixelRatio || 1;
      const config = {
        type: PhaserGame.AUTO,
        parent: container,
        transparent: true,
        scene: [PreloadScene, DragDropScene, SummaryScene],
        scale: { mode: PhaserGame.Scale.NONE, width: container.clientWidth, height: container.clientHeight },
        resolution: ratio,
        callbacks: { postBoot: (game) => { game.canvas.style.width = `${container.clientWidth}px`; game.canvas.style.height = `${container.clientHeight}px`; } },
      };

      phaserRef.current = new PhaserGame.Game(config);

      resizeObserverRef.current = new ResizeObserver(() => {
        if (!phaserRef.current) return;
        const w = container.clientWidth; const h = container.clientHeight;
        phaserRef.current.scale.resize(w, h);
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

export default Game7;
