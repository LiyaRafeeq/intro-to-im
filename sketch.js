let currentState;
let bowl, oven, ingredients, dough, cookies;
let nextButton, restartButton, recipeButton;
let eggSprite, flour, sugar, butter, vanilla, chocoChips, tray;
let dingSound;

function preload() {
  bg = loadImage('bg.png');
  font = loadFont('babybloom.otf');
  firstCookie = loadImage('startCookie.png');
  lastCookie = loadImage('finalCookie.png');
  eggSprite = loadImage('egg.png'); 
  bowlImg = loadImage('bowl.png');
  flour = loadImage('flour.png');
  sugar = loadImage('sugar.png');
  butter = loadImage('butter.png');
  vanilla = loadImage('vanilla.png');
  chocoChips = loadImage('choco.png');
  tray = loadImage('tray.png');
  dingSound = loadSound('ovenDing.mp3');
}

function setup() {
  createCanvas(800, 600);
  currentState = new WelcomeState();

  // Initialize bowl, oven, and ingredients
  bowl = new Bowl(400, 450);
  oven = new Oven(600, 300);
  ingredients = [
    new Ingredient('egg', 320, 300, eggSprite, true), 
    new Ingredient('flour', 150, 250, flour, false),
    new Ingredient('sugar', 350, 150, sugar, false),
    new Ingredient('butter', 450, 270, butter, false),
    new Ingredient('chocChips', 100, 400, chocoChips, false)
  ];

  // initialising buttons
  nextButton = createButton('Next');
  nextButton.position(700, 550);
  nextButton.hide();

  restartButton = createButton('Restart');
  restartButton.position(700, 550);
  restartButton.hide();

  recipeButton = createButton('Recipe');
  recipeButton.position(600, 550);
  recipeButton.hide();

  nextButton.mousePressed(() => {
    if (currentState instanceof MixingState) {
      currentState.nextButtonPressed();  //change state to the Baking state
    }
  });
}

function draw() {
  background(bg);
  currentState.display();
  currentState.update();
}

function mousePressed() {
  currentState.mousePressed();
}

function keyPressed() {
  currentState.keyPressed();
}

class WelcomeState {
  display() {
    image(firstCookie, 100, 100);
    textAlign(CENTER, CENTER);
    textSize(32);
    textFont(font);
    fill('#85b2d3');
    text("Welcome to the Cookie Game!", width / 2, height / 2);
    textSize(72);
    text("Press any key to start", width / 2, height / 2 + 50);
  }

  update() {}

  mousePressed() {}

//change state to mixing state
  keyPressed() {
    currentState = new MixingState();
  }
}

class MixingState {
  constructor() {
    nextButton.show();
  }

  display() {
    bowl.display();
    for (let ingredient of ingredients) {
      ingredient.display();
    }
  }

  update() {
    for (let ingredient of ingredients) {
      ingredient.update();
    }
  }

  mousePressed() {
    // checking if the egg is clicked to crack it
    for (let ingredient of ingredients) {
      if (ingredient.name === 'egg') {
        ingredient.checkClicked();
      } else {
        ingredient.checkDragging();
      }
    }
  }

  keyPressed() {}

  // change state to BakingState
  nextButtonPressed() {
    currentState = new BakingState();
    nextButton.hide();  
  }
}

class BakingState {
  constructor() {
    this.bakingTimer = 0;
    this.isBaking = false;
  }

  display() {
    oven.display();
    image(tray, 500, 300);
    if (this.isBaking) {
      textSize(68);
      textFont(font);
      fill('#85b2d3');
      text("Baking...", width / 2, height / 2);
    }
  }

  update() {
    if (this.isBaking) {
      this.bakingTimer++;
      if (this.bakingTimer > 300) { // 5 seconds at 60 fps
        dingSound.play();
        currentState = new FinishedState();
      }
    }
  }

  mousePressed() {
    this.isBaking = true;
  }

  keyPressed() {}
}

class FinishedState {
  constructor() {
    restartButton.show();
    recipeButton.show();
  }

  display() {
    image(lastCookie, 100, 100);
    textAlign(CENTER, CENTER);
    textSize(72);
    textFont(font);
    fill('#85b2d3');
    text("Cookies are ready! Congrats!", width / 2, height / 2);
  }

  update() {}

  mousePressed() {}

  keyPressed() {}
}

class Bowl {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = bowlImg.width;
    this.height = bowlImg.height;
  }

  display() {
    image(bowlImg, this.x - this.width / 2, this.y - this.height / 2);
  }

  // to check if the ingredient is in the bowl
  isIngredientInBowl(ingredient) {
    return (
      ingredient.x > this.x - this.width / 2 &&
      ingredient.x < this.x + this.width / 2 &&
      ingredient.y > this.y - this.height / 2 &&
      ingredient.y < this.y + this.height / 2
    );
  }
}

class Oven {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill(100, 100, 100);
    rect(this.x, this.y, 150, 150); // oven using shapes
  }
}

// Ingredient Class
class Ingredient {
  constructor(name, x, y, img, isEgg) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.img = img;
    this.isEgg = isEgg;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDropped = false;
    this.currentFrame = 0; 
    this.numFrames = 5; 
    this.frameWidth = 150; //width of spritesheet
    this.frameHeight = 150; // height of sprite sheet
    this.isCracked = false; // the egg is cracked
    this.frameTimer = 0; 
    this.frameDelay = 100;
  }

  display() {
    if (this.isEgg && this.isCracked) {
      let sx = (this.numFrames - 1) * this.frameWidth;
      image(this.img, this.x, this.y, this.frameWidth, this.frameHeight, sx, 0, this.frameWidth, this.frameHeight);
    } else if (this.isEgg && !this.isCracked) {
      let sx = this.currentFrame * this.frameWidth;
      image(this.img, this.x, this.y, this.frameWidth, this.frameHeight, sx, 0, this.frameWidth, this.frameHeight);
    } else if (!this.isDropped) {
      image(this.img, this.x, this.y);
    }
  }

  update() {
    if (this.isDragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }

    if (!this.isDropped && !this.isEgg && bowl.isIngredientInBowl(this)) {
      this.isDropped = true;
      this.x = bowl.x; // to put the ingredient into the bowl
      this.y = bowl.y;
    }

    // animate the egg spritesheet if it's clicked
    if (this.isEgg && this.isCracked) {
      this.frameTimer++;
      if (this.frameTimer >= this.frameDelay) {
        this.frameTimer = 0;  // to reset timer
        this.currentFrame = (this.currentFrame + 1) % this.numFrames;
      }
    }
  }

  checkDragging() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.img.width &&
      mouseY > this.y &&
      mouseY < this.y + this.img.height &&
      !this.isDropped
    ) {
      this.isDragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  checkClicked() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.img.width &&
      mouseY > this.y &&
      mouseY < this.y + this.img.height &&
      !this.isCracked
    ) {
      this.isCracked = true; 
    }
  }
}

restartButton.mousePressed(() => {
  currentState = new WelcomeState();
  // to reset game state tp beginning 
});

recipeButton.mousePressed(() => {
  // to display recipe
  
});
