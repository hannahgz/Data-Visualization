/*
This game uses ml5.js' HandPose model to create an interactive motion-sensor game. When the user closes their fist, the mouth
closes as well, which is a direct way to give the user feedback as an open hand corresponds to a sense of openness, whereas
a fist corresponds to the idea of being closed. The user also receives feedback every time they eat a different food as an
eating sound plays. Healthy foods have a more crisp sound whereas unhealthy foods sound more closely associated with junk food.
Different foods are also introduced for the user to discover, but because of the similar color schemes (green = healthy) and
(brown/warm tones = unhealthy), the user still understands which foods to try to get. This also adds a sense of discovery to the
game as they learn how different foods give them different points. The buttons use affordance through their changing color over 
hover and also how they make a noise every time they are clicked. The rounded corners also make them look more like traditional
buttons. The calibrate screen gives the user a direct opportunity to see how the model is working and calibrate their hand 
positioning as needed.

The funny expression of the character makes this piece humorous to me. Also it's really hard for me to eat healthy so this sums up
what it feels like for me to try to eat lots of veggies!
*/

/*
Sources:

Sounds:
Healthy Sound: https://www.youtube.com/watch?v=iR9Sk31IOCk&ab_channel=SoundProductions
Unhealthy Sound: https://www.youtube.com/watch?v=4oE-eEf--oQ&ab_channel=nBeats
Button Click: https://www.youtube.com/watch?v=LVEWkghDh9A&ab_channel=CreatorAssets

HandPose:
https://docs.ml5js.org/#/reference/handpose

GPT used for starter code for some base classes
*/


let handPose;
let video;
let hands = [];
let fistDetected = false;
let openPalmDetected = false;
let palmCenter = { x: 0, y: 0 }; // Define palmCenter globally
let mouthOpenAmount = 0;
let gameState = "start";
let timer = 30; // 30-second countdown
let startTime;
let emojiArray = [];
let emojiSpawnInterval;
let score = 0; // Initialize score
let calibrateButton;
let exitButton;
let startButton;
let restartButton;
let bounceOffset = 0;

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
	unhealthySound = loadSound('unhealthy.mp3');
	healthySound = loadSound('healthy.mp3');
	healthySound.setVolume(0.8);
	buttonSound = loadSound('button.mp3');
	buttonSound.setVolume(3);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
	createCalibrateButton();
	createExitButton();
	createStartButton();
	createRestartButton();
}

// Base button format used GPT to generate, then duplicated to other buttons
function createCalibrateButton() {
	// Create the "Calibrate" button
  calibrateButton = createButton('Calibrate');
  calibrateButton.position(width / 2 - 50, height / 1.3);
  calibrateButton.size(100, 50);
  calibrateButton.style('background-color', '#e8cc5a');
  calibrateButton.style('border', 'none');
  calibrateButton.style('color', 'white');
  calibrateButton.style('font-size', '20px');
  calibrateButton.style('border-radius', '10px');
  calibrateButton.style('cursor', 'pointer');

  // Button hover effect
  calibrateButton.mouseOver(() => {
    calibrateButton.style('background-color', '#c5a31b');
  });

  calibrateButton.mouseOut(() => {
    calibrateButton.style('background-color', '#e8cc5a');
  });

  // When the button is clicked, change to the calibration screen
  calibrateButton.mousePressed(() => {
		buttonSound.play();
    gameState = "calibrate"; // Set to calibration screen
  });
}

function createStartButton() {
  startButton = createButton('Start');
  startButton.position(width / 2 - 50, height / 1.5);
  startButton.size(100, 50);
  startButton.style('background-color', '#75ba75');
  startButton.style('border', 'none');
  startButton.style('color', 'white');
  startButton.style('font-size', '20px');
  startButton.style('border-radius', '10px');
  startButton.style('cursor', 'pointer');

  // Button hover effect
  startButton.mouseOver(() => {
    startButton.style('background-color', '#306230');
  });

  startButton.mouseOut(() => {
    startButton.style('background-color', '#75ba75');
  });

  // When the button is clicked, change to the calibration screen
  startButton.mousePressed(() => {
		buttonSound.play();
    gameState = "playing"; // Set to calibration screen
		timer = 30; // Reset timer to 30 seconds
		score = 0;
		startTime = millis(); // Set the start time for the countdown
		emojiArray = []; // Reset emoji array
		emojiSpawnInterval = setInterval(spawnEmoji, random(800, 1200)); 
		saladArray = [];
  });
}

function createRestartButton() {
  restartButton = createButton('Restart');
  restartButton.position(width / 2 - 50, height / 1.5);
  restartButton.size(100, 50);
  restartButton.style('background-color', '#75ba75');
  restartButton.style('border', 'none');
  restartButton.style('color', 'white');
  restartButton.style('font-size', '20px');
  restartButton.style('border-radius', '10px');
  restartButton.style('cursor', 'pointer');

  // Button hover effect
  restartButton.mouseOver(() => {
    restartButton.style('background-color', '#306230');
  });

  restartButton.mouseOut(() => {
    restartButton.style('background-color', '#75ba75');
  });

  restartButton.mousePressed(() => {
		buttonSound.play();
    gameState = "playing"; // Set to calibration screen
		timer = 30; // Reset timer to 30 seconds
		score = 0;
		startTime = millis(); // Set the start time for the countdown
		emojiArray = []; // Reset emoji array
		emojiSpawnInterval = setInterval(spawnEmoji, random(800, 1200)); // Spawn emojis every 2 seconds
		saladArray = [];
  });
}


function createExitButton() {
	// Create the "Exit" button
  exitButton = createButton('Exit');
  exitButton.position(width / 2 - 50, height / 1.2);
  exitButton.size(100, 50);
  exitButton.style('background-color', '#ff8d8d');
  exitButton.style('border', 'none');
  exitButton.style('color', 'white');
  exitButton.style('font-size', '20px');
  exitButton.style('border-radius', '10px');
  exitButton.style('cursor', 'pointer');

  // Button hover effect
  exitButton.mouseOver(() => {
    exitButton.style('background-color', '#c1042b');
  });

  exitButton.mouseOut(() => {
    exitButton.style('background-color', '#ff8d8d');
  });

  // When the button is clicked, change to the calibration screen
  exitButton.mousePressed(() => {
		buttonSound.play();
    gameState = "start"; // Set to calibration screen
  });
}

function draw() {
	textFont("Tahoma")
	// textFont("Century Gothic")
  background("black");

  // Mirror the webcam video

	if (gameState === "start") {
    // Show the start screen
    showStartScreen();
		calibrateButton.show();
		exitButton.hide();
		startButton.show();
		restartButton.hide();
	} else if (gameState == "calibrate") {
		calibrateButton.hide();
		exitButton.show();
		startButton.hide();
		restartButton.hide();
		push(); // Start a new drawing state
		translate(width, 0); // Move the origin to the right edge of the canvas
		scale(-1, 1); // Flip the x-axis to mirror the image
		image(video, 0, 0, width, height); // Draw the mirrored video
		pop(); // Restore the original drawing state
		
		for (let i = 0; i < hands.length; i++) {
			let hand = hands[i];

			// Detect if the hand is a fist or open palm
			if (hand.keypoints.length > 0) {
				checkHandGesture(hand);
			}
			for (let j = 0; j < hand.keypoints.length; j++) {
				let keypoint = hand.keypoints[j];
				fill(0, 255, 0);
				noStroke();
				circle(width - keypoint.x, keypoint.y, 10);
			}
			
			drawCartoonFace();
		}
		
		fill(255);
		textSize(32);
		textAlign(LEFT);
		if (fistDetected) {
			text('Fist Detected', 20, 40);
		} else if (openPalmDetected) {
			text('Open Palm Detected', 20, 40);
		}
	}
	else if (gameState == "playing") {
		// Draw all the tracked hand points
		calibrateButton.hide();
		startButton.hide();
		restartButton.hide();
		showTimer();
		
		if (millis() - startTime > 1000) {
      timer--;
      startTime = millis(); // Reset start time for each second
    }

    if (timer <= 0) {
      gameState = "end"; // End the game when timer reaches 0
    }
		
		for (let i = 0; i < hands.length; i++) {
			let hand = hands[i];

			// Detect if the hand is a fist or open palm
			if (hand.keypoints.length > 0) {
				checkHandGesture(hand);
			}
			
			drawCartoonFace();
		}
		// Display and update all emojis
    for (let i = emojiArray.length - 1; i >= 0; i--) {
      let emoji = emojiArray[i];
      
      // Draw emoji
      text(emoji.type, emoji.x, emoji.y);
      
			if (fistDetected && checkEmojiCollision(emoji)) {
        if (emoji.type === '🥦') {
          score++; // Increase score for broccoli
					healthySound.play();
        } else if (emoji.type === '🍟') {
          score--; // Decrease score for fries
					unhealthySound.play();
        } else if (emoji.type === '🍔') {
					score -= 2;
					unhealthySound.play();
				} else if (emoji.type === '🥬') {
					score += 2;
					healthySound.play();
				}
        emojiArray.splice(i, 1); // Remove emoji from the array
      }
			
      // Decrease lifespan
      emoji.lifespan -= deltaTime / 1000; // Decrease lifespan based on time passed
      
      // Remove emoji if its lifespan reaches zero
      if (emoji.lifespan <= 0) {
        emojiArray.splice(i, 1); // Remove emoji from array
      }
    }
		
		if (timer < 15 && saladArray.length === 0) {
			spawnSalad(); // Spawn the first salad after 10 seconds
		}
		
		// Move, sparkle, and display salad emojis
		for (let i = saladArray.length - 1; i >= 0; i--) {
			let salad = saladArray[i];
			salad.move();
			salad.display();
			salad.sparkle();

			// Check if the mouth is closed over the salad
			if (fistDetected && dist(palmCenter.x, palmCenter.y, salad.x, salad.y) < 80 * 1.25) {
				saladArray.splice(i, 1); // Remove the salad emoji
				healthySound.play();
				score += 5; // Increase score by 5
			}
		}
		

		displayScore();
	} else if (gameState === "end") {
    // Show the end game screen
    showEndScreen();
		calibrateButton.show();
		restartButton.show();
  }
	
}

// Function to display the score
function displayScore() {
  fill(255);
  textSize(32);
  textAlign(RIGHT);
  text("Score: " + score, width - 20, 40); // Display the score in the top-right corner
}

// Check if the mouth (cartoon face) is overlapping with the emoji
function checkEmojiCollision(emoji) {
  let mouthX = palmCenter.x;
  let mouthY = palmCenter.y + 20; // Adjust for the mouth position
  let mouthSize = 80; // Mouth size (ellipse width)

  let distance = dist(mouthX, mouthY, emoji.x, emoji.y);
  return distance < mouthSize; // Check if the emoji is within mouth size
}

function spawnEmoji() {
  let broccoli = '🥦';
	let leaf = '🥬'
  let fries = '🍟';
	let hamburger = '🍔'
  let type = random([broccoli, fries, leaf, hamburger]); // Randomly choose emoji type
  let x = random(width/5, width * (4/5));
  let y = random(height/5, height * (7/10));
  
  // Random lifespan between 2 to 5 seconds
  let lifespan = random(2, 5);
  
  // Add emoji to the array with type, position, and lifespan
  emojiArray.push({type: type, x: x, y: y, lifespan: lifespan});
}


// Function to show the start screen
function showStartScreen() {
	// background(0); // Optional background
  fill(255); // White text
  textAlign(CENTER);
  textSize(64);
  
  let bounceAmount = sin(bounceOffset) * 20; // Adjust 20 for bounce height
  
  // Left broccoli bouncing
  text("🥦", width / 2 - 225, height / 3 - 20 + bounceAmount);

  // Right broccoli bouncing
  text("🥦", width / 2 + 225, height / 3 - 20 + bounceAmount);
  bounceOffset += 0.1;
  // Reset any transformations and draw the title
  text("Veggie Tales", width / 2, height / 3); // Title

  textSize(24);
  text("Hold up your open palm ✋ 1 foot away from the camera to move the 😮", width / 2, height / 2.1); // Game instructions
  text("Close your fist ✊ to close your mouth 😋 and eat", width / 2, height / 1.9); // Game instructions
  text("Eat healthy 🥦 and avoid junk foods 🍟", width / 2, height / 1.74); // Game instructions
  
	drawSaladBorder();
}

let offsetTop = 0; // Horizontal offset for the top border
let offsetBottom = 0; // Horizontal offset for the bottom border

// GPT used to help with the left and right movement of the salad border
function drawSaladBorder() {
  textSize(32); 
  let saladEmoji = "🥗";
  let spacing = 50; 
  
  // Top border moving left
  for (let x = -spacing + offsetTop; x <= width; x += spacing) {
    text(saladEmoji, x, 30); // Top row
  }

  // Bottom border moving right
  for (let x = -spacing + offsetBottom; x <= width; x += spacing) {
    text(saladEmoji, x, height - 30); // Bottom row
  }

  // Update the offsets to create the movement effect
  offsetTop -= 0.5; // Move top border to the left
  offsetBottom += 0.5; // Move bottom border to the right

  // Reset offsets when they exceed the spacing to create a continuous loop
  if (offsetTop <= -spacing) {
    offsetTop = 0;
  }
  if (offsetBottom >= spacing) {
    offsetBottom = 0;
  }
}

// Function to show the countdown timer
function showTimer() {
  fill(255);
  textSize(32);
  textAlign(LEFT);
  text("Time: " + timer, 20, 40); // Display the countdown timer in the top-left corner
}

// Function to show the end game screen
function showEndScreen() {
  fill(255); // White text
  textAlign(CENTER);
  textSize(64);
  text("Game Over!", width / 2, height / 2.3); // End screen message
	textSize(32);
	text("You ended with score: " + score, width / 2, height / 1.75); // End screen message
	drawSaladBorder();
}


// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}

function checkHandGesture(hand) {
  // Get positions of the wrist and fingertips
  let wrist = hand.keypoints.find(point => point.name === "wrist");
  let thumbTip = hand.keypoints.find(point => point.name === "thumb_tip");
  let indexTip = hand.keypoints.find(point => point.name === "index_finger_tip");
  let middleTip = hand.keypoints.find(point => point.name === "middle_finger_tip");
  let ringTip = hand.keypoints.find(point => point.name === "ring_finger_tip");
  let pinkyTip = hand.keypoints.find(point => point.name === "pinky_finger_tip");

	let thumbBottom = hand.keypoints.find(point => point.name == "thumb_cmc")
	let middleBottom = hand.keypoints.find(point => point.name == "middle_finger_mcp")
	let indexBottom = hand.keypoints.find(point => point.name == "index_finger_mcp")
	let ringBottom = hand.keypoints.find(point => point.name == "ring_finger_mcp")
	let pinkyBottom = hand.keypoints.find(point => point.name == "pinky_finger_mcp")
			
  if (wrist && middleTip && ringTip && pinkyTip) {
    let distMiddle = dist(wrist.x, wrist.y, middleTip.x, middleTip.y);
    let distRing = dist(wrist.x, wrist.y, ringTip.x, ringTip.y);
    let distPinky = dist(wrist.x, wrist.y, pinkyTip.x, pinkyTip.y);

    if (distMiddle < 250 && distRing < 250 && distPinky < 250) {
      fistDetected = true;
      openPalmDetected = false;
    } else {
      fistDetected = false;
      openPalmDetected = true;
    }

    // Calculate the palm center as the average of wrist and the fingertips
    if (openPalmDetected) {
			let palmX = (wrist.x + thumbBottom.x + indexBottom.x + middleBottom.x + ringBottom.x + pinkyBottom.x) / 6;
			let palmY = (wrist.y + thumbBottom.y + indexBottom.y + middleBottom.y + ringBottom.y + pinkyBottom.y) / 6;
			palmCenter.x = width - palmX; // Adjust to mirror the hand's x position
			palmCenter.y = palmY;
    }
  }
}

function drawCartoonFace() {
  let faceX = palmCenter.x;
  let faceY = palmCenter.y;
  
  // Face background
  fill(255, 224, 189); // Skin color
	noStroke();
  ellipse(faceX, faceY, 140, 140); // Face shape

  // Eyes
  fill(0);
  noStroke();
  ellipse(faceX - 20, faceY - 20, 20, 20); // Left eye
  ellipse(faceX + 20, faceY - 20, 20, 20); // Right eye

  // Mouth
  fill("#f393bf"); // Red color for the mouth
  if (fistDetected) {
    // Closed mouth (line)
    rect(faceX - 40, faceY + 20, 80, 5); // Thin line for a closed mouth
  } else {
    // Open mouth (ellipse)
    ellipse(faceX, faceY + 20, 80, 50); // Elliptical open mouth
  }
}


let saladArray = []; // To store salad emojis
let sparkleTimer = 0; // Timer for sparkling effect
let saladOneEaten = false;
let saladTwoEaten = false;

// GPT used to create base methods for Salad class
class Salad {
  constructor() {
    this.x = random(width / 10, width * (9 / 10));
    this.y = random(height / 10, height * (9 / 10));
    this.size = 50; // Size of salad emoji
    this.xSpeed = random(1, 3);
    this.ySpeed = random(1, 3);
    this.sparkling = false; // Sparkling state
    this.sparkleDuration = 1000; // Duration for each sparkle effect
    this.sparkleColor = color(112, 247, 112, 50); 
  }

  move() {
    // Bounce off the edges
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x > width - this.size / 2 || this.x < this.size / 2) {
      this.xSpeed *= -1;
    }
    if (this.y > height - this.size / 2 || this.y < this.size / 2) {
      this.ySpeed *= -1;
    }
  }

  sparkle() {
    // Trigger sparkle effect at intervals
    sparkleTimer += deltaTime;
    if (sparkleTimer > this.sparkleDuration) {
      this.sparkling = !this.sparkling; // Toggle sparkling on/off
      sparkleTimer = 0; // Reset the sparkle timer
    }

    if (this.sparkling) {
      fill(this.sparkleColor);
      noStroke();
      ellipse(this.x + 25, this.y - 19, this.size + 10, this.size + 10); // Sparkle around the emoji
    }
  }

  display() {
    textSize(this.size);
    text('🥗', this.x, this.y); // Salad emoji
  }
}

function spawnSalad() {
  saladArray.push(new Salad());
}
