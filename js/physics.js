class Physics {
  constructor() {
    this.gravity = -20; // Gravity acceleration (m/s²)
    this.friction = 0.9; // Ground friction coefficient
    this.airResistance = 0.99; // Air resistance coefficient
  }

  update(delta) {
    // This method can be extended to handle more complex physics calculations
    // Currently, gravity is applied directly in the Skater class
  }

  // Check if a point is on a ramp
  checkRampCollision(position, ramps) {
    for (let ramp of ramps) {
      if (ramp.type === 'halfpipe') {
        // Half pipe collision detection
        const distance = this.pointDistanceToHalfPipe(position, ramp);
        if (distance < 0.5) {
          return {
            isOnRamp: true,
            rampType: 'halfpipe',
            ramp: ramp,
            normal: this.calculateHalfPipeNormal(position, ramp),
          };
        }
      } else if (ramp.type === 'ramp') {
        // Simple ramp collision detection
        const isOnRamp = this.isPointOnRamp(position, ramp);
        if (isOnRamp) {
          return {
            isOnRamp: true,
            rampType: 'ramp',
            ramp: ramp,
            normal: this.calculateRampNormal(ramp),
          };
        }
      } else if (ramp.type === 'quarterpipe') {
        // Quarter pipe collision detection
        const distance = this.pointDistanceToQuarterPipe(position, ramp);
        if (distance < 0.5) {
          return {
            isOnRamp: true,
            rampType: 'quarterpipe',
            ramp: ramp,
            normal: this.calculateQuarterPipeNormal(position, ramp),
          };
        }
      }
    }

    return { isOnRamp: false };
  }

  // Check if a point is on a rail
  checkRailCollision(position, rails) {
    for (let rail of rails) {
      const railPos = rail.position;
      const railDim = rail.dimensions;

      // Check if position is within rail bounds
      const xDiff = Math.abs(position.x - railPos.x);
      const yDiff = Math.abs(position.y - (railPos.y + railDim.height / 2));
      const zDiff = Math.abs(position.z - railPos.z);

      if (
        xDiff < railDim.width * 1.5 &&
        yDiff < railDim.height * 0.8 &&
        zDiff < railDim.length / 2
      ) {
        return {
          isOnRail: true,
          rail: rail,
        };
      }
    }

    return { isOnRail: false };
  }

  // Check collision with obstacles
  checkObstacleCollision(position, velocity, obstacles) {
    for (let obstacle of obstacles) {
      if (obstacle.type === 'funbox') {
        const boxPos = obstacle.position;
        const boxDim = obstacle.dimensions;

        // Simple box collision
        if (
          position.x > boxPos.x - boxDim.width / 2 - 1 &&
          position.x < boxPos.x + boxDim.width / 2 + 1 &&
          position.z > boxPos.z - boxDim.length / 2 - 1 &&
          position.z < boxPos.z + boxDim.length / 2 + 1 &&
          position.y < boxPos.y + boxDim.height + 1 &&
          position.y > boxPos.y - 1
        ) {
          // Calculate collision response
          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: this.calculateBoxNormal(position, boxPos, boxDim),
          };
        }
      } else if (obstacle.type === 'wall') {
        // Wall collision (simplified)
        const wallPos = obstacle.position;
        // Detect which wall based on position
        if (wallPos.z < -40 && Math.abs(position.z - wallPos.z) < 2) {
          // North wall
          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: new THREE.Vector3(0, 0, 1),
          };
        } else if (wallPos.z > 40 && Math.abs(position.z - wallPos.z) < 2) {
          // South wall
          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: new THREE.Vector3(0, 0, -1),
          };
        } else if (wallPos.x > 40 && Math.abs(position.x - wallPos.x) < 2) {
          // East wall
          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: new THREE.Vector3(-1, 0, 0),
          };
        } else if (wallPos.x < -40 && Math.abs(position.x - wallPos.x) < 2) {
          // West wall
          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: new THREE.Vector3(1, 0, 0),
          };
        }
      }
    }

    return { hasCollided: false };
  }

  // Helper methods for collision detection

  pointDistanceToHalfPipe(point, halfPipe) {
    // Simplified distance calculation to half-pipe
    const pipePos = halfPipe.position;
    const pipeDim = halfPipe.dimensions;

    // Check if within length bounds
    if (Math.abs(point.z - pipePos.z) > pipeDim.length / 2) {
      return 100; // Out of range
    }

    // Calculate distance to curved surface (simplified)
    const dx = point.x - pipePos.x;
    const dy = point.y - pipePos.y;
    const distToCenter = Math.sqrt(dx * dx + dy * dy);

    return Math.abs(distToCenter - pipeDim.width / 2);
  }

  calculateHalfPipeNormal(point, halfPipe) {
    // Simplified normal calculation for half-pipe
    const pipePos = halfPipe.position;

    // Calculate vector from center of pipe to point
    const dx = point.x - pipePos.x;
    const dy = point.y - pipePos.y;

    // Normalize
    const length = Math.sqrt(dx * dx + dy * dy);
    return new THREE.Vector3(dx / length, dy / length, 0);
  }

  isPointOnRamp(point, ramp) {
    const rampPos = ramp.position;
    const rampDim = ramp.dimensions;
    const rampRot = ramp.rotation;

    // Check if within width bounds
    if (Math.abs(point.x - rampPos.x) > rampDim.width / 2) {
      return false;
    }

    // Check if within length bounds
    if (Math.abs(point.z - rampPos.z) > rampDim.length / 2) {
      return false;
    }

    // Calculate expected y based on ramp angle
    const angleX = rampRot.x;
    const distFromBase = point.z - (rampPos.z - rampDim.length / 2);
    const expectedY = rampPos.y + Math.tan(angleX) * distFromBase;

    // Check if point is close to the expected y
    return Math.abs(point.y - expectedY) < 0.5;
  }

  calculateRampNormal(ramp) {
    const angleX = ramp.rotation.x;
    return new THREE.Vector3(
      0,
      Math.cos(angleX),
      -Math.sin(angleX)
    ).normalize();
  }

  pointDistanceToQuarterPipe(point, pipe) {
    // Simplified distance calculation for quarter pipe
    const pipePos = pipe.position;
    const pipeDim = pipe.dimensions;

    // Check if within width bounds
    if (Math.abs(point.x - pipePos.x) > pipeDim.width / 2) {
      return 100; // Out of range
    }

    // Check if within length bounds
    if (Math.abs(point.z - pipePos.z) > pipeDim.length / 2) {
      return 100; // Out of range
    }

    // Calculate approx. distance to curved surface (simplified)
    const dx = point.x - (pipePos.x - pipeDim.width / 2);
    const dy = point.y;
    const distToCorner = Math.sqrt(dx * dx + dy * dy);

    return Math.abs(distToCorner - pipeDim.width / 2);
  }

  calculateQuarterPipeNormal(point, pipe) {
    // Simplified normal calculation for quarter pipe
    const pipePos = pipe.position;
    const pipeDim = pipe.dimensions;

    // Calculate vector from corner of pipe to point
    const dx = point.x - (pipePos.x - pipeDim.width / 2);
    const dy = point.y;

    // Normalize
    const length = Math.sqrt(dx * dx + dy * dy);
    return new THREE.Vector3(dx / length, dy / length, 0);
  }

  calculateBoxNormal(point, boxPos, boxDim) {
    // Determine which face of the box was hit
    const dx = point.x - boxPos.x;
    const dy = point.y - boxPos.y;
    const dz = point.z - boxPos.z;

    // Find the closest face
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const absDz = Math.abs(dz);

    const halfWidth = boxDim.width / 2;
    const halfHeight = boxDim.height / 2;
    const halfLength = boxDim.length / 2;

    if (absDx > absDy && absDx > absDz) {
      // X-axis faces
      return new THREE.Vector3(Math.sign(dx), 0, 0);
    } else if (absDy > absDx && absDy > absDz) {
      // Y-axis faces
      return new THREE.Vector3(0, Math.sign(dy), 0);
    } else {
      // Z-axis faces
      return new THREE.Vector3(0, 0, Math.sign(dz));
    }
  }

  // Apply bounce physics when colliding with surfaces
  applyBounce(velocity, normal, bounceFactor = 0.5) {
    // Reflect velocity over the normal
    const dot = velocity.dot(normal);
    const reflection = new THREE.Vector3();

    reflection.x = velocity.x - 2 * dot * normal.x;
    reflection.y = velocity.y - 2 * dot * normal.y;
    reflection.z = velocity.z - 2 * dot * normal.z;

    // Apply bounce factor to reduce energy
    reflection.multiplyScalar(bounceFactor);

    return reflection;
  }
}
