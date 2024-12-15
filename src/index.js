import * as THREE from 'three';
import { loadModel, detectFunction } from './handLandMarkDetection';
import { requestCameraAccess } from './accessUserCameraDetectLandMarks';
import { pincingobj } from './handLandMarkDetection';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a line (optional example geometry)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(geometry, material);
box.position.set(0, 0,-3); // Place in the scene
const axesHelper = new THREE.AxesHelper(5); // Argument is the size of the axes lines
scene.add(box,axesHelper);
camera.position.z = 5;
box.rotation.x = 2
// Array to hold spheres for hand landmarks
let spheres = [];

function createSphere(x, y, z) {
    // console.log(x,y,z)
    const radius = 0.2; // Smaller radius for a smaller sphere
    const widthSegments = 8;
    const heightSegments = 8;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(-x,y,z);
    return sphere;
}

function renderHand(hands) {
    // Remove previously rendered spheres
    spheres.forEach(sphere => scene.remove(sphere));
    spheres = [];

    if (hands.length === 0) return;

    hands.forEach(hand => {
        hand.forEach(landmark => {
            const sphere = createSphere(landmark.x, landmark.y, landmark.z);
            spheres.push(sphere);
            scene.add(sphere);
        });
    });
}





await loadModel();
let video = await requestCameraAccess();
console.log("video is ", video);

mainLoop();

// Main loop that handles all the loop tasks
async function mainLoop() {
    const data = await detectFunction(video);
    renderer.render(scene, camera)
    renderHand(data);
    requestAnimationFrame(mainLoop);
}
export {box}