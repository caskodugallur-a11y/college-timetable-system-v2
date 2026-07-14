// ============================================
// THREE.JS BACKGROUND MANAGER
// CAS Kodungallur — 3D Animated Background
// ============================================

class ThreeBG {
  constructor(canvasId = 'bg3d') {
    this.canvasId = canvasId;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.group = null;
    this.shapes = [];
    this.animFrame = null;
    this.mouse = { x: 0, y: 0 };
    this.targetCamera = { x: 0, y: 0 };
    this.isRunning = false;
    this.clock = null;
  }

  static isMobile() {
    return navigator.maxTouchPoints > 0 || window.innerWidth < 768;
  }

  init(options = {}) {
    // Skip on mobile
    if (ThreeBG.isMobile()) return false;

    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return false;

    const {
      shapeCount = 100,
      primaryColor = 0x3B82F6,
      emissiveColor = 0x1D4ED8,
      cameraZ = 20,
      cameraParallax = 0.3,
      torusKnot = false, // centerpiece for login
      ringsOnly = false
    } = options;

    this.cameraParallax = cameraParallax;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = cameraZ;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Clock
    this.clock = new THREE.Clock();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3B82F6, 2, 30);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B5CF6, 1.5, 25);
    pointLight2.position.set(-5, -5, 3);
    this.scene.add(pointLight2);

    // Group
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Optional: TorusKnot centerpiece (login page)
    if (torusKnot) {
      const knotGeo = new THREE.TorusKnotGeometry(3, 0.8, 120, 16);
      const knotMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: emissiveColor,
        roughness: 0.3,
        metalness: 0.6,
        wireframe: true,
        transparent: true,
        opacity: 0.07
      });
      const knot = new THREE.Mesh(knotGeo, knotMat);
      knot.position.z = -8;
      this.scene.add(knot);
      this._torusKnot = knot;
    }

    // Create shapes
    const geoFactories = ringsOnly ? [
      () => new THREE.RingGeometry(0.4, 0.9, 32)
    ] : [
      () => new THREE.IcosahedronGeometry(1, 0),
      () => new THREE.OctahedronGeometry(1, 0),
      () => new THREE.TorusGeometry(0.7, 0.25, 8, 16),
      () => new THREE.TetrahedronGeometry(1, 0),
    ];

    for (let i = 0; i < shapeCount; i++) {
      const scale = 0.1 + Math.random() * 0.25;
      const geoFn = geoFactories[Math.floor(Math.random() * geoFactories.length)];
      const geo = geoFn();

      const wireframe = Math.random() > 0.6;
      const mat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: emissiveColor,
        emissiveIntensity: wireframe ? 0.8 : 0.3,
        roughness: 0.1,
        metalness: 0.8,
        wireframe: wireframe,
        transparent: true,
        opacity: wireframe ? 0.6 : 0.8,
        side: ringsOnly ? THREE.DoubleSide : THREE.FrontSide
      });

      const mesh = new THREE.Mesh(geo, mat);

      const spread = 30;
      mesh.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5
      );
      mesh.scale.setScalar(scale);

      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.008,
        rotY: (Math.random() - 0.5) * 0.012,
        rotZ: (Math.random() - 0.5) * 0.006,
      };

      this.group.add(mesh);
      this.shapes.push(mesh);
    }

    // Mouse tracking
    window.addEventListener('mousemove', this._onMouseMove.bind(this), { passive: true });

    // Resize
    window.addEventListener('resize', this._onResize.bind(this), { passive: true });

    // Visibility change — pause when hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    this.isRunning = true;
    this._animate();
    return true;
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  _onResize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _animate() {
    if (!this.isRunning) return;
    this.animFrame = requestAnimationFrame(this._animate.bind(this));

    const t = this.clock.getElapsedTime();

    // Rotate individual shapes
    this.shapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotX;
      mesh.rotation.y += mesh.userData.rotY;
      mesh.rotation.z += mesh.userData.rotZ;
    });

    // Group figure-8 orbit
    this.group.position.x = Math.sin(t * 0.15) * 1.5;
    this.group.position.y = Math.sin(t * 0.1) * 0.8;

    // Slow group rotation
    this.group.rotation.y = t * 0.03;

    // Rotate torus knot if present
    if (this._torusKnot) {
      this._torusKnot.rotation.x = t * 0.15;
      this._torusKnot.rotation.y = t * 0.2;
    }

    // Camera parallax — lerp toward mouse
    this.targetCamera.x += (this.mouse.x * this.cameraParallax - this.targetCamera.x) * 0.05;
    this.targetCamera.y += (this.mouse.y * this.cameraParallax - this.targetCamera.y) * 0.05;
    this.camera.position.x = this.targetCamera.x;
    this.camera.position.y = this.targetCamera.y;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  pause() {
    this.isRunning = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this._animate();
    }
  }

  destroy() {
    this.pause();
    window.removeEventListener('mousemove', this._onMouseMove.bind(this));
    window.removeEventListener('resize', this._onResize.bind(this));
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Export as global
window.ThreeBG = ThreeBG;
