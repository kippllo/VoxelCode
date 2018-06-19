/*
	Made by Rhett Thompson. ©2018 Rhett Thompson
	V 1.0.1

	Description:
		VoxelCode is a voxel editor built in pure JavaScript with its only dependency being Three.js which is use for graphics rendering.
		Unlike traditional voxel editors, VoxelCode uses nothing but scripting to model. This makes it unique.
		It has different commands that make placing voxel much easier.
		VoxelCode supports exporting to the stl file format for 3D printing and obj file format for use in other programs, such as game engines.
	License:
		VoxelCode is licensed to all under the MIT license,
		which can be found on the VoxelCode GitHub page: https://github.com/kippllo/VoxelCode
*/



// The class that creates voxel objects. A lot of the magic happens here!
// At the top because of hoisting.
class voxel {

	// The constructor takese the x,y,z coordinates of the voxel and the rgb color value.
	constructor(x,y,z, r,g,b){

		// These are the vertices positions that make up the voxel.
		// Note: these are a default values that are transformed later.
		this.vertices = {
			0:[0.0, 0.0, 0.0],
			1:[0.0, 1.0, 0.0],
			2:[1.0, 0.0, 0.0],
			3:[1.0, 1.0, 0.0],

			4:[0.0, 0.0, 1.0],
			5:[0.0, 1.0, 1.0],
			6:[1.0, 0.0, 1.0],
			7:[1.0, 1.0, 1.0]
		};

		// These are the triangle faces that are made of the vertices.
		// Note: each triangle contains the index of three vertices, these indices correlate to the ones defined above.
		this.triangles = [
			// Bottom Plain
			[0,1,3],
			[0,3,2],

			// Top Plain
			[7,5,4],
			[7,4,6],

			// Left Plain
			[5,1,0],
			[5,0,4],

			// Right Plain
			[7,6,2],
			[7,2,3],

			// Front Plain
			[6,4,0],
			[6,0,2],

			// Back Plain
			[7,3,1],
			[7,1,5]
		];

		// Normals indices correspond to trianlge indices.
		// So, that means that "normals[0]" is the normal that goes with "triangles[0]".
		this.normals = [
			// Bottom Plain
			[0.0, 0.0, -1.0],
			[0.0, 0.0, -1.0],

			// Top Plain
			[0.0, 0.0, 1.0],
			[0.0, 0.0, 1.0],

			// Left Plain
			[-1.0, 0.0, 0.0],
			[-1.0, 0.0, 0.0],

			// Right Plain
			[1.0, 0.0, 0.0],
			[1.0, 0.0, 0.0],

			// Front Plain
			[0.0, -1.0, 0.0],
			[0.0, -1.0, 0.0],

			// Back Plain
			[0.0, 1.0, 0.0],
			[0.0, 1.0, 0.0]
		];

		// If the grid lock is on, then round voxel placement to a whole number.
		if (grid) {
			this.x = Math.round(x);
			this.y = Math.round(y);
			this.z = Math.round(z);
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		// "this.r, this.g, this.b" is used for exporting, while the color array is used for internal coloring in the 3D view (a.k.a. three.js).
		// Only need to check for the first color. Add a catch for other array errors before this (such as r is given but not g or b)...
		if(r == undefined){ // null will work too, !r will still be true if 0 is a given value, so I can't use !r.
			// If no color is given, default to white.
			this.r = 255;
			this.g = 255;
			this.b = 255;
		} else{
			this.r = r;
			this.g = g;
			this.b = b;
		}

		// Set internal colors after this.rbg is defined.
		// They correspond to triangle indices like normals.
		this.colors = [
			// Bottom Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b],

			// Top Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b],

			// Left Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b],

			// Right Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b],

			// Front Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b],

			// Back Plain
			[this.r, this.g, this.b],
			[this.r, this.g, this.b]
		];

		// Set the colorIndex that will be used for UV mapping when exported to a .obj file.
		// In the line below it is checking the global var array that holds the color palette to see if this cube's color is already inside of it.
		// Note: "this.colorIndex" is the index value used to give this voxel color in the obj file export. So, first we check if that color is already
		// in the color palette. If it is just set "this.colorIndex" to reference the existing entry in the color palette. But if the color cannot be 
		// found, it will add the new color to the end of the color palette and set this newly added entry's index as its "this.colorIndex".
		this.colorIndex = indexOfNested(colorArray, [this.r, this.g, this.b]);
		// If the color of our voxel is not found, add it to the end of the colorArray.
		if (this.colorIndex == -1) {
			colorArray.push([this.r, this.g, this.b]);
			this.colorIndex = colorArray.length -1; // The newly added last index is now set as our colorIndex.
		}

		// These are the colorIndices for each individual triangle, these must be removed with inside faces.
		// Note: these are used in the obj export and they correlate to triangles, just like the normals do.
		this.triangleColorIndices = [
			// Bottom Plain
			this.colorIndex,
			this.colorIndex,

			// Top Plain
			this.colorIndex,
			this.colorIndex,

			// Left Plain
			this.colorIndex,
			this.colorIndex,

			// Right Plain
			this.colorIndex,
			this.colorIndex,

			// Front Plain
			this.colorIndex,
			this.colorIndex,

			// Back Plain
			this.colorIndex,
			this.colorIndex
		];

		// Move/translate the vertices from the origin by the x,y,z given as parameters.
		this.move(this.x, this.y, this.z);
	}

	// A method that moves the voxel by moving its vertices.
	move(x,y,z){
		for(var vert in this.vertices){
			this.vertices[vert][0] += x;
			this.vertices[vert][1] += y;
			this.vertices[vert][2] += z;
		}
	}

	// A method that removes inside faces.
	// This is useful when wanting to 3D print the voxel model.
	// Note: Since normals, rendering colors, and export obj colors are all based on the triangle arrays
	// they also need to be removed if the triangle they correlate to is removed.
	checkForInsideTriangles(xyzs){ // "xyzs" (read xyz's) is an array of voxel x's, y's, and z's. Example: [[0,0,0], [1,1,1], [3,4,5]]
		xyzs.forEach(function(xyz){

			
			// First check to see if the two voxels have the same y's and z's because if 
			// they share y's and z's the two can be adjacent on the x-axis.
			if(xyz[1] == this.y && xyz[2] == this.z){

				// If right face is touching...
				// This means if the voxel being compared is one to the right of THIS voxel, remove the inside face of THIS voxel.
				if(xyz[0] == this.x + 1){
					// Remove right face triangles, normals, render colors, and obj export colors.
					var ind = indexOfNested(this.triangles, [7,6,2]); // NOTE: the reason we are find the index of the "7,6,2" triangle is because that is the first triangle that makes up the right side, it is directly followed by the second triangle for that side. This pattern is mirrored in the normals, render colors, and obj export colors. Because of this pattern it is easy to remove both triangles that make up the face by finding the index of the first one and just removing it and the following index which is the second triangle.
					this.triangles.splice(ind, 2); // This will start removing at the index of the first triangle in the right face and go to the second. So, both triangles making the side will be removed.
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}
				// If left face is touching...
				else if(xyz[0] == this.x - 1){
					var ind = indexOfNested(this.triangles, [5,1,0]);
					this.triangles.splice(ind, 2);
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}
			}

			// Check to see if the two voxels have the same x's and z's because if 
			// they share these the two can be adjacent on the y-axis.
			else if(xyz[0] == this.x && xyz[2] == this.z){
				if(xyz[1] == this.y + 1){
					var ind = indexOfNested(this.triangles, [7,3,1]);
					this.triangles.splice(ind, 2);
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}

				else if(xyz[1] == this.y - 1){
					var ind = indexOfNested(this.triangles, [6,4,0]);
					this.triangles.splice(ind, 2);
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}
			}

			// Check to see if the two voxels have the same x's and y's because if 
			// they share these the two can be adjacent on the z-axis.
			else if(xyz[0] == this.x && xyz[1] == this.y){ // If the x's and y's are the same, then check if the z is with in plus/minus 1 of this voxel.
				if(xyz[2] == this.z + 1){
					var ind = indexOfNested(this.triangles, [7,5,4]);
					this.triangles.splice(ind, 2);
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}

				else if(xyz[2] == this.z - 1){
					var ind = indexOfNested(this.triangles, [0,1,3]);
					this.triangles.splice(ind, 2);
					this.normals.splice(ind, 2);
					this.colors.splice(ind, 2);
					this.triangleColorIndices.splice(ind, 2);
				}
			}
		},this); // Can pass the instance of this into the forEach loop by having it here at the end. Help: https://stackoverflow.com/questions/19733758/passing-scope-to-foreach   and: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	}
}




// ---------Global Variables are defined below---------

// References to the HTML elements are acquired by id.
var input = document.getElementById("inputText");
var previewButton = document.getElementById("previewButton");
var compileButton = document.getElementById("compileButton");
var exportSTL = document.getElementById("exportSTL");
var exportOBJ = document.getElementById("exportOBJ");

// Global vars to hold all voxel render and compile data.
var voxels = [], verts = {}, tris = [], norms = [], colors = [], name = 'voxel';

// colorArray holds the RGB values of every color used by a voxel. It is filled by the voxel object constructor function.
// colorIndexTriangles holds all voxel.colorIndex that corresponds to a colorArray RGB value. These indices correlate to triangles that will be used to set obj color.
// colorIndexTriangles are set in the compile function.
var colorArray = [], colorIndexTriangles = [];

// Use a rount-to-int-grid to lock voxel placement.
var grid = true;


// This function is used as a cheaper, just graphics, call to render a preview to the canvas. It does not get global variables ready for exporting.
previewButton.addEventListener('click', function(){

	// Clear global holder vars. This is not so the preview can fill them, but to make sure the export buttons will not export anything. If these are not cleared it would export the last compiled model.
	voxels = [], verts = {}, tris = [], norms = [], colors = [], name = 'voxel', colorArray = [], colorIndexTriangles = [], grid = true;
	
	// Call the "interpret" function to get voxel from user input.
	var preVoxels = interpret(input.value); // Returns an array of objects...

	// This part takes the newly created array of Voxel-Objects and makes an object holding their vertices as arrays.
	// It accomplishes this by first making an empty Object that will act as a dictionary.
	// Then it loops through every voxel-object, getting all of the vertices in that voxel-object.
	// It then adds these vertices--which are arrays--to the new parent object.
	// 
	// i is the number of the current voxel-object
	// n is the number to make the key in the new dictionary for there current vertex.
	// v is the number of the current vertex.
	var preVerts = {};
	for (var i = 0, n = 0; i < preVoxels.length; i++){

		// In this line I use "Object.keys()" which gets the passed in object's properties in an array from. That allows me to count the length, thus I can tell the amount of the vertices in the voxel. Just to be clear we are using the keys function on an array of objects, that is why I need "voxels[i].vertices". voxels is the array holding the voxel-object, and that voxel-object has a property that is another object which holds arrays representing the vertices.
		for (var v = 0; v < Object.keys(preVoxels[i].vertices).length; v++){
			// Since v is the local vertices number it needs to reset. But n never resets because it is not relative to current voxel-object, but instead keeps the place that the new vertex should be added in the parent object, which is holding all voxel-objects' vertices.
			preVerts[n] = preVoxels[i].vertices[v];
			n++;
		}
	}


	// Get all voxel-objects triangles
	var preTris = [];
	for (var i = 0; i < preVoxels.length; i++){
		var updatedTris = preVoxels[i].triangles.map(function(tri){
				var newTri = tri.slice(); // Copy to a new array so the original trianlges are not changed.
				// Each voxel has 8 vertices, so a multiple of 8 must be added in order to make all combined triangle vertices concurrent.
				newTri[0] += 8*i; // X
				newTri[1] += 8*i; // Y
				newTri[2] += 8*i; // Z
				return newTri;
		});
		preTris = preTris.concat(updatedTris);
	}


	// Get all voxel-objects normals
	var preNorms = [];
	preVoxels.forEach(function(vox){
		preNorms = preNorms.concat(vox.normals);
	});


	// Get all voxel-objects colors
	// Maybe depreciate this old color function and update render coloring to use the new colorIndexTriangles.
	var preColors = [];
	preVoxels.forEach(function(vox){
		preColors = preColors.concat(vox.colors);
	});



	// RENDER THE 3D VIEW
	// These functions are in the graphic script, not this file.
	removeAllVoxels(); // Clear the 3d view first.
	infoToMesh(preVerts, preTris, preNorms, preColors); // Render updated Object!
}, false);




// This is called when the compile button is pressed, it gets all the global vars set for exporting.
compileButton.addEventListener('click', function(){

	// Clear global holder vars.
	voxels = [], verts = {}, tris = [], norms = [], colors = [], name = 'voxel', colorArray = [], colorIndexTriangles = [], grid = true;

	// Call the "interpret" function to get voxel from user input.
	voxels = interpret(input.value); // Returns an array of objects...

	// Remove duplicate voxels.
	var deleteDuplicateArray = []; // A temp array to hold voxels that need to be remove from the main array.

	// Loop through the voxel array twice to compare all voxels.
	voxels.forEach(function(vox1, index1) {
		voxels.forEach(function(vox2, index2){
			// If the index we are currently checking is not already marked to be deleted...
			if (deleteDuplicateArray.indexOf(index1) == -1) {
				// If index2 is already marked to be removed, don't remove index1.
				if(deleteDuplicateArray.indexOf(index2) == -1){
					if(index1 != index2) { // If they are not the same index...
						if(vox1.x == vox2.x && vox1.y == vox2.y && vox1.z == vox2.z) { // If they are indeed in the same space.
							deleteDuplicateArray.push(index1); // Storing to do the removal after the fuction. Mark the whole voxel instead of the index (marking just the index would look like: "deleteDuplicateArray.push(vox1);") so later "indexOf" can be used to remove the right voxels, regardless of the indexes being changed by the constant removal of voxels in the voxels-holder array. NOTE: just the index of the voxel is stored here, and later the voxel itself is found. Maybe change this later... change to be "deleteDuplicateArray.push(vox1);" that is...
						}
					}
				}
			}
		});
	});

	// Make a new array holding all the voxel objects that the indices in the last array refer to.
	// This marks the whole voxel instead of the index, so "indexOf" can be used in a minute to remove the right voxels.
	var deleteDuplicateVoxArray = deleteDuplicateArray.map(function(index){
		return voxels[index];
	});

	deleteDuplicateVoxArray.forEach(function(vox){
		voxels.splice(voxels.indexOf(vox), 1);
	});


	// This parts removes inside faces from voxels
	// "voxelXyzs" is a temp var and is used for checking sides, so it does not need to be global.
	var voxelXyzs = voxels.map(function(vox){
		return [vox.x, vox.y, vox.z]
	});

	voxels.forEach(function(vox){
		vox.checkForInsideTriangles(voxelXyzs);
	});







	// This part takes the newly created array of Voxel-Objects and makes an object holding their vertices as arrays.
	// It accomplishes this by first making an empty Object that will act as a dictionary.
	// Then it loops through every voxel-object, getting all of the vertices in that voxel-object.
	// It then adds these vertices--which are arrays--to the new parent object.
	// 
	// i is the number of the current voxel-object
	// n is the number to make the key in the new dictionary for there current vertex.
	// v is the number of the current vertex.
	verts = {};
	for (var i = 0, n = 0; i < voxels.length; i++){

		// In this line I use "Object.keys()" which gets the passed in object's properties in an array from. That allows me to count the length, thus I can tell the amount of the vertices in the voxel. Just to be clear we are using the keys function on an array of objects, that is why I need "voxels[i].vertices". voxels is the array holding the voxel-object, and that voxel-object has a property that is another object which holds arrays representing the vertices.
		for (var v = 0; v < Object.keys(voxels[i].vertices).length; v++){
			// Since v is the local vertices number it needs to reset. But n never resets because it is not relative to current voxel-object, but instead keeps the place that the new vertex should be added in the parent object, which is holding all voxel-objects' vertices.
			verts[n] = voxels[i].vertices[v];
			n++;
		}
	}


	// Get all voxel-objects triangles
	tris = [];
	for (var i = 0; i < voxels.length; i++){
		var updatedTris = voxels[i].triangles.map(function(tri){
				var newTri = tri.slice(); // Copy to a new array so the original trianlges are not changed.
				// Each voxel has 8 vertices, so a multiple of 8 must be added in order to make all combined triangle vertices concurrent.
				newTri[0] += 8*i; // X
				newTri[1] += 8*i; // Y
				newTri[2] += 8*i; // Z
				return newTri;
		});
		tris = tris.concat(updatedTris);
	}


	// Get all voxel-objects normals
	norms = [];
	voxels.forEach(function(vox){
		norms = norms.concat(vox.normals);
	});


	// Get all voxel-objects colors
	// Maybe depreciate this old color function and update render coloring to use the new colorIndexTriangles.
	colors = [];
	voxels.forEach(function(vox){
		colors = colors.concat(vox.colors);
	});


	// Get all voxel-objects colorsIndices for .obj exporting...
	colorIndexTriangles = [];
	voxels.forEach(function(vox){
		colorIndexTriangles = colorIndexTriangles.concat(vox.triangleColorIndices);
	});



	// RENDER THE 3D VIEW----------------------------
	// These functions are in the graphic script, not this file.
	removeAllVoxels(); // Clear the 3d view first.
	infoToMesh(verts, tris, norms, colors); // Render updated Object!
	// END OF RENDER THE 3D VIEW---------------------



	// Call the export triangulate function...
	var exportTris = triangulate(verts, tris);
	tris = exportTris; // This is a work around for now, maybe make "exportTris" be its own global var later...
}, false);



// Export to STL
exportSTL.addEventListener('click', function(){
	// Check to make sure the compile function has been run. Maybe show error is it has not. Maybe make a console...
	// Note: Just checking "if(array)" is always true. If you want to check if there are any items in the array do: "if(array.length)".
	if(voxels.length) { // Maybe check why "if(verts.length)" was always returning false...
		var stlExportData = exportStlDataURL(verts, tris, norms);
		downloadDataURL(stlExportData, name + '.stl');
	} else {
		alert('Code has not been compiled!');
	}
}, false);


// Export to OBJ
exportOBJ.addEventListener('click', function(){

	// Check to make sure the compile function has been run. Maybe show error is it has not.
	// Note: Just checking "if(array)" is always true. If you want to check if there are any items in the array do: "if(array.length)".
	if(voxels.length) {
		var objExportData = exportObjDataURL(verts, tris, norms, colorArray, colorIndexTriangles);
		downloadDataURL(objExportData, name + '.obj');

		// Download the .mtl file that goes with the .obj
		var mtlDataURL = 'data:text/plain;charset=utf-8,newmtl%20' + name + '%0amap_Kd%20' + name + '.png';
		downloadDataURL(mtlDataURL, name + '.mtl');

		// Download the .png texture file that goes with the .obj
		var pngDataURL = exportPNG(colorArray);
		downloadDataURL(pngDataURL, name + '.png');
	} else {
		alert('Code has not been compiled!');
	}
}, false);




// This function recalculates triangles so that there will be no duplicate vertices.
function triangulate(vertList, triList){

	var newVertices = Object.assign({}, vertList); // Copy the data to a new Object, so we can change it without damaging the original. //Help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	var newTriangles = triList.map(function(arr){ // The map will copy all nested arrays, returning a new array that holds the results (just like a python list comprehension). This is needed because in js "var newTriangles = triList.slice()" would only reference the already existing arrays, meaning changes done on the new would also be made to the original.
		return arr.slice(); // Copy the data to a new array. This works for 1 dimensional arrays.
	});

	// For every vertices, loop through every vertices that is not the current vertex.
	// Then compare the values of the old vertex with that of the new vertex, 
	// if they are equal check every triangle's point's for the old vertex and replace it with the new vertex.
	// The varable "key" is the old vertex.
	// The varable "checkKey" is the new vertex.
	// The "Number()" function just converts string to int. For some reason when a for loop declares the key in object, the keys are given as strings.
	for (var key in newVertices){
		for(var checkKey in newVertices){
			if (key != checkKey){

				strArray1 = newVertices[key].toString();
				strArray2 = newVertices[checkKey].toString();
				if(strArray1 == strArray2){ // Array to string for comparision, maybe use this later: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript

					newTriangles.forEach(function(numbArray){
						numbArray.forEach(function(numb,ind,arr){ // The object, index and the array are passed into the loop. https://stackoverflow.com/questions/12482961/is-it-possible-to-change-values-of-the-array-when-doing-foreach-in-javascript
							if (numb == Number(key)){
								arr[ind] = Number(checkKey);
							}
						});
					});
				}
			}
		}
		// The delete should be down here after the key is completely done being used.
		delete newVertices[key];
	}
	return newTriangles;
}




// The main magic, this function converts the users input into voxels.
function interpret (code) {

	var voxelObjs = []; // The array to put all voxels in.
	
	var lines = code.split('\n');

	var linesSplit = lines.map(function(line){
		return tempSplit = line.split('['); // This will give us the first word of each line as index 0 of tempSplit. So we will know what to do with lines that start with "fill" or what not.
	});

	// Loop through every line and check the header to see what function needs to be done.
	// Currently the "linesSplit" var is an array of strings.
	linesSplit.forEach(function(line,index,array){

		if (line[0].indexOf('*') == -1) { // If the line does not contain the comment symbol... Remember if ".indexOf" returns -1 then the character is not in the string.


			if(line[0].indexOf('fill') >= 0){ // If the "fill" header can be found. indexOf help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf

				// Find out the fill limits, the beginning and end limits.
				// line[1] contains the fillParameters.
				var fillParametersNumbers = [];
				line[1].split(',').forEach(function(str,index,array){ // Split each the string by the commas and convert each of those to a int, if the string segment cannot be made into an int, do some error check to check for something like "50]", but if that is not the case, disregard the part that is not a number.

					// Now convert the fill parameters from strings to numbers, throwing out the non-numbers like commas and } or )
					var numb = parseFloat(str); // Number(str); the number function return spaces as zeros so I need something more strict, thus the parseFloat.

					// Error checking for the last number in array like "100]" NOTE: This check might actually not be necessary because parseFloat('0.5]') == 0.5, look at more later...
					if(numb == NaN && str.indexOf(']') >= 0 ){ // So if the string char can actually be converted to a number... Basically we want to say if(NaN) than don't add it to the array. And we have error checking for something like "100]".
						
						strNumb = str.split(']')[0]; // This will cut the string in half at the point where "]" is found, we then take the first index of that split string, which is just the number.
						numb = parseFloat(strNumb);
					}


					if(numb || numb == 0){ // if(0) is always false, so I need to check is the numb is equal to 0.
						fillParametersNumbers = fillParametersNumbers.concat(numb);
					}
				});


				// Actually find out what voxels we are supposed to fill in...
				var fillElements = []; // This stores the voxels that will actually make up the fill.
				for (var i = index + 1; array[i].indexOf('}') < 0; i++){ // Go through the next few lines until we find a line that contains the "}" meaning the close of the function. Could be written as: "array[i].indexOf('}') == -1".

					tempNumberHolder = []; // This is to hold all number data for the voxel object on this line. This is needed to add each voxel as an index in a nested array.
					
					// I need to account for negative numbers, so spliting lines by each charater is troublesome...
					// I also need to account for numbers with more charaters than one.
					// So I split each one by a comma then check each split for a number.
					array[i][1].split(',').forEach(function(str,index,array){ // The "array[i][1].split(',')" means that we are checking each number in the second index because the first index is just a empty string because of how it was previously formatted.
						
						var numb = parseFloat(str);

						// Error checking for the last number in array like "100]"
						if(numb == NaN && str.indexOf(']') >= 0 ){
							strNumb = str.split(']')[0]; // This will cut the string in half at the point where "]" is found, we then take the first index of that split string, which is just out number.
							numb = parseFloat(strNumb);
						}


						if(numb || numb == 0){ // if(0) is always false, so I need to check is the numb is equal to 0.
							tempNumberHolder = tempNumberHolder.concat(numb);
						}
					});
					fillElements = fillElements.concat([tempNumberHolder]);
					array[i][0] = '*'; // After the voxel parameters have been recorded, make that line commented out. This is a work around so that the voxels inside of the fill command are not called again after they have been used in the fill. Essentially, there was a bug where the interpreter would correctly do the fill command, but then would reread the voxels inside of that fill command and place them again as if they were regular voxel outside of the fill command. Commenting out the line once the fill command is done with it prevents the interpreter from rereading the line. Note: This just comments out the line from the array variable not the actual user input.
				}

				// Find the center of the group of voxel elements. I use it to transform the group as it is filled in over and over again.
				var elementsCenter = groupCenter(fillElements);

				// Calculate 3D line points based on fill parameters. These are the fill end points.
				var fillLinePoints = calculate3DLine(fillParametersNumbers[0], fillParametersNumbers[1], fillParametersNumbers[2], fillParametersNumbers[3], fillParametersNumbers[4], fillParametersNumbers[5]);

				// Next I need to find out the transform needed to make the center be the starting point for the fill.
				fillLinePoints.forEach(function(point){
					// The transform is just the difference between the center and the line point.
					var transform = [ point[0] - elementsCenter[0], point[1] - elementsCenter[1], point[2] - elementsCenter[2] ];

					fillElements.forEach(function(element){
						// Move each fill element by the transform.
						var transformedPosition = [ element[0] + transform[0], element[1] + transform[1], element[2] + transform[2] ];

						// Make a new voxel object for this transformed/moved fill element.
						var fillVox = new voxel(transformedPosition[0], transformedPosition[1], transformedPosition[2], element[3], element[4], element[5]); // Retain the rgb color of the current element, it does not need to be changed.
						voxelObjs = voxelObjs.concat(fillVox);
					});
				});
			}

			// If the "voxel" command can be found.
			else if(line[0].indexOf('voxel') >= 0){

				var voxelParameters = [];
				line[1].split(',').forEach(function(str,index,array){ // Split each the string by the commas and convert each of those to a int, if the string segment cannot be made into an int, do some error check to check for something like "50]", but if that is not the case, disregard the part that is not a number.

					var numb = parseFloat(str);

					// Error checking for the last number in array like "100]"
					if(numb == NaN && str.indexOf(']') >= 0 ){
						
						strNumb = str.split(']')[0]; // This will cut the string in half at the point where "]" is found, we then take the first index of that split string, which is just the number.
						numb = parseFloat(strNumb);
					}


					if(numb || numb == 0){ // if(0) is always false, so I need to check is the numb is equal to 0.
						voxelParameters = voxelParameters.concat(numb);
					}
				});

				var elseVoxel = new voxel(voxelParameters[0], voxelParameters[1], voxelParameters[2], voxelParameters[3], voxelParameters[4], voxelParameters[5]);
				voxelObjs = voxelObjs.concat(elseVoxel); // Maybe use .push instead...
			}

			// If the "grid:off" header can be found.
			else if( line[0].indexOf('grid:off') >= 0 || line[0].indexOf('grid: off') >= 0 ){
				grid = false;
			}
			// If the "grid:on" header can be found.
			else if( line[0].indexOf('grid:on') >= 0 || line[0].indexOf('grid: on') >= 0 ){
				grid = true;
			}

			// If the "filename:" header can be found, set file name for the voxel model.
			else if( line[0].indexOf('filename:') >= 0){
				var tempFileName = line[0].split(':'); // Split the line at the colon so the actual name will be tempFileName index 1.
				name = tempFileName[1];
			}


			// If the "cube" header can be found.
			else if(line[0].indexOf('cube') >= 0){

				var cubeParametersNumbers = [];
				line[1].split(',').forEach(function(str,index,array){ // Split each the string by the commas and convert each of those to a int, if the string segment cannot be made into an int, do some error check to check for something like "50]", but if that is not the case, disregard the part that is not a number.

					var numb = parseFloat(str);

					// Error checking for the last number in array like "100]"
					if(numb == NaN && str.indexOf(']') >= 0 ){
						
						strNumb = str.split(']')[0]; // This will cut the string in half at the point where "]" is found, we then take the first index of that split string, which is just the number.
						numb = parseFloat(strNumb);
					}


					if(numb || numb == 0){ // if(0) is always false, so I need to check is the numb is equal to 0.
						cubeParametersNumbers = cubeParametersNumbers.concat(numb);
					}
				});

				// The startPoint needs to be less than the end point (A.K.A it needs to be the smallest point). Here I am checking which point is smallest and making that the startPoint and the other bigger point becomes the end point.
				if ( (cubeParametersNumbers[0] + cubeParametersNumbers[1] + cubeParametersNumbers[2]) <= (cubeParametersNumbers[3] + cubeParametersNumbers[4] + cubeParametersNumbers[5]) ){ // Using "<=" instead of "<" to catch both points being the same...
					var startPoint = [ cubeParametersNumbers[0], cubeParametersNumbers[1], cubeParametersNumbers[2] ];
					var endPoint = [ cubeParametersNumbers[3], cubeParametersNumbers[4], cubeParametersNumbers[5] ];
				} else { // If the last point given in the cube parameter is smaller then the first given, make last point the startPoint.
					var startPoint = [ cubeParametersNumbers[3], cubeParametersNumbers[4], cubeParametersNumbers[5] ];
					var endPoint = [ cubeParametersNumbers[0], cubeParametersNumbers[1], cubeParametersNumbers[2] ];
				}

				// Get the Width, Length, and Height of the cube, by x2 - x1 and so on.
				// These will be the distance to go from the startPoint in all directions.
				var xDistance = endPoint[0] - startPoint[0];
				var yDistance = endPoint[1] - startPoint[1];
				var zDistance = endPoint[2] - startPoint[2];

				// Using the absolute value of the distance to avoid negative distances. Like what would occur with "cube[-1,-100,5, 1,1,1]". In this zDistance = -4, which would break the cube loop below.
				for (var z = 0; z <= Math.abs(zDistance); z++){ // The cube needs to include end points, thus I used "<=" so that it includes the last point. If this were a cube in real life including the end point voxel would make it one unit bigger than it should be. This is sort of the case here too, but I keep it this way because it makes sense to include the endPoint in a voxel editing program.
					for (var x = 0; x <= Math.abs(xDistance); x++) {
						for (var y = 0; y <= Math.abs(yDistance); y++) {

							// Use a Conditional (ternary) Operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
							// If the xDistance is a negative number, subtract the x-step instead of adding it to the startPoint by making it negative: -x == (x * -1)
							// If the distance is positive, just add the x-step to the startPoint.
							var xOffset = (xDistance < 0) ? -x : x; // if xDistance less than 0 make it '-x' else make it 'x'.
							var yOffset = (yDistance < 0) ? -y : y;
							var zOffset = (zDistance < 0) ? -z : z;

							// Actually make a new voxel object for each point in the cube.
							var currentVoxel = new voxel( startPoint[0]+xOffset, startPoint[1]+yOffset, startPoint[2]+zOffset, cubeParametersNumbers[6], cubeParametersNumbers[7], cubeParametersNumbers[8] ); // The StartPoint plus the offset of the step. The "cubeParametersNumbers[6], cubeParametersNumbers[7], cubeParametersNumbers[8]" is for RGB color parameters.
							voxelObjs.push(currentVoxel); // Trying ".push" instead of ".concat".
						}
					}
				}
			}
		} // End of comment symbol check.
	});

	return voxelObjs; // This is an array of objects.
}


// This function is used by the fill command to get the center of the shape set to be filled.
function groupCenter(voxels) {
	var x,y,z;

	// Use "voxels[0][0]" to set an initial value, so the initial value will always be based on real numbers that are in the parameters.
	var xMin = voxels[0][0], yMin = voxels[0][1], zMin = voxels[0][2];
	var xMax = voxels[0][0], yMax = voxels[0][1], zMax = voxels[0][2];


	voxels.forEach(function(vox){

		vox.forEach(function(pos, index){ // pos is the value of either the voxel x,y, or z.
			// Maybe use a turnery operator here...
			if(pos < xMin && index == 0){
					xMin = pos;
			}

			if(pos > xMax && index == 0){
					xMax = pos;
			}


			if(pos < yMin && index == 1){
					yMin = pos;
			}

			if(pos > yMax && index == 1){
					yMax = pos;
			}


			if(pos < zMin && index == 2){
					zMin = pos;
			}

			if(pos > zMax && index == 2){
					zMax = pos;
			}


		});


	});

	// I now have the buttom and top most corners of my bounding box.

	// These are the lengths of the sides, so to speak, of the bounding box.
	x = xMax + xMin;
	y = yMax + yMin;
	z = zMax + zMin;

	// Get the center point, but still fixed on a grid.
	var centerPos = [Math.floor(x/2), Math.floor(y/2), Math.floor(z/2)];

	return centerPos;
}



// Returns a dataURL for a stl file of the voxel model.
function exportStlDataURL(vertices, triangles, normals){

	var data = 'data:text/plain;charset=utf-8,solid%20Default%0a';

	for (var i = 0; i < triangles.length; i++){

		// Must use "%0a" for new line, "%20" for spaces, and "%09" for tabs.
		data += "%20%20facet%20normal%20" + normals[i].join('%20') + "%0a";
		data += "%20%20%20%20outer%20loop" + "%0a";
		data += "%20%20%20%20%20%20vertex%20" + vertices[triangles[i][0]].join('%20') + "%0a";
		data += "%20%20%20%20%20%20vertex%20" + vertices[triangles[i][1]].join('%20') + "%0a";
		data += "%20%20%20%20%20%20vertex%20" + vertices[triangles[i][2]].join('%20') + "%0a";
		data += "%20%20%20%20endloop" + "%0a";
		data += "%20%20endfacet" + "%0a";

	}

	data += "endsolid%20Default";
	
	return data;

}



function exportObjDataURL(vertices, triangles, normals, colorPalette, triangleColors){

	var data = 'data:text/plain;charset=utf-8,';

	// Setup object group and material in OBJ.
	data += 'g%20' + name + '%0a';
	data += 'mtllib%20' + name + '.mtl%0a';
	data += 'usemtl%20' + name + '%0a';

	// Add some whitespace
	data += '%0a%0a';

	
	// Write Vertices
	// "Object.keys(object).length" allows me to get the length of an object variable.
	for (var i = 0; i < colorPalette.length; i++){

		var step = (1/colorPalette.length) * i;
		var offset = (1/colorPalette.length) - (1/(2*colorPalette.length));

		data += 'vt%20' + (step + offset) + '%200%0a';
		// The above code sets the UV at an offset to each color on the palette so there is no half-and-half textures.
	}


	// Add some whitespace
	data += '%0a%0a';


	// Write UV coordinates.
	// Need to keep track of all colors used with a pallet and keep colorWdith and total colors...
	for (var i = 0; i < Object.keys(vertices).length; i++){
		data += 'v%20' + vertices[i].join('%20') + '%0a';
	}


	// Add some whitespace
	data += '%0a%0a';


	// Write Normals
	for (var i = 0; i < normals.length; i++){
		data += 'vn%20' + normals[i].join('%20') + '%0a';
	}


	// Add some whitespace
	data += '%0a%0a';


	// Write Faces (Triangles)
	// Note: In .obj files the vertex, normals, and UV counts all start at 1 and not 0.
	// This means I have to add 1 to all of these array indexs when writing them to the obj.
	// Face format is: vertex/UV/Normal
	// Normals and UV should just match the triangle in iteration. A.K.A they should just be i+1
	for (var i = 0; i < triangles.length; i++){
		data += 'f%20' + (triangles[i][0]+1) + '/' + (triangleColors[i] +1) + '/' + (i+1)
		+ '%20' + (triangles[i][1]+1) + '/' + (triangleColors[i] +1) + '/' + (i+1)
		+ '%20' + (triangles[i][2]+1) + '/' + (triangleColors[i] +1) + '/' + (i+1)
		+ '%0a';
	}

	
	return data;

}


// Exports the colors used in the voxel model into a nice dataURL.
function exportPNG(colorPalette){

	var canvasElement = document.createElement('canvas');
	canvasElement.width = colorPalette.length * 10;
	canvasElement.height = 10;

	var draw2D = canvasElement.getContext('2d');

	// Fill the color palette.
	for(var i = 0; i < colorPalette.length; i++){
		drawBox2D(draw2D, i*10, 0, 10, colorPalette[i]);
	}

	var data = canvasElement.toDataURL('image/png');

	// I since we are not doing anything like a ".click()" invoke, it is not necessary to .appendChild() or .remove() to the html page.

	return data;
}

// Draws a 2D box on a 2D canvas context.
// Color should be an array of [R,G,B]. 0-255
function drawBox2D(draw2DContext, x, y, size, color){
	draw2DContext.beginPath();
	draw2DContext.rect(x, y, size, size);
	draw2DContext.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
	draw2DContext.fill();
	draw2DContext.closePath();
}


// Gets the index of a nested array inside of the parent array.
function indexOfNested(arr, nested){
	strArr = arr.map(function(element){
		return element.toString();
	});
	return strArr.indexOf(nested.toString());
}


// Calculates the points of a line in 3D.
function calculate3DLine(x1,y1,z1, x2,y2,z2){

	var vector = [];
	var linePoints = [];

	
	
	// What we are doing here is checking to make sure the largest numerical value, for each point, is selected. 
	// Then we are comparing those points, based on these largest numbers that we just found, to see which contains the largest value over all the axes (x,y, and z).
	// Finding the point that has the largest axis value will allow us to calculate line points based on a positive number instead of negative ones.
	// I chose to do this so it would be easy to find which axis should be used to determine how we step through the 3D line. The axis with the biggest value is used.
	// The end effect of all this is a smooth line with logical points in 3D space.

	// I use "biggest1 = x1" to set an initial value, so the initial value will always be based on real numbers that are in the parameters.
	var biggest1 = x1;
	var biggest2 = x2;


	// No need to check x since x is the initial value.
	if (y1 > biggest1) {biggest1 = y1;}
	if (z1 > biggest1) {biggest1 = z1;}

	if (y2 > biggest2) {biggest2 = y2;}
	if (z2 > biggest2) {biggest2 = z2;}

	// Check to make sure points are smallest to largest, so the loops work right later. (I do "point2 - point1" so having point2 be largest will produce positive variables.)
	// If the first point (which is supposed to be smaller) is the biggest point, switch the two points.
	if (biggest1 > biggest2) {
		// Clean, easy to follow, method for swapping two variables.
		var xTemp = x1;
		var yTemp = y1;
		var zTemp = z1;

		x1 = x2;
		y1 = y2;
		z1 = z2;

		x2 = xTemp;
		y2 = yTemp;
		z2 = zTemp;
	}
	
	

	// Calculate Vector
	vector[0] = x2 - x1;
	vector[1] = y2 - y1;
	vector[2] = z2 - z1;


	// Calculate line points
	if ( x1 != x2 && vector[0] >= vector[1] && vector[0] >= vector[2] ){ // If the x values are not the same step, through by x values to find the points. And only use x to step if the two x-points have the greatest(or equal) distance between the points. This greatest difference/distance will allow the line points to be close together and smooth. Remember the vector array holds the calculated differences in distance. Then, if the x distance is not the greatest, do the same check for Y & Z.
		for (var x = x1, i = 0; x != x2; x++, i++) {
			var t = (x - x1)/vector[0];

			linePoints[i] = [];
			linePoints[i][0] = x;
			linePoints[i][1] = vector[1] * t + y1;
			linePoints[i][2] = vector[2] * t + z1;
		}
	} else if ( y1 != y2  && vector[1] >= vector[0] && vector[1] >= vector[2] ){ // Step on the y-axis if x is constant between both points, and if the x distance is not the greatest.
		for (var y = y1, i = 0; y != y2; y++, i++) {
			var t = (y - y1)/vector[1];

			linePoints[i] = [];
			linePoints[i][0] = vector[0] * t + x1;
			linePoints[i][1] = y;
			linePoints[i][2] = vector[2] * t + z1;
		}
	} else if ( z1 != z2  && vector[2] >= vector[0] && vector[2] >= vector[1] ){ // Step on the z-axis if x & y are constant between both points, and if the x & y distances are not the greatest.
		for (var z = z1, i = 0; z != z2; z++, i++) {
			var t = (z - z1)/vector[2];

			linePoints[i] = [];
			linePoints[i][0] = vector[0] * t + x1;
			linePoints[i][1] = vector[1] * t + y1;
			linePoints[i][2] = z;
		}
	} else { // If the two points are the same point, just make i = 0 so that one point can be add to the array.
		var i = 0;
	}

	// Insert the final end point.
	linePoints[i] = [];
	linePoints[i][0] = x2;
	linePoints[i][1] = y2;
	linePoints[i][2] = z2;

	// Return the 2D array that holds all the point of the line.
	return linePoints;
}


// This can be used to cause a download from a <button> or anywhere else in the js!
function downloadDataURL(dataURL, filename){

	// Create a new <a> DOM element. And set it with the data URL and filename.
	var aElement = document.createElement('a');
	aElement.href = dataURL;
	aElement.download = filename;
	
	// The <a> element does not need to have text for this method to work, so the next line is optional.
	//aElement.innerHTML = 'FooBar';

	// The new element must be inserted into the html before it is click-able. This is required for firefox, but not safari and maybe not in Chrome either.
	document.body.appendChild(aElement);
	// Simulate a click on the new element.
	aElement.click();
	// Remove the element so the html page is returned to normal condition.
	aElement.remove();
}



