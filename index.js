window.onload = load;
window.onresize = resize;

function load() {
    const hoverName = document.getElementById("hover-name");
    
    hoverName.onmouseout = makeHoverNameInvisible;
    hoverName.onmouseover = makeHoverNameVisible
}

function resize() {
    moveHoverName();
    
    resizePattern();
}

function makeHoverNameInvisible() {
    const hiddenName = document.getElementById("hidden-name");
    
    hiddenName.className = "";
}

function makeHoverNameVisible() {
    const hoverName = document.getElementById("hover-name"),
          hiddenName = document.getElementById("hidden-name");
    
    hiddenName.className = "hidden-name-visible";
    
    moveHoverName();
}

function moveHoverName() {
    const hiddenName = document.getElementById("hidden-name"),
          hiddenBoundingBox = hiddenName.getBoundingClientRect(),
          
          hoverBoundingBox = document.getElementById("hover-name").getBoundingClientRect();
    
    hiddenName.style.left = (hoverBoundingBox.left + (hoverBoundingBox.width - hiddenBoundingBox.width) / 2) + "px";
    hiddenName.style.top = ((hoverBoundingBox.top - 10) - (hiddenBoundingBox.height + 10) - 5) + "px";
}