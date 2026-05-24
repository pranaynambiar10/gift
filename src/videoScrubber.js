// src/videoScrubber.js

/**
 * A highly-optimized, lerped scroll-driven video frame scrubber.
 * Controls a hidden video element, syncing its playback currentTime 
 * with the page scroll progress smoothly, and drawing frames onto a Canvas.
 * Includes absolute safety fallback states for CORS, network block, and mobile constraints.
 */

export class VideoScrubber {
  constructor(canvas, videoUrl, onLoadCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.videoUrl = videoUrl;
    this.onLoadCallback = onLoadCallback;
    
    // Core parameters
    this.video = null;
    this.isLoaded = false;
    this.useFallback = false;
    this.duration = 0;
    
    // Playback and lerp variables
    this.targetTime = 0;
    this.currentTime = 0;
    this.lerpSpeed = 0.08; // Balances instantaneous tracking vs premium fluid slide
    
    this.init();
  }

  init() {
    // Create background video element with proper attributes for iOS/safari autoplay policies
    this.video = document.createElement('video');
    this.video.src = this.videoUrl;
    this.video.setAttribute('preload', 'auto');
    this.video.setAttribute('muted', 'true');
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.crossOrigin = 'anonymous';
    this.video.muted = true;
    
    // Force DOM attachment hidden to satisfy strict browser preload policies
    this.video.style.position = 'fixed';
    this.video.style.width = '1px';
    this.video.style.height = '1px';
    this.video.style.opacity = '0.01';
    this.video.style.pointerEvents = 'none';
    this.video.style.bottom = '0';
    this.video.style.right = '0';
    this.video.style.zIndex = '-999';
    document.body.appendChild(this.video);

    this.video.load();

    // Trigger loaded metadata event
    const handleLoad = () => {
      if (this.isLoaded) return;
      this.duration = this.video.duration || 10;
      this.isLoaded = true;
      console.log("💍 Cinematic background video preloaded successfully. Duration: ", this.duration);
      if (this.onLoadCallback) this.onLoadCallback(this.duration);
    };

    // Listeners for load completion
    this.video.addEventListener('loadedmetadata', handleLoad);
    this.video.addEventListener('canplaythrough', handleLoad);

    // CRITICAL: Safety preloader timeout fallback (2.2 seconds max delay)
    // Ensures that the website will NEVER get stuck on a loading screen on slower connections or if CORS is blocked!
    setTimeout(() => {
      if (!this.isLoaded) {
        console.warn("⏳ Video loading delayed or blocked by browser security. Initializing luxury generative background...");
        this.isLoaded = true;
        this.useFallback = true;
        this.duration = 10; // Simulated duration for scroll milestones
        if (this.onLoadCallback) this.onLoadCallback(this.duration);
      }
    }, 2200);
  }

  /**
   * Updates target playback position based on scroll percentage.
   * @param {number} scrollRatio - Value between 0 and 1.
   */
  updateScroll(scrollRatio) {
    if (!this.isLoaded || !this.duration) return;
    this.targetTime = scrollRatio * (this.duration - 0.05);
  }

  /**
   * Applies smooth linear interpolation (lerping) and updates video currentTime.
   */
  update() {
    if (!this.isLoaded || this.useFallback) return;

    const diff = this.targetTime - this.currentTime;
    
    if (Math.abs(diff) < 0.001) {
      this.currentTime = this.targetTime;
    } else {
      this.currentTime += diff * this.lerpSpeed;
    }

    try {
      this.video.currentTime = Math.max(0, Math.min(this.currentTime, this.duration));
    } catch (err) {
      // Catch native browser time seek bounds warnings
    }
  }

  /**
   * Draws a breathtaking slowly swaying royal crimson radial gradient mimicking the sacred fire
   */
  drawFallbackGradient() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Slow mathematical swaying based on current time
    const time = Date.now() * 0.001;
    const cx = w / 2 + Math.sin(time * 0.5) * (w * 0.15);
    const cy = h / 2 + Math.cos(time * 0.4) * (h * 0.15);
    
    const grad = this.ctx.createRadialGradient(
      cx, cy, 30,
      w / 2, h / 2, Math.max(w, h) * 0.8
    );
    
    grad.addColorStop(0, '#320208');   // Rich Warm Rose Crimson
    grad.addColorStop(0.4, '#130104'); // Royal Midnight Deep Crimson
    grad.addColorStop(1, '#050002');   // Midnight Charcoal Black
    
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);
  }

  /**
   * Draws current video frame scaled to cover the entire canvas.
   * Includes complete try/catch security wrap to prevent CORS crashes from halting execution.
   */
  draw() {
    if (!this.isLoaded) {
      this.drawFallbackGradient();
      return;
    }

    try {
      if (this.useFallback || !this.video) {
        this.drawFallbackGradient();
        return;
      }

      // Draw the video frame to cover
      this.drawImageCover(this.ctx, this.video, 0, 0, this.canvas.width, this.canvas.height);
    } catch (error) {
      // Caught CORS / SecurityError. Switch instantly to the premium gradient fallback
      console.warn("🛡️ CORS security exception caught (browser blocked canvas draw). Running luxury shifting gradient fallback: ", error);
      this.useFallback = true;
      this.drawFallbackGradient();
    }
  }

  /**
   * Cover-cropping logic ensuring high-end aspect ratios on all screens
   */
  drawImageCover(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) {
    const imgWidth = img.videoWidth || img.width;
    const imgHeight = img.videoHeight || img.height;

    if (!imgWidth || !imgHeight) {
      this.drawFallbackGradient();
      return;
    }

    const r = Math.min(w / imgWidth, h / imgHeight);
    
    let nw = imgWidth * r; 
    let nh = imgHeight * r; 
    let cx, cy, cw, ch;

    let s = 1;

    if (Math.abs(nw - w) < 0.01) {
      s = w / nw;
    }
    if (Math.abs(nh - h) < 0.01) {
      s = h / nh;
    }

    nw *= s;
    nh *= s;

    cw = imgWidth / (nw / w);
    ch = imgHeight / (nh / h);

    cx = (imgWidth - cw) * offsetX;
    cy = (imgHeight - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > imgWidth) cw = imgWidth;
    if (ch > imgHeight) ch = imgHeight;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  }
}
