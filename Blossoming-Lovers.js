
/*
Using complementary colors represents two different people with a unique set of life experiences. Then, when the two sets of
hills begin to overlap, the two palettes go from becoming uniquely monochrome to blending together and mixing, representing
the process of falling in love. At the point of overlap, a tree begins to blossom that represents the relationship as it contains 
the colors of both people. Lastly, when the colors are fully overlapped, the foreground and focal point are created by the 
fully blossomed tree and the background are the sets of hills. The focal point is generated only from colors because the 
brightness is much higher/more clear on the tree's colors. The hills in the background also show some ideas from atmospheric perspective
from the varying opacities.

*/
let noiseLeft = 0.0;  // Noise for the left side
let noiseRight = 1000.0;  // Noise for the right side (start at a different point)
let offset = 0.003;
let speed = 1;
let hillOffsets = [];

let tree = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  
  // Generate hill offsets for consistent noise patterns
  for (let i = 0; i < 3; i++) {
    hillOffsets.push(random(0, 1000));  // Random initial noise for each hill
  }
	
	let start = createVector(width / 2, height);
	let dir = createVector(0, -1);

	// Initialize the first branch with a starting color (blue)
	let b = new Branch(start, dir, 80, color(0, 0, 255)); // Starting branch is blue
	tree.push(b);
	
}

function draw() {
  let leftXEnd = map(frameCount * speed, 0, width, 0, width);
  let rightXStart = map(frameCount * speed, 0, width, width, 0);

  // Stop once the hills meet in the middle
  if (leftXEnd >= width) {
    noLoop();
  }
  
  // Clear the background
  background(255); // Clear the canvas before drawing
  
  // Draw the left side with orange background and hills
	noStroke();
  drawBackgroundAndHills(color(30, 80, 80, 40), 0, leftXEnd, noiseLeft); // Orange

  // Draw the right side with blue background and hills
	drawBackgroundAndHills2(color(210, 80, 80, 20), rightXStart, width, noiseRight); // Blue
	
	if (leftXEnd >= width / 2) {
		for (let i = tree.length - 1; i >= 0; i--) {
			let b = tree[i];
			b.update();
			b.show();
			if (b.timeToBranch()) {
				if (tree.length < 1023) {
					// Angle that branch grows at is random
					tree.push(b.branch(random(10, 25)));  // Add one going right
					tree.push(b.branch(random(-25, -10))); // Add one going left
				}
			}
		}
	}

}

// Draws the hills from the left side
function drawBackgroundAndHills(hillColor, xStart, xEnd, noiseStart) {
	// Draws rectangle in the back which serves as the background
	fill(hillColor);
	rect(0, 0, xEnd, height);
	
	// Draw three layers of hills, each with a different vertical offset
  for (let i = 0; i < hillOffsets.length; i++) {
    drawHill(hillColor, noiseStart + hillOffsets[i], xStart, xEnd, i * 150); 
  }
}

// Draws the hills and background from the right side
function drawBackgroundAndHills2(hillColor, xStart, xEnd, noiseStart) {
	fill(hillColor);
	rect(xStart, 0, width, height);
	
  // Draw three layers of hills, each with a different vertical offset
  for (let i = 0; i < hillOffsets.length; i++) {
    drawHill2(hillColor, noiseStart + hillOffsets[i], xStart, xEnd, i * 150);
  }
}

// Draw the hills from the left side
function drawHill(hillColor, noiseStart, xStart, xEnd, yOffset) {
  fill(hillColor);
  beginShape();
  vertex(xStart, height);

  let incrementedNoiseStart = noiseStart; 

  for (let x = xStart; x < xEnd; x++) {
		// GPT used to understand how noise works
    let y = noise(incrementedNoiseStart) * height; 
    vertex(x, y + yOffset);
    incrementedNoiseStart += offset; 
  }

  vertex(xEnd, height);
  endShape(CLOSE);
}

// Draw hills from the right side (different because of where the shape for the vertex starts)
function drawHill2(hillColor, noiseStart, xStart, xEnd, yOffset) {
  fill(hillColor);
  beginShape();
  vertex(xEnd, height);

  let incrementedNoiseStart = noiseStart;

  for (let x = xEnd; x > xStart; x--) {
    let y = noise(incrementedNoiseStart) * height;
    vertex(x, y + yOffset);
    incrementedNoiseStart -= offset;  
  }

  vertex(xStart, height);
  endShape(CLOSE);
}

// https://editor.p5js.org/natureofcode/sketches/mR4_GpQS- 
// The base code for this branch class is derived almost entirely from the above library
// Modifications that I made were to the velocity of growing, and the coloring/weight of branches of the tree
class Branch {
  constructor(startPos, velocity, timerStart) {
    this.start = startPos.copy();
    this.end = startPos.copy();
		
    this.timerStart = timerStart;
    this.timer = this.timerStart;
		
		this.vel = velocity.copy();
		
    this.growing = true;
    
    // Randomly assign either blue or orange when the branch is created
    this.branchColor = floor(random(2)) ? "orange" : "blue";
  }

  update() {
    if (this.growing) {
      this.end.add(this.vel);
    }
  }

  show() {
		strokeWeight(2);
    stroke(this.branchColor); // Always use the assigned color
    line(this.start.x, this.start.y, this.end.x, this.end.y);
  }

  timeToBranch() {
    this.timer--;
    if (this.timer < 0 && this.growing) {
      this.growing = false;
      return true;
    } else {
      return false;
    }
  }

  branch(angle) {
    let theta = this.vel.heading();
    let mag = this.vel.mag();
    theta += radians(angle);
		
    let newVel = p5.Vector.fromAngle(theta);
    newVel.setMag(mag);
    return new Branch(this.end, newVel, this.timerStart * 0.85);
  }
}
