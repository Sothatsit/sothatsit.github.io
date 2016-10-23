const SPACING = 30,
      RADIUS = 10,
      
      WAVELENGTH = 400,
      FREQUENCY = 0.55,
      
      DROP_MOVEMENT = 20,
      DROP_MOVEMENT_DISTANCE_MULTIPLIER = 1 / 800,
      
      DROP_SIZE_COS_MULTIPLIER = 0.2;

window.onload = load;
window.onresize = resize;
document.onmousemove = mouseMove;

let ctx, windowWidth, windowHeight, mouseX, mouseY;

function load() {
    resize();
    
    mouseX = mouseX || windowWidth / 2;
    mouseY = mouseY || windowHeight / 2;
    
    repaintLoop = function() {
        repaint();
        
        window.requestAnimationFrame(repaintLoop);
    };
    
    repaintLoop();
}

function resize() {
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    
    const canvas = document.getElementById("canvas");
    
    ctx = canvas.getContext('2d');
    
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    
    setup();
    
    repaint();
}

function mouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
}

let dots;

function setup() {
    dots = [];
    
    let dotsX = Math.floor(windowWidth / SPACING) - 1,
        dotsY = Math.floor(windowHeight / SPACING) - 1;
    
    if(dotsX <= 0 || dotsY <= 0) {
        return;
    } 
    
    let offsetX = (windowWidth - (dotsX - 1) * SPACING) / 2,
        offsetY = (windowHeight - (dotsY - 1) * SPACING) / 2;
    
    for(let x = 0; x < dotsX; x++) {
        for(let y = 0; y < dotsY; y++) {
            dots.push(newDot(offsetX + x * SPACING, offsetY + y * SPACING));
        }
    }
}
        
function newDot(x, y) {
    return [x, y, NaN, NaN, NaN, NaN, NaN, NaN]
}

let startTime = new Date().getTime();

function getTime() {
    return (new Date().getTime() - startTime) / 1000;
}

function repaint() {
    ctx.fillStyle = "rgba(70, 70, 70, 1)";
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    let time = getTime(),
        centreX = mouseX,
        centreY = mouseY;
    
    const timeOffset = (time * FREQUENCY) * 2 * Math.PI;
    
    for(let index = 0; index < dots.length; index++) {
        const dot = dots[index];
        
        const relX = centreX - dot[0],
            relY = centreY - dot[1];
        
        if(dot[2] != relX && dot[3] != relY) {
            dot[2] = relX;
            dot[3] = relY;
            dot[4] = Math.atan2(relY, relX);
            dot[5] = Math.sqrt(relX * relX + relY * relY);
            dot[6] = Math.cos(dot[4]);
            dot[7] = Math.sin(dot[4]);
        }
        
        let angle = dot[4];
        
        const distanceFromCentre = dot[5],
              cosAngle = dot[6],
              sinAngle = dot[7],
              
              distanceOffset = (distanceFromCentre / WAVELENGTH) * 2 * Math.PI,
              cosTime = Math.cos(timeOffset + distanceOffset),
              offsetCosTime = Math.cos(timeOffset + distanceOffset + Math.PI / 2),
              
              dropMovement = DROP_MOVEMENT * (1 + distanceFromCentre * DROP_MOVEMENT_DISTANCE_MULTIPLIER),
              dropOffsetX = cosAngle * cosTime * dropMovement,
              dropOffsetY = sinAngle * cosTime * dropMovement,
              dropDistance = Math.abs(15 * offsetCosTime),
              dropRadius = RADIUS * (1 + -1 * cosTime * DROP_SIZE_COS_MULTIPLIER);
        
        if(offsetCosTime < 0) {
            angle += Math.PI;
        }
        
        ctx.fillStyle = "rgba(10, 138, 255, " + ((-cosTime + 3) / 4) + ")";
        
        if(dropDistance > dropRadius / 2) {
            drawDrop(dot, dot[0] + dropOffsetX, dot[1] + dropOffsetY, dropRadius, dropRadius / 2, angle, dropDistance);
        } else {
            drawCircle(dot[0] + dropOffsetX, dot[1] + dropOffsetY, dropRadius);
        }
        
        //drawCircle(dot[0] + dropOffsetX, dot[1] + dropOffsetY, dropRadius);
    }
}

function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    
    ctx.fill();
}

function drawDrop(dot, x, y, bigRadius, smallRadius, angle, distance) {
    let cosAngle = dot[3],
        sinAngle = dot[4];
    
    if(angle != dot[2]) {
        cosAngle *= -1;
        sinAngle *= -1;
    }
    
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