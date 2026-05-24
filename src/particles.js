// src/particles.js

/**
 * Highly optimized creative canvas physics engine.
 * Renders floating marigold petals and glittering gold dust particles
 * drifting upwards (anti-gravity) and reacting fluidly to mouse movement.
 */

class GoldDust {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true);
  }

  reset(canvasWidth, canvasHeight, init = false) {
    this.x = Math.random() * canvasWidth;
    this.y = init ? Math.random() * canvasHeight : canvasHeight + 10;
    this.size = 1 + Math.random() * 2.5; // Small glittering particles
    this.alpha = 0.2 + Math.random() * 0.7;
    this.speedY = -(0.2 + Math.random() * 0.6); // Float upwards
    this.speedX = -0.2 + Math.random() * 0.4;
    this.angle = Math.random() * Math.PI * 2;
    this.shimmerSpeed = 0.01 + Math.random() * 0.02;
    
    // Physics velocity offsets for mouse interaction
    this.vx = 0;
    this.vy = 0;
  }

  update(canvasWidth, canvasHeight, mouse) {
    // Shimmer effect
    this.angle += this.shimmerSpeed;
    this.alpha = 0.2 + Math.abs(Math.sin(this.angle)) * 0.7;

    // Mouse repulsion physics
    let dx = this.x - mouse.x;
    let dy = this.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100) {
      let force = (100 - dist) / 100;
      let forceAngle = Math.atan2(dy, dx);
      this.vx += Math.cos(forceAngle) * force * 0.8;
      this.vy += Math.sin(forceAngle) * force * 0.8;
    }

    // Apply velocities and drag
    this.x += this.speedX + this.vx;
    this.y += this.speedY + this.vy;
    
    this.vx *= 0.95; // High friction
    this.vy *= 0.95;

    // Reset if offscreen
    if (this.y < -10 || this.x < -10 || this.x > canvasWidth + 10) {
      this.reset(canvasWidth, canvasHeight, false);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`; // Matte Gold
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = '#D4AF37';
    ctx.fill();
    ctx.restore();
  }
}

class MarigoldPetal {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true);
  }

  reset(canvasWidth, canvasHeight, init = false) {
    this.x = Math.random() * canvasWidth;
    this.y = init ? Math.random() * canvasHeight : canvasHeight + 20;
    this.size = 6 + Math.random() * 12; // Realistic visible sizes
    this.speedY = -(0.4 + Math.random() * 0.8); // Anti-gravity upward float
    this.swaySpeed = 0.005 + Math.random() * 0.015;
    this.swayAmplitude = 0.2 + Math.random() * 0.6;
    this.swayOffset = Math.random() * Math.PI * 2;
    
    // Color variants: Saffron Orange and Marigold Yellow-Gold
    const colors = [
      { r: 224, g: 96, b: 20 },   // Saffron Orange
      { r: 240, g: 176, b: 16 },  // Golden Yellow
      { r: 212, g: 76, b: 15 },   // Crimson Orange
      { r: 180, g: 14, b: 25 }    // Royal Crimson Petal
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = 0.6 + Math.random() * 0.4;
    
    // Rotational angles for realistic 3D tumbling
    this.angleX = Math.random() * Math.PI;
    this.angleY = Math.random() * Math.PI;
    this.rotSpeedX = 0.005 + Math.random() * 0.015;
    this.rotSpeedY = 0.005 + Math.random() * 0.015;
    
    // Friction velocities
    this.vx = 0;
    this.vy = 0;
  }

  update(canvasWidth, canvasHeight, mouse, time) {
    // 3D tumbling rotators
    this.angleX += this.rotSpeedX;
    this.angleY += this.rotSpeedY;

    // Horizontal swaying using sine waves
    let sway = Math.sin(time * this.swaySpeed + this.swayOffset) * this.swayAmplitude;

    // Mouse Repulsion physics
    let dx = this.x - mouse.x;
    let dy = this.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      let force = (150 - dist) / 150;
      let forceAngle = Math.atan2(dy, dx);
      // Gentle floating push away from mouse
      this.vx += Math.cos(forceAngle) * force * 2.2;
      this.vy += Math.sin(forceAngle) * force * 2.2;
    }

    // Apply updates
    this.x += sway + this.vx;
    this.y += this.speedY + this.vy;

    // Apply atmospheric drag (slowly return to normal upward float)
    this.vx *= 0.94;
    this.vy *= 0.94;

    // Reset if offscreen bounds
    if (this.y < -20 || this.x < -20 || this.x > canvasWidth + 20) {
      this.reset(canvasWidth, canvasHeight, false);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Apply 3D-looking scaling based on rotation angles
    let scaleX = Math.sin(this.angleX);
    let scaleY = Math.cos(this.angleY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(this.angleX + this.angleY);

    ctx.beginPath();
    // Drawing a high-quality stylized marigold petal using bezier curves
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -this.size / 2, -this.size / 3, 
      -this.size * 0.7, -this.size, 
      0, -this.size * 1.3
    );
    ctx.bezierCurveTo(
      this.size * 0.7, -this.size, 
      this.size / 2, -this.size / 3, 
      0, 0
    );

    // Dynamic Saffron / Gold gradient to give volume and realism
    let grad = ctx.createLinearGradient(0, 0, 0, -this.size * 1.3);
    grad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
    grad.addColorStop(0.7, `rgba(${this.color.r + 20 > 255 ? 255 : this.color.r + 20}, ${this.color.g + 15 > 255 ? 255 : this.color.g + 15}, ${this.color.b}, ${this.alpha * 0.9})`);
    grad.addColorStop(1, `rgba(212, 175, 55, ${this.alpha * 0.85})`); // Gold tip

    ctx.fillStyle = grad;
    
    // Subtle golden rim outline
    ctx.strokeStyle = `rgba(212, 175, 55, ${this.alpha * 0.4})`;
    ctx.lineWidth = 0.5;
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
}

export class AntiGravityParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.time = 0;

    this.init();
    this.setupListeners();
  }

  init() {
    this.resize();
    this.particles = [];
    
    // Density calculation based on screen size (prevent overload on mobile)
    const area = this.canvas.width * this.canvas.height;
    const dustCount = Math.min(Math.floor(area / 12000), 120);
    const petalCount = Math.min(Math.floor(area / 35000), 35);

    // Instantiate Gold Dust
    for (let i = 0; i < dustCount; i++) {
      this.particles.push(new GoldDust(this.canvas.width, this.canvas.height));
    }

    // Instantiate Marigold Petals
    for (let i = 0; i < petalCount; i++) {
      this.particles.push(new MarigoldPetal(this.canvas.width, this.canvas.height));
    }
  }

  setupListeners() {
    // Mouse movement listener
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    // Hide cursor tracking when off window
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Resizing debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.init();
      }, 250);
    });
  }

  resize() {
    // Set actual layout display dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  update() {
    this.time += 1;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Update all active items
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(width, height, this.mouse, this.time);
    }
  }

  draw() {
    // Renders particles on top of whatever was drawn previously (the video frames)
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
    }
  }
}
