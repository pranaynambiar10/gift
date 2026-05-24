// src/zoomPlayer.js

/**
 * A highly-optimized scroll-bound 2D Canvas Zoom & Parallax Engine.
 * Loads a generated high-fidelity background image (the temple courtyard),
 * and zooms/pans into it seamlessly based on scroll progress to simulate
 * a cinematic 3D walk through the archway.
 */

export class ZoomPlayer {
  constructor(canvas, imageUrl, onLoadCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.imageUrl = imageUrl;
    this.onLoadCallback = onLoadCallback;

    // Load assets
    this.image = new Image();
    this.isLoaded = false;
    
    // Zoom and pan interpolation states
    this.scale = 1.0;
    this.targetScale = 1.0;
    
    this.panY = 0;
    this.targetPanY = 0;

    this.lerpSpeed = 0.08; // Buttery smooth glide speed

    this.init();
  }

  init() {
    this.image.src = this.imageUrl;
    this.image.onload = () => {
      this.isLoaded = true;
      console.log("⛩️ Cinematic temple courtyard asset preloaded successfully.");
      if (this.onLoadCallback) this.onLoadCallback();
    };

    // Safety fallback trigger
    setTimeout(() => {
      if (!this.isLoaded) {
        this.isLoaded = true;
        if (this.onLoadCallback) this.onLoadCallback();
      }
    }, 1500);
  }

  /**
   * Maps global scroll progress to active zoom ratios
   * @param {number} scrollRatio - Global scroll percentage (0 to 1)
   */
  updateScroll(scrollRatio) {
    if (!this.isLoaded) return;

    // The zoom phase occurs between 15% and 80% scroll
    let zoomProgress = 0;
    
    if (scrollRatio < 0.15) {
      zoomProgress = 0;
    } else if (scrollRatio > 0.80) {
      zoomProgress = 1;
    } else {
      // Normalize zoomProgress from 0 to 1 inside the 15%-80% scroll window
      zoomProgress = (scrollRatio - 0.15) / 0.65;
    }

    // Zoom from 1.0x (normal cover) up to 2.0x zoom
    this.targetScale = 1.0 + zoomProgress * 1.0;
    
    // Pan Y upwards slightly (simulating looking up at the high temple tower as you walk in)
    this.targetPanY = zoomProgress * (this.canvas.height * 0.12);
  }

  /**
   * Lerps zoom and pan variables inside requestAnimationFrame
   */
  update() {
    if (!this.isLoaded) return;

    // Smooth scale interpolation
    this.scale += (this.targetScale - this.scale) * this.lerpSpeed;

    // Smooth pan Y interpolation
    this.panY += (this.targetPanY - this.panY) * this.lerpSpeed;
  }

  /**
   * Renders the cover-cropped image with active zoom and pan modifications
   */
  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (!this.isLoaded || !this.image.complete) {
      // Shifting royal background loader gradient
      const grad = this.ctx.createRadialGradient(
        w / 2, h / 2, 50,
        w / 2, h / 2, Math.max(w, h)
      );
      grad.addColorStop(0, '#2E050A'); // Warm crimson
      grad.addColorStop(1, '#050002'); // Midnight black
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
      return;
    }

    this.ctx.save();
    
    // Translate origin to screen center, applying Y panning
    this.ctx.translate(w / 2, h / 2 - this.panY);
    
    // Scale canvas around centered origin
    this.ctx.scale(this.scale, this.scale);

    // Render cover-cropped centered image
    this.drawImageCoverCentered(this.ctx, this.image, 0, 0, w, h);

    this.ctx.restore();
  }

  /**
   * Premium responsive cover-crop centered algorithm
   */
  drawImageCoverCentered(ctx, img, cx, cy, w, h) {
    const imgWidth = img.width;
    const imgHeight = img.height;

    if (!imgWidth || !imgHeight) return;

    // Maintain ratio covers
    const r = Math.max(w / imgWidth, h / imgHeight);
    const nw = imgWidth * r;
    const nh = imgHeight * r;

    // Draw centered on (cx, cy)
    ctx.drawImage(img, cx - nw / 2, cy - nh / 2, nw, nh);
  }
}
