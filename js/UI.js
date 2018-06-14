

var input = document.getElementById("inputText");
var lineCounter = document.getElementById("lineCounter");
// Remember the canvas is already set to a three.js renderer var in the graphics script, here I will just be referencing it. "renderer" is its name.

// Update UI when the window is first loaded.
window.addEventListener('load', function (){
	updateUI(); // Needs to be wrapped in an anonymous function, so it is not call before the event trigger...
}, false);

// Update UI sizes when the window is resized.
window.addEventListener('resize', function (){
	updateUI(); // Needs to be wrapped in an anonymous function, so it is not call before the event trigger...
}, false);



function updateUI () {

	// If it is not a mobile device...
	if (window.innerWidth > 750){

		// Note: In CSS "line-height" and "font-size" control how many pixels each line takes up height-wise. If line-height is set to 1, than the pixel height of each line is the font-size. Here I need to divide the "window.innerHeight" by that pixel line-height so that the textarea takes up the whole page vertically.
		var textareaLineHeight = 20;
		var UISpacing = 2; // The Exart spacing to subtract from the textarea for the nav and export buttons. Note: This number is the number of rows (not pixels) that is subtracted from the total rows that make the textarea height.

		input.rows = (window.innerHeight/textareaLineHeight) - UISpacing; // Use .rows instead of .height to update the textarea hieght.
		lineCounter.rows = (window.innerHeight/textareaLineHeight) - UISpacing; // This is so the line count will be on the same level as the text...


		camera.aspect = (window.innerWidth/2)/window.innerHeight; // I also need to update the camera when changing canvas size: https://github.com/mrdoob/three.js/issues/69
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth/2, window.innerHeight); // ".setSize" is a three.js function that properly resizes the viewport.
	} else { // If it is a mobile device...

		// Resize UI to fit mobile screen.
		input.rows = 10, lineCounter.rows = 10; // Using a static amount of rows for mobile...
		// Note: textArea width is controlled in the CSS, both for mobile and desktop sizes.

		camera.aspect = 1; // 1 since it just a square.
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerWidth); // Make it a square.
	}
}


