/**
 * Build a minimal sign-up benefits screen for unauthenticated users.
 * This is a lightweight version focused on performance and clarity.
 */
export function buildSignUpBenefitsUI(scene, options = {}) {
  const {
    correct,
    onSignIn,
    texts = {},
  } = options;

  const {
    scoreTitle = "Your Score",
    benefitText = "Sign in to save your score and track progress.",
  } = texts;

  const x = scene.scale.width / 2;
  const y = scene.scale.height / 2;
  const dpr = scene.game?.renderer?.resolution || 1;

  // Dim the background slightly to make text more readable
  const overlay = scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
  overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);

  // --- Text Elements (with larger fonts and strokes) ---

  // 1. Score Title
  const scoreTitleText = scene.add.text(x, y - 200, scoreTitle, {
    fontFamily: "Fredoka One",
    fontSize: `${70 * dpr}px`, // Increased size
    color: "#ffffff",
    align: 'center',
  }).setOrigin(0.5);
  scoreTitleText.setStroke('#000000', 5 * dpr); // Added stroke for visibility
  scoreTitleText.setResolution(dpr);

  // 2. Score Value
  const scoreValueText = scene.add.text(x, y - 100, correct, {
    fontFamily: "Fredoka One",
    fontSize: `${64 * dpr}px`, // Increased size
    color: "#ffffff",
    align: 'center',
  }).setOrigin(0.5);
  scoreValueText.setStroke('#000000', 6 * dpr); // Added stroke
  scoreValueText.setResolution(dpr);

  // 3. Benefit Line
  const benefitLine = scene.add.text(x, y + 50, benefitText, {
    fontFamily: "Fredoka One", // Changed font for consistency
    fontSize: `${50 * dpr}px`, // Increased size
    color: "#eeeeee",
    align: 'center',
    wordWrap: { width: (scene.scale.width * 0.8) * dpr }
  }).setOrigin(0.5);
  benefitLine.setStroke('#000000', 4 * dpr); // Added stroke
  benefitLine.setResolution(dpr);

  // 4. Sign In Button
  const buttonWidth = 280;
  const buttonHeight = 65;
  const buttonY = y + 150;

  // Button Shadow
  const signInShadow = scene.add.graphics();
  signInShadow.fillStyle(0x000000, 0.25);
  signInShadow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 + 8, buttonWidth, buttonHeight, 32);

  const signInBg = scene.add.graphics();
  signInBg.fillStyle(0xf97544, 1); // Orange color from brand
  signInBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 32);

  const signInButtonText = scene.add.text(0, 0, "Sign In", { // Hardcoded text
    fontFamily: "Fredoka One",
    fontSize: `${45 * dpr}px`, // Increased size
    color: "#ffffff",
  }).setOrigin(0.5);
  signInButtonText.setResolution(dpr);

  const signInButton = scene.add.container(x, buttonY, [signInShadow, signInBg, signInButtonText]);
  signInButton.setSize(buttonWidth, buttonHeight);
  signInButton.setInteractive({ useHandCursor: true });

  // --- Event Handlers ---

  signInButton.on('pointerdown', () => {
    // Press-down effect
    scene.tweens.add({
      targets: signInButton,
      y: buttonY + 8, // Move button down
      duration: 100,
      ease: 'Power1'
    });
    scene.tweens.add({
      targets: signInShadow,
      y: 0, // Hide shadow
      duration: 100,
      ease: 'Power1'
    });
  });

  signInButton.on('pointerup', () => {
    // Release effect
    scene.tweens.add({
      targets: signInButton,
      y: buttonY, // Move button back up
      duration: 100,
      ease: 'Power1',
      onComplete: () => {
        if (onSignIn) {
          onSignIn();
        }
      }
    });
     scene.tweens.add({
      targets: signInShadow,
      y: 8, // Restore shadow
      duration: 100,
      ease: 'Power1'
    });
  });

  signInButton.on('pointerover', () => {
    scene.tweens.add({ targets: signInButton, scale: 1.03, duration: 150 });
  });

  signInButton.on('pointerout', () => {
    scene.tweens.add({ targets: signInButton, scale: 1.0, duration: 150 });
    // Also reset position if pointer leaves while pressed
    scene.tweens.add({ targets: signInButton, y: buttonY, duration: 100 });
    scene.tweens.add({ targets: signInShadow, y: 8, duration: 100 });
  });

  // --- Entrance Animation (Simple Fade-in) ---
  const allElements = [overlay, scoreTitleText, scoreValueText, benefitLine, signInButton];
  allElements.forEach(el => {
    el.setAlpha(0);
    scene.tweens.add({
      targets: el,
      alpha: el === overlay ? 0.5 : 1,
      duration: 500,
      ease: 'Power1'
    });
  });

  return {
    overlay,
    scoreTitleText,
    scoreValueText,
    benefitLine,
    signInButton,
  };
}