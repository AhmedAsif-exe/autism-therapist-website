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

  // Background rectangle
  const graphBG = scene.add.graphics();
  graphBG.fillStyle(colors.bgFill, colors.bgAlpha);
  graphBG.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
  graphBG.lineStyle(2, colors.axis, 1);
  graphBG.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

  // Axes
  const axes = scene.add.graphics();
  axes.lineStyle(3, colors.axis, 1);
  axes.beginPath();
  axes.moveTo(-width / 2 + margin.left,  height / 2 - margin.bottom + 1); // y-axis
  axes.lineTo(-width / 2 + margin.left, -height / 2 + margin.top);
  axes.moveTo(-width / 2 + margin.left,  height / 2 - margin.bottom);     // x-axis
  axes.lineTo( width / 2 - margin.right, height / 2 - margin.bottom);
  axes.strokePath();

  // Container (start displaced for entrance animation)
  const container = scene.add.container(
    x,
    y + (entrance.fromYOffset || 0),
    [graphBG, axes]
  ).setAlpha(0);

  const maxVal = Math.max(...historyData, 1);
  const plotW  = width - margin.left - margin.right;
  const plotH  = height - margin.top - margin.bottom;
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
      line.lineStyle(2, colors.line, 0.8);
      line.beginPath();
      historyData.forEach((val, i) => {
        const px = -width / 2 + margin.left + dx * i;
        const py =  height / 2 - margin.bottom - (val / maxVal) * plotH;
        if (i === 0) line.moveTo(px, py); else line.lineTo(px, py);
      });
      line.strokePath();
      container.add(line);
      scene.tweens.add({ targets: line, alpha: 1, delay: 200, duration: 300 });

      // Title
      const title = scene.add.text(0, -height / 2 - 20, titleText, {
        fontFamily: 'Fredoka One',
        fontSize: '24px',
        color: colors.titleColor,
        stroke: colors.titleStroke,
        strokeThickness: 4,
      }).setOrigin(0.5, 1).setAlpha(0);
      container.add(title);
      scene.tweens.add({ targets: title, alpha: 1, delay: 300, duration: 300 });

      // Axis labels
      const labelStyle = { fontFamily: 'Fredoka One', fontSize: '16px', color: colors.labelColor };
      const yLabel = scene.add.text(
        -width / 2 + margin.left - 10,
        -height / 2 + margin.top,
        String(maxVal),
        labelStyle
      ).setOrigin(1, 0).setAlpha(0);
      container.add(yLabel);
      scene.tweens.add({ targets: yLabel, alpha: 1, delay: 400, duration: 250 });

      historyData.forEach((_, i) => {
        const xLabel = scene.add.text(
          -width / 2 + margin.left + dx * i,
          height / 2 - margin.bottom + 5,
          String(i + 1),
          labelStyle
        ).setOrigin(0.5, 0).setAlpha(0);
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
        const px = -width / 2 + margin.left + dx * i;
        const py =  height / 2 - margin.bottom - (val / maxVal) * plotH;
        const dot = scene.add.circle(px, py, 6, colors.dot)
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
          dot._tooltip = scene.add.text(px, py - 12, String(val), {
            fontFamily: 'Fredoka One', fontSize: '24px', color: colors.labelColor, stroke: '#fff', strokeThickness: 4
          }).setOrigin(0.5, 1).setDepth(11);
          container.add(dot._tooltip);
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
