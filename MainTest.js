
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const frustumSize = 3;

const chair = new GLTFLoader();
const coffeTable = new GLTFLoader();
const desk = new GLTFLoader();
const estantes = new GLTFLoader();
const pc = new GLTFLoader();
const plant = new GLTFLoader();
const puff = new GLTFLoader();
const sideTable = new GLTFLoader();
const tapete = new GLTFLoader();
const room = new GLTFLoader();
const pcOutline = new GLTFLoader();
const pcScreen = new GLTFLoader();

let pcModel;
let pcFunctionOpen = false;

let pcOutlineModel;

const models = [];

const highlightedMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

let closestIntersectedObject = null;

function init() {

    // ---------------------------------------
    //            RENDER AND SCENE
    // ---------------------------------------

    renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true});

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    // ---------------------------------------
    //         CAMERA AND CONTROLS
    // ---------------------------------------

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
    
    camera.position.set( 200, 150, 200 );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.735 , 0 );
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    controls.minZoom = 1;
	controls.maxZoom = 5;

    // ---------------------------------------
    //                LIGHTS
    // ---------------------------------------

    const light = new THREE.DirectionalLight( 0xffffff, 2);
    light.position.set( 1.5, 1.5, 1.5);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    
    scene.add( light );
    scene.add( light.target );

    //shadow properties
    light.shadow.mapSize.width = 3000; 
    light.shadow.mapSize.height = 3000; 
    light.shadow.camera.near = 1; 
    light.shadow.camera.far = 5; 

    // ----------------------------------------------------------------------
    //                         -- ADDING OBJECTS --
    // ----------------------------------------------------------------------

    // Load all the models as separate meshes

    function loadModel(loader, path, callback) {
        loader.load(path, function (gltf) {
            const model = gltf.scene;
            scene.add(model);
            models.push(model);
    
            model.traverse(function (node) {
                if (node.isMesh) {
                    // Store the original material for each mesh
                    node.userData.originalMaterial = node.material.clone();
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
    
            // Check if this is the PC model and assign it to pcModel
            if (callback) {
                callback(model);
            }
        }, undefined, function (e) {
            console.error(e);
        });
    }

    loadModel(chair, 'GLTF/chair.gltf');
    loadModel(coffeTable, 'GLTF/coffeTable.gltf');
    loadModel(desk, 'GLTF/desk.gltf');
    loadModel(estantes, 'GLTF/estantes.gltf');
    loadModel(pcScreen, 'GLTF/pcScreen2.gltf');

    loadModel(pc, 'GLTF/pc.gltf', function (model) {
        pcModel = model;
    });

    loadModel(pcOutline, 'GLTF/pcOutline.gltf', function (model) {
        pcOutlineModel = model;
        pcOutlineModel.visible = false;
    });

    loadModel(plant, 'GLTF/plant.gltf');
    loadModel(puff, 'GLTF/puff.gltf');
    loadModel(sideTable, 'GLTF/sideTable.gltf');
    loadModel(tapete, 'GLTF/tapete.gltf');
    loadModel(room, 'GLTF/room.gltf');

}

function restoreOriginalMaterial(object) {
    object.traverse(function (node) {
        if (node.isMesh) {
            node.material = node.userData.originalMaterial;
        }
    });
}

function animate() {
    window.requestAnimationFrame(animate);

    controls.update();

    raycaster.setFromCamera(pointer, camera);

    // Restore original material for all models
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        restoreOriginalMaterial(model);
    }

    // Find the closest intersected object
    const intersects = raycaster.intersectObjects(models, true);

    if (intersects.length > 0) {

        closestIntersectedObject = intersects[0].object.parent;

    } else {

        closestIntersectedObject = null;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

	camera.left = - frustumSize * aspect / 2;
	camera.right = frustumSize * aspect / 2;
	camera.top = frustumSize / 2;
	camera.bottom = - frustumSize / 2;

	camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//-----------------------------------------------

function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


//-----------------------------------------------
//               -- PC FUNCTION --
//-----------------------------------------------

function pcOpen() {
    if (!pcFunctionOpen) {
        // Your code for handling the click to open the PC function
        console.log('PC opened! Open action triggered.');

        pcOutlineModel.visible = false;

        // Stop orbit controls
        controls.enabled = false;

        // Set a new camera position
        const newCameraPosition = new THREE.Vector3(0, 50, 100);
        camera.position.set(0.45, 0.65, 0.25);
        controls.target.set(0, 0.55, -0.8); // Optional: Set a new target for the camera to look at

        camera.zoom = 10.0; // Adjust this value based on your requirements

        camera.near = 0.1; // Adjust these values based on your scene
        camera.far = 10; // Adjust these values based on your scene

        // Update the camera projection matrix
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();

        // Render the scene with the updated camera
        renderer.render(scene, camera);

        // Add a close button to the HTML document
        const closeButton = document.createElement('button');
        closeButton.innerHTML = 'CLOSE PC';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '75%';
        closeButton.style.left = '50%';
        closeButton.style.transform = 'translate(-50%, -50%)';
        closeButton.style.padding = '15px 30px';
        closeButton.style.background = '#fff';
        closeButton.style.borderRadius = '20px';
        closeButton.style.border = 'none';
        closeButton.style.fontFamily = 'Roboto, sans-serif';
        closeButton.style.fontWeight = '300';
        closeButton.style.fontSize = '18px';
        document.body.appendChild(closeButton);

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = '#eee'; // Change color on hover
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = '#fff'; // Change color on hover
        });


        // Add an event listener to the close button
        closeButton.addEventListener('click', closePCFunction);
    } else {
        // Your code for handling the click to close the PC function
        console.log('PC closed! Close action triggered.');
    
        // Restart orbit controls
        controls.enabled = true;
    
        // Reset the camera to its initial configuration
        camera.position.set(200, 150, 200);
        controls.target.set(0, 0.735, 0);
        camera.zoom = 1.0;
    
        // Reset near and far values to match the original settings
        camera.near = 1;
        camera.far = 1000;
    
        // Update the camera projection matrix
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
    
        // Remove the close button from the HTML document
        const closeButton = document.querySelector('button');
        if (closeButton) {
            closeButton.remove();
        }
    }

    // Toggle the PC function state
    pcFunctionOpen = !pcFunctionOpen;
}


function closePCFunction() {
    // Trigger the pcOpen function to close the PC function
    pcOpen();
}

window.addEventListener('pointerdown', onClick, false);

function onClick(event) {
    // Calculate normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast from the camera
    raycaster.setFromCamera(pointer, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(models, true);

    // Check if there is a closest intersected object
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Check if the clicked object is a descendant of the PC model
        if (clickedObject.isDescendantOf(pcModel)) {
            // Trigger the pcOpen function
            pcOpen();
            console.log('PC Clicked!');
        } else {
            console.log('Clicked object is not the PC.');
        }
    } else {
        console.log('No object clicked.');
    }
}

function overPc(event) {
    console.log('over the scene');

    if (!pcFunctionOpen) {
    // Calculate normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast from the camera
    raycaster.setFromCamera(pointer, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(models, true);

    // Check if there is a closest intersected object
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Check if the clicked object is a descendant of the PC model
        if (clickedObject.isDescendantOf(pcModel)) {
            // Make pcOutlineModel visible
            pcOutlineModel.visible = true;
            console.log('over PC! pcOutlineModel visible');
        } else {
            // Make pcOutlineModel invisible
            pcOutlineModel.visible = false;
            console.log('not over PC. pcOutlineModel invisible');
        }
    } else {
        // Make pcOutlineModel invisible
        pcOutlineModel.visible = false;
        console.log('No event trying. pcOutlineModel invisible');
    }
} else {
    // PC is open, do nothing or handle it differently
}

}

THREE.Object3D.prototype.isDescendantOf = function (ancestor) {
    let parent = this.parent;
    while (parent !== null) {
        if (parent === ancestor) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
};

window.addEventListener( 'pointermove', overPc );

window.addEventListener( 'pointermove', onPointerMove );

//-----------------------------------------------

window.addEventListener('resize', onWindowResize, false);

init();
animate();