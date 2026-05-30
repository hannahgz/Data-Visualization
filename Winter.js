let lastSecondRecorded = -1;
let lastHourRecorded = -1;
let drops = [];
let bucketCapacity = 60;
let done = false;
let stars = [];


function drawExistingDrops() {
  for (let i = 0; i < lastSecond; i++) {
    let drop = new Drop(random(0, windowWidth), height - 204, i);
    drops.push(drop);
  }
}

// Initialize all the starting conditions
function setup() {
  createCanvas(windowWidth, windowHeight);
	lastSecond = second(); 
  drawExistingDrops();
	lastHourRecorded = hour() % 12;
	if (lastHourRecorded == 0) {
		lastHourRecorded += 12;
	}
	for (let i = 0; i < lastHourRecorded; i++) {
		let x = width/12 * i + width/24;
    let y = height - 560; // Height of the trees (top position)
		stars.push(new Star(x, y));
	}
}

function drawChristmasTree(x, y, treeWidth, treeHeight) {
  let trunkHeight = treeHeight / 5;
  let trunkWidth = treeWidth / 4;

  // Draw tree trunk
  fill(139, 69, 19); // brown color
  rect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight + 10);

  // Draw tree (5 green triangles with snow on the bottom)
  for (let i = 0; i < 5; i++) {
    let levelWidth = treeWidth - i * treeWidth / 6;
    let levelHeight = treeHeight / 5;
    let levelY = y - trunkHeight - i * levelHeight;
    
    // Green part of the tree
		noStroke();
    fill(0, 128, 0); // green color
    triangle(x, levelY - levelHeight, x - levelWidth / 2, levelY, x + levelWidth / 2, levelY);
  }

}

// Star class to handle movement and fading trail with history
// GPT used for the Star class, especially for the ampersand-like curve movement
class Star {
  constructor(centerX, centerY) {
    this.centerX = centerX; // Starting position of the star
    this.centerY = centerY;
    this.t = random(0, TWO_PI); // Time variable for each star (different starting positions)
    this.history = []; // Store history of positions for the trail
  }

  move() {
    // Parametric equation to mimic an ampersand-like curve, interesting pattern
    let x = 50 * sin(2 * this.t) + 25 * cos(this.t); // Horizontal movement with ampersand shape
    let y = 50 * cos(2 * this.t) - 25 * sin(this.t); // Vertical movement with ampersand shape

    // Update the position of the star
    let newX = this.centerX + x;
    let newY = this.centerY + y;

    this.t += 0.012; // Increment time for smooth movement

    // Add the current position to the history
    this.history.push({x: newX, y: newY});

    // Limit the history size to control the length of the trail
    if (this.history.length > 20) {
      this.history.shift();
    }

    this.x = newX; // Update the current position for drawing
    this.y = newY;
  }

  display() {
    // Draw the trail by iterating through history and reducing opacity
    noStroke();
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      let opacity = map(i, 0, this.history.length, 0, 255);
      fill(255, 255, 0, opacity);
      drawStar(pos.x, pos.y, 10, 5, 5);
    }

    // Draw the current position of the star
    fill(255, 255, 0); // Bright yellow for the current star
    drawStar(this.x, this.y, 15, 7.5, 5);
  }
}

// Function to draw a star with n points {GPT}
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;

  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1;
    let sy = y + sin(a) * radius1;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius2;
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Used to draw the snow on the tree as a trapezoid
function drawTrapezoid(treeWidth, treeHeight, y, trunkHeight, trunkWidth, i, static = true) {
	let levelWidth = treeWidth - (i % 5) * treeWidth / 6;
	let levelHeight = treeHeight / 5;
	let levelY = y - trunkHeight - (i % 5) * levelHeight;
	
	snowHeight = levelHeight / 4;
	
	if (!static) {
		snowHeight = map(second(), 0, 59, 0, levelHeight / 4); // Snow grows over 1 minute, slower animation
		
	}
	fill(255); // white color for snow
	x =  width/12* floor(i/5) + width /24
	beginShape();
	vertex(x - levelWidth / 2, levelY); // left corner
	vertex(x + levelWidth / 2, levelY); // right corner
	vertex(x + levelWidth / 3, levelY - snowHeight); // right part of snow layer
	vertex(x - levelWidth / 3, levelY - snowHeight); // left part of snow layer
	endShape(CLOSE);
	
}

function drawChristmasTreeSnow(y, treeWidth, treeHeight) {
	let trunkHeight = treeHeight / 5;
  let trunkWidth = treeWidth / 4;
	let minuteVar = minute()
	
	for (let i = 0; i < minuteVar; i++) {
		drawTrapezoid(treeWidth, treeHeight, y, trunkHeight, trunkWidth, i);
	}
	drawTrapezoid(treeWidth, treeHeight, y, trunkHeight, trunkWidth, minuteVar, false);
}

function draw() {

  // Gradient colors
  let darkColor = color(3, 51, 130);   // Dark blue
  let lightColor = color(89, 131, 194);  // Light blue

  // Draw the gradient background
  for (let y = 0; y < height; y++) {
    // Calculate the gradient color for the current row
    let inter = map(y, 0, height, 0, 1);
    let gradientColor = lerpColor(darkColor, lightColor, inter);
    
    stroke(gradientColor);
    line(0, y, width, y);
  }
	
	// Draw the ground
  fill(255); // White color for the ground
  noStroke();
  rect(0, height - 200, width, 400); // Ground at the bottom of the canvas, 100 pixels tall
	
	let treeSpacing = width / 12;
  for (let i = 0; i < 12; i++) {
    let x = treeSpacing * i + treeSpacing / 2;
    drawChristmasTree(x, height - 200, 80, 200);
  }
	drawChristmasTreeSnow(height - 200, 80, 200);

	
	let currentSecond = second();
	if (second() == 0) {
		drops = []
	}
	if (drops.length < second()) {
		let drop = new Drop(random(20, windowWidth-20), 0, 0); // random x position for the snow
		drops.push(drop);
	}


  // Animate each drop
  for (let i = drops.length - 1; i >= 0; i--) {
    drops[i].move();
    drops[i].display();
  }
	
	let currentHour = hour() % 12;
	if (currentHour == 0) {
		currentHour += 12
	}
	if (currentHour !== lastHourRecorded) {
		lastHourRecorded = currentHour;
		if (currentHour == 1) {
			stars = []
		}
		let x = width/12 * (currentHour -1) + width/24;
    let y = height - height * (6/7); // Height of the trees (top position)
		stars.push(new Star(x, y));
	}
	
	for (let star of stars) {
    star.move(); // Move each star along the ampersand curve
    star.display(); // Display the star and its trail
  }
}

class Drop {
  constructor(x, y, second) {
    this.x = x;
    this.y = y;
    this.second = second;
    this.size = 10;
    this.speed = 0;          // Initial speed of falling
    this.acceleration = random(0.01, 0.2); // Acceleration to simulate gravity
    this.wind = random(-2, 2);  // Horizontal movement variation (wind effect)
    this.time = 0;  // Time variable to control the curve pattern
  }

	// Movement of snow falls at random rates and also falls in different patterns (wind)
  move() {
    if (this.y < height - 204) {  
      this.speed += this.acceleration;       // Make it gravity-like
      this.y += this.speed;                  // Update the drop's vertical position
      
			// Wind movement
      this.x += sin(this.time) * this.wind * 2;  // Sinusoidal horizontal movement
      this.time += 0.1;  // Increment time
    } else {
      this.y = height - 204;  // Stop when hit the ground
    }
  }

  display() {
    push();
    translate(this.x, this.y);  // Move the origin to the drop's position
    let opacity = map(59 - (drops.length - 1), 0, 59, 0, 255) // Used to make the opacity of the drop fade over time
    noStroke();
    fill(255, 255, 255, opacity);
    ellipse(-this.size * 0.1, -this.size * 0.1, this.size * 0.8, this.size * 0.8);
    pop();
  }
}
