class Skater {
  constructor(scene) {
    this.scene = scene;

    this.position = new THREE.Vector3(0, 0.2, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, -1);
    this.speed = 0;
    this.maxSpeed = 15;
    this.acceleration = 20;
    this.deceleration = 10;
    this.jumpForce = 10;
    this.isOnGround = true;
    this.isJumping = false;
    this.isGrinding = false;
    this.isInAir = false;
    this.rotationSpeed = Math.PI;
    this.trickRotation = new THREE.Vector3(0, 0, 0);
    this.currentTrick = null;
    this.trickTimer = 0;

    // Keyboard state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      trick1: false,
      trick2: false,
      trick3: false,
      trick4: false,
    };

    this.createSkater();
    this.setupControls();
  }

  createSkater() {
    // Create a simple skateboard model
    const boardGeometry = new THREE.BoxGeometry(0.8, 0.1, 2);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Wood color
      roughness: 0.8,
      metalness: 0.2,
    });
    this.skateboard = new THREE.Mesh(boardGeometry, boardMaterial);
    this.skateboard.castShadow = true;
    this.scene.add(this.skateboard);

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.5,
    });

    // Create four wheels
    this.wheels = [];
    const wheelPositions = [
      { x: 0.4, z: 0.7 }, // Front right
      { x: -0.4, z: 0.7 }, // Front left
      { x: 0.4, z: -0.7 }, // Back right
      { x: -0.4, z: -0.7 }, // Back left
    ];

    for (let pos of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, -0.15, pos.z);
      wheel.castShadow = true;
      this.skateboard.add(wheel);
      this.wheels.push(wheel);
    }

    // Create a simple skater figure - using CylinderGeometry instead of CapsuleGeometry
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 0.8;
    this.skateboard.add(this.body);

    // Create a head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc99,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 1.6;
    this.skateboard.add(this.head);

    // Create arms and legs - using CylinderGeometry instead of CapsuleGeometry
    const limbGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
    const limbMaterial = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      roughness: 0.8,
      metalness: 0.2,
    });

    // Arms
    this.rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
    this.rightArm.position.set(0.5, 1.0, 0);
    this.rightArm.rotation.z = -Math.PI / 4;
    this.skateboard.add(this.rightArm);

    this.leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
    this.leftArm.position.set(-0.5, 1.0, 0);
    this.leftArm.rotation.z = Math.PI / 4;
    this.skateboard.add(this.leftArm);

    // Legs
    this.rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    this.rightLeg.position.set(0.2, 0.4, 0);
    this.skateboard.add(this.rightLeg);

    this.leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    this.leftLeg.position.set(-0.2, 0.4, 0);
    this.skateboard.add(this.leftLeg);

    // Set initial position
    this.skateboard.position.copy(this.position);
  }

  setupControls() {
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event.code);
    });

    document.addEventListener('keyup', (event) => {
      this.handleKeyUp(event.code);
    });
  }

  handleKeyDown(code) {
    switch (code) {
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        this.jump();
        break;
      case 'ArrowUp':
        this.keys.trick1 = true;
        this.doTrick('kickflip');
        break;
      case 'ArrowDown':
        this.keys.trick2 = true;
        this.doTrick('heelflip');
        break;
      case 'ArrowLeft':
        this.keys.trick3 = true;
        this.doTrick('360flip');
        break;
      case 'ArrowRight':
        this.keys.trick4 = true;
        this.doTrick('shuvit');
        break;
    }
  }

  handleKeyUp(code) {
    switch (code) {
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      case 'ArrowUp':
        this.keys.trick1 = false;
        break;
      case 'ArrowDown':
        this.keys.trick2 = false;
        break;
      case 'ArrowLeft':
        this.keys.trick3 = false;
        break;
      case 'ArrowRight':
        this.keys.trick4 = false;
        break;
    }
  }

  update(delta, physics) {
    this.handleMovement(delta);
    this.applyPhysics(delta, physics);
    this.updateTrickState(delta);
    this.updateSkaterAnimation(delta);

    // Update skateboard position
    this.skateboard.position.copy(this.position);

    // Rotate skateboard to face movement direction
    if (this.speed > 0.1 || this.speed < -0.1) {
      const angle = Math.atan2(this.direction.x, this.direction.z);
      this.skateboard.rotation.y = angle;
    }
  }

  handleMovement(delta) {
    // Acceleration
    if (this.keys.forward) {
      this.speed = Math.min(
        this.speed + this.acceleration * delta,
        this.maxSpeed
      );
    } else if (this.keys.backward) {
      this.speed = Math.max(
        this.speed - this.acceleration * delta,
        -this.maxSpeed / 2
      );
    } else {
      // Deceleration when no keys pressed
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.deceleration * delta);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.deceleration * delta);
      }
    }

    // Turning
    if (this.keys.left) {
      this.direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.rotationSpeed * delta
      );
    }
    if (this.keys.right) {
      this.direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -this.rotationSpeed * delta
      );
    }

    // Normalize direction vector
    this.direction.normalize();

    // Calculate velocity from direction and speed
    this.velocity.x = this.direction.x * this.speed;
    this.velocity.z = this.direction.z * this.speed;
  }

  jump() {
    if (this.isOnGround && !this.isJumping) {
      // Base jump force
      let jumpForce = this.jumpForce;

      // If on a ramp, get extra height - uses current speed and jump timing
      if (this.skatePark) {
        const ramps = this.skatePark.getRamps();
        const rampCollision = this.physics
          ? this.physics.checkRampCollision(this.position, ramps)
          : { isOnRamp: false };

        if (rampCollision.isOnRamp) {
          // Boost jump based on speed and ramp angle
          const angleBoost = 1.0;
          if (rampCollision.normal) {
            // Steeper ramp = higher jump when at speed
            const slopeBoost = Math.abs(rampCollision.normal.y) * 5.0;
            const speedBoost = Math.min(this.speed / this.maxSpeed, 1.0) * 2.0;
            jumpForce += slopeBoost * speedBoost;
          }
        }
      }

      this.velocity.y = jumpForce;
      this.isJumping = true;
      this.isOnGround = false;
      this.isInAir = true;

      // End grinding if we were on a rail
      this.isGrinding = false;
    }
  }

  doTrick(trickName) {
    if (this.isInAir && !this.currentTrick) {
      switch (trickName) {
        case 'kickflip':
          this.currentTrick = {
            name: 'Kickflip',
            rotation: new THREE.Vector3(0, 0, Math.PI * 2),
            duration: 1.0,
            points: 100,
          };
          break;
        case 'heelflip':
          this.currentTrick = {
            name: 'Heelflip',
            rotation: new THREE.Vector3(0, 0, -Math.PI * 2),
            duration: 1.0,
            points: 100,
          };
          break;
        case '360flip':
          this.currentTrick = {
            name: '360 Flip',
            rotation: new THREE.Vector3(Math.PI * 2, Math.PI, 0),
            duration: 1.2,
            points: 150,
          };
          break;
        case 'shuvit':
          this.currentTrick = {
            name: 'Shuvit',
            rotation: new THREE.Vector3(0, Math.PI, 0),
            duration: 0.8,
            points: 50,
          };
          break;
      }

      if (this.currentTrick) {
        this.trickTimer = 0;
        this.trickRotation.set(0, 0, 0);
      }
    }
  }

  updateTrickState(delta) {
    if (this.currentTrick && this.isInAir) {
      this.trickTimer += delta;

      // Calculate trick progress
      const progress = Math.min(
        this.trickTimer / this.currentTrick.duration,
        1.0
      );

      // Apply rotation based on progress
      this.trickRotation.x = this.currentTrick.rotation.x * progress;
      this.trickRotation.y = this.currentTrick.rotation.y * progress;
      this.trickRotation.z = this.currentTrick.rotation.z * progress;

      // Apply rotation to skateboard
      this.skateboard.rotation.x = this.trickRotation.x;
      this.skateboard.rotation.z = this.trickRotation.z;

      // Override y rotation from direction with trick rotation
      if (this.currentTrick.rotation.y !== 0) {
        this.skateboard.rotation.y += this.trickRotation.y * delta * 3;
      }

      // Trick completed
      if (progress >= 1.0) {
        const completedTrick = this.currentTrick;
        this.currentTrick = null;
        return completedTrick;
      }
    } else if (!this.isInAir && this.currentTrick) {
      // Failed trick - landed during trick
      this.currentTrick = null;
      this.trickRotation.set(0, 0, 0);
    }

    return null;
  }

  updateSkaterAnimation(delta) {
    // Animate legs based on grind state or air state
    if (this.isGrinding) {
      // Grinding animation
      this.rightLeg.position.y = 0.2 + Math.sin(Date.now() * 0.01) * 0.1;
      this.leftLeg.position.y = 0.2 - Math.sin(Date.now() * 0.01) * 0.1;
    } else if (this.isInAir) {
      // Air animation
      this.rightLeg.position.y = 0.2;
      this.leftLeg.position.y = 0.2;
      this.rightArm.rotation.z = -Math.PI / 3;
      this.leftArm.rotation.z = Math.PI / 3;
    } else {
      // Regular riding animation
      this.rightLeg.position.y = 0.4;
      this.leftLeg.position.y = 0.4;
      this.rightArm.rotation.z =
        -Math.PI / 4 + Math.sin(Date.now() * 0.005) * 0.1;
      this.leftArm.rotation.z =
        Math.PI / 4 - Math.sin(Date.now() * 0.005) * 0.1;
    }
  }

  applyPhysics(delta, physics) {
    // Apply gravity if in air
    if (!this.isOnGround) {
      this.velocity.y += physics.gravity * delta;
    }

    // Store original position for collision resolution
    const originalPosition = this.position.clone();

    // Update position based on velocity
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Get skatepark elements - use direct reference if available
    let obstacles = [];
    let ramps = [];
    let rails = [];

    if (this.skatePark) {
      // Use direct reference if we have it
      obstacles = this.skatePark.getObstacles();
      ramps = this.skatePark.getRamps();
      rails = this.skatePark.getRails();
    } else {
      // Fall back to finding in scene
      const skatePark = Array.from(this.scene.children).find(
        (child) => child.constructor && child.constructor.name === 'SkatePark'
      );
      if (skatePark) {
        obstacles = skatePark.getObstacles();
        ramps = skatePark.getRamps();
        rails = skatePark.getRails();
      }
    }

    // Check for obstacle collisions
    const obstacleCollision = physics.checkObstacleCollision(
      this.position,
      this.velocity,
      obstacles
    );
    if (obstacleCollision.hasCollided) {
      // Push player out of obstacle
      const pushDirection = obstacleCollision.normal
        .clone()
        .multiplyScalar(0.1);
      this.position.add(pushDirection);

      // Bounce velocity off obstacle
      this.velocity = physics.applyBounce(
        this.velocity,
        obstacleCollision.normal,
        0.3
      );

      // If hitting from the top, consider as ground
      if (obstacleCollision.normal.y > 0.7) {
        this.isOnGround = true;
        this.isJumping = false;
        this.isInAir = false;
        this.velocity.y = 0;
      }
    }

    // Check for ramp collisions
    const rampCollision = physics.checkRampCollision(this.position, ramps);
    if (rampCollision.isOnRamp) {
      // Adjust height based on ramp
      if (rampCollision.rampType === 'ramp') {
        // Simple ramp - adjust height and direction
        const rampNormal = rampCollision.normal;

        // Only apply if we're close to the ramp surface
        const rampY = this.getRampHeightAt(this.position, rampCollision.ramp);
        if (Math.abs(this.position.y - rampY) < 0.5) {
          this.position.y = rampY;
          this.isOnGround = true;
          this.isJumping = false;
          this.isInAir = false;

          // Adjust speed based on slope
          if (this.velocity.y < 0) {
            // Going downhill - accelerate
            this.speed += 0.1 * Math.abs(rampNormal.y);
          } else {
            // Going uphill - decelerate
            this.speed -= 0.2 * Math.abs(rampNormal.y);
          }
        }
      } else if (
        rampCollision.rampType === 'halfpipe' ||
        rampCollision.rampType === 'quarterpipe'
      ) {
        // Curved ramp - more complex interaction
        const curveNormal = rampCollision.normal;

        // Check if we're on the surface
        if (this.velocity.y < 0) {
          this.isOnGround = true;
          this.isJumping = false;
          this.isInAir = false;

          // Align to curved surface
          const alignForce = 0.8;
          this.velocity.x += curveNormal.x * alignForce;
          this.velocity.y = Math.max(0, this.velocity.y);

          // Transfer some downward momentum to forward momentum
          if (this.speed > 0.5) {
            this.speed += Math.abs(this.velocity.y * 0.05);
          }
        }
      }
    }

    // Check for rail collisions
    const railCollision = physics.checkRailCollision(this.position, rails);
    if (railCollision.isOnRail) {
      // Start grinding if close enough to rail height
      const railHeight =
        railCollision.rail.position.y +
        railCollision.rail.dimensions.height / 2;
      if (Math.abs(this.position.y - railHeight) < 0.3 && this.speed > 1) {
        this.position.y = railHeight;
        this.isGrinding = true;
        this.isOnGround = false;
        this.isJumping = false;
        this.isInAir = false;

        // Align to rail direction (assuming rails are Z-aligned)
        const railDirection = new THREE.Vector3(0, 0, 1);
        this.direction.lerp(railDirection, 0.1);

        // Maintain or slightly reduce speed during grind
        this.speed *= 0.99;

        // Keep centered on rail
        this.position.x = railCollision.rail.position.x;
      }
    } else {
      // Stop grinding if not on a rail
      this.isGrinding = false;
    }

    // Ground collision check
    if (this.position.y <= 0.2 && !this.isGrinding) {
      this.position.y = 0.2;
      this.velocity.y = 0;
      this.isOnGround = true;
      this.isJumping = false;
      this.isInAir = false;

      // Reset skateboard rotation when landing
      if (!this.currentTrick) {
        this.skateboard.rotation.x = 0;
        this.skateboard.rotation.z = 0;
      }
    } else if (
      this.position.y > 0.2 &&
      !this.isGrinding &&
      !rampCollision.isOnRamp
    ) {
      // We're in the air if not on the ground, not grinding, and not on a ramp
      this.isOnGround = false;
      this.isInAir = true;
    }

    // Boundary checks
    const boundaryLimit = 49;
    if (Math.abs(this.position.x) > boundaryLimit) {
      this.position.x = Math.sign(this.position.x) * boundaryLimit;
      this.velocity.x *= -0.5; // Bounce off walls
    }

    if (Math.abs(this.position.z) > boundaryLimit) {
      this.position.z = Math.sign(this.position.z) * boundaryLimit;
      this.velocity.z *= -0.5; // Bounce off walls
    }
  }

  // Helper method to calculate height at a point on a ramp
  getRampHeightAt(position, ramp) {
    if (ramp.type === 'ramp') {
      const rampPos = ramp.position;
      const rampRot = ramp.rotation;
      const rampDim = ramp.dimensions;

      // Calculate distance from ramp start
      const rampStart = rampPos.z - rampDim.length / 2;
      const distanceOnRamp = position.z - rampStart;

      // Calculate height using ramp angle
      return (
        rampPos.y - rampDim.height / 2 + Math.tan(rampRot.x) * distanceOnRamp
      );
    }

    return 0.2; // Default ground height
  }

  getPosition() {
    return this.position;
  }

  getDirection() {
    return this.direction;
  }

  getCurrentTrick() {
    return this.currentTrick;
  }

  setSkatePark(skatePark) {
    this.skatePark = skatePark;
  }

  setPhysics(physics) {
    this.physics = physics;
  }
}
