let numSets = 5; // Number of sets of rings
let numRings = 4; // Number of rings in each set
let setDetails = [
  { startRadius: 80, radiusStep: 5, x: -200, y: -200, numCircles: 50 },
  { startRadius: 110, radiusStep: 5, x: -50, y: -130, numCircles: 70 },
  { startRadius: 120, radiusStep: 5, x: 150, y: -150, numCircles: 90 },
  { startRadius: 140, radiusStep: 5, x: -150, y: 50, numCircles: 110 },
  { startRadius: 160, radiusStep: 5, x: 80, y: 100, numCircles: 130 }
];
let angleOffsets = [0, 0, 0, 0, 0] 

function setup() {
  createCanvas(600, 600);
  noStroke();
}

function drawCircle(radius, numCircles, direction, angleOffset) {
  let angleStep = TWO_PI / numCircles;
  for (let i = 0; i < numCircles; i++) {
    let angle = i * angleStep + angleOffset;
    let x = radius * cos(angle);
    let y = radius * sin(angle);
    
    fill(255);
    ellipse(direction * x, y, 5, 5); // Draw small circles within each ring
  }
}

function draw() {
  background(0);
  
  for (let setIndex = 0; setIndex < numSets; setIndex++) {
		// {GPT}: used to understand how to translate center of canvas and how push and pop work
    let { startRadius, radiusStep, x, y, numCircles } = setDetails[setIndex];
    
    push();
    translate(width / 2 + x, height / 2 + y);
    
    // Draw the central dot for the current set
    fill(255);
    ellipse(0, 0, 5, 5); // Central dot
    
    // Draw the rings for the current set
    for (let ringIndex = 0; ringIndex < numRings; ringIndex++) {
			let direction = 1
			if (ringIndex % 2 == 1) {
				direction = -1
			}
      let radius = startRadius - ringIndex * radiusStep;
      drawCircle(radius, numCircles, direction, angleOffsets[setIndex]);
    }
  
    angleOffsets[setIndex] += 0.005; 
    
    pop();
  }
}
