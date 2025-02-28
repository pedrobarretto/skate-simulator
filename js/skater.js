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
    if ((this.isOnGround || this.isGrinding) && !this.isJumping) {
      // Base jump force
      let jumpForce = this.jumpForce;
      let jumpDirection = new THREE.Vector3(0, 1, 0); // Default jump direction is straight up

      // If grinding, add momentum in the direction of travel when jumping
      if (this.isGrinding) {
        const movementDirection = Math.sign(this.direction.z);
        // Preserve horizontal momentum
        this.velocity.z = this.speed * movementDirection;
        // Add extra vertical boost for rail jumps
        jumpForce += 2.0;
      }

      // Enhanced ramp jump mechanics
      if (this.skatePark && this.physics) {
        const ramps = this.skatePark.getRamps();
        const rampCollision = this.physics.checkRampCollision(
          this.position,
          ramps
        );

        if (rampCollision.isOnRamp) {
          // Get the normal of the ramp surface we're jumping from
          const rampNormal = rampCollision.normal;

          // Calculate jump boost based on speed and ramp angle
          const speedFactor = Math.min(this.speed / this.maxSpeed, 1.0);

          if (rampCollision.rampType === 'ramp') {
            // Simple inclined ramp - angle the jump in the direction of the ramp normal
            jumpDirection.copy(rampNormal).normalize();

            // Boost height based on speed and incline
            const slopeBoost = (1.0 - rampNormal.y) * 3.0; // More boost on steeper ramps
            jumpForce += slopeBoost * speedFactor * 2.0;
          } else if (
            rampCollision.rampType === 'halfpipe' ||
            rampCollision.rampType === 'quarterpipe'
          ) {
            // Curved ramp - extract jump direction from the normal
            jumpDirection.copy(rampNormal).normalize();

            // On curved ramps, give massive air at high speeds
            // The more vertical the normal is, the more height boost
            const verticalComponent = 1.0 - Math.abs(rampNormal.y);
            const curveBoost = verticalComponent * 6.0;

            jumpForce += curveBoost * speedFactor * 2.5;

            // Add some horizontal momentum in the direction of the normal
            this.velocity.x += jumpDirection.x * speedFactor * 5.0;

            // If we're moving fast enough, convert some forward speed to upward launch
            if (this.speed > this.maxSpeed * 0.7 && verticalComponent > 0.7) {
              const launchBoost = this.speed * 0.8;
              jumpForce += launchBoost;
              this.speed *= 0.7; // Reduce forward speed as we convert to vertical
            }
          }
        }
      }

      // Apply the calculated jump force in the jump direction
      this.velocity.x += jumpDirection.x * jumpForce * 0.3;
      this.velocity.y = jumpDirection.y * jumpForce;
      this.velocity.z += jumpDirection.z * jumpForce * 0.3;

      // Update state flags
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

    // Calculate next position without moving yet
    const nextPosition = this.position
      .clone()
      .add(
        new THREE.Vector3(
          this.velocity.x * delta,
          this.velocity.y * delta,
          this.velocity.z * delta
        )
      );

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

    // PRE-CHECK COLLISIONS AT NEXT POSITION TO PREVENT TUNNELING

    // Pre-check obstacle collisions at the next position
    const nextObstacleCollision = physics.checkObstacleCollision(
      nextPosition,
      this.velocity,
      obstacles
    );

    if (nextObstacleCollision.hasCollided) {
      // If we would collide at next position, don't move there
      const normal = nextObstacleCollision.normal;
      const penetrationDepth = nextObstacleCollision.penetrationDepth || 0.3;

      // Handle vertical collision (landing on top)
      if (normal.y > 0.7) {
        // We're hitting the top of an obstacle - treat as landing on it
        this.position.y =
          nextObstacleCollision.obstacle.position.y +
          nextObstacleCollision.obstacle.dimensions.height +
          0.2;
        this.velocity.y = 0;
        this.isOnGround = true;
        this.isJumping = false;
        this.isInAir = false;

        // Preserve horizontal movement with friction
        this.velocity.x *= 0.95;
        this.velocity.z *= 0.95;
      } else {
        // Side collision - prevent movement in that direction and bounce
        // Project the velocity onto the collision normal
        const dotProduct = this.velocity.dot(normal);

        // Only remove the component of velocity going into the obstacle
        if (dotProduct < 0) {
          // Calculate the component of velocity in the direction of the normal
          const velocityIntoObstacle = normal
            .clone()
            .multiplyScalar(dotProduct);

          // Remove that component and add bounce
          this.velocity.sub(velocityIntoObstacle);
          this.velocity.add(velocityIntoObstacle.multiplyScalar(-0.5)); // Bounce factor 0.5

          // Adjust position to prevent penetration
          this.position.add(normal.clone().multiplyScalar(penetrationDepth));
        }
      }

      // Update speed based on new velocity
      this.speed = Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z
      );
    } else {
      // No obstacle collision predicted, let's check ramps and rails

      // PRE-CHECK RAMP COLLISIONS - More aggressive detection
      let willBeOnRamp = false;
      let rampToUse = null;
      let rampNormal = null;
      let rampType = null;

      // Check all ramps with increased bounds
      for (let ramp of ramps) {
        if (ramp.type === 'ramp') {
          // Enhanced ramp check with larger bounds
          const rampPos = ramp.position;
          const rampDim = ramp.dimensions;

          // Bigger detection box for ramps
          if (
            Math.abs(nextPosition.x - rampPos.x) < rampDim.width / 2 + 1.0 &&
            Math.abs(nextPosition.z - rampPos.z) < rampDim.length / 2 + 1.0
          ) {
            // Calculate expected height with greater tolerance
            const rampY = this.getRampHeightAt(nextPosition, ramp);
            if (Math.abs(nextPosition.y - rampY) < 1.0) {
              willBeOnRamp = true;
              rampToUse = ramp;
              rampType = 'ramp';
              rampNormal = physics.calculateRampNormal(ramp);
              break;
            }
          }
        } else if (ramp.type === 'halfpipe' || ramp.type === 'quarterpipe') {
          // Enhanced curved ramp check with larger tolerance
          const pipePos = ramp.position;
          const pipeDim = ramp.dimensions;

          // Bigger box check first
          if (
            Math.abs(nextPosition.x - pipePos.x) < pipeDim.width + 1.0 &&
            Math.abs(nextPosition.z - pipePos.z) < pipeDim.length / 2 + 1.0
          ) {
            // Then do precise curved surface check
            const distance =
              ramp.type === 'halfpipe'
                ? physics.pointDistanceToHalfPipe(nextPosition, ramp)
                : physics.pointDistanceToQuarterPipe(nextPosition, ramp);

            if (distance < 1.0) {
              willBeOnRamp = true;
              rampToUse = ramp;
              rampType = ramp.type;
              rampNormal =
                ramp.type === 'halfpipe'
                  ? physics.calculateHalfPipeNormal(nextPosition, ramp)
                  : physics.calculateQuarterPipeNormal(nextPosition, ramp);
              break;
            }
          }
        }
      }

      // PRE-CHECK RAIL COLLISIONS - Larger detection area
      let willBeOnRail = false;
      let railToUse = null;

      for (let rail of rails) {
        const railPos = rail.position;
        const railDim = rail.dimensions;

        // Much larger detection bounds for rails
        const xDiff = Math.abs(nextPosition.x - railPos.x);
        const yDiff = Math.abs(
          nextPosition.y - (railPos.y + railDim.height / 2)
        );
        const zDiff = Math.abs(nextPosition.z - railPos.z);

        if (
          xDiff < railDim.width * 2.0 &&
          yDiff < railDim.height * 1.5 &&
          zDiff < railDim.length / 2 + 1.0
        ) {
          willBeOnRail = true;
          railToUse = rail;
          break;
        }
      }

      // Now update position based on collision pre-checks
      if (willBeOnRamp) {
        // Handle ramp collision
        if (rampType === 'ramp') {
          // Smooth ramp handling
          const rampY = this.getRampHeightAt(nextPosition, rampToUse);

          // More reliable climb check - also consider coming from the side
          // This prevents passing through on the sides
          const canClimb =
            this.position.y >= rampY - 1.0 ||
            Math.abs(this.velocity.y) < 5.0 ||
            Math.abs(this.position.z - rampToUse.position.z) >
              rampToUse.dimensions.length * 0.3;

          if (canClimb) {
            // Update XZ position
            this.position.x += this.velocity.x * delta;
            this.position.z += this.velocity.z * delta;

            // Update Y position to stay on ramp with a small offset to stay firmly on it
            this.position.y = rampY + 0.05;

            this.isOnGround = true;
            this.isJumping = false;
            this.isInAir = false;

            // Apply ramp physics with better handling for steep ramps
            const slopeAngle = Math.acos(rampNormal.y);
            const gravityAlongRamp =
              Math.sin(slopeAngle) * Math.abs(physics.gravity);

            // Reduce sliding on steep ramps by applying friction
            const steepnessFactor = Math.min(1.0, slopeAngle * 3.0); // Higher for steeper ramps

            // Acceleration impact depends on whether moving with or against gravity
            const goingDown =
              this.velocity.y < 0 ||
              (this.direction.z > 0 && rampNormal.z < 0) ||
              (this.direction.z < 0 && rampNormal.z > 0);

            if (goingDown) {
              // Going downhill - accelerate
              this.speed += gravityAlongRamp * delta * 0.2;

              // Cap downhill speed based on steepness to prevent excessive acceleration
              const maxDownhillSpeed =
                this.maxSpeed * (1.0 + steepnessFactor * 0.5);
              this.speed = Math.min(this.speed, maxDownhillSpeed);
            } else {
              // Going uphill - decelerate more on steeper ramps
              this.speed -=
                gravityAlongRamp * delta * (0.25 + steepnessFactor * 0.1);
            }

            // Enhanced minimum speed on ramps to prevent getting stuck
            if (Math.abs(this.speed) < 1.0 && slopeAngle > 0.1) {
              this.speed = 1.0 * Math.sign(this.speed || 1);
            }

            // Update velocity for next frame
            this.velocity.y = 0;
          } else {
            // Regular movement if we're under the ramp
            this.position.add(this.velocity.clone().multiplyScalar(delta));
          }
        } else if (rampType === 'halfpipe' || rampType === 'quarterpipe') {
          // Curved ramp handling - more complex

          // Update XZ position but with controlled speed on curves
          const curveSpeedFactor = 0.95; // Slightly reduce speed on curves for better control
          this.position.x += this.velocity.x * delta * curveSpeedFactor;
          this.position.z += this.velocity.z * delta * curveSpeedFactor;

          // Enhanced approach detection for more reliable collision
          const isApproachingFromAbove =
            this.velocity.y <= 0 ||
            this.position.y >= rampToUse.position.y + 0.2;

          // Improved check to prevent going through the bottom of curved ramps
          if (isApproachingFromAbove) {
            // Apply curved surface physics
            this.isOnGround = true;
            this.isJumping = false;
            this.isInAir = false;

            // Enhanced alignment force based on the curve normal and speed
            // More force at higher speeds for better curve following
            const speedFactor = Math.min(
              1.0,
              Math.abs(this.speed) / this.maxSpeed
            );
            const alignForce = 2.0 + speedFactor * 1.5;

            // Apply force toward the curve surface
            this.velocity.x += rampNormal.x * alignForce;
            this.velocity.y = Math.max(0, this.velocity.y * 0.3); // Dampen vertical velocity

            // Add a slight upward force when moving fast to help stay on vertical sections
            if (
              Math.abs(rampNormal.x) > 0.8 &&
              Math.abs(this.speed) > this.maxSpeed * 0.6
            ) {
              this.velocity.y += 0.5 * speedFactor;
            }

            // Enhanced momentum transfer for better pipe riding experience
            if (this.speed > 1.0) {
              // Convert vertical momentum to forward momentum - this helps maintain speed
              const momentumTransfer = Math.abs(this.velocity.y * 0.3);
              this.speed += momentumTransfer;

              // Higher speed cap in pipes to allow for reaching the top
              const pipeFactor = 1.2;
              if (this.speed > this.maxSpeed * pipeFactor) {
                this.speed = this.maxSpeed * pipeFactor;
              }

              // Improved curve following - adapt direction more strongly on steep curves
              const curveAdaptFactor = 0.2 + Math.abs(rampNormal.x) * 0.3; // More direction change on vertical sections
              this.direction.x =
                (1 - curveAdaptFactor) * this.direction.x +
                curveAdaptFactor * rampNormal.x;
              this.direction.normalize();
            }

            // Update position to follow curved surface with improved accuracy
            if (rampType === 'halfpipe') {
              const pipePos = rampToUse.position;
              const pipeRadius = rampToUse.dimensions.width / 2;
              const distanceFromCenter = Math.abs(this.position.x - pipePos.x);

              if (distanceFromCenter < pipeRadius) {
                // Set Y position based on curve equation - add base height of pipe position
                const curveHeight =
                  pipeRadius -
                  Math.sqrt(
                    pipeRadius * pipeRadius -
                      Math.pow(distanceFromCenter - pipeRadius, 2)
                  );

                // Add a small offset to prevent sinking into the surface
                this.position.y = pipePos.y + curveHeight + 0.05;

                // Apply a small push toward pipe center when at the top to prevent flying off
                if (
                  curveHeight > pipeRadius * 0.8 &&
                  Math.abs(this.speed) < 3.0
                ) {
                  const pushToCenter =
                    Math.sign(pipePos.x - this.position.x) * 0.05;
                  this.position.x += pushToCenter;
                }
              }
            } else if (rampType === 'quarterpipe') {
              const pipePos = rampToUse.position;
              const cornerX = pipePos.x - rampToUse.dimensions.width / 2;
              const radius = rampToUse.dimensions.width;
              const dx = this.position.x - cornerX;

              if (dx > 0 && dx < radius) {
                // Set Y position based on quarter-circle equation with small offset
                const curveHeight = Math.sqrt(radius * radius - dx * dx);
                this.position.y = pipePos.y + curveHeight + 0.05;

                // Near vertical section handling - add artificial push to prevent falling off
                if (dx < radius * 0.2 && Math.abs(this.speed) < 3.0) {
                  this.position.x += 0.05; // Small push away from the corner
                }
              }
            }
          } else {
            // Regular movement if approaching from below the surface
            this.position.add(this.velocity.clone().multiplyScalar(delta));
          }
        }
      } else if (willBeOnRail) {
        // Handle rail collision/grinding
        const railHeight =
          railToUse.position.y + railToUse.dimensions.height / 2;

        // Check rail approach
        const railCollision = physics.checkRailCollision(this.position, [
          railToUse,
        ]);
        if (railCollision.isOnRail) {
          // Handle differently based on approach
          if (railCollision.approach === 'from_above') {
            // Coming from above - snap to rail and grind
            this.position.x = railToUse.position.x; // Center on rail
            this.position.y = railHeight;

            // Get the current movement direction (positive or negative Z)
            const movementDirection = Math.sign(this.direction.z);

            // Apply movement in the direction the skater is facing with proper speed
            this.position.z += this.speed * movementDirection * delta;

            // Check rail boundaries to prevent grinding past the ends
            const railLength = railToUse.dimensions.length;
            const railPos = railToUse.position.z;
            const railStart = railPos - railLength / 2;
            const railEnd = railPos + railLength / 2;

            // If we've reached the end of the rail, stop grinding
            if (this.position.z < railStart || this.position.z > railEnd) {
              this.isGrinding = false;
              this.isInAir = true;

              // More substantial exit boost for leaving rail
              const exitSpeed = Math.max(this.speed, 7.0); // Higher minimum exit speed
              this.velocity.z = movementDirection * exitSpeed;

              // Stronger vertical boost to get off the rail completely
              this.velocity.y += 3.5;

              // Set X velocity slightly away from rail to prevent re-detection
              this.velocity.x = Math.random() > 0.5 ? 0.5 : -0.5;

              // Position farther from the rail end to completely clear collision detection
              this.position.z =
                this.position.z < railStart ? railStart - 0.5 : railEnd + 0.5;
              this.position.y += 0.2; // Lift up slightly to clear the rail

              // Force update state flags to ensure controls work
              this.isOnGround = false;
              this.isJumping = false;

              // Update speed based on new velocity
              this.speed = Math.sqrt(
                this.velocity.x * this.velocity.x +
                  this.velocity.z * this.velocity.z
              );
            } else {
              this.isGrinding = true;
              this.isOnGround = false;
              this.isJumping = false;
              this.isInAir = false;
            }

            // Keep the skater's current direction instead of forcing a specific direction
            // Just adjust the X component slightly to align with rail
            this.direction.x = this.direction.x * 0.1; // Reduce sideways movement
            this.direction.normalize();

            // Maintain speed with slight reduction
            this.speed *= 0.99;
            this.velocity.y = 0;
            // Maintain the Z velocity direction to keep moving the right way
            this.velocity.z = this.speed * movementDirection;
            this.velocity.x = 0; // Zero out X velocity while on the rail
          } else {
            // Coming from side - bounce off
            // Get direction to rail center
            const toRail = new THREE.Vector3(
              railToUse.position.x - this.position.x,
              0,
              0
            ).normalize();

            // Push away from rail
            this.position.x += -toRail.x * 0.5;

            // Bounce velocity
            this.velocity.x *= -0.5;

            // Can still move in z direction
            this.position.z += this.velocity.z * delta;
          }
        } else {
          // Regular movement if not grinding
          this.position.add(this.velocity.clone().multiplyScalar(delta));
        }
      } else {
        // No collisions detected, regular movement
        this.position.add(this.velocity.clone().multiplyScalar(delta));
      }
    }

    // POST-CHECK FOR COLLISIONS AT CURRENT POSITION (to handle any missed collisions)

    // Check for obstacle collisions at current position
    const obstacleCollision = physics.checkObstacleCollision(
      this.position,
      this.velocity,
      obstacles
    );

    if (obstacleCollision.hasCollided) {
      // Get collision normal and penetration depth
      const normal = obstacleCollision.normal;
      const penetrationDepth = obstacleCollision.penetrationDepth || 0.3;

      // Push player out of obstacle with stronger force
      const pushDirection = normal
        .clone()
        .multiplyScalar(penetrationDepth * 1.5);
      this.position.add(pushDirection);

      // Apply bounce with reduced speed
      this.velocity = physics.applyBounce(this.velocity, normal, 0.4);

      // If we hit from the top, snap to the surface
      if (normal.y > 0.7) {
        this.isOnGround = true;
        this.isJumping = false;
        this.isInAir = false;
        this.velocity.y = 0;
      }

      // Reduce speed on impact
      this.speed *= 0.8;
    }

    // Check for ramp collisions (final check)
    const rampCollision = physics.checkRampCollision(this.position, ramps);
    if (rampCollision.isOnRamp) {
      // Ramp handling already done in pre-check, just update flags
      this.isOnGround = true;
      this.isJumping = false;
      this.isInAir = false;
    }

    // Check for rail collisions (final check)
    const railCollision = physics.checkRailCollision(this.position, rails);
    if (railCollision.isOnRail && !this.isInAir) {
      // Only set grinding if not forcibly in air
      // Rail handling already done in pre-check, just update flags
      this.isGrinding = true;
      this.isOnGround = false;
      this.isJumping = false;
      this.isInAir = false;
    } else if (this.isGrinding && !railCollision.isOnRail) {
      // Stop grinding if not on a rail
      this.isGrinding = false;
      this.isInAir = true;

      // Give a small boost if transitioning off a rail to prevent getting stuck
      if (Math.abs(this.velocity.y) < 1.0) {
        this.velocity.y += 2.0;
      }
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
      !rampCollision.isOnRamp &&
      !obstacleCollision.hasCollided
    ) {
      // We're in the air if not on the ground, not grinding, not on a ramp, and not on an obstacle
      this.isOnGround = false;
      this.isInAir = true;
    }

    // Boundary checks
    const boundaryLimit = 49;
    if (Math.abs(this.position.x) > boundaryLimit) {
      this.position.x = Math.sign(this.position.x) * boundaryLimit;
      this.velocity.x *= -0.5; // Bounce off walls

      // Ensure minimum speed after bouncing to prevent getting stuck
      if (Math.abs(this.velocity.x) < 2.0) {
        this.velocity.x = Math.sign(this.velocity.x) * 2.0;
      }
    }

    if (Math.abs(this.position.z) > boundaryLimit) {
      this.position.z = Math.sign(this.position.z) * boundaryLimit;
      this.velocity.z *= -0.5; // Bounce off walls

      // Ensure minimum speed after bouncing to prevent getting stuck
      if (Math.abs(this.velocity.z) < 2.0) {
        this.velocity.z = Math.sign(this.velocity.z) * 2.0;
      }
    }

    // Update speed based on velocity after all physics are applied
    this.speed = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z
    );
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
