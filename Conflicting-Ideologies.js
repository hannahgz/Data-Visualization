let cols = 5;
let rows = 5;
let cellWidth, cellHeight;
let circles = []; 

let ball; 

function setup() {
  createCanvas(600, 600);  
  cellWidth = width / cols;   
  cellHeight = height / rows; 

  // Initialize the grey circles
  for (let i = 0; i < cols; i++) {
    circles[i] = [];
    for (let j = 0; j < rows; j++) {
      let circleX = i * cellWidth + cellWidth / 2;
      let circleY = j * cellHeight + cellHeight / 2;
      circles[i][j] = {x: circleX, y: circleY, originalX: circleX, originalY: circleY, isYellow: false, diameter: 50};
    }
  }

  // Initialize the yellow ball
  ball = {
    x: random(width/6, width * 5/6),
    y: random(height/6, height * 5/6),
    xSpeed: random(1,3),
    ySpeed: random(1,3),
    diameter: 20
  };
	
	ball2 = {
    x: random(width/6, width * 5/6),
    y: random(height/6, height * 5/6),
    xSpeed: random(1,3),
    ySpeed: random(1,3),
    diameter: 20
  };
}

function drawGridCircle(circle) {
	if (circle.isYellow) {
			fill(252, 177, 3);
			stroke("white");  
			strokeWeight(5); 
		} else {
			fill(150);
			stroke("black");  
			strokeWeight(5); 
		}

		ellipse(circle.x, circle.y, circle.diameter, circle.diameter);
}

function updateBallPos(ball) {
	ball.x += ball.xSpeed;
  ball.y += ball.ySpeed;

  // Check for bouncing on edges
  if (ball.x > width - ball.diameter / 2 || ball.x < ball.diameter / 2) {
    ball.xSpeed *= -1;
  }
  if (ball.y >= height - ball.diameter / 2 || ball.y < ball.diameter / 2) {
    ball.ySpeed *= -1;
  }
}

function draw() {
  background(220);
  
  // Draw grey circles and handle their movement
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let circle = circles[i][j];
      // Calculate the current cell of the yellow ball
      let ballCellX = floor(ball.x / cellWidth);
      let ballCellY = floor(ball.y / cellHeight);

      // Check if the yellow ball is in the same cell as the circle
      if (i === ballCellX && j === ballCellY) {
        // Move the circle towards the ball (from GPT, lerp used to interpolate between given values )
        circle.x = lerp(circle.x, ball.x, 0.04);
        circle.y = lerp(circle.y, ball.y, 0.04);
				
				circle.isYellow = true;
				if (circle.diameter < 100) {
					circle.diameter += 1
				}
      } else {
        // Move the circle back to its original position (see above for description on GPT use)
        circle.x = lerp(circle.x, circle.originalX, 0.04);
        circle.y = lerp(circle.y, circle.originalY, 0.04);
				// circle.diameter = 50
				fill(150)
				noStroke()
      }
			
			let ball2CellX = floor(ball2.x / cellWidth);
      let ball2CellY = floor(ball2.y / cellHeight);

      // Check if the grey ball is in the same cell as the circle
      if (i === ball2CellX && j === ball2CellY) {
				circle.isYellow = false;
				circle.x = lerp(circle.x, ball2.x, 0.04);
        circle.y = lerp(circle.y, ball2.y, 0.04);
				if (circle.diameter > 1) {
					circle.diameter -= 1
				}
			} else {
				circle.x = lerp(circle.x, circle.originalX, 0.04);
        circle.y = lerp(circle.y, circle.originalY, 0.04);
			}
			
			drawGridCircle(circle)
    }
  }

  fill(252, 177, 3);
  stroke("white");  
	strokeWeight(5); 
  ellipse(ball.x, ball.y, ball.diameter, ball.diameter);
  
  // Update the position of the yellow ball
  updateBallPos(ball);
	
	
	fill(150);
  stroke("black");  
	strokeWeight(5); 
  ellipse(ball2.x, ball2.y, ball2.diameter, ball2.diameter);
  
  // Update the position of the grey ball
	updateBallPos(ball2);
}
