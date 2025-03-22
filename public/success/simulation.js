// Inject CSS keyframes for our custom animations
(function () {
  var style = document.createElement("style");
  style.innerHTML = `
    @keyframes barFadeInHoldOut {
      0% { opacity: 0; }
      33.33% { opacity: 1; }
      66.66% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes maxi2FadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes maxi2Rotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();

var Simulation = (function () {
  // Private variables
  var scene, camera, renderer, controls, clock;
  var particleSystem, particlePositions, particleVelocities;
  var galaxySystem = null;
  var nebula = null;
  var particleCount = 20000;
  var params;
  var barImage, maxi2Image;
  var nebulaFadeStartTime = 0;
  var nebulaFadeDuration = 3;
  var nebulaTargetOpacity = 0.7;
  var gui;

  function init() {
    // Create scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 200);

    // Create renderer and add to document
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    // Lights
    var ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    var pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Create particle system
    createParticleSystem();

    // Set up GUI
    setupGUI();

    // Create and animate bar.png
    barImage = document.createElement("img");
    barImage.src = "textures/bar.png";
    barImage.style.position = "absolute";
    barImage.style.top = "50%";
    barImage.style.left = "50%";
    barImage.style.transform = "translate(-50%, -50%)";
    barImage.style.height = "50vh";
    barImage.style.width = "auto";
    barImage.style.animation = "barFadeInHoldOut 9s forwards";
    document.body.appendChild(barImage);

    // Create and animate maxi2.png
    maxi2Image = document.createElement("img");
    maxi2Image.src = "textures/maxi2.png";
    maxi2Image.style.position = "absolute";
    maxi2Image.style.top = "50%";
    maxi2Image.style.left = "50%";
    maxi2Image.style.transform = "translate(-50%, -50%)";
    maxi2Image.style.height = "50vh";
    maxi2Image.style.width = "auto";
    maxi2Image.style.opacity = "0";
    maxi2Image.style.animation = "maxi2FadeIn 3s forwards 5s, maxi2Rotate 20s linear infinite 8s";
    document.body.appendChild(maxi2Image);

    // Clock and window resize listener
    clock = new THREE.Clock();
    window.addEventListener("resize", onWindowResize, false);
    nebulaFadeStartTime = clock.elapsedTime;
  }

  function createParticleSystem() {
    var geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = new Float32Array(particleCount * 3);

    for (var i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      var theta = Math.random() * 2 * Math.PI;
      var phi = Math.acos(Math.random() * 2 - 1);
      var speed = Math.random() * 0.5 + 0.5;
      particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      particleVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      particleVelocities[i * 3 + 2] = speed * Math.cos(phi);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    var sprite = generateSprite();
    var material = new THREE.PointsMaterial({
      size: 2,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.8,
      color: 0xffffff,
    });
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function generateSprite() {
    var canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    var context = canvas.getContext("2d");

    var gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(173, 216, 230, 0.8)");
    gradient.addColorStop(0.4, "rgba(135, 206, 250, 0.6)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function setupGUI() {
    params = {
      expansionSpeed: 50,
      particleSize: 1.5,
      showSensorMetrics: false
    };
    gui = new dat.GUI({ width: 300 });
    gui.add(params, "expansionSpeed", 10, 200).name("Expansion Speed");
    gui
      .add(params, "particleSize", 1, 10)
      .name("Particle Size")
      .onChange(function (value) {
        if (particleSystem) particleSystem.material.size = value;
      });
    gui.close();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function updateParticles(delta) {
    var positions = particleSystem.geometry.attributes.position.array;
    for (var i = 0; i < particleCount; i++) {
      var index = i * 3;
      positions[index] += particleVelocities[index] * params.expansionSpeed * delta;
      positions[index + 1] += particleVelocities[index + 1] * params.expansionSpeed * delta;
      positions[index + 2] += particleVelocities[index + 2] * params.expansionSpeed * delta;
      
      var distance = Math.sqrt(
        positions[index] * positions[index] +
        positions[index + 1] * positions[index + 1] +
        positions[index + 2] * positions[index + 2]
      );
      if (distance > 500) {
         positions[index] = 0;
         positions[index + 1] = 0;
         positions[index + 2] = 0;
      }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  function updateNebula() {
    if (nebula && nebula.material.opacity < nebulaTargetOpacity) {
      var fadeElapsed = clock.elapsedTime - nebulaFadeStartTime;
      nebula.material.opacity = Math.min(
        nebulaTargetOpacity,
        (fadeElapsed / nebulaFadeDuration) * nebulaTargetOpacity
      );
    }
  }

  function animateSimulation() {
    requestAnimationFrame(animateSimulation);
    var delta = clock.getDelta();
    updateParticles(delta);
    updateNebula();
    controls.update();
    renderer.render(scene, camera);
  }

  // Public API
  return {
    start: function () {
      init();
      animateSimulation();
    },
    stop: function () {
      // Optional: implement cleanup
    },
  };
})(); 