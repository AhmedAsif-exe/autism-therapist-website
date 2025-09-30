// Shared Progress Graph utility for Phaser scenes (Game 1 & Game 2)
// Builds an animated line graph showing recent attempt history.
// Usage:
//   import { buildProgressGraph } from './ProgressGraph';
//   buildProgressGraph(this, { x, y, width, height, data, titleText });
//
// The function handles entrance animation, line/dot sequencing, tooltips, and styling
// consistent with existing game aesthetics.

export function buildProgressGraph(scene, {
  x,
  y,
  width = 400,
  height = 250,
  data = [],
  titleText = 'Progress Over Past 5 Attempts',
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  entrance = { fromYOffset: 200, delay: 0 },
  colors = {
    bgFill: 0xffffff,
    bgAlpha: 0.5,
    axis: 0x042539,
    line: 0x042539,
    dot: 0x042539,
    titleStroke: '#042539',
    titleColor: '#fff',
    labelColor: '#042539'
  }
} = {}) {
  // Fallback if no data
  const historyData = (data && data.length) ? data.slice() : [0];

  // Resolve DPR and CSS-pixel helpers
  const dpr = scene.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const cssW = width / dpr;
  const cssH = height / dpr;

  // Scale relative to reference size 400x250 (matches previous default)
  const REF_W = 400;
  const REF_H = 250;
  const s = Math.min(cssW / REF_W, cssH / REF_H);

  // Scaled margins (in CSS px -> convert to device px for drawing)
  const mTopCss = (margin.top ?? 20) * s;
  const mRightCss = (margin.right ?? 20) * s;
  const mBottomCss = (margin.bottom ?? 30) * s;
  const mLeftCss = (margin.left ?? 40) * s;
  const mTop = mTopCss * dpr;
  const mRight = mRightCss * dpr;
  const mBottom = mBottomCss * dpr;
  const mLeft = mLeftCss * dpr;

  // Axis thickness and dot radius scale gently with size
  const axisThickness = Math.max(1, Math.round(2 * s));
  const lineThickness = Math.max(1, Math.round(2 * s));
  const dotRadius = Math.max(3, Math.round(6 * s));

  // Background rectangle
  const graphBG = scene.add.graphics();
  graphBG.fillStyle(colors.bgFill, colors.bgAlpha);
  graphBG.fillRoundedRect(-width / 2, -height / 2, width, height, Math.max(6, 8 * s));
  graphBG.lineStyle(axisThickness, colors.axis, 1);
  graphBG.strokeRoundedRect(-width / 2, -height / 2, width, height, Math.max(6, 8 * s));

  // Axes
  const axes = scene.add.graphics();
  axes.lineStyle(axisThickness, colors.axis, 1);
  axes.beginPath();
  axes.moveTo(-width / 2 + mLeft,  height / 2 - mBottom + 1); // y-axis
  axes.lineTo(-width / 2 + mLeft, -height / 2 + mTop);
  axes.moveTo(-width / 2 + mLeft,  height / 2 - mBottom);     // x-axis
  axes.lineTo( width / 2 - mRight, height / 2 - mBottom);
  axes.strokePath();

  // Container (start displaced for entrance animation)
  const container = scene.add.container(
    x,
    y + (entrance.fromYOffset || 0),
    [graphBG, axes]
  ).setAlpha(0);

  // Plot area and data normalization
  const maxVal = Math.max(...historyData, 1);
  const plotW  = width - mLeft - mRight;
  const plotH  = height - mTop - mBottom;
  const dx     = historyData.length > 1 ? plotW / (historyData.length - 1) : 0;

  // Entrance animation
  scene.tweens.add({
    targets: container,
    alpha: { from: 0, to: 1 },
    y: { from: y + (entrance.fromYOffset || 0), to: y },
    delay: entrance.delay || 0,
    duration: 600,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Connecting line
      const line = scene.add.graphics({ alpha: 0 }).setDepth(5);
      line.lineStyle(lineThickness, colors.line, 0.8);
      line.beginPath();
      historyData.forEach((val, i) => {
        const px = -width / 2 + mLeft + dx * i;
        const py =  height / 2 - mBottom - (val / maxVal) * plotH;
        if (i === 0) line.moveTo(px, py); else line.lineTo(px, py);
      });
      line.strokePath();
      container.add(line);
      scene.tweens.add({ targets: line, alpha: 1, delay: 200, duration: 300 });

      // Title (scale with container, DPR-aware, allow wrap)
      const titleCss = Math.max(12, Math.min(24, 24 * s));
      const title = scene.add.text(0, -height / 2 - Math.max(8, 12 * s), titleText, {
        fontFamily: 'Fredoka One',
        fontSize: `${titleCss * dpr}px`,
        color: colors.titleColor,
        stroke: colors.titleStroke,
        strokeThickness: Math.max(2, Math.round(4 * s)),
        align: 'center',
        wordWrap: { width: Math.max(width, 200 * dpr), useAdvancedWrap: true }
      }).setOrigin(0.5, 1).setAlpha(0);
      title.setResolution(dpr);
      container.add(title);
      scene.tweens.add({ targets: title, alpha: 1, delay: 300, duration: 300 });

      // Axis labels (scale with container and DPR)
      const labelCss = Math.max(10, Math.min(16, 16 * s));
      const labelStyle = { fontFamily: 'Fredoka One', fontSize: `${labelCss * dpr}px`, color: colors.labelColor };
      const yLabel = scene.add.text(
        -width / 2 + mLeft - Math.max(6, 10 * s),
        -height / 2 + mTop,
        String(maxVal),
        labelStyle
      ).setOrigin(1, 0).setAlpha(0);
      yLabel.setResolution(dpr);
      container.add(yLabel);
      scene.tweens.add({ targets: yLabel, alpha: 1, delay: 400, duration: 250 });

      historyData.forEach((_, i) => {
        const xLabel = scene.add.text(
          -width / 2 + mLeft + dx * i,
          height / 2 - mBottom + Math.max(2, 4 * s),
          String(i + 1),
          labelStyle
        ).setOrigin(0.5, 0).setAlpha(0);
        xLabel.setResolution(dpr);
        container.add(xLabel);
        scene.tweens.add({
          targets: xLabel,
          alpha: 1,
          delay: 400 + i * 100,
          duration: 250
        });
      });

      // Dots
      let cumulativeDelay = 600;
      historyData.forEach((val, i) => {
        const px = -width / 2 + mLeft + dx * i;
        const py =  height / 2 - mBottom - (val / maxVal) * plotH;
        const dot = scene.add.circle(px, py, dotRadius, colors.dot)
          .setScale(0)
          .setAlpha(0)
          .setInteractive({ useHandCursor: true })
          .setDepth(10);
        container.add(dot);
        scene.tweens.add({
          targets: dot,
          scale: 1,
          alpha: 1,
          delay: cumulativeDelay,
          duration: 300,
          ease: 'Back.easeOut'
        });
        cumulativeDelay += 150;
        dot.on('pointerover', () => {
          scene.tweens.add({ targets: dot, scale: 1.5, duration: 150 });
          const tipCss = Math.max(12, Math.min(20, 20 * s));
          const tooltip = scene.add.text(px, py - Math.max(8, 12 * s), String(val), {
            fontFamily: 'Fredoka One',
            fontSize: `${tipCss * dpr}px`,
            color: colors.labelColor,
            stroke: '#fff',
            strokeThickness: Math.max(2, Math.round(4 * s))
          }).setOrigin(0.5, 1).setDepth(11);
          tooltip.setResolution(dpr);
          dot._tooltip = tooltip;
          container.add(tooltip);
        });
        dot.on('pointerout', () => {
          scene.tweens.add({ targets: dot, scale: 1, duration: 150 });
          if (dot._tooltip) { dot._tooltip.destroy(); dot._tooltip = null; }
        });
      });
    }
  });

  return container;
}
