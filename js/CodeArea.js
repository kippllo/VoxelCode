/*
	CodeArea:Zero.js
	A simple web code editor made by Rhett Thompson. ©2018 Rhett Thompson
*/



var codeArea = document.getElementById("inputText");
var lineCounter = document.getElementById("lineCounter");

codeArea.addEventListener('scroll', function (event){
	updateScroll(event);
}, false);

codeArea.addEventListener('input', function (event){
	updateLineCount(event);
}, false);


// This function syncs the scrolling of the two textareas.
function updateScroll(event) {
	lineCounter.scrollTop = codeArea.scrollTop; // Note: "codeArea.scrollTop" should be the same as "event.target.scrollTop".
}


// This function updates the line count.
function updateLineCount(event) {

	// Figure out how to fix lag later...
	// The for loop lags at about line 800
	// The ".length" lags at about line 45,000...

	// This one line returns the correct line count!
	var currentLineCount = codeArea.value.split('\n').length; // CoolNote: "codeArea.value.split('string').length -1" should return the number of occurrences of any string (in other words it is the same as "str.count("x")" in other languages).

	// Reset the line count text-numbers to blank so it can be refilled.
	lineCounter.value = "";
	// Step through each line and number them. (Could do i + 1 to avoid starting at zero. Or maybe have i start at 1 and do i <= currentLineCount...) // Doing that fix will also fix the cols getting wider on 9 instead of 10 glitch...
	for (var i=0; i < currentLineCount; i++){
		lineCounter.value += i + '.\n';
	}

	// Get the width of the string that will represent our line count, then use this to make sure the width is wide enough so that the numbers are not cut off.
	var lineCountStringWidth = currentLineCount.toString().length;
	// Add to the columns if the width needs to be bigger.
	lineCounter.cols = lineCountStringWidth +1; // Plus one because it needs to account for the "." at the end of the line number.
	// Shrink the width of the code textarea so the line count and the code-textarea still fit on the screen.
	codeArea.style.width = (85-lineCounter.cols) + '%'; // Note: this is how to change css in js.
}



