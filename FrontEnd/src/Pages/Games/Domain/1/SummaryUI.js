// Shared Summary UI builder for Phaser scenes
// Provides a consistent summary section with:
//  - Animated summary text ("You got X correct on first try!")
//  - "Play Again" button with hover/press animations and restart callback
//  - Modular progress graph via buildProgressGraph
//
// Usage:
//   import { buildSummaryUI } from './SummaryUI';
//   buildSummaryUI(this, {
//     correct: this.correct,
//     total: this.total,
//     history: this.localHistory,
//     onRestart: () => this.scene.start('MainScene'),
//     graph: { x, y, width, height, titleText, entrance },
//     renderHeading: true,
//   });

import { buildProgressGraph } from './ProgressGraph';

export function buildSummaryUI(
  scene,
  {
    correct = 0,
    total = 0,
    history = [],
    onRestart,
    texts = {},
    graph = {},
    renderHeading = true,
  } = {}
) {
  const {
    heading = `You got ${correct} correct on first try!`,
    playAgain = 'Play Again',
  } = texts;

  // Compute DPR-aware responsive scaling relative to a reference 1000x750 board
  const dpr = scene.game?.renderer?.resolution || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const cssW = scene.scale.width / dpr;
  const cssH = scene.scale.height / dpr;
  const REF_W = 1000;
  const REF_H = 750;
  const sRef = Math.min(cssW / REF_W, cssH / REF_H);
  const isSmall = cssW <= 768 && cssH <= 1024;

  // Optional summary heading
  let summaryText;
  if (renderHeading && heading) {
    const headingCssPx = Math.max(18, Math.min(32, 36 * sRef));
    // Shift heading further up on small screens to free vertical space for the graph
    const headingY = isSmall ? scene.scale.height * 0.14 : scene.scale.height / 5;
    summaryText = scene.add
      .text(
        scene.scale.width / 2,
        headingY,
        heading,
        {
          fontFamily: 'Fredoka One',
          fontSize: `${headingCssPx * dpr}px`,
          color: '#fff',
          stroke: '#042539',
          strokeThickness: 6,
          align: 'center',
          wordWrap: { width: cssW * 0.9 * dpr, useAdvancedWrap: true },
        }
      )
      .setOrigin(0.5)
      .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6)
      .setAlpha(0);
    summaryText.setResolution(dpr);

    scene.tweens.add({
      targets: summaryText,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 800,
      ease: 'Back.easeOut',
    });
  }

  // Play Again button
  // Increase button size by 1.5x on small screens
  const btnScaleUp = isSmall ? 1.5 : 1;
  const btnFontCssPx = Math.max(14, Math.min(24, 32 * sRef)) * btnScaleUp;
  const btnText = scene.add
    .text(0, 0, playAgain, {
      fontFamily: 'Fredoka One',
      fontSize: `${btnFontCssPx * dpr}px`,
      color: '#042539',
    })
    .setOrigin(0.5);
  btnText.setResolution(dpr);

  const width = btnText.width + 32 * btnScaleUp;
  const height = btnText.height + 16 * btnScaleUp;
  const bg = scene.add.graphics();
  bg.fillStyle(0xffffff, 0.6);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
  bg.lineStyle(4, 0x042539, 1);
  bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);

  const x = scene.scale.width / 2;
  const y = scene.scale.height / 2;
  const restartButton = scene.add.container(x, y, [bg, btnText]);
  restartButton.setSize(width, height);
  restartButton.setInteractive({ useHandCursor: true });

  restartButton.on('pointerover', () => {
    scene.tweens.add({ targets: restartButton, scale: 1.05, duration: 200 });
    bg.clear();
    bg.fillStyle(0x57c785, 0.8);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(6, 0x042539, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    btnText.setColor('#ffffff');
  });

  restartButton.on('pointerout', () => {
    scene.tweens.add({ targets: restartButton, scale: 1, duration: 200 });
    bg.clear();
    bg.fillStyle(0xffffff, 0.6);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(4, 0x042539, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    btnText.setColor('#042539');
  });

  restartButton.on('pointerdown', () => {
    scene.tweens.add({
      targets: restartButton,
      scale: 1.15,
      duration: 200,
      ease: 'Circ.easeInOut',
      onComplete: () => {
        if (typeof onRestart === 'function') {
          onRestart();
        } else {
          // Prefer a shared regeneration hook if provided by the game
          const hook = scene.game && scene.game.reactHandleShuffle;
          if (typeof hook === 'function') {
            hook();
          } else if (scene.scene.isActive('MainScene')) {
            // Fallback: restart the main scene
            scene.scene.start('MainScene');
          }
        }
      },
    });
  });

  // Move the Play Again button further up on small screens
  const restartTargetY = isSmall ? scene.scale.height * 0.26 : scene.scale.height / 3;
  const restartFromY = isSmall ? scene.scale.height * 0.5 : scene.scale.height / 2 + 150 * sRef;
  scene.tweens.add({
    targets: restartButton,
    alpha: { from: 0, to: 1 },
    y: { from: restartFromY, to: restartTargetY },
    duration: 600,
    ease: 'Back.easeOut',
  });

  // Build shared progress graph with responsive scaling
  const {
    x: gx = scene.scale.width / 2,
    y: gy = scene.scale.height / 2 + 150,
    width: gwBase = 400,
    height: ghBase = 250,
    titleText = 'Progress Over Past 5 Attempts',
    entrance = { fromYOffset: 300, delay: 200 },
  } = graph || {};

  if (isSmall) {
    // Constrain the graph to the bottom half of the container on small screens
    const sidePadCss = Math.max(12, cssW * 0.05);
    const gwCss = Math.max(220, Math.min(gwBase * sRef, cssW - sidePadCss * 2));

    // Reserve bottom half area starting a bit below mid to leave room for button/heading
    const bottomTopCss = cssH * 0.55;
    const bottomPadCss = Math.max(12, cssH * 0.02);
    const availableBottomCss = Math.max(100, cssH - bottomTopCss - bottomPadCss);

    // Fit graph height into bottom area; leave some headroom for the graph title above the plot
    const titleGapCss = 18; // space for label above graph
    const ghCss = Math.max(140, Math.min(ghBase * sRef, availableBottomCss - titleGapCss));

    // Center the graph within bottom half
    const graphTopCss = bottomTopCss + (availableBottomCss - ghCss) / 2;
    const graphCenterY = (graphTopCss + ghCss / 2) * dpr;

    buildProgressGraph(scene, {
      x: scene.scale.width / 2,
      y: graphCenterY,
      width: gwCss * dpr,
      height: ghCss * dpr,
      data: history,
      titleText,
      entrance: { ...(entrance || {}), fromYOffset: (entrance?.fromYOffset || 0) * sRef },
    });
  } else {
    // Default behavior for larger screens
    // Scale provided x/y offsets proportionally relative to center
    const baseOffsetXCss = (gx - scene.scale.width / 2) / dpr;
    const baseOffsetYCss = (gy - scene.scale.height / 2) / dpr;
    const scaledOffsetX = baseOffsetXCss * sRef * dpr;
    const scaledOffsetY = baseOffsetYCss * sRef * dpr;

    // Keep the graph readable
    const gw = gwBase * sRef; // CSS px
    const minGraphCssH = 180; // minimum CSS px height to avoid squishing
    const gh = Math.max(ghBase * sRef, minGraphCssH);

    buildProgressGraph(scene, {
      x: scene.scale.width / 2 + scaledOffsetX,
      y: scene.scale.height / 2 + scaledOffsetY,
      width: gw * dpr,
      height: gh * dpr,
      data: history,
      titleText,
      entrance: { ...(entrance || {}), fromYOffset: (entrance?.fromYOffset || 0) * sRef },
    });
  }

  return { summaryText, restartButton };
}
