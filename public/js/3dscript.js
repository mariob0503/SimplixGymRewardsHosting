import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Load Font and Create Text
const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.167.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const meshes = [];
    let totalWidth = 0;
    const spacing = 0.1;

    // Generate geometries for each character
    const geometries = [];
    for (const char of "SIMPLIX.SOLUTIONS") {
        const geometry = new TextGeometry(char, {
            font: font,
            size: 1,
            height: 0.2,
        });
        geometry.computeBoundingBox();
        const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        // Center each character's geometry
        const centerX = (geometry.boundingBox.min.x + geometry.boundingBox.max.x) / 2;
        geometry.translate(-centerX, 0, 0);
        geometry.computeBoundingBox();
        const newWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        geometries.push({ geometry, width: newWidth });
        totalWidth += newWidth + spacing;
    }
    totalWidth -= spacing;

    // Position meshes to center the text
    let left = -totalWidth / 2;
    for (const { geometry, width } of geometries) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = left + width / 2;
        left += width + spacing;
        scene.add(mesh);
        meshes.push(mesh);
    }

    // Camera Setup
    const d = 20; // Distance from text
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);

    // Camera Movement Parameters
    const a = 5; // x offset (top right and bottom left)
    const b = 5; // y offset

    // Animation Loop
    const clock = new THREE.Clock();
    let initialized = false;

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (t < 3) {
            // Camera movement cycle (3 seconds)
            const phase = t % 3;
            if (phase < 0.75) { // Center to top right
                const s = phase / 0.75;
                camera.position.x = s * a;
                camera.position.y = s * b;
            } else if (phase < 1.5) { // Top right to center
                const s = (phase - 0.75) / 0.75;
                camera.position.x = a - s * a;
                camera.position.y = b - s * b;
            } else if (phase < 2.25) { // Center to bottom left
                const s = (phase - 1.5) / 0.75;
                camera.position.x = s * (-a);
                camera.position.y = s * (-b);
            } else { // Bottom left to center
                const s = (phase - 2.25) / 0.75;
                camera.position.x = -a + s * a;
                camera.position.y = -b + s * b;
            }
            camera.position.z = d;
            camera.lookAt(0, 0, 0);
        } else {
            // After 3 seconds, camera stays put and text explodes
            camera.position.set(0, 0, d);
            camera.lookAt(0, 0, 0);

            if (!initialized) {
                // Initialize explosion velocities
                meshes.forEach(mesh => {
                    const direction = camera.position.clone().sub(mesh.position);
                    const speed = 10 + Math.random() * 5; // Vary speed between 10 and 15
                    mesh.userData.velocity = direction.normalize().multiplyScalar(speed);
                });
                initialized = true;
            }

            // Update mesh positions
            const deltaTime = clock.getDelta();
            meshes.forEach(mesh => {
                mesh.position.add(mesh.userData.velocity.clone().multiplyScalar(deltaTime));
            });
        }

        renderer.render(scene, camera);
    }
    animate();
});