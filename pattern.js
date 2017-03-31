const TAU = Math.PI * 2,
      HALF_PI = Math.PI * 0.5;

let getTime;

if (window.performance.now) {
    console.log("Using high performance timer");
    getTime = function() { return window.performance.now() / 1000; };
} else if (window.performance.webkitNow) {
    console.log("Using webkit high performance timer");
    getTime = function() { return window.performance.webkitNow() / 1000; };
} else {
    console.log("Using low performance timer");
    getTime = function() { return new Date().getTime() / 1000; };
}

function Pattern(canvas) {
    // Settings

    this.spacing = 30;
    this.radius = 10;

    this.wavelength = 400;
    this.frequency = 0.2;

    this.dropMovement = 20;
    this.dropMovementDistanceMultiplier = 1 / 800;

    this.dropSizeCosMultiplier = 0.2;

    this.fadeIn = true;
    this.fadeInTime = 0.5;

    // Running values

    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.startTime = getTime();
    this.fadedIn = false;

    this.opacity = 1;

    this.loopRunning = false;

    // Repaint pattern

    this.repaint = function() {
        const width = this.canvas.width,
              height = this.canvas.height,

              centreX = width / 2,
              centreY = height / 2;

        this.context.clearRect(0, 0, width, height);

        if(this.fadeIn && !this.fadedIn) {
            this.opacity = Math.min(1, (getTime() - this.startTime) / this.fadeInTime);
            this.fadedIn = (this.opacity == 1);
        }

        this.context.globalAlpha = this.opacity;

        const timeOffset = (getTime() * this.frequency) * TAU,

              dotsX = Math.floor(width / this.spacing) - 1,
              dotsY = Math.floor(height / this.spacing) - 1,

              offsetX = (width - (dotsX - 1) * this.spacing) / 2,
              offsetY = (height - (dotsY - 1) * this.spacing) / 2;

        for(let x = 0; x < dotsX; x++) {
            for(let y = 0; y < dotsY; y++) {
                let screenX = offsetX + x * this.spacing,
                    screenY = offsetY + y * this.spacing;

                drawDot(this, centreX, centreY, timeOffset, screenX, screenY);
            }
        }
    }.bind(this);

    // Resize the canvas

    this.resize = function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        this.repaint();
    }.bind(this);

    // Loop repainting every animation frame

    this.startLoop = function() {
        if(!this.loopRunning) {
            this.loopRunning = true;

            this.loop();
        }
    }.bind(this);

    this.loop = function() {
        if(this.loopRunning) {
            this.repaint();

            window.requestAnimationFrame(this.loop);
        }
    }.bind(this);

    this.stopLoop = function() {
        this.loopRunning = false;
    }.bind(this);
}

function drawDot(pattern, centreX, centreY, timeOffset, x, y) {
    const relX = centreX - x,
          relY = centreY - y,

          angle = Math.atan2(relY, relX),
          distanceFromCentre = Math.sqrt(relX * relX + relY * relY),

          distanceOffset = (distanceFromCentre / pattern.wavelength) * TAU,
          cosTime = Math.cos(timeOffset + distanceOffset),
          sinTime = -Math.sin(timeOffset + distanceOffset),

          dropMovement = pattern.dropMovement * (1 + distanceFromCentre * pattern.dropMovementDistanceMultiplier),
          dropOffsetX = Math.cos(angle) * cosTime * dropMovement,
          dropOffsetY = Math.sin(angle) * cosTime * dropMovement,
          dropDistance = Math.abs(15 * sinTime),
          dropRadius = pattern.radius * (1 + -1 * cosTime * pattern.dropSizeCosMultiplier);

    pattern.context.fillStyle = "rgba(10, 138, 255, " + ((-cosTime + 3) / 4) + ")";

    if(dropDistance > dropRadius / 2) {
        const smallRadius = dropRadius / 2,
              dropAngle = (sinTime < 0 ? angle + Math.PI : angle);

        drawDrop(pattern.context, x + dropOffsetX, y + dropOffsetY, dropRadius, smallRadius, dropAngle, dropDistance);
    } else {
        drawCircle(pattern.context, x + dropOffsetX, y + dropOffsetY, dropRadius);
    }
}

function drawCircle(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, TAU, false);
    context.closePath();

    context.fill();
}

function drawDrop(context, x, y, bigRadius, smallRadius, angle, distance) {
    let angleDif = HALF_PI - Math.acos(smallRadius / distance),

        fromX = x - Math.cos(angle) * distance,
        fromY = y - Math.sin(angle) * distance;

    context.beginPath();

    context.arc(fromX, fromY, smallRadius,
            angle - angleDif - HALF_PI,
            angle + angleDif + HALF_PI, true);

    context.arc(x, y, bigRadius,
            angle + angleDif + HALF_PI,
            angle - angleDif - HALF_PI, true);

    context.closePath();

    context.fill();
}
