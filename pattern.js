let CONTENT_BACKGROUND_COLOUR = "rgba(70, 70, 70, 0.6)",
      
      SPACING = 30,
      RADIUS = 10,
      
      WAVELENGTH = 400,
      FREQUENCY = 0.2,
      
      DROP_MOVEMENT = 20,
      DROP_MOVEMENT_DISTANCE_MULTIPLIER = 1 / 800,
      
      DROP_SIZE_COS_MULTIPLIER = 0.2;

let ctx, windowWidth, windowHeight;

function loadPattern() {
    resizePattern();
    
    repaintLoop = function() {
        repaint();
        
        window.requestAnimationFrame(repaintLoop);
    };
    
    repaintLoop();
}

function resizePattern() {
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    
    const canvas = document.getElementById("canvas"),
          outer = document.getElementById("outer");
    
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    
    outer.style.width = windowWidth + "px";
    outer.style.height = windowHeight + "px";
    
    ctx = canvas.getContext('2d');
    
    repaint();
}

let startTime = new Date().getTime();

function getTime() {
    return (new Date().getTime() - startTime) / 1000;
}

function repaint() {
    ctx.clearRect(0, 0, windowWidth, windowHeight);
    
    const centreX = windowWidth / 2,
          centreY = windowHeight / 2,
          timeOffset = (getTime() * FREQUENCY) * 2 * Math.PI,
          
          dotsX = Math.floor(windowWidth / SPACING) - 1,
          dotsY = Math.floor(windowHeight / SPACING) - 1,
          
          offsetX = (windowWidth - (dotsX - 1) * SPACING) / 2,
          offsetY = (windowHeight - (dotsY - 1) * SPACING) / 2;
    
    for(let x = 0; x < dotsX; x++) {
        for(let y = 0; y < dotsY; y++) {
            let screenX = offsetX + x * SPACING,
                screenY = offsetY + y * SPACING;
            
            drawDot(centreX, centreY, timeOffset, screenX, screenY);
        }
    }
}

function drawDot(centreX, centreY, timeOffset, x, y) {
    const relX = centreX - x,
          relY = centreY - y,
          
          angle = Math.atan2(relY, relX),
          distanceFromCentre = Math.sqrt(relX * relX + relY * relY),
          
          distanceOffset = (distanceFromCentre / WAVELENGTH) * 2 * Math.PI,
          cosTime = Math.cos(timeOffset + distanceOffset),
          offsetCosTime = Math.cos(timeOffset + distanceOffset + Math.PI / 2),

          dropMovement = DROP_MOVEMENT * (1 + distanceFromCentre * DROP_MOVEMENT_DISTANCE_MULTIPLIER),
          dropOffsetX = Math.cos(angle) * cosTime * dropMovement,
          dropOffsetY = Math.sin(angle) * cosTime * dropMovement,
          dropDistance = Math.abs(15 * offsetCosTime),
          dropRadius = RADIUS * (1 + -1 * cosTime * DROP_SIZE_COS_MULTIPLIER);

    ctx.fillStyle = "rgba(10, 138, 255, " + ((-cosTime + 3) / 4) + ")";

    if(dropDistance > dropRadius / 2) {
        drawDrop(x + dropOffsetX, y + dropOffsetY, dropRadius, dropRadius / 2, (offsetCosTime < 0 ? angle + Math.PI : angle), dropDistance);
    } else {
        drawCircle(x + dropOffsetX, y + dropOffsetY, dropRadius);
    }
}

function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    
    ctx.fill();
}

function drawDrop(x, y, bigRadius, smallRadius, angle, distance) {
    let angleDif = 0.5 * Math.PI - Math.acos(smallRadius / distance),

        fromX = x - Math.cos(angle) * distance,
        fromY = y - Math.sin(angle) * distance;
    
    ctx.beginPath();
    
    ctx.arc(fromX, fromY, smallRadius, 
            -0.5 * Math.PI - angleDif + angle, 
            0.5 * Math.PI + angleDif + angle, true);

    ctx.arc(x, y, bigRadius, 
            0.5 * Math.PI + angle + angleDif, 
            -0.5 * Math.PI + angle - angleDif, true);
    
    ctx.closePath();
    
    ctx.fill();
}

loadPattern();