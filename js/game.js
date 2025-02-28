class Game {
  constructor() {
    this.initThree();
    this.initLighting();
    this.initEventListeners();

    this.score = 0;
    this.isPlaying = false;
    this.clock = new THREE.Clock();

    // Create skate park
    this.skatePark = new SkatePark(this.scene);

    // Create skater
    this.skater = new Skater(this.scene);

    // Pass skatePark reference to skater
    this.skater.setSkatePark(this.skatePark);

    // Physics initialization
    this.physics = new Physics();

    // Pass physics reference to skater
    this.skater.setPhysics(this.physics);

    // Animation loop
    this.animate();
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 30);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document
      .getElementById('game-canvas')
      .appendChild(this.renderer.domElement);

    // Controls (commented out for gameplay, but useful for debugging)
    // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  initLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(50, 100, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.scene.add(this.sunLight);
  }

  initEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start button
    document.getElementById('start-button').addEventListener('click', () => {
      document.getElementById('start-screen').style.display = 'none';
      this.isPlaying = true;
      this.clock.start();
    });
  }

  updateScore(points) {
    this.score += points;
    document.getElementById('score').textContent = this.score;
  }

  updateTrick(trickName) {
    document.getElementById('trick').textContent = trickName;
    // Show trick name temporarily
    setTimeout(() => {
      if (document.getElementById('trick').textContent === trickName) {
        document.getElementById('trick').textContent = 'None';
      }
    }, 2000);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    if (this.isPlaying) {
      const delta = this.clock.getDelta();

      // Update physics
      this.physics.update(delta);

      // Update skater
      this.skater.update(delta, this.physics);

      // Update camera to follow skater
      this.updateCamera();

      // Check for tricks
      this.checkTricks();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateCamera() {
    // Third-person camera following the skater
    const skaterPosition = this.skater.getPosition();
    const skaterDirection = this.skater.getDirection();

    // Position camera behind the skater
    this.camera.position.x = skaterPosition.x - skaterDirection.x * 10;
    this.camera.position.y = skaterPosition.y + 5;
    this.camera.position.z = skaterPosition.z - skaterDirection.z * 10;

    // Look at skater
    this.camera.lookAt(skaterPosition);
  }

  checkTricks() {
    const trick = this.skater.getCurrentTrick();
    if (trick) {
      this.updateTrick(trick.name);
      this.updateScore(trick.points);
    }
  }
}

// Initialize game when window loads
window.addEventListener('load', () => {
  const game = new Game();
});
