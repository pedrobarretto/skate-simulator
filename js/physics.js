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

      // Much bigger detection area for rails
      const xDiff = Math.abs(position.x - railPos.x);
      const yDiff = Math.abs(position.y - (railPos.y + railDim.height / 2));
      const zDiff = Math.abs(position.z - railPos.z);

      // Initial broad check with very generous boundaries
      if (
        xDiff < railDim.width * 2.5 &&
        yDiff < railDim.height * 2.0 &&
        zDiff < railDim.length / 2 + 2.0
      ) {
        // If we're close enough, do a more refined check
        // Create a rectangular prism for rail collision

        // Different collision detection based on height
        // If we're above the rail, use wider detection to help snap onto it
        if (position.y >= railPos.y + railDim.height / 4) {
          // Above the rail - wider top boundary for grinding
          if (
            xDiff < railDim.width * 2.0 &&
            position.y < railPos.y + railDim.height * 2.0 &&
            position.y > railPos.y &&
            zDiff < railDim.length / 2 + 0.5
          ) {
            return {
              isOnRail: true,
              rail: rail,
              approach: 'from_above',
            };
          }
        } else {
          // Side approach - narrower boundary to prevent passing through
          if (
            xDiff < railDim.width * 1.2 &&
            yDiff < railDim.height * 1.2 &&
            zDiff < railDim.length / 2 + 0.5
          ) {
            return {
              isOnRail: true,
              rail: rail,
              approach: 'from_side',
            };
          }
        }
      }
    }

    return { isOnRail: false };
  }

  // Check collision with obstacles
  checkObstacleCollision(position, velocity, obstacles) {
    // Consider the skater as having some width (representing the skateboard)
    const skaterWidth = 1.0; // Increase from 0.8
    const skaterLength = 1.8; // Increase from 1.5
    const skaterHeight = 1.5; // Increase from 1.0

    for (let obstacle of obstacles) {
      if (obstacle.type === 'funbox') {
        const boxPos = obstacle.position;
        const boxDim = obstacle.dimensions;

        // Enhanced box collision with even larger detection boundaries
        if (
          position.x > boxPos.x - boxDim.width / 2 - skaterWidth / 2 &&
          position.x < boxPos.x + boxDim.width / 2 + skaterWidth / 2 &&
          position.z > boxPos.z - boxDim.length / 2 - skaterLength / 2 &&
          position.z < boxPos.z + boxDim.length / 2 + skaterLength / 2 &&
          position.y < boxPos.y + boxDim.height + skaterHeight / 2 &&
          position.y > boxPos.y - skaterHeight / 2
        ) {
          // Calculate collision response with enhanced normal calculation
          const normal = this.calculateBoxNormal(position, boxPos, boxDim);

          // More accurate penetration depth calculation
          let penetrationDepth = 0.2; // Default minimum push

          // Calculate penetration based on which side we hit
          if (Math.abs(normal.x) > 0.7) {
            // Collision with x-axis face
            const rightEdge = boxPos.x + boxDim.width / 2 + skaterWidth / 2;
            const leftEdge = boxPos.x - boxDim.width / 2 - skaterWidth / 2;
            penetrationDepth =
              normal.x > 0
                ? Math.abs(position.x - leftEdge)
                : Math.abs(position.x - rightEdge);
          } else if (Math.abs(normal.y) > 0.7) {
            // Collision with y-axis face (top/bottom)
            const topEdge = boxPos.y + boxDim.height + skaterHeight / 2;
            const bottomEdge = boxPos.y - skaterHeight / 2;
            penetrationDepth =
              normal.y > 0
                ? Math.abs(position.y - bottomEdge)
                : Math.abs(position.y - topEdge);
          } else if (Math.abs(normal.z) > 0.7) {
            // Collision with z-axis face
            const frontEdge = boxPos.z + boxDim.length / 2 + skaterLength / 2;
            const backEdge = boxPos.z - boxDim.length / 2 - skaterLength / 2;
            penetrationDepth =
              normal.z > 0
                ? Math.abs(position.z - backEdge)
                : Math.abs(position.z - frontEdge);
          }

          // Ensure minimum push distance and maximum reasonable push
          penetrationDepth = Math.max(0.2, Math.min(penetrationDepth, 1.5));

          return {
            hasCollided: true,
            obstacle: obstacle,
            normal: normal,
            penetrationDepth: penetrationDepth,
          };
        }
      } else if (obstacle.type === 'wall') {
        // Enhanced wall collision with larger detection boundaries
        const wallPos = obstacle.position;

        // North/South walls (Z-axis)
        if (wallPos.z < -40) {
          // North wall - larger detection zone
          if (position.z < wallPos.z + 2.5 && position.z > wallPos.z - 1.5) {
            return {
              hasCollided: true,
              obstacle: obstacle,
              normal: new THREE.Vector3(0, 0, 1),
              penetrationDepth: Math.abs(position.z - (wallPos.z + 1.0)),
            };
          }
        } else if (wallPos.z > 40) {
          // South wall - larger detection zone
          if (position.z > wallPos.z - 2.5 && position.z < wallPos.z + 1.5) {
            return {
              hasCollided: true,
              obstacle: obstacle,
              normal: new THREE.Vector3(0, 0, -1),
              penetrationDepth: Math.abs(position.z - (wallPos.z - 1.0)),
            };
          }
        }
        // East/West walls (X-axis)
        else if (wallPos.x > 40) {
          // East wall - larger detection zone
          if (position.x > wallPos.x - 2.5 && position.x < wallPos.x + 1.5) {
            return {
              hasCollided: true,
              obstacle: obstacle,
              normal: new THREE.Vector3(-1, 0, 0),
              penetrationDepth: Math.abs(position.x - (wallPos.x - 1.0)),
            };
          }
        } else if (wallPos.x < -40) {
          // West wall - larger detection zone
          if (position.x < wallPos.x + 2.5 && position.x > wallPos.x - 1.5) {
            return {
              hasCollided: true,
              obstacle: obstacle,
              normal: new THREE.Vector3(1, 0, 0),
              penetrationDepth: Math.abs(position.x - (wallPos.x + 1.0)),
            };
          }
        }
      }
    }

    return { hasCollided: false };
  }

  // Helper methods for collision detection

  pointDistanceToHalfPipe(point, halfPipe) {
    // Enhanced distance calculation to half-pipe
    const pipePos = halfPipe.position;
    const pipeDim = halfPipe.dimensions;

    // Check if within length bounds with larger tolerance
    if (Math.abs(point.z - pipePos.z) > pipeDim.length / 2 + 1.0) {
      return 100; // Out of range
    }

    // Calculate distance to curved surface with improved precision
    const heightFromGround = point.y;
    const distanceFromCenter = Math.abs(point.x - pipePos.x);

    // Use a more accurate half-pipe model based on a semi-circle
    const pipeRadius = pipeDim.width / 2;

    if (distanceFromCenter > pipeRadius + 1.0) {
      return 100; // Too far from pipe horizontally
    }

    // Calculate expected height at this x-position using quarter-circle formula
    let expectedHeight = 0;
    if (distanceFromCenter < pipeRadius) {
      // Inside half-pipe radius - calculate height using circle equation
      expectedHeight =
        pipeRadius -
        Math.sqrt(
          pipeRadius * pipeRadius - Math.pow(distanceFromCenter - pipeRadius, 2)
        );
    }

    // Return distance to expected surface
    return Math.abs(heightFromGround - expectedHeight);
  }

  calculateHalfPipeNormal(point, halfPipe) {
    // Enhanced normal calculation for half-pipe
    const pipePos = halfPipe.position;
    const pipeDim = halfPipe.dimensions;
    const pipeRadius = pipeDim.width / 2;

    // Calculate position relative to the center of the half-pipe curve
    const dx = point.x - pipePos.x;
    const dy = point.y;

    // Get angle in the half-pipe curve
    const angle = Math.atan2(dy, dx - pipeRadius);

    // Calculate normal vector pointing perpendicular to the curve surface
    return new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
  }

  isPointOnRamp(point, ramp) {
    const rampPos = ramp.position;
    const rampDim = ramp.dimensions;
    const rampRot = ramp.rotation;

    // Check if within width bounds with larger detection area
    if (Math.abs(point.x - rampPos.x) > rampDim.width / 2 + 1.0) {
      return false;
    }

    // Check if within length bounds with larger detection area
    if (Math.abs(point.z - rampPos.z) > rampDim.length / 2 + 1.5) {
      return false;
    }

    // Calculate expected y based on ramp angle with improved precision
    const angleX = rampRot.x;

    // Calculate the z-distance from the start of the ramp
    let distFromBase;
    if (rampRot.x > 0) {
      // Ramp sloping upward in +z direction
      distFromBase = point.z - (rampPos.z - rampDim.length / 2);
    } else {
      // Ramp sloping upward in -z direction
      distFromBase = rampPos.z + rampDim.length / 2 - point.z;
    }

    // Calculate the expected height at this point on the ramp
    const expectedY = rampPos.y + Math.tan(Math.abs(angleX)) * distFromBase;

    // Much more generous tolerance for height check
    // This makes it easier to climb and stay on ramps
    const tolerance = 1.0 + Math.abs(Math.tan(angleX)) * 0.5; // Larger tolerance for steeper ramps
    return Math.abs(point.y - expectedY) < tolerance;
  }

  calculateRampNormal(ramp) {
    const angleX = ramp.rotation.x;

    // More accurate normal calculation that respects the actual slope orientation
    const normalY = Math.cos(Math.abs(angleX));
    let normalZ;

    if (angleX > 0) {
      // Ramp sloping up in +z direction
      normalZ = -Math.sin(Math.abs(angleX));
    } else {
      // Ramp sloping up in -z direction
      normalZ = Math.sin(Math.abs(angleX));
    }

    // For steep ramps, slightly enhance the y component for better climbing
    if (Math.abs(angleX) > Math.PI / 6) {
      // Steeper than 30 degrees
      const enhancedY = normalY * 1.1; // Slightly boost the Y component
      return new THREE.Vector3(0, enhancedY, normalZ).normalize();
    } else {
      return new THREE.Vector3(0, normalY, normalZ).normalize();
    }
  }

  pointDistanceToQuarterPipe(point, pipe) {
    // Enhanced distance calculation for quarter pipe
    const pipePos = pipe.position;
    const pipeDim = pipe.dimensions;

    // Check if within width and length bounds with larger tolerance
    if (Math.abs(point.x - pipePos.x) > pipeDim.width / 2 + 1.0) {
      return 100; // Out of range
    }

    if (Math.abs(point.z - pipePos.z) > pipeDim.length / 2 + 1.0) {
      return 100; // Out of range
    }

    // Calculate distance to curved surface with improved precision
    // For quarter pipe, we're measuring from the corner
    const cornerX = pipePos.x - pipeDim.width / 2;
    const cornerY = 0; // Assuming pipe starts at ground level

    const dx = point.x - cornerX;
    const dy = point.y - cornerY;

    // The radius of the quarter pipe curve
    const radius = pipeDim.width;

    // If we're outside the quarter pipe area completely
    if (dx < 0 || dy < 0) {
      return 100;
    }

    // Calculate distance from point to the quarter-circle
    const distToCenter = Math.sqrt(dx * dx + dy * dy);

    return Math.abs(distToCenter - radius);
  }

  calculateQuarterPipeNormal(point, pipe) {
    // Enhanced normal calculation for quarter pipe
    const pipePos = pipe.position;
    const pipeDim = pipe.dimensions;

    // Calculate position relative to the corner of the quarter-pipe
    const cornerX = pipePos.x - pipeDim.width / 2;
    const cornerY = 0;

    const dx = point.x - cornerX;
    const dy = point.y - cornerY;

    // Get angle in the quarter-pipe curve
    const angle = Math.atan2(dy, dx);

    // Calculate normal vector pointing perpendicular to the curve surface
    return new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
  }

  calculateBoxNormal(point, boxPos, boxDim) {
    // Determine which face of the box was hit with more precision
    const dx = point.x - boxPos.x;
    const dy = point.y - boxPos.y;
    const dz = point.z - boxPos.z;

    // Calculate relative distances to each face as percentages
    const percentX = Math.abs(dx) / (boxDim.width / 2);
    const percentY = Math.abs(dy) / (boxDim.height / 2);
    const percentZ = Math.abs(dz) / (boxDim.length / 2);

    // Determine which face was hit based on closest approach
    if (percentX >= percentY && percentX >= percentZ) {
      // X-axis faces
      return new THREE.Vector3(Math.sign(dx), 0, 0);
    } else if (percentY >= percentX && percentY >= percentZ) {
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
