class SkatePark {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.ramps = [];
    this.rails = [];

    this.createGround();
    this.createHalfPipe();
    this.createFunBox();
    this.createRails();
    this.createQuarterPipe();
    this.createBoundaries();
  }

  createGround() {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Create grid lines on the ground
    const gridHelper = new THREE.GridHelper(100, 20, 0x555555, 0x555555);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  createHalfPipe() {
    // Half-pipe parameters
    const halfPipeWidth = 15;
    const halfPipeHeight = 6;
    const halfPipeLength = 30;
    const segments = 20;

    // Create half-pipe using a tube geometry
    const halfPipeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-halfPipeWidth / 2, 0, 0),
      new THREE.Vector3(0, -halfPipeHeight / 1.5, 0),
      new THREE.Vector3(halfPipeWidth / 2, 0, 0)
    );

    const halfPipeGeometry = new THREE.TubeGeometry(
      halfPipeCurve,
      segments,
      halfPipeWidth / 2,
      1,
      false
    );
    const halfPipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.halfPipe = new THREE.Mesh(halfPipeGeometry, halfPipeMaterial);
    this.halfPipe.rotation.y = Math.PI / 2;
    this.halfPipe.position.set(0, halfPipeHeight / 2, -30);
    this.halfPipe.scale.z = halfPipeLength / 10;
    this.halfPipe.castShadow = true;
    this.halfPipe.receiveShadow = true;
    this.scene.add(this.halfPipe);

    this.ramps.push({
      mesh: this.halfPipe,
      type: 'halfpipe',
      position: this.halfPipe.position,
      dimensions: {
        width: halfPipeWidth,
        height: halfPipeHeight,
        length: halfPipeLength,
      },
    });
  }

  createFunBox() {
    // Fun Box (a box with ramps on the sides)
    const boxWidth = 10;
    const boxHeight = 2;
    const boxLength = 10;

    // Create the main box
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxLength);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.2,
    });

    this.funBox = new THREE.Mesh(boxGeometry, boxMaterial);
    this.funBox.position.set(15, boxHeight / 2, 5);
    this.funBox.castShadow = true;
    this.funBox.receiveShadow = true;
    this.scene.add(this.funBox);

    // Create ramps on each side
    const rampGeometry = new THREE.BoxGeometry(
      boxWidth,
      boxHeight,
      boxLength / 2
    );
    const rampMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.7,
      metalness: 0.2,
    });

    // Front ramp
    this.frontRamp = new THREE.Mesh(rampGeometry, rampMaterial);
    this.frontRamp.position.set(
      15,
      boxHeight / 2,
      boxLength / 2 + boxLength / 4
    );
    this.frontRamp.rotation.x = Math.PI / 8;
    this.frontRamp.castShadow = true;
    this.frontRamp.receiveShadow = true;
    this.scene.add(this.frontRamp);

    // Back ramp
    this.backRamp = new THREE.Mesh(rampGeometry, rampMaterial);
    this.backRamp.position.set(
      15,
      boxHeight / 2,
      -boxLength / 2 - boxLength / 4
    );
    this.backRamp.rotation.x = -Math.PI / 8;
    this.backRamp.castShadow = true;
    this.backRamp.receiveShadow = true;
    this.scene.add(this.backRamp);

    this.obstacles.push({
      mesh: this.funBox,
      type: 'funbox',
      position: this.funBox.position,
      dimensions: {
        width: boxWidth,
        height: boxHeight,
        length: boxLength,
      },
    });

    this.ramps.push({
      mesh: this.frontRamp,
      type: 'ramp',
      position: this.frontRamp.position,
      rotation: this.frontRamp.rotation,
      dimensions: {
        width: boxWidth,
        height: boxHeight,
        length: boxLength / 2,
      },
    });

    this.ramps.push({
      mesh: this.backRamp,
      type: 'ramp',
      position: this.backRamp.position,
      rotation: this.backRamp.rotation,
      dimensions: {
        width: boxWidth,
        height: boxHeight,
        length: boxLength / 2,
      },
    });
  }

  createRails() {
    // Create a rail for grinding
    const railLength = 15;
    const railHeight = 1;
    const railThickness = 0.2;

    const railGeometry = new THREE.BoxGeometry(
      railThickness,
      railHeight,
      railLength
    );
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.3,
      metalness: 0.8,
    });

    this.rail = new THREE.Mesh(railGeometry, railMaterial);
    this.rail.position.set(-15, railHeight / 2, 0);
    this.rail.castShadow = true;
    this.scene.add(this.rail);

    // Create rail supports
    const supportGeometry = new THREE.BoxGeometry(0.4, railHeight, 0.4);
    const supportMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.3,
    });

    // Add supports at both ends and middle
    for (let i = -1; i <= 1; i++) {
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      support.position.set(-15, railHeight / 2, i * (railLength / 2));
      support.castShadow = true;
      this.scene.add(support);
    }

    this.rails.push({
      mesh: this.rail,
      type: 'rail',
      position: this.rail.position,
      dimensions: {
        width: railThickness,
        height: railHeight,
        length: railLength,
      },
    });
  }

  createQuarterPipe() {
    // Quarter pipe parameters
    const quarterPipeWidth = 15;
    const quarterPipeHeight = 5;
    const quarterPipeLength = 10;
    const segments = 10;

    // Create quarter pipe curve
    const quarterPipeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(quarterPipeWidth / 2, quarterPipeHeight / 2, 0),
      new THREE.Vector3(quarterPipeWidth, quarterPipeHeight, 0)
    );

    const points = quarterPipeCurve.getPoints(segments);
    const quarterPipeShape = new THREE.Shape();

    // Create shape for extrusion
    quarterPipeShape.moveTo(0, 0);
    for (let i = 0; i < points.length; i++) {
      quarterPipeShape.lineTo(points[i].x, points[i].y);
    }
    quarterPipeShape.lineTo(quarterPipeWidth, 0);
    quarterPipeShape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: quarterPipeLength,
      bevelEnabled: false,
    };

    const quarterPipeGeometry = new THREE.ExtrudeGeometry(
      quarterPipeShape,
      extrudeSettings
    );
    const quarterPipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.quarterPipe = new THREE.Mesh(quarterPipeGeometry, quarterPipeMaterial);
    this.quarterPipe.rotation.y = Math.PI;
    this.quarterPipe.position.set(20, 0, -15);
    this.quarterPipe.castShadow = true;
    this.quarterPipe.receiveShadow = true;
    this.scene.add(this.quarterPipe);

    this.ramps.push({
      mesh: this.quarterPipe,
      type: 'quarterpipe',
      position: this.quarterPipe.position,
      dimensions: {
        width: quarterPipeWidth,
        height: quarterPipeHeight,
        length: quarterPipeLength,
      },
    });
  }

  createBoundaries() {
    // Create boundaries around the skate park
    const wallHeight = 1.5;
    const wallThickness = 1;
    const parkSize = 50;

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.2,
    });

    // North wall
    const northWallGeometry = new THREE.BoxGeometry(
      parkSize * 2,
      wallHeight,
      wallThickness
    );
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -parkSize);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    this.scene.add(northWall);

    // South wall
    const southWallGeometry = new THREE.BoxGeometry(
      parkSize * 2,
      wallHeight,
      wallThickness
    );
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, parkSize);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    this.scene.add(southWall);

    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      parkSize * 2
    );
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(parkSize, wallHeight / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);

    // West wall
    const westWallGeometry = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      parkSize * 2
    );
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
    westWall.position.set(-parkSize, wallHeight / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    this.scene.add(westWall);

    this.obstacles.push(
      { mesh: northWall, type: 'wall', position: northWall.position },
      { mesh: southWall, type: 'wall', position: southWall.position },
      { mesh: eastWall, type: 'wall', position: eastWall.position },
      { mesh: westWall, type: 'wall', position: westWall.position }
    );
  }

  getObstacles() {
    return this.obstacles;
  }

  getRamps() {
    return this.ramps;
  }

  getRails() {
    return this.rails;
  }
}

// Export SkatePark to window so it can be used by other modules
window.SkatePark = SkatePark;
