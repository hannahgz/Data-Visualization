
/*
Works Cited:
- ChatGPT:
	- Used for wrapText, drawDottedLine, square grid methods
	- Assist with translate logic for scrollytelling (also how to create the scroll bar)
	- drawMouseIcon (fully from ChatGPT)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC2709326/ (for statistic on number of women who die from unsafe abortions)
- https://www.marchofdimes.org/peristats/data?reg=99&top=14&stop=128&lev=1&slev=4&obj=18&sreg=22 (population of women in louisiana aged 15-44)
- mouse icon inspo from: https://codepen.io/kode88/pen/KydBxY
- Data: https://osf.io/pfxq3/ (from data-is-plural)
- Inspired by WW2 visual we saw in class
*/

/*
Artistic Statement:

To add emotion to this piece, I completely changed the concept and styling, the only aspect I kept was the scrollytelling part. The main emotions
I sought to capture were sadness and loneliness, and some annoyance -> slight anger (by having to scroll for a long time).

To make the user feel the true weight of how far women have to travel, I made the user literally scroll the distance, making them more engaged
in the piece. I also used a more stark color palette (only black and white) and serious font, to better convey the seriousness of the 
issue. I felt the previous pink and green I used was visually interesting, but conveyed a more happy emotion than I wanted. Throughout the piece,
a mix of qualitative and quantitative statements were used to set the mood.

At the end, I wanted to play with scale to demonstrate the wide-reaching imapcts of the overturning of Roe v. Wade.

Affordances were used throughout the piece, with the horizontal lines going across the screen to indicate specific miles. The user can also 
use the mouse to drag the progress bar directly on the right if they don't want to scroll.
*/


let states = [];
let distances = [];
let maxDistance;
let scrollY = 0; // Tracks how far we've scrolled
let barScaling = 800; // Space between bars
let totalHeight; // Total height of the virtual content, total height = 
let barUnit;
let draggingScrollbar = false;
let scrollbarYPos = 0; // The vertical position of the scrollbar handle
let scrollbarHeight = 50; // Proportional height of the scrollbar
let startBars = 2000;
let lineLength = 0;  // Length of the dotted line
let dotY;           // Y-position of the dot inside the mouse icon
let mouseYMin, mouseYMax; // Limits for the dot movement inside the mouse shape
let mouseHeight = 190;
let font;

let maxScroll = 43500

let ellipseSize = 10;
let spacing = 5;
let cols = 50;
let rows = 20;
let ellipses = [];
let targetX, targetY;

function preload() {
  // Load the CSV file (ensure the file is in the same directory as your sketch)
  table = loadTable("grouped_df - grouped_df (1).csv", "header");
	font = loadFont('NotoSerif-VariableFont_wdth,wght.ttf');
}
function setup() {
  createCanvas(1200, 600);

  // Extract data for the year 2024
  for (let i = 0; i < table.getRowCount(); i++) {
    let year = table.getNum(i, "year");
    if (year === 2024) {
      let state = table.getString(i, "origin_state");
      let distance = table.getNum(i, "distance_origintodest");

      states.push(state);
      distances.push(distance);
    }
  }

  maxDistance = max(distances); // Find the maximum distance for scaling
  totalHeight = states.length * barScaling; // Calculate the total virtual height #75900 
	barUnit = (totalHeight-50)/maxDistance;
  textAlign(CENTER);
	
	mouseYMin = mouseHeight - 15; // Start point for the dot
  mouseYMax = mouseHeight + 10; // End point for the dot
  dotY = mouseYMin;            // Initial position for the dot
	
	textFont(font);
	// textFont("Calibri");
	
	
	// Calculate grid dimensions and center offsets
  let gridWidth = cols * (ellipseSize + spacing) - spacing;
  let gridHeight = rows * (ellipseSize + spacing) - spacing;

  let xOffset = (width - gridWidth) / 2; // Center horizontally
  let yOffset = (height - gridHeight) / 2; // Center vertically

  // Store initial positions of ellipses in a grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = xOffset + col * (ellipseSize + spacing);
      let y = yOffset + row * (ellipseSize + spacing) + 43000;
      ellipses.push({ x, y, startX: x, startY: y });
    }
  }

  // Set target position (center of the canvas)
  targetX = width / 2;
  targetY = 43300;
}

function drawDottedLine(x, y, length) {
  let dotSpacing = 5;  // Space between dots
  for (let i = 0; i < length; i += dotSpacing) {
    // ellipse(x + i, y, 10, 5);  // Draw a dot at each position
		noStroke();
		fill("grey");
		rect(x+i, y, 6, 5);
  }
}

function drawDottedLineVert(x, y, length) {
  let dotSpacing = 5;  // Space between dots
  for (let i = 0; i < length; i += dotSpacing) {
    // ellipse(x + i, y, 10, 5);  // Draw a dot at each position
		noStroke();
		fill("grey");
		rect(x, y + i, 5, 6);
  }
}

// Function to draw a simple mouse icon with a scrolling dot inside
function drawMouseIcon(x, y) {
  // Draw the mouse outline
  stroke(255);
  noFill();
  strokeWeight(2);
  rectMode(CENTER);
  rect(x, y, 40, 60, 20); // Rounded rectangle to represent the mouse

  // Calculate the alpha (opacity) based on the dot's position
  let alpha = map(dotY, mouseYMin, mouseYMax, 255, 50); // Fades as it moves downward

  // Draw the dot with decreasing opacity
  fill(255, 255, 255, alpha);
  noStroke();
  ellipse(x, dotY, 8, 8); // The dot moves downwards and fades inside the mouse
}


function wrapText(str, x, y, maxWidth, text_size) {
	push();
  let words = split(str, ' ');
  let currentLine = '';
  let lineHeight = 35; // Space between lines
  
	textAlign(LEFT, CENTER);
	textSize(text_size);
	fill("white");
  for (let i = 0; i < words.length; i++) {
    let testLine = currentLine + words[i] + ' ';
    let testWidth = textWidth(testLine);
    
    // If adding this word exceeds the max width, draw the current line and start a new one
    if (testWidth > maxWidth) {
      text(currentLine, x, y);
      currentLine = words[i] + ' '; // Start new line with the current word
      y += lineHeight; // Move down for the next line
    } else {
      currentLine = testLine; // Continue the current line with the word
    }
  }
  
  // Draw any remaining text
  text(currentLine, x, y);
	pop();
}

// function scrollToMiles() {
// 	return 
// }
function draw() {
  background("black");
	
	let rectWidth = 80;
	let rectHeight = 50;
	
	// fill(120);
	// rect(0, height/2 - rectHeight/2 + 100, rectWidth, rectHeight);
	// textSize(8);
	// textAlign(CENTER, CENTER);
	// fill("white")
	// text(scrollY, rectWidth/2, height/2 + 100);
	
  let margin = 150;
  let chartWidth = width - 2 * margin;
  let barWidth = chartWidth / states.length;
	
  push();
  translate(margin - 50, -scrollY); // Translate the view based on the scroll position

	wrapText("In June of 2022, Roe v. Wade was overturned, eliminating the federal right to abortion. The effects of this decision are still unfolding, but one metric we can already examine is the distance women must travel to their nearest abortion facility.",
					 - 100, height/2 - 50, 1100, 25)
	
	push();
	drawMouseIcon(1050, mouseHeight);
	
	// Update the dot position for the downward scrolling effect
	dotY += 0.4;
	if (dotY > mouseYMax) {
		dotY = mouseYMin; // Reset to the top once it reaches the bottom
	}
	pop();
	
	wrapText("We represent the average distance for each state in the U.S. as a bar.", -100, 800, 1100, 25);
	
	fill("white");
	rect(width - 350, 720, barWidth, barUnit);
	
	vertlineLength = constrain(map(scrollY, 150, 700, 0, barUnit), 0, barUnit - 5);
  // drawDottedLineVert(800, 800, vertlineLength);  // The dotted line starts at y = height/2
	drawDottedLineVert(880, 720, vertlineLength);  // The dotted line starts at y = height/2
	
	fill("white");
	textSize(20);
	text("1 mile", 920, 800);

	
	wrapText("Below, we show the current distribution of distances in 2024 across all 50 states in the U.S. as well as Washington D.C. Along the way, we highlight important changes and statistics that demonstrate the sobering effects of the Supreme Court decision.", -100, 1200, 1100, 25);
	
  // Draw bars
  for (let i = 0; i < states.length; i++) {
    let x = margin + i * barWidth + barWidth / 2;
    let barHeight = map(distances[i], 0, maxDistance, 0, totalHeight - 50);
  
		fill("white");
		rect(x - barWidth / 2, startBars, barWidth - 1, barHeight); // Bars extend downward

		// Label state below each bar
		fill("white");
		textSize(12);
		textAlign(CENTER, CENTER);
		// textStyle(BOLD);
		text(states[i], x - 2, barHeight + 15 + startBars);
		textStyle(NORMAL);
    // }
  }
  pop();
	
	push();
	// Update the length of the dotted line based on scrollY
	translate(0, -scrollY); // Translate the view based on the scroll position
	
	
	
	fill("white");
	textSize(24);
	textAlign(LEFT, CENTER);
	
	// let smallFont = 20;
	let currMilesScroll = map(30, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);  // Change 1000 to adjust how far you scroll to grow the line
		drawDottedLine(0, currMilesScroll, lineLength);  // The dotted line starts at y = height/2
		wrapText("For some states, the overturning of Roe v. Wade had minimal impact. 13 states and D.C. all continue to have average distances of less than 30 miles (as represented by the line below) in 2024. However, the same cannot be said for all states.", 0, currMilesScroll - 200, 450, 20);
	}
	
	currMilesScroll = map(70, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);  // Change 1000 to adjust how far you scroll to grow the line
		drawDottedLine(0, currMilesScroll, lineLength);  // The dotted line starts at y = height/2
		wrapText("70 miles was the national average in 2021, the year before Roe v. Wade was overturned.", 0, currMilesScroll - 60, 600, 20);
	}
	
	currMilesScroll = map(101, 0, maxDistance, startBars, startBars + totalHeight);
	if (scrollY < currMilesScroll + 300) {
		lineLength2 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength2);
		wrapText("101 miles was the national average in 2024, after Roe v. Wade was overturned. This is a 41 mile increase from just 3 years ago in 2021.", 0, currMilesScroll - 100, 600, 20);
	}
	
	currMilesScroll = map(130, 0, maxDistance, startBars, startBars + totalHeight);
	if (scrollY < currMilesScroll + 300) {
		lineLength2 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength2);
		let secondsSinceStart = millis() / 1000;
		wrapText(`Feeling tired of scrolling? It has only been ${ nf(secondsSinceStart, 0, 2)} seconds since this animation began. Consider how long it would take for the women in the remaining 11 states to travel 130 miles.`, 0, currMilesScroll - 100, 600, 20);
	}
	
	currMilesScroll = map(170, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		// lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		// drawDottedLine(0, currMilesScroll, lineLength3);
		wrapText("68,000 women die of unsafe abortions annually, making it one of the leading causes of maternal mortality (13%).", 0, currMilesScroll - 60, 600, 20);
	}
	
	
	currMilesScroll = map(207, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength3);
		wrapText("207 miles was the maximum distance across all states in 2021. Now in 2024, 8 states have significantly exceeded this maximum.", 0, currMilesScroll - 100, 600, 20);
	}
	
	currMilesScroll = map(250, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength3);
		wrapText("At a distance of 250 miles, women often have to fly across state borders for treatment.", 0, currMilesScroll - 60, 600, 20);
	}
	
	
	currMilesScroll = map(300, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength3);
		wrapText("We've now hit an average of more than 300 miles.", 0, currMilesScroll - 20, 600, 20);
	}
	
	currMilesScroll = map(350, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		// lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		// drawDottedLine(0, currMilesScroll, lineLength3);
		wrapText("It is a lonely, frightening, and arduous journey for these women.", 0, currMilesScroll - 50, 600, 20);
	}
	
	currMilesScroll = map(400, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength3);
		secondsSinceStart = millis() / 1000;
		wrapText(`We've now hit an average of more than 400 miles. It has only been ${nf(secondsSinceStart, 0, 2)} seconds—consider the weight of the inconvenience you feel now.`, 0, currMilesScroll - 100, 600, 20);
	}
	
	currMilesScroll = map(470, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY < currMilesScroll + 300) {
		lineLength3 = map(scrollY, currMilesScroll - 500, currMilesScroll - 200, 0, width);
		drawDottedLine(0, currMilesScroll, lineLength3);
		secondsSinceStart = millis() / 1000;
		wrapText(`At 470 miles, we have finally almost reached the maximum average distance in Louisiana.`, 0, currMilesScroll - 60, 600, 20);
	}
	
	currMilesScroll = map(477, 0, maxDistance, startBars, startBars + totalHeight);
	// wrapText("It is easy to lose sight of what each of these bars represent and the humanity behind each statistc. In 2023 in Louisiana, the population of women aged 15-44 was 909,420.", 0, currMilesScroll, 1100, 24);
	wrapText("It is easy to lose sight of what each of these bars represent and the humanity behind each statistic. To illustrate this, we represent a woman aged 15-44 in Louisiana as a single dot:", 0, currMilesScroll, 1100, 20);
	fill("white");
	noStroke();
	ellipse(670, currMilesScroll + 38, 10, 10);
	
	// drawGridOfEllipses(10, 5);
	
	// let scrollProgress = constrain(window.scrollY / (document.body.scrollHeight - window.innerHeight), 0, 1);
	let scrollProgress = constrain(map(scrollY, 42900, 43000, 0, 1), 0, 1);

  // Draw ellipses, animating them towards the target position
  fill(255);
  noStroke();
  for (let ellipseData of ellipses) {
    let x = lerp(ellipseData.startX, targetX, scrollProgress);
    let y = lerp(ellipseData.startY, targetY, scrollProgress);
    ellipse(x, y, ellipseSize, ellipseSize);
  }
	
	if (scrollY > 43000) {
		fill("white");
		rect(width/2 - 15, 43285, 30, 30);
		wrapText("Every 1000 women are then represented by a single square:", 0, currMilesScroll + 335, 800, 20);
	}
	drawGridOfSquares(18, 5);
	
	wrapText("Thus, the 9000 squares above represent the more than 900,000 women in Louisiana aged 15-44 who could be directly impacted by the overturning of Roe v. Wade.", 0, currMilesScroll + 1050, 1100, 20);
	
	pop();

  // Draw a simple scrollbar
	// fill(100);
	// // let scrollbarHeight = height * (height / totalHeight); // Proportional height of the scrollbar
	// let scrollbarHeight = 50;
	// let scrollbarY = map(scrollY, 0, maxScroll, 0, height - scrollbarHeight);
	// rect(width - 20, scrollbarY, 10, scrollbarHeight);
	fill(100);
  scrollbarYPos = map(scrollY, 0, maxScroll, 0, height - scrollbarHeight);
  rect(width - 20, scrollbarYPos, 10, scrollbarHeight);
	
	currMilesScroll = map(477, 0, maxDistance, startBars, startBars + totalHeight);
	
	if (scrollY > startBars && scrollY < currMilesScroll) {
		fill(120);
		rect(0, 0, rectWidth, rectHeight);
		textSize(16);
		textAlign(CENTER, CENTER);
		fill("white")
		text(`${Math.round(map(scrollY - startBars, 0, totalHeight, 0, maxDistance))} miles`, rectWidth/2, rectHeight/2 - 2);
	}
	
}

// function drawGridOfEllipses(ellipseSize, spacing) {
//   let cols = 50; // Fixed number of columns
//   let rows = 20; // Fixed number of rows
//   let totalWidth = cols * (ellipseSize + spacing) - spacing; // Total grid width
//   let totalHeight = rows * (ellipseSize + spacing) - spacing; // Total grid height

//   let xOffset = (width - totalWidth) / 2; // Centering the grid horizontally
//   let yOffset = (height - totalHeight) / 2; // Centering the grid vertically

//   for (let row = 0; row < rows; row++) {
//     for (let col = 0; col < cols; col++) {
//       fill(255); // Set ellipse color to white
//       let x = xOffset + col * (ellipseSize + spacing); // X position with spacing
//       let y = yOffset + row * (ellipseSize + spacing); // Y position with spacing
//       ellipse(x, y + 53000, ellipseSize, ellipseSize);
//     }
//   }
// }

function drawGridOfSquares(circleSize, spacing) {
  let cols = 50; // Fixed number of columns
  let rows = 18; // Fixed number of rows
  let totalCircles = rows * cols; // Total number of squares

	let totalWidth = cols * (circleSize + spacing) - spacing; // Total grid width
	let xOffset = (width - totalWidth) / 2; // Centering the grid horizontally
	
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      fill(255); // Set square color to white
      let x = xOffset + col * (circleSize + spacing); // X position with spacing
      let y = row * (circleSize + spacing); // Y position with spacing
      rect(x, y + 43500, circleSize, circleSize);
    }
  }
}

function mouseWheel(event) {
  // Adjust scrollY based on the mouse wheel movement
  scrollY += event.delta;
  scrollY = constrain(scrollY, 0, maxScroll); // Keep within bounds
}


function mousePressed() {
  // Check if the user clicks on the scrollbar to start dragging
  let scrollbarY = map(scrollY, 0, maxScroll, 0, height - scrollbarHeight);

  if (mouseX > width - 20 && mouseX < width - 10 && mouseY > scrollbarY && mouseY < scrollbarY + scrollbarHeight) {
    draggingScrollbar = true; // Begin dragging
  }
}

function mouseDragged() {
  // If the scrollbar is being dragged, update scrollY based on the mouse position
  if (draggingScrollbar) {
    let newScrollY = map(mouseY, 0, height, 0, maxScroll);
    scrollY = constrain(newScrollY, 0, maxScroll); // Keep within bounds
  }
}

function mouseReleased() {
  // Stop dragging the scrollbar when the mouse is released
  draggingScrollbar = false;
}
