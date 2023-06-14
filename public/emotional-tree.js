// Defining Global Variables
let tree;
let max_dist = 100;
let min_dist = 10;
let plantHealth = 0;
let sentimentScore = 0; // Global variable for sentimentScore
let canvasParent = document.getElementById("et-canvas");

// Branch Class Definition
class Branch {
    constructor(parent, pos, dir) {
        this.pos = pos;
        this.parent = parent;
        this.dir = dir;
        this.origDir = this.dir.copy();
        this.count = 0;
        this.len = 5;
    }

    reset() {
        this.dir = this.origDir.copy();
        this.count = 0;
    }

    next() {
        let nextDir = p5.Vector.mult(this.dir, this.len);
        let nextPos = p5.Vector.add(this.pos, nextDir);
        return new Branch(this, nextPos, this.dir.copy());
    }

    show() {
        if (this.parent != null) {
            let topColor = color(165, 42, 42);
            let bottomColor = color(0, 255, 0);
            let ratio = this.pos.y / canvasParent.clientHeight; // calculate the ratio based on the current y position
            let branchColor = lerpColor(bottomColor, topColor, ratio);
            stroke(branchColor);
            strokeWeight(4);
            line(this.pos.x, this.pos.y, this.parent.pos.x, this.parent.pos.y);
        }
    }
}

// Leaf Class Definition
class Leaf {
    constructor() {
        this.pos = createVector(random(width), random(canvasParent.clientHeight * 0.70));
        this.reached = false;
    }

    show() {
        fill(0, 0, 0, 0);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 4, 4);
    }
}

// Tree Class Definition
// Tree Class Definition
class Tree {
    constructor() {
        this.leaves = [];
        this.branches = [];

        for (let i = 0; i < 500; i++) {
            this.leaves.push(new Leaf());
        }

        let pos = createVector(width / 2, height);
        let dir = createVector(0, -1);
        let root = new Branch(null, pos, dir);
        this.branches.push(root);

        let current = root;
        let found = false;

        while (!found) {
            for (let i = 0; i < this.leaves.length; i++) {
                let d = p5.Vector.dist(current.pos, this.leaves[i].pos);
                if (d < max_dist) {
                    found = true;
                }
            }
            if (!found) {
                let branch = current.next();
                current = branch;
                this.branches.push(current);
            }
        }
    }

    grow() {
        for (let i = 0; i < this.leaves.length; i++) {
            let leaf = this.leaves[i];
            let closestBranch = null;
            let record = max_dist;
            for (let j = 0; j < this.branches.length; j++) {
                let branch = this.branches[j];
                let d = p5.Vector.dist(leaf.pos, branch.pos);
                if (d < min_dist) {
                    leaf.reached = true;
                    closestBranch = null;
                    break;
                } else if (d < record) {
                    closestBranch = branch;
                    record = d;
                }
            }

            if (closestBranch != null) {
                let newDir = p5.Vector.sub(leaf.pos, closestBranch.pos);
                newDir.normalize();
                closestBranch.dir.add(newDir);
                closestBranch.count++;
            }
        }

        for (let i = this.leaves.length - 1; i >= 0; i--) {
            if (this.leaves[i].reached) {
                this.leaves.splice(i, 1);
            }
        }

        for (let i = this.branches.length - 1; i >= 0; i--) {
            let branch = this.branches[i];
            if (branch.count > 0) {
                branch.dir.div(branch.count + 1);
                this.branches.push(branch.next());
                branch.reset();
            }
        }
    }

    show() {
        for (let i = 0; i < this.leaves.length; i++) {
            this.leaves[i].show();
        }

        for (let i = 0; i < this.branches.length; i++) {
            this.branches[i].show();
        }
    }
}


// Global variable for canvas ID
let canvasId = 0;

// Global variable to control if the setup is the first run
let firstRun = true;

function setup() {
    if (firstRun) {
        // We do not create a canvas on the first run,
        // but set the firstRun to false for subsequent runs
        firstRun = false;
        return;
    }

    let canvas = createCanvas(canvasParent.clientWidth, canvasParent.clientHeight);
    // Assign an id to the canvas
    canvas.id('canvas' + canvasId);
    canvas.parent("et-canvas");
    tree = new Tree();
    noLoop();
}



// Draw function without a parameter
function draw() {
    if (plantHealth <= 0 && sentimentScore <= 0 || plantHealth >= 100 && sentimentScore >= 0) {
        return;
    }
    background(0, 0, 0, 0);
    plantHealth += sentimentScore

    console.log("Plant Health: ", plantHealth);
    console.log("Sentiment Score: ", sentimentScore);

    // If the slider value has changed, call grow() the appropriate number of times
    if (sentimentScore > 0) {
        for (var i = 0; i < sentimentScore; i++) {
            console.log("Growing tree..."); // Log when the tree is growing
            tree.grow();
        }
    } else if (sentimentScore < 0) {
        // If the slider has been moved to a lower value, we remove the old canvas and grow a new tree to the new slider value
        removeCanvas(canvasId);
        canvasId++;
        setup();
        for (var i = 0; i < plantHealth; i++) {
            tree.grow();
        }
    }

    tree.show();
    sentimentScore = 0; // Reset sentiment score after updating the tree
}

function removeCanvas(canvasId) {
    let canvas = document.getElementById('canvas' + canvasId);
    canvas.parentNode.removeChild(canvas);
}


async function getFlowerFeelings() {
    let message = document.getElementById("et-message").value;
    let sentToTreeButton = document.getElementById("et-send-to-tree-button");
    let flowerThoughts = document.getElementById("et-tree-thoughts");

    sentToTreeButton.style.display = "none";
    console.log(message);
    try {
        const response = await fetch("https://emotionaltree.xavierfont.com/analyze_sentiment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({expression: message}),
        });
        const jsonData = await response.json();
        sentimentScore = Number(jsonData.sentimentScore); // Update the global sentimentScore
        redraw(); // Manually call draw() when you want to update the display
        sentToTreeButton.style.display = "inline";
        flowerThoughts.innerText = jsonData.flowerResponse;
    } catch (error) {
        console.log("Error fetching sentiment: ", error);
        sentToTreeButton.style.display = "inline";
        flowerThoughts.innerText = "an error occurred.";
    }
}

function startEmotionalTree () {

    setup();

    let startEmotionalTreeButton = document.getElementById("et-start-emotional-tree-button");
    let userToTree = document.getElementById("et-message-to-tree");
    let bean = document.getElementById("et-bean");
    startEmotionalTreeButton.style.display = "none";
    userToTree.style.visibility = "visible";
    bean.style.display = "block";
}