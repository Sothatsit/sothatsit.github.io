window.onload = load;
window.onresize = resize;

let pattern;

function findWindowSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
    };
}

function load() {
    const hoverName = document.getElementById("hover-name"),
          hiddenName = document.getElementById("hidden-name");
    
    hoverName.onmouseout = function() { hiddenName.className = ""; };
    hoverName.onmouseover = function() { hiddenName.className = "hidden-name-visible"; };
    
    moveHoverName();
    
    // Defer rendering pattern until page loaded
    setTimeout(loadPattern, 0);
}

function loadPattern() {
    pattern = new Pattern(document.getElementById("canvas"));
    
    const windowSize = findWindowSize();
    
    pattern.resize(windowSize.width, windowSize.height);
    pattern.startLoop();
}

function resize() {
    moveHoverName();
    
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
          windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    
    pattern.resize(windowWidth, windowHeight);
    
    const outer = document.getElementById("outer");
    
    outer.style.width = windowWidth + "px";
    outer.style.height = windowHeight + "px";
}

function moveHoverName() {
    const hiddenName = document.getElementById("hidden-name"),
          hiddenBoundingBox = hiddenName.getBoundingClientRect(),
          
          hoverBoundingBox = document.getElementById("hover-name").getBoundingClientRect();
    
    hiddenName.style.left = (hoverBoundingBox.left + (hoverBoundingBox.width - hiddenBoundingBox.width) / 2) + "px";
    hiddenName.style.top = ((hoverBoundingBox.top - 10) - (hiddenBoundingBox.height + 10) - 5) + "px";
}