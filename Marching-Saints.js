// Visual portrait for When the Saints go Marching In
// Color scheme relies on split complementary palette (purple, yellow, green) representing typical New Orleans/Jazz colors and 
// also emphasizing all the diverse tones and sounds heard in the song. Begins in greyscale since the song was actually typically
// played most often in funeral processions, so greyscale captures the idea of death and somberness. 
// But increasing saturation/brightness of colors as well as frequency of fireworks shows celebration of life and 
// more positive energy. Splashes of color and wave movement as fireworks move upwards capture energy of song.


let fireworks = [];
let gravity;
let lastUpdate = 0;
let maxSaturation = 100; 
let currentSaturation = 0;
let currentBrightness = 0;
let maxBrightness = 100;

// make the frequency of fireworks increase over time

function setup() {
  createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 360, 100, 100, 100);
	// GPT used for help with vector logic
  gravity = createVector(0, 0.13); // gravity effect for the particles
  stroke(255);
  strokeWeight(20);
}

function draw() {
  background(0);
  
  if (random(1) < 0.02 * millis()/5000 && millis() <= 45000) {
    fireworks.push(new Firework());
  }

  
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

class Firework {
  constructor() {
		// Set the color of the firework randomly, to be gold, purple, or green (split complementary)
		let colorRandomVar = floor(random(3))
		if (colorRandomVar == 0) {
			colorRandomVar = 100;
		} else if (colorRandomVar == 1) {
			colorRandomVar = 47;
		} else {
			colorRandomVar = 275;
		}
		
		if (millis() - lastUpdate > 1000) { // Check if 1 second has passed
			currentSaturation += 6; // If 1 second has passed, update saturation and brightness
			currentBrightness += 10;
			currentSaturation = constrain(currentSaturation, 0, maxSaturation);
			currentBrightness = constrain(currentBrightness, 0, maxBrightness);
			lastUpdate = millis(); // Update the last update time
		}
		
    this.firework = new Particle(random(width/10, width * (9/10)), height, true, color(colorRandomVar, currentSaturation, currentBrightness));
    this.exploded = false;
    this.particles = [];
  }
  
  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
			this.firework.pos.x += sin(frameCount * 0.05) * 2; // Amplitude of 2
      this.firework.update();
      
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  explode() {
    for (let i = 0; i < random(100, 200); i++) {
      let p = new Particle(this.firework.pos.x, this.firework.pos.y, false, this.firework.myColor);
      this.particles.push(p);
    }
  }
  
  done() {
    return this.exploded && this.particles.length === 0;
  }
  
  show() {
    if (!this.exploded) {
      this.firework.show();
    }
    
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

class Particle {
  constructor(x, y, firework, myColor) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 200;
		this.myColor = myColor;
    
    if (this.firework) {
			// height that the fireworks can go up to
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(1, 15));
    }
    
    this.acc = createVector(0, 0);
  }
  
	// Force code and updating code for firework written with help of GPT
  applyForce(force) {
    this.acc.add(force);
  }
  
  update() {
    if (!this.firework) {
			// firework spread
      this.vel.mult(random(0.8, 0.85));
      this.lifespan -= 2;
    }
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  done() {
    return this.lifespan <= 0;
  }
  
  show() {
    if (!this.firework) {
      strokeWeight(5);
			stroke(hue(this.myColor), saturation(this.myColor), brightness(this.myColor), this.lifespan);
    } else {
      strokeWeight(10);
			stroke(hue(this.myColor), saturation(this.myColor), brightness(this.myColor));
    }
    point(this.pos.x, this.pos.y);
  }
}
