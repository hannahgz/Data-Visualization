
/*
Cited sources: 
- used Color Scale from Martin to assist with coloring of the planets based on valence
- GPT used to create the selector for different time scales 
- GPT used to create dotted line to denote duration
- Spotify API: https://developer.spotify.com/documentation/web-api 
*/

/*
This visualiztion shows information about my top-15 most played songs on Spotify over different time frames in a "galaxy" setting.
Different features of each planet correspond to different representative features of the song (song features were obtained
using Spotify's API). 
- Valence/happiness: color (using concepts from color lecture, cool tones = sad, warm tones = happy)
- Duration: size
- Energy: orbiting speed
- Rank: distance from "sun"
The legend conveys all of these features visually using smaller versions of each feature.

Affordances are used to signal behavior to the user where the size of planets increases slightly when you hover over them, and
also gain a white outline. This lets the user know they can click the planets to see more information. The default initialization
also starts with the top-ranked song selected to further suggest this behavior.

The color of the center "sun" represents the average color of all the planets.

*Interestingly, my long-term visualizatins shows that my favorite songs of all time are pretty similar :) Mostly slow and sad ;')
songs haha! But my short-term graph shows more variation which makes sense!
*/

let planets = [];
let selectedPlanet = null; // Track the planet that was clicked
let yellowBlue = 0;
let selectedVal = 0;
let dropdown;
let sunColors = [];

function preload() {
	longTerm = loadTable('long_term_final.tsv', 'tsv', 'header');
	mediumTerm = loadTable('medium_term_new.tsv', 'tsv', 'header');
	shortTerm = loadTable('short_term_final.tsv', 'tsv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
	yellowBlue = new ColorScale([color('rgb(27,21,174)'), color('rgb(255,207,0)')], 
																 [0, 1]);
  angleMode(DEGREES); // Use degrees for easier angle calculations
  // Create 20 planets with varying distances, sizes, and speeds
	let terms = [shortTerm, mediumTerm, longTerm];
	
	for (let j = 0; j < 3; j++) {
		let subPlanets = [];
		let rows = terms[j].getRows();
		let lastDistance = 30;
		let lastPlanetSize = 0;
		let sumColor = 0;
		for (let i = 0; i < 15; i++) { // Updated to create 20 planets
			
			let planetDuration = rows[i].getNum("duration_ms");
			
			// let planetSize = random(15, 24);
			let planetSize = map(planetDuration, 120000, 300000, 12, 26);
			// let distance = 30 + 20 * i;
			let distance = lastDistance + lastPlanetSize/2;
			if (i != 0) {
				distance += planetSize/2;
			}
		
			let energy = rows[i].getNum("energy");
			let planetSpeed = map(energy, 0, 1, 0.005, 0.21);
	
			let valence = rows[i].getNum("valence");
			let planetColor = yellowBlue.getColor(valence);
			sumColor += valence;
			let artist = rows[i].getString("artist");
			subPlanets.push(new Planet(distance, planetSize, planetSpeed, planetColor, rows[i].getString("track-name"), valence, energy, planetDuration, artist, i + 1));
			lastPlanetSize = planetSize;
			lastDistance = distance;
		}
		planets.push(subPlanets);
		sunColors.push(sumColor/15);
	}
	selectedPlanet = planets[0][0];
	planets[0][0].selected = true;
	
	
	// Create a dropdown menu
  dropdown = createSelect();
  dropdown.position(windowWidth - 250, 290);
  dropdown.option('Short Term (last 4 weeks)');
  dropdown.option('Medium Term (last 6 months)');
  dropdown.option('Long Term (last year)');
  dropdown.changed(selectionChanged); // Callback when the user selects an option
	
	dropdown.style('font-size', '14px');            
	dropdown.style('color', '#333');                 
	dropdown.style('border', '2px solid #333');      
	dropdown.style('border-radius', '10px');         
	dropdown.style('padding', '5px');                
	dropdown.style('width', '220px'); 

	dropdown.elt.size = 3; // Force dropdown options to show downwards
	
  textSize(24);
}

function drawDurationLegend() {
	let circleX = width / 2 - 230;  // X position of the circle center
  let circleY = -(height/2) + 125; // Y position of the circle center
  let radius = 20;         // Radius of the circle

  // Draw the circle
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(circleX, circleY, radius * 2);

  // Draw a dotted line for the diameter
  let startX = circleX - radius;  // Leftmost point of the diameter
  let endX = circleX + radius;    // Rightmost point of the diameter
  let step = 5;                  // Distance between the dots

  for (let x = startX; x < endX; x += step) {
    stroke(255);       // Black color for the dotted line
    strokeWeight(2); // Thickness of the dots
    point(x, circleY); // Draw a point at each step along the diameter
  }
	fill(255)
	noStroke();
	text("Duration", circleX + 80, circleY + 5);
}

let energyAngle = 0;
function drawEnergyLegend() {
	energyAngle += 1

	let energyDistance = 20
	let x = cos(energyAngle) * energyDistance;
	let y = sin(energyAngle) * energyDistance;
    
	// Draw orbit path
	translate(width - 230, 190);
	noFill();
	strokeWeight(2);
	stroke(255);
	ellipse(0, 0, energyDistance * 2); // Orbit ellipse

	// Draw planet
	noStroke();
	fill(255);

	ellipse(x, y, 10);
	text("Energy", 78, 5);
}

function drawRankLegend() {
	translate(width - 230, 250);
	noFill();
	strokeWeight(2);
	stroke(255);
	ellipse(0, 0, 20 * 2); // Orbit ellipse
	ellipse(0, 0, 15 * 2); // Orbit ellipse
	ellipse(0, 0, 10 * 2); // Orbit ellipse
	
	noStroke();
	fill(255);
	text("Rank", 78, 5);
}

function selectionChanged() {
  let selectedOption = dropdown.value();
	if (selectedOption == "Medium Term (last 6 months)") {
		selectedVal = 1;
	} else if (selectedOption == "Short Term (last 4 weeks)") {
		selectedVal = 0;
	} else {
		selectedVal = 2;
	}
	selectedPlanet = planets[selectedVal][0];
	planets[selectedVal][0].selected = true;
}

function drawTitle() {
  textAlign(LEFT, TOP);
  
  // Draw the larger part of the title
  textSize(32); 
  stroke(0, 102, 204); 
  strokeWeight(4);
  text("AstroTunes", 20, 20);
  
  noStroke(); 
  fill(255); 
  text("AstroTunes", 20, 20);
  
  textSize(24); 
  fill(0, 102, 204); 
  text("Top-15 Most Played Spotify Songs", 20, 60); // Adjust Y position for spacing
}

function draw() {
  background(0);
  translate(width / 2, height / 2); // Move the origin to the center of the canvas
	
  // Draw the Sun
  noStroke();
  fill(yellowBlue.getColor(sunColors[selectedVal]));
  ellipse(0, 0, 30); // Sun
  
  // Animate and draw the planets
  for (let planet of planets[selectedVal]) {
    planet.orbit();
    planet.display();
    planet.checkHover(); // Check if the mouse is hovering over the planet
  }

	if (selectedPlanet) {

		// Semi-transparent background with rounded corners
		noStroke();
		fill(255, 255, 255, 20); // White background
		rect(-(width / 2) + 10, (height / 2) - 195, 300, 170, 20);

		// Title
		fill(255); 
		textSize(18);
		textAlign(LEFT, TOP);
		text(`${selectedPlanet.title}`, -(width / 2) + 20, (height / 2) - 180);

		// Artist
		fill(175); // Medium gray for valence
		textSize(16);
		text(`Artist: ${selectedPlanet.artist}`, -(width / 2) + 20, (height / 2) - 150);

		// Valence
		text(`Valence: ${selectedPlanet.valence.toFixed(2)}`, -(width / 2) + 20, (height / 2) - 125);

		// Energy
		text(`Energy: ${selectedPlanet.energy.toFixed(2)}`, -(width / 2) + 20, (height / 2) - 75);

		// Duration
		text(`Duration: ${selectedPlanet.planetDuration} ms`, -(width / 2) + 20, (height / 2) - 100);
		
		// Energy
		text(`Rank: ${selectedPlanet.rank}`, -(width / 2) + 20, (height / 2) - 50);
	}
	

	drawScale(yellowBlue, windowWidth/2 - 250, -(windowHeight/2) + 50);
	drawDurationLegend();
	fill("white");
	text("Time Range", width/2 - 150, 30);
	
	resetMatrix();
	drawEnergyLegend();
	
	resetMatrix();
	drawRankLegend();
	
	resetMatrix();
	drawTitle();
	
}

// Planet class
class Planet {
  constructor(distance, planetSize, planetSpeed, planetColor, title, valence, energy, planetDuration, artist, rank) {
    this.angle = random(360); // Random start angle
    this.distance = distance;
    this.planetSize = planetSize;
    this.planetSpeed = planetSpeed;
    this.planetColor = planetColor;
    this.hovering = false; // Track if the planet is being hovered over
		this.title = title;
		this.valence = valence;
		this.energy = energy;
		this.planetDuration = planetDuration;
		this.artist = artist;
		this.rank = rank;
		this.selected = false;
  }
  
  // Orbit around the sun
  orbit() {
    this.angle += this.planetSpeed; // Increase the angle based on speed
  }

  // Display the planet
  display() {
    let x = cos(this.angle) * this.distance;
    let y = sin(this.angle) * this.distance;
    
    // Draw orbit path
    noFill();
    strokeWeight(1);
    stroke(255, 50);
    ellipse(0, 0, this.distance * 2); // Orbit ellipse
    
    // Draw planet
    noStroke();
    fill(this.planetColor);
    
		let extra = 0;
    if (this.hovering) {
      stroke(255); // White outline when hovered
      strokeWeight(2);
			extra = 2
    } else if (this.selected) {
			stroke(255);
      strokeWeight(2);
		}
		else {
      noStroke();
    }
    
    ellipse(x, y, this.planetSize + extra);
  }

  // Check if the mouse is hovering over the planet
  checkHover() {
    let x = cos(this.angle) * this.distance;
    let y = sin(this.angle) * this.distance;
    
    let d = dist(mouseX - width / 2, mouseY - height / 2, x, y);
    
    // Check if the mouse is close to the planet
    if (d < this.planetSize / 2) {
      this.hovering = true;
    } else {
      this.hovering = false;
    }
  }
}

// Handle mouse clicks
function mousePressed() {

	let foundPlanet = -1;
	for (let i = 0; i < 15; i++) {
		let planet = planets[selectedVal][i];
    let x = cos(planet.angle) * planet.distance;
    let y = sin(planet.angle) * planet.distance;
    
    let d = dist(mouseX - width / 2, mouseY - height / 2, x, y);
		
    // Check if the mouse clicked on a planet
    if (d < planet.planetSize / 2) {
			planet.selected = true;
      selectedPlanet = planet; // Update selected planet
			foundPlanet = i;
      break;
    }
  }
	if (foundPlanet != -1) {
		for (let i = 0; i < 15; i++) {
			let planet = planets[selectedVal][i];
			if (i != foundPlanet) {
				planet.selected = false;
			}
		}
	}	
}


// Represents a numeric color scale.
class ColorScale {
	
	// In this constructor, the "colors" and "numbers" parameters
	// need to be arrays of the same length.
	// They should hold (can you guess?) colors and numbers.
	// "numbers" should be sorted in ascending order.
	constructor(colors, numbers) {
		this.colors = colors;
		this.numbers = numbers;
	}
	
	// Minimum numeric value for scale.
	getMin() {
		return this.numbers[0];
	}
	
	// Maximum numeric value for scale.
	getMax() {
		return this.numbers[this.numbers.length - 1];
	}
	
	// Return the appropriate color for the given number
	getColor(x) {
		let numColors = this.numbers.length;
		// If the number is off the ends of the scale,
		// return the appropriate extreme value.
		if (x <= this.getMin()) {
			return this.colors[0];
		}
		if (x >= this.getMax()) {
			return this.colors[numColors - 1];
		}
		
		// Otherwise go through numbers array and find which segment we should use;
		// return an appropriate color via linear interpolation.
		for (let i = 1; i < numColors; i++) {
			if (x <= this.numbers[i]) {
				let t = (x - this.numbers[i - 1]) / (this.numbers[i] - this.numbers[i - 1]);
				return lerpColor(this.colors[i - 1], this.colors[i], t);
			}
		}
	}
}

// Convenience function to draw a color scale object
// at a given point on the screen.
// One design option (not taken here) would be to make this
// function a method of the ColorScale class--but in that case
// you'd probably want to make it a little more general.
function drawScale(scale, x, y) {
	let w = 200;
	// Draw a color spectrum, one line for each available pixel.
	for (let i = 0; i < w; i++) {
		// Use linear interpolation between min and max of scale
		// to figure out what value to draw at this part of spectrum
		let t = lerp(scale.getMin(), scale.getMax(), i / (w + 1));
		stroke(scale.getColor(t));
		line(x + i, y, x + i, y + 10);
	}
	
	// Label min and max values of color scale.
	fill(255);
	noStroke();
	textSize(16);
	textAlign(LEFT, BASELINE);
	text(scale.getMin() + " (Sad)", x, y - 5);
	textAlign(RIGHT, BASELINE);
	text(scale.getMax() + " (Happy)", x + w, y - 5);
	textAlign(CENTER, BASELINE);
	text("Valence", x + (w/2), y + 25);
}

