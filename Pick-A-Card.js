/*
Sources:
- Data: https://www.data-is-plural.com/archive/2017-02-22-edition/ and references analysis from this paper
  https://www.psychologyofmagic.org/research/cards/cards.pdf, see Figure 10
- Card Pictures: https://opengameart.org/content/playing-cards-vector-png, cards are in public domain
- ChatGPT: used for drawing checkboxes, dotted squares, log to linear scale (inspired by Laura/Bill comment), and for the card hover pop up
*/

/*
This study asked participants to randomly select a playing card. The results were very surprising to me because ~50% of all 
participants selected one of four cards: Ace of Spades, Queen of Hearts, Ace of Hearts, and King of Hearts, even though
there were 52 different cards that anyone could have chosen. 

This visualization encourages interaction from the user by asking them to participate as well and see how they compare to the
study. Outliers are clearly highlighted with a box to draw attention to the interesting aspects of the data (specific card preferences and
face cards being more likely). In addition, toggling selections on and off in the legend allows users to isolate specific 
attributes and changing y-axis scale gives more differentation between points. The colors for the average points are a maroon 
color, which reflects an in between of black and red colors.
*/

let table;
let ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let suits = ['S', 'H', 'D', 'C'];
let suitSymbols = {
  'S': '♠️',
  'H': '♥️',
  'D': '♦️',
  'C': '♣️'
};
let suitToggles = {
  'S': true,
  'H': true,
  'D': true,
  'C': true,
	"AVERAGE": false,
	"OUTLIER": true
};

let selectedCard = null;
// let dropdown;
let cardImages = [];
let cardNames = [];

// COMMENT THESE OUT AND UNCOMMENT BELOW TO GO STRAIGHT TO VIZ
let graphVisible = false;
let timerFinished = false;


// let graphVisible = true;
// let timerFinished = true;
let countdown = 5;
let hoverCard = null;
let selectedCardTimer = 0;
let selectedCardDuration = 15 * 60; // 10 seconds at 60 frames per second
let checkboxes = {}

let image_ranks = ["ace", "2", "3", '4', '5', '6', '7', '8', '9', '10', "jack", "queen", "king"];
let image_suits = ["spade", "heart", "diamond", "club"];
let rank_totals = {"A": 0.34, "2": 0.038, '3': 0.064, '4': 0.028, '5': 0.023 , '6': 0.013, '7': 0.049, '8': 0.034, '9': 0.017, '10': 0.026, 'J': 0.096, 'Q': 0.18, 'K': 0.089}

let legendX = 850;
let legendY = 30;

let useLogScale = false;

function preload() {
  table = loadTable('cs73_card.csv', 'csv', 'header');
	
	// Load all card images
	for (let j = 0; j < image_suits.length; j++) {
		for (let i = 0; i < image_ranks.length; i++) {
			let rank = image_ranks[i];
			let suit = image_suits[j];
			cardNames.push(`${ranks[i]}${suits[j]}`)
			let imgName = `${rank}_of_${suit}s.png`;
			if (rank == "jack" || rank == "queen" || rank == "king") {
				imgName = `${rank}_of_${suit}s2.png`;
			}
	
			cardImages.push(loadImage(imgName));
		}
  }
	
}

function displayCards() {
	textSize(30);
	textAlign(CENTER);
	text("Click the first card that came to mind.", width / 2, 80);
	let startX = 10;
  let x = startX;
  let y = 125;
  
	let cardWidth = 70;
  for (let i = 0; i < cardImages.length; i++) {
		if (mouseX > x && mouseX < x + 65 && mouseY > y && mouseY < y + 90) {
			image(cardImages[i], x-2.5, y-3, cardWidth * 1.1, cardWidth * (4/3) * 1.1);
    } else {
			image(cardImages[i], x, y, cardWidth, cardWidth * (4/3));
		}
		
    if (mouseIsPressed && mouseX > x && mouseX < x + cardWidth + 5 && mouseY > y && mouseY < y + (cardWidth) * (4/3)) {
      selectedCard = cardNames[i];
      graphVisible = true;
      redraw();
      break;
    }
    
    x += cardWidth + 5;
    if (x > width - cardWidth) {
      x = startX;
      y += (cardWidth) * (4/3) * 1.1;
    }
  }
}

function setup() {
  createCanvas(1000, 700);
  background(240);
	textFont('Source Sans Pro');

	toggleButton = createButton('Log Scale');
  toggleButton.position(10, 10);
	
	toggleButton.style('font-family', "'Source Sans Pro', sans-serif");
  toggleButton.style('font-size', '18px');
  toggleButton.style('padding', '10px 20px');
  toggleButton.style('background-color', '#f0f0f0');
  toggleButton.style('border', '1px solid #ccc');
  toggleButton.style('border-radius', '5px');
	
  toggleButton.mousePressed(toggleScale);
}

function toggleScale() {
  useLogScale = !useLogScale;
  toggleButton.html(useLogScale ? 'Linear Scale' : 'Log Scale');
}

function draw() {
	if (!timerFinished) {
    background(240);
    fill(0);
		textSize(50);
		textAlign(CENTER);
    text("Think of a playing card.", width / 2, height / 2 - 30);
    text(`${countdown}`, width / 2, height / 2 + 50);

    if (frameCount % 60 == 0 && countdown > 0) { // Update every second
      countdown--;
    }

    if (countdown == 0) {
      timerFinished = true;
    }
		toggleButton.hide();
  } else {
		if (!graphVisible) {
			background(240);
			displayCards();
			toggleButton.hide();
		} else {
			background(240);
			drawScatterplot();
			drawLegend();
			drawHoverInfo();
			toggleButton.show();
		}
	}
	
}

function drawDottedSquare(x, y, size, legend = false) {
	if (!suitToggles["OUTLIER"] && !legend) {
		return;
	}
  push();
  stroke(0);
  strokeWeight(1.5);
  let dashLength = 4;
  let gapLength = 4;
  
  for (let i = 0; i < size; i += dashLength + gapLength) {
    // Top line
    line(x - size/2 + i, y - size/2, x - size/2 + Math.min(i + dashLength, size), y - size/2);
    // Bottom line
    line(x - size/2 + i, y + size/2, x - size/2 + Math.min(i + dashLength, size), y + size/2);
    // Left line
    line(x - size/2, y - size/2 + i, x - size/2, y - size/2 + Math.min(i + dashLength, size));
    // Right line
    line(x + size/2, y - size/2 + i, x + size/2, y - size/2 + Math.min(i + dashLength, size));
  }
  pop();
}

function drawAxes(xAxisHeight, xAxisLength) {
  stroke(0);
  line(100, xAxisHeight, xAxisLength, xAxisHeight);  // x-axis
  line(100, xAxisHeight, 100, 50);    // y-axis
  
  noStroke();
  fill(0);
  textSize(16);

  // X-axis label
  text("Rank", width / 2, xAxisHeight + 35);

  // Y-axis label
  text("Proportion", 45, height / 2 - 10);
  text("Selected", 45, height / 2 + 5);

  // Add rank labels (X-axis)
  noStroke();
  for (let i = 0; i < ranks.length; i++) {
    let x = map(i, 0, ranks.length - 1, 150, xAxisLength);
    text(ranks[i], x - 2, xAxisHeight + 15);
  }

  // Add y-axis labels and tick marks (Y-axis)
  textAlign(RIGHT);

  let numTicks = 7; // Number of tick marks
  let maxVal = 0.35; // Maximum y value

  for (let i = 0; i <= numTicks; i++) {
    let proportion;
    let y;
    
    if (useLogScale) {
      // Logarithmic scale for y-axis
      let logMin = log(0.001); // Avoid log(0), start from a small value
      let logMax = log(maxVal);
      proportion = exp(map(i, 0, numTicks, logMin, logMax)).toFixed(3); // Exponential back to original value
      y = map(log(proportion), logMin, logMax, xAxisHeight, 50);
    } else {
      // Linear scale for y-axis
      proportion = (i * (maxVal / numTicks)).toFixed(2);
      y = map(i * (maxVal / numTicks), 0, maxVal, xAxisHeight, 50);
    }

    // Draw y-axis labels
    noStroke();
    text(proportion, 90, y);
    
    // Draw tick marks on y-axis
    stroke(0);
    line(95, y, 100, y);
  }
}


function drawScatterplot() {
  // Set up axes
	
	// textSize(16);
	// text("Participants were asked to name the first playing card that came to mind.", width/2 - 225, 60);
	// text("~50% of all participants chose one of 4 cards:", width/2 - 160, 80);
	// text("~50% of all participants chose one of 4 cards:", width/2 - 160, 80);
	// Ace of Spades, Queen of Hearts, Ace of Hearts, and King of Hearts
	textAlign(CENTER, CENTER);
	textSize(30);
	text("Most Commonly Named Playing Cards", width/2, 30);
	textSize(16);
	text("See how you compare to the 600 people sampled in the study!", width/2, 60);
	
  stroke(0);
	let xAxisHeight = 650;
	let xAxisLength = 850;
	drawAxes(xAxisHeight, xAxisLength)
	
  // Plot points
  textAlign(CENTER, CENTER);

	

  for (let i = 0; i < table.getRowCount(); i++) {
    let rank = table.getString(i, "Rank");
    let suit = table.getString(i, "Suit");
    let proportion = table.getNum(i, "Proportion Selected");
		let card = table.getString(i, "Card");

    let x = map(ranks.indexOf(rank), 0, ranks.length - 1, 150, xAxisLength);
    let y = map(proportion, 0, 0.35, xAxisHeight, 50);
		
		let maxVal = 0.35; // Maximum y value
		let numTicks = 7;
		if (useLogScale) {
      // Logarithmic scale for y-axis
      let logMin = log(0.001); // Avoid log(0), start from a small value
      let logMax = log(maxVal);
      y = map(log(proportion), logMin, logMax, xAxisHeight, 50);
    }
		
		noStroke();
		// let opacity = suitToggles[suit] ? 255 : 0;
		// fill(0, opacity);
		// if (card == "2C" || card == "6C" ) {
		// 	x -= 12
		// } else if (card == "2S" || card == "6S") {
		// 	x += 12
		// } else if (card == "8C" || card == "9C") {
		// 	x -= 6
		// } else if (card == "8H" || card == "9S") {
		// 	x += 6
		// }
		
		
		if (card === selectedCard) {
			if (selectedCardTimer === 0) {
				selectedCardTimer = frameCount; // Start the timer
			}

			let elapsedTime = frameCount - selectedCardTimer;
			
  		if (elapsedTime < selectedCardDuration) {

				let text_opacity = map(elapsedTime, 0, selectedCardDuration, 255, 0);
    
				fill(255, 255, 0, text_opacity); // Highlight color
				ellipse(x-1.8, y-1, 25, 25); // Highlight circle
				
    		fill(0, 0, 0, text_opacity); // Highlight color with fading opacity
				
				textSize(22);
				text(`The ${image_ranks[ranks.indexOf(rank)]} of ${image_suits[suits.indexOf(suit)]}s was selected by ${(proportion*100).toFixed(3)}% of people in the study.`, width/2, height/2);
				text(`Explore the graph to see which cards were most/least commonly selected.`, width/2, height/2 + 20);
			} else {
				selectedCard = null; // Reset selected card after 10 seconds
				selectedCardTimer = 0; // Reset timer
			}
		}
		
		
		if (!suitToggles[suit]) {
			continue;
		}
		textSize(18);
		fill(0, 0, 0, 255); 
		text(suitSymbols[suit], x, y);
    
		
		if (card == "AS" || card == "KH" || card == "QH" || card == "AH") {
			drawDottedSquare(x - 1, y - 1, 23);
		}
		
		// Check if mouse is hovering over this point
    if (dist(mouseX, mouseY, x, y) < 5) {
      hoverCard = {card: card, proportion: proportion, x: x, y: y};
    }
  }
	
	// if (suitToggles["H"] && suitToggles["S"] && !suitToggles["D"] && !suitToggles["C"]) {
		
	// }
	
	if (suitToggles["AVERAGE"]) {
			for (let rank in rank_totals) {
				let x = map(ranks.indexOf(rank), 0, ranks.length - 1, 150, xAxisLength);
    		let y = map(rank_totals[rank], 0, 0.35, xAxisHeight, 50);
				if (useLogScale) {
					// Logarithmic scale for y-axis
					let logMin = log(0.001); // Avoid log(0), start from a small value
					let logMax = log(0.35);
					y = map(log(rank_totals[rank]), logMin, logMax, xAxisHeight, 50);
				}

				fill(135, 20, 0);
				noStroke();
				ellipse(x, y, 15, 15);
				
				if (dist(mouseX, mouseY, x, y) < 5) {
					hoverCard = {card: rank, proportion: rank_totals[rank], x: x, y: y};
				}
				
				if (rank == "A" || rank == "J" || rank == "Q" || rank == "K") {
					drawDottedSquare(x, y, 20);
				}
			}
			
		}
	
}

function drawHoverInfo() {
  if (hoverCard) {
    fill(255);
    // stroke(0);
		noStroke();
    rect(hoverCard.x + 10, hoverCard.y - 40, 120, 40, 10);
    fill(0);
    
    textAlign(LEFT, TOP);
    textSize(16);
		let cardText = hoverCard.card;
		if (cardText.length == 1) {
			text(`Rank: ${cardText}`, hoverCard.x + 15, hoverCard.y - 32);
		} else {
			text(`Card: ${cardText}`, hoverCard.x + 15, hoverCard.y - 32);
		}
    text(`Proportion: ${hoverCard.proportion.toFixed(3)}`, hoverCard.x + 15, hoverCard.y - 20);
  }
}

function mouseMoved() {
  hoverCard = null; // Reset hover info
  redraw(); // Redraw the canvas to update hover effect
}

function drawLegend() {
  textAlign(LEFT);
  textSize(20);
  fill(0);
	noStroke();
  text("Legend", legendX, legendY);

	textSize(16);
	noStroke();
  for (let i = 0; i < suits.length; i++) {
    let suit = suits[i];
    let y = legendY + 20 * (i + 1);

    // Draw custom checkboxes
    drawCheckbox(legendX, y, suitToggles[suit]);

    // Draw suit symbol and name
    fill(0);
		noStroke();
    text(suitSymbols[suit], legendX + 30, y);
    text(`${image_suits[i]}s`, legendX + 50, y);
  }
	
	let y = legendY + 20 * (4 + 1);
	drawCheckbox(legendX, y, suitToggles["AVERAGE"]);
	fill(135, 20, 0);
	noStroke();
	ellipse(legendX + 37, y, 15, 15);
	fill(0);
	text(`avg by rank`, legendX + 50, y);
	
	y = legendY + 20 * (5 + 1);
	drawCheckbox(legendX, y, suitToggles["OUTLIER"], true);
	fill(135, 20, 0);
	noStroke();
	drawDottedSquare(legendX + 37, y, 12, true);
	fill(0);
	text(`outliers`, legendX + 50, y);
	
}

function drawCheckbox(x, y, isChecked) {
  stroke(0);
  fill(255);
  rect(x, y - 10, 20, 20); // Checkbox outline

  // Draw checkmark if checked
  if (isChecked) {
		line(x + 6, y + 2, x + 9, y + 8); 

    // Second part of the checkmark (same long length)
    line(x + 9, y + 8, x + 16, y - 6);
  }
}

function mousePressed() {
  for (let i = 0; i < 6; i++) {
		let suit = "";
		if (i < 4) {
			suit = suits[i];
		} else if (i == 4) {
			suit = "AVERAGE"
		} else {
			suit = "OUTLIER";
		}
    let y = legendY + 20 * (i + 1);

    // Check if checkbox is clicked
    if (mouseX > legendX && mouseX < legendX + 20 &&
        mouseY > y - 10 && mouseY < y + 10) {
      suitToggles[suit] = !suitToggles[suit];
      break;
    }
  }
}


