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

  // Optional summary heading
  let summaryText;
  if (renderHeading && heading) {
    summaryText = scene.add
      .text(
        scene.scale.width / 2,
        scene.scale.height / 5,
        heading,
        {
          fontFamily: 'Fredoka One',
          fontSize: '36px',
          color: '#fff',
          stroke: '#042539',
          strokeThickness: 6,
        }
      )
      .setOrigin(0.5)
      .setShadow(2, 2, 'rgba(4, 37, 57, 0.8)', 6)
      .setAlpha(0);

    scene.tweens.add({
      targets: summaryText,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 800,
      ease: 'Back.easeOut',
    });
  }

  // Play Again button
  const btnText = scene.add
    .text(0, 0, playAgain, {
      fontFamily: 'Fredoka One',
      fontSize: '32px',
      color: '#042539',
    })
    .setOrigin(0.5);

  const width = btnText.width + 32;
  const height = btnText.height + 16;
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
          // Default: restart the main scene if named 'MainScene'
          if (scene.scene.isActive('MainScene')) {
            scene.scene.start('MainScene');
          }
        }
      },
    });
  });

  scene.tweens.add({
    targets: restartButton,
    alpha: { from: 0, to: 1 },
    y: { from: scene.scale.height / 2 + 150, to: scene.scale.height / 3 },
    duration: 600,
    ease: 'Back.easeOut',
  });

  // Build shared progress graph
  const {
    x: gx = scene.scale.width / 2,
    y: gy = scene.scale.height / 2 + 150,
    width: gw = 400,
    height: gh = 250,
    titleText = 'Progress Over Past 5 Attempts',
    entrance = { fromYOffset: 300, delay: 200 },
  } = graph || {};

  buildProgressGraph(scene, {
    x: gx,
    y: gy,
    width: gw,
    height: gh,
    data: history,
    titleText,
    entrance,
  });

  return { summaryText, restartButton };
}
