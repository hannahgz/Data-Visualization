/*
Changes:
- Hover Behavior (changed in all 3 hover "levels")
  - Removed "Name: xyz" row and instead left-aligned "xyz" directly
	- Increased font size and bolded name of foundation to emphasize text to look at
	- Changed background color to standardized grey with legend and back button
	- Changed all text to be white
- Initial Palette Display
	- Fixed leading between title and subheading, and also leading within the subheading
  - Increased font size for "Shades of Bias Palette" and bolded
	- Increased font size for foundation category names
	- Use of grid for each foundation shade
- Scatter Plot
	- Dynamic movement/animation of points using lerp to show how individual points compose average
	- Changed background to be same as color of palette so points stand out more against darker bg and for consistency
	- Adjusted all features (axes, tick marks, title) to be white
	- Increased font size for title of "XYZ Category" and fixed leading between title and subheading
- Legends
	- Standardized legend between both pages, removed tan background and standard to grey, same size for both legend rects
	- Clarified indiv points by showing multiple small squares in the legend
	- Bolded and left-aligned "Legend", increased font size
- Misc Changes
	- Standardized back button coloring
*/

/*
Sources (exactly same as previous version)
- ChatGPT: used to create the back button, helped with swinging open motion of palette
- State idea from Martin's in-class example
- Dataset: (found through data is plural) https://github.com/the-pudding/data/tree/master/foundation-names
- Data Processing: some assistance from GPT, but also added additional functionalities in this notebook
https://colab.research.google.com/drive/1hthbNOQGhuJM4KkQbvIu_ZOg4MVKCqgY?usp=sharing 
*/



let angle = 0; 
// let angle = 130;
let pWidth = 0; 
let pHeight; 
let pSpeed = 0.75; 

let table;
let descriptorTable;
let hoverShade = null;
let upperLeftX = 0;
let upperLeftY = 0;
let fadeInDuration = 3 * 60;
let timer = 0;

let PALETTE = 0;
let DETAILED = 1;
let detailedCategory = "";

let data = {};
let averagePoints = [];
let individualPoints = [];
let hoveredPoint = null;
let hoveredIndivPoint = null;
let minSaturation = 0;
let backButton;
let clickedPoint = null;
let categoryName = null;

let startX = 175;
let endX;
let startY;

let startPointX;
let startPointY;
let lerpFactor = 0;

let legendWidth = 180;
let legendHeight = 90;

let state = PALETTE;
let test = null;
let categoryData = [
	{ name: 'gem', color: '#e0bca3', size: 99 },
	{ name: 'misc', color: '#e1bca1', size: 184 },
	{ name: 'plant', color: '#d5ae8f', size: 20 },
	{ name: 'skin', color: '#daae8d', size: 104 },
	{ name: 'color', color: '#d5aa88', size: 165 },
	{ name: 'rock', color: '#cfa481', size: 127 },
	{ name: 'descriptor', color: '#c89b7c', size: 1322 },
	{ name: 'name', color: '#c09371', size: 43 },
	{ name: 'textile', color: '#c99a7b', size: 97 },
	{ name: 'location', color: '#c99874', size: 210 },
	{ name: 'food', color: '#bd8d6a', size: 682 },
	{ name: 'metal', color: '#c7926d', size: 24 },
	{ name: 'drink', color: '#a67658', size: 206 },
	{ name: 'wood', color: '#ab795b', size: 144 },
]

function preload() {
  // Load the Didot font
	for (const item of categoryData){
		let tableName = `${item.name}_processed_fixed.csv`
		data[item.name] = loadTable(tableName, 'csv', 'header');
	}
}

function setup() {
	// textFont(didotFont);
	textFont("Montserrat");
	pWidth = windowWidth - 200;
	pHeight = windowHeight/2;
	upperLeftX = windowWidth/2 - pWidth/2;
	upperLeftY = windowHeight/2 - 50;
	// test = table.findRows("descriptor", "categories");

  createCanvas(windowWidth, windowHeight);
	startY = height - 100;
	endX = width - 50;
	// processData();
	createBackButton();
}

function draw() {
  background(220);

  
	if (state == PALETTE) {
		fill("#2b2929");
		rect(upperLeftX, upperLeftY, pWidth, pHeight);

		fill("white");
		let pStart = upperLeftY + pHeight/2 + 10;
		for (let column = 0; column < 2; column++) {
			for (let row = 0; row < 7; row++) {
				let currShade = categoryData[column * 7 + row];
				let ellipseSize = map(currShade.size, 20, 1322, pWidth/20, pWidth/8);
				let ellipseSizeActual = ellipseSize;
				let currX = upperLeftX + (pWidth/19) + (pWidth/7 * row);
				let currY = upperLeftY + pHeight/4 + (pHeight/2) * column;

				if (dist(mouseX, mouseY, currX, currY) < ellipseSize/2) {
					hoverShade = {
						name: currShade.name, 
						hexCode: currShade.color, 
						count: currShade.size,
						x: currX,
						y: currY
					};
					ellipseSizeActual += 10
					
					if (mouseIsPressed) {
						averagePoints = []
						individualPoints = []
						categoryName = hoverShade.name;
						processData(hoverShade.name);
						state = DETAILED;
						startPointX = currX;
						startPointY = currY;
						break;
					}
				}
				
				noStroke();
				fill(currShade.color);
				ellipse(
					currX, 
					currY, 
					ellipseSizeActual, 
					ellipseSizeActual);
				textAlign(CENTER, CENTER);
				textSize(18);
				text(currShade.name, currX, currY + ellipseSize/2 + 17);

			}
		}
		
		drawPalette(angle);

		
		if (angle > 45) {
			drawHoverInfo();
		}
		if (angle < 130) {
			angle += pSpeed; 
		} else {
			drawPaletteLegend();
			
			let text_opacity = 255;
			fill(240, 240, 240)
			if (timer === 0) {
				timer = frameCount; // Start the timer
			}

			let elapsedTime = frameCount - timer;

			if (elapsedTime < fadeInDuration) {
				let text_opacity = map(elapsedTime, 0, fadeInDuration, 0, 255);
				fill(240, 240, 240, text_opacity); 
			} 

			textSize(50);
			textAlign(CENTER, CENTER);
			textStyle(BOLD);
			text("Shades of Bias Palette", width/2, height/14 * 3.2);
			textStyle(NORMAL);
			textSize(20);
			text("Explore the most common categories for foundation names and how", width/2, height/14 * 4.2);
			text("certain categories favor lighter or darker skin tones by clicking/hovering.", width/2, height/14 * 4.65);
		}
	} else {
		background("#2b2929");
		if (lerpFactor < 1) {
			lerpFactor += 0.01;
		}
		drawPlot();
		backButton.draw();
	}
	
}
function mouseMoved() {
  hoverShade = null; // Reset hover info
  // redraw(); // Redraw the canvas to update hover effect
	if (state == DETAILED) {
		hoveredPoint = null;
		for (let point of averagePoints) {
			if (dist(mouseX, mouseY, point.x, point.y) < (point.size)/2 && clickedPoint == null) {
				hoveredPoint = point;
				break;
			}
		}
		hoveredIndivPoint = null;
		if (clickedPoint) {
			for (let point of individualPoints) {
				if (point.name === clickedPoint.name && dist(mouseX, mouseY, point.x, point.y) < point.size - 1) {
					hoveredIndivPoint = point;
					break;
				}
			}
		}
	}
	
}

function drawDetailed(inputTable) {
	let totalEllipses = inputTable.getRowCount();
	let cols = 50; // Number of columns in the grid
  let rows = ceil(totalEllipses / cols); // Calculate the number of rows

  let xSpacing = width / cols; // Horizontal spacing between ellipses
  let ySpacing = height / rows; // Vertical spacing between ellipses
  
  let ellipseSize = min(xSpacing, ySpacing) * 0.8; // Size of each ellipse
  
  let counter = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (counter < totalEllipses) {
				fill(inputTable.getRow(counter).get("hex"));
        let xpos = x * xSpacing + xSpacing / 2;
        let ypos = y * ySpacing + ySpacing / 2;
        ellipse(xpos, ypos, ellipseSize, ellipseSize);
        counter++;
      }
    }
  }
}

function drawHoverInfo() {
  if (hoverShade) {
    fill(125, 125, 125, 200);
    // stroke(0);
		noStroke();
    rect(hoverShade.x + 20, hoverShade.y - 70, 130, 60, 10);
    fill(255);
    
    textAlign(LEFT, CENTER);
    textSize(20);
		textStyle(BOLD);
		stroke(1);
		text(`${hoverShade.name}`, hoverShade.x + 30, hoverShade.y - 55);
		
		noStroke();
		textStyle(NORMAL);
		textSize(16);
		text(`Color: ${hoverShade.hexCode}`, hoverShade.x + 30, hoverShade.y - 35);
		text(`Count: ${hoverShade.count}`, hoverShade.x + 30, hoverShade.y - 20);
  }
}

function drawPalette(angle) {
  push();

  translate(upperLeftX, upperLeftY);

  // Create the 3D perspective effect by skewing the palette as it rotates
  let pXOffset = cos(radians(angle)) * pHeight; // X offset for the palette's movement
  let pYOffset = sin(radians(angle)) * pHeight/4; // Y offset to simulate the shrinking
	stroke(0);
	fill("#2b2929");
	quad(
	0, 0, // Top-left (hinge point)
	pWidth, 0, 
	pWidth + pYOffset, pXOffset, // Botton-right
	-pYOffset, pXOffset // Bottom-left
	);

  pop();
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function drawPlot() {
  // Draw axes
	drawLegend();
	textAlign(CENTER, CENTER);
	textSize(40);
	textStyle(BOLD);
	fill(255);
	text(`${capitalizeFirstLetter(categoryName)} Category`, (endX + startX)/2, 50)
	textStyle(NORMAL);
	textSize(16);
	text(`Hover and click to see how certain names are used for different shades.`, (endX + startX)/2, 80)
	
	textSize(16);
  stroke(255);
	fill(255);
  line(startX, startY, endX, startY); // x-axis
  line(startX, startY, startX, 50);   // y-axis
  
  // Draw tick marks for x-axis
	textAlign(CENTER, CENTER);
  for (let i = 0; i <= 1; i += 0.1) {
    let x = map(i, 0, 1, startX, endX);
		stroke(255);
    line(x, startY + 5, x, startY - 5); // Tick mark
		noStroke();
    text(i.toFixed(1), x, startY + 20); // Label
  }
  // Draw tick marks for y-axis
  for (let i = 0; i <= 1; i += 0.1) {
		stroke(255);
    let y = map(i, 0, 1, startY, 50);
    line(startX - 5, y, startX, y); // Tick mark
		noStroke();
    text(i.toFixed(1), startX - 25, y); // Label
  }
	
	
	textSize(20);
	fill("white");
	text("Lightness", 70, (startY + 50)/2);
	text("Saturation", (width + startX - 50)/2, height - 40);
  
  // Draw average points
  noStroke(); 
  for (let point of averagePoints) {
		if (point == hoveredPoint || point == clickedPoint || (hoveredPoint == null && clickedPoint == null)) {
			fill(point.hex);
		} else {
			let c = color(point.hex);
			c.setAlpha(20);
			fill(c);
		} 
		let testX = lerp(startPointX, point.x, lerpFactor);
		let testY = lerp(startPointY, point.y, lerpFactor);
		ellipse(testX, testY, point.size, point.size);
		// ellipse(point.x, point.y, point.size, point.size);
  }
  
  // Draw individual points if an average point is hovered
  if (hoveredPoint || clickedPoint) {
    for (let point of individualPoints) {
      if (hoveredPoint && point.name === hoveredPoint.name) {
        // fill(0, 255, 0);
				fill(point.hex);
				// stroke(0);
        rect(point.x, point.y, point.size, point.size);
      }
			if (clickedPoint && point.name === clickedPoint.name) {
        // fill(0, 255, 0);
				fill(point.hex);
        rect(point.x, point.y, point.size, point.size);
      }
    }
  }
  
  // Display hover information
  if (hoveredPoint) {
    drawHoverPointInfo(hoveredPoint);
  }	
	
	if (hoveredIndivPoint) {
		drawHoverIndivPointInfo(hoveredIndivPoint);
	}
}

function drawHoverPointInfo(point) {
	fill(125, 125, 125, 200);
	// stroke(0);
	noStroke();
	rect(point.x + 10, point.y - 70, 220, 75, 10);
	fill(255);

	textAlign(CENTER, CENTER);
	
	
	fill(255);
	push();
	// translate(width - 30, 0);
	textAlign(LEFT, CENTER);
	textSize(20);
	// stroke(1);
	// strokeWeight(5);
	textStyle(BOLD);
	text(`${point.name}`, point.x + 20, point.y - 55);
	textStyle(NORMAL);
	noStroke();
	textSize(16);
	text(`Saturation: ${point.saturation.toFixed(2)}`, point.x + 20, point.y - 35);
	text(`Lightness: ${point.lightness.toFixed(2)}`, point.x + 20, point.y - 20);
	text(`Count: ${point.count}`, point.x + 20, point.y - 5);
	pop();
}

function drawHoverIndivPointInfo(point) {
	fill(125, 125, 125, 200);
	// stroke(0);
	noStroke();
	let rectHeight = 70;
	rect(point.x + 10, point.y - 70, 240, 75, 10);
	fill(0);

	textAlign(CENTER, CENTER);
	
	
	fill(255);
	push();
	// translate(width - 30, 0);
	textAlign(LEFT, CENTER);
	textSize(20);
	textStyle(BOLD);
	text(`${point.name}`, point.x + 20, point.y - 55);
	
	textSize(16);
	textStyle(NORMAL);
	text(`Saturation: ${point.saturation.toFixed(2)}`, point.x + 20, point.y - 35 );
	text(`Lightness: ${point.lightness.toFixed(2)}`, point.x + 20, point.y - 20);
	text(`Brand: ${point.brand}`, point.x + 20, point.y - 5);
	pop();
}

function processData(name) {
	let minCount = 1000000;
	let maxCount = 0;
	for (let row of data[name].rows) {
		let count = parseInt(row.get('count'))
		if (count > maxCount) {
			maxCount = count;
		}
		if (count < minCount) {
			minCount = count;
		}
	}
  for (let row of data[name].rows) {
    let x = map(parseFloat(row.get('saturation')), 0, 1, startX, endX);
    let y = map(parseFloat(row.get('lightness')), 0, 1, startY, 50);
		let count = parseInt(row.get('count'))
		let pointSize = map(count, minCount, maxCount, 10, width/25);
		if (minCount == maxCount) {
			pointSize = 10;
		}
    let point = {
      x: x,
      y: y,
      name: row.get('name'),
			hex: row.get("hex"),
      lightness: parseFloat(row.get('lightness')),
      saturation: parseFloat(row.get('saturation')),
			brand: row.get("brand"),
      count: count,
			size: pointSize,
			product: row.get("product"),
    };
    
		// if (point.product != "Average" && point.count == 1) {
		// 	individualPoints.push(point);
		// } else {
		// 	averagePoints.push(point);
		// }
		if (point.product == "Average") {
			averagePoints.push(point);
		} else {
			individualPoints.push(point);
  	}
	}
}

function createBackButton() {
  backButton = {
    x: 20,
    y: 20,
    width: 100,
    height: 40,
    label: 'Back',
    
    draw: function() {
      push();
      // Button shape
      noStroke();
			if (this.isMouseOver()) {
				fill(255, 255, 255, 50);
			} else {
				fill(255, 255, 255, 100);
			}
			
      rect(this.x, this.y, this.width, this.height, 20);  // Rounded corners
      
      // // Button shadow
      // fill(0, 0, 0, 30);
      // rect(this.x + 2, this.y + 2, this.width, this.height, 20);
      
      // Button text
      textAlign(CENTER, CENTER);
      textSize(16);
      fill(255);
      text(this.label, this.x + this.width/2, this.y + this.height/2);
			
      pop();
    },
    
    isMouseOver: function() {
      return mouseX > this.x && mouseX < this.x + this.width &&
             mouseY > this.y && mouseY < this.y + this.height;
    }
  };
}

function drawLegend() {
	// let x = lerp(-100, 100, );
	// rect(x, 60, 7, 7);
	
	push();
	translate (width - legendWidth - 15, 15);
	fill(255, 255, 255, 100);
	rect(0, 0, legendWidth, legendHeight, 10);
	fill("white");
	noStroke();
	textSize(18);
	textAlign(LEFT, CENTER);
	textStyle(BOLD);
	text("Legend", 10, 20);
	
	textStyle(NORMAL);
	textSize(16);
	fill("rgb(132,94,35)");
	ellipse(20, 45, 15, 15);
	fill("white");
	text("Average by Name", 40, 45);
	
	
	// fill("rgb(132,94,35)");
	// ellipse(20, 70, 15, 15);
	fill("rgb(250,224,185)");
	rect(10, 60, 8, 8);
	fill("rgb(105,68,12)");
	rect(25, 63, 8, 8);
	fill("rgb(201,144,59)");
	rect(15, 72, 8, 8);
	fill("rgb(201,144,59)");
	
	// fill("rgb(175,146,102)");
	// rect(13, 62, 15, 15);
	fill("white");
	text("Individuals by Name", 40, 70);
	pop();
}

function drawPaletteLegend() {
	push();
	noStroke();
	fill(255, 255, 255, 100);
	let legendY = pHeight/4 + 5; // 90
	translate(width - legendWidth - 70, legendY);
	// rect(width - 275, legendY, legendWidth, legendHeight, 10);
	rect(0, 0, legendWidth, legendHeight, 10);
	textAlign(LEFT, CENTER);
	fill(255, 255, 255)
	textSize(18);
	textStyle(BOLD);
	text("Legend", 10, 20);
	
	textStyle(NORMAL);
	textSize(16);
	fill("rgb(225,187,135)")
	ellipse(15, 45, 10, 10);
	ellipse(35, 45, 20, 20);
	fill("white");
	text("Count", 55, 45);

	fill("rgb(230,192,138)")
	ellipse(15, 70, 10, 10);

	fill("rgb(115,84,43)")
	ellipse(35, 70, 10, 10);
	fill("white");
	text("Average Shade", 55, 70);
	pop();
}

function mousePressed() {
  if (backButton.isMouseOver()) {
    state = !state;
		hoveredPoint = null;
		clickedPoint = null;
		lerpFactor = 0;
  }
	
	if (state == DETAILED) {
		clickedPoint = null;
		for (let point of averagePoints) {
			if (dist(mouseX, mouseY, point.x, point.y) < (point.size)/2) {
				clickedPoint = point;
				break;
			}
		}
	}
}
