x = 200
y = 200
z = 200

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(event) {
        // alpha: rotation around z-axis
        var rotateDegrees = event.alpha;
        // gamma: left to right
        var leftToRight = event.gamma;
        // beta: front back motion
        var frontToBack = event.beta;

        handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
    }, true);
}

var handleOrientationEvent = function(frontToBack, leftToRight, rotateDegrees) {
    x += frontToBack
	y += leftToRight
	z += rotateDegrees
	
	var dot = document.getElementById("thing");
	dot.style.left = x + "px";
	dot.style.top = y + "px";
	dot.style.transform = "rotate(" + z + "deg)";
};