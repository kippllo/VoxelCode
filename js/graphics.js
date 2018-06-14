/*
	Made by Rhett Thompson. ©2018 Rhett Thompson
	V 1.0
	
	License:
		VoxelCode is licensed to all under the MIT license,
		which can be found on the VoxelCode GitHub page: https://github.com/kippllo/VoxelCode
*/

var scene = new THREE.Scene();
var aspect = 1/1; // This will have to change with the size of the canvas... (window.innerWidth / window.innerHeight)
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({canvas: graphicsCanvas}); // "graphicsCanvas" is the html Canvas id. Help: https://github.com/mrdoob/three.js/issues/352


// Set BG color help: https://stackoverflow.com/questions/16177056/changing-three-js-background-to-transparent-or-other-color
scene.background = new THREE.Color(0x7d7d7d);

var light = new THREE.DirectionalLight( 0xdddddd, 1 ); // (color, intensity)
//light.position.set( -100, 100, 100 ); //the default is up: (0, 1, 0)
scene.add( light );


camera.position.set(-5, 5, -5); // Offset the camera a little so it does not spawn inside the cube command easily.
// Note rotation is set by the orbit script.


var controls = new THREE.OrbitControls(camera, renderer.domElement); // Adding "renderer.domElement" somehow fixes the issue where the canvas stole all the focus of the mouse/window/keyboard. Help: https://stackoverflow.com/questions/32151598/three-js-orbitcontrols-conflicting-with-html5-canvas
controls.enableKeys = false;



// Move the render function here so that it can be called without needed global variables.
var render = function() {
	requestAnimationFrame(render);
	controls.update();
	renderer.render(scene, camera);
};

render();


function infoToMesh(verts, tris, norms, colors){
	var geometry = new THREE.Geometry();

	var vertsArr = Object.keys(verts).map(function(key){
		return new THREE.Vector3(verts[key][0], verts[key][1], verts[key][2]);
	});

	vertsArr.forEach(function(vert){
		geometry.vertices.push(vert);
	});

	tris.forEach(function(tri, index){
		geometry.faces.push( new THREE.Face3(tri[0], tri[1], tri[2], /*Normals*/ new THREE.Vector3(norms[index][0], norms[index][1], norms[index][2]), /*Colors*/ new THREE.Color('rgb(' + colors[index][0] + ',' + colors[index][1] + ',' + colors[index][2] + ')') ) ); //Face help: https://threejs.org/docs/#api/core/Face3       //Color Help: https://threejs.org/docs/#api/math/Color
	});

	var material = new THREE.MeshToonMaterial({vertexColors: THREE.FaceColors}); // Help part 1: https://stackoverflow.com/questions/11252592/how-to-change-face-color-in-three-js          //Part 2: https://threejs.org/docs/#api/materials/Material

	var voxelTest = new THREE.Mesh(geometry, material);
	voxelTest.name = 'voxel';
	scene.add (voxelTest);
}


function removeMesh(voxMesh){
	scene.remove (voxMesh); // Remove help: https://stackoverflow.com/questions/40694372/what-is-the-right-way-to-remove-a-mesh-completely-from-the-scene-in-three-js?rq=1
	voxMesh.geometry.dispose();
	voxMesh.material.dispose();
	voxMesh = undefined; // Not sure if this part is necessary because every mesh is a local variable not only stored in the scene.
}

// Removes every voxel from the scene...
function removeAllVoxels(){

	while(scene.getObjectByName('voxel')) { // If there are still voxels in the scene...
		removeMesh(scene.getObjectByName('voxel'));
	}
}
