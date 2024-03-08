import gsap from "gsap";
import { Mesh, PlaneGeometry, Raycaster, ShaderMaterial, TextureLoader, Vector2, Vector4 } from "three";
import vertexShader from "./shader/planeVertex.glsl";
import fragmentShader from "./shader/planeFragment.glsl";

export class Plane {
  constructor(stage, params) {
    this.stage = stage;
    this.params = params;

    this.geometry = null;
    this.material = null;
    this.mesh = null;

    this.canvas = this.stage.renderer.domElement;
    this.canvasRect = this.canvas.getBoundingClientRect();

    this.elements = document.querySelectorAll(".js-image");
    this.os = [];

    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.init();
  }

  init() {
    this.setObjects();
  }

  onPointerMove(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycast();
  }

  raycast() {
    this.raycaster.setFromCamera(this.pointer, this.stage.camera);
    const intersects = this.raycaster.intersectObjects(this.stage.scene.children);
    // console.log(this.stage.scene.children);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;
      // console.log(obj);
      obj.material.uniforms.uMouse.value = intersects[i].uv;
    }
  }

  getPostion(rect, canvasRect) {
    const x = rect.left + rect.width / 2 - canvasRect.width / 2;
    const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
    return { x, y };
  }

  getScroll(o) {
    const { $el, mesh } = o;
    const rect = $el.getBoundingClientRect();
    const { x, y } = this.getPostion(rect, this.canvasRect);
    // mesh.position.x = x;
    mesh.position.y = y;
  }

  getResize(o, newCanvasRect) {
    const { $el, mesh, geometry, rect } = o;
    const nextRect = $el.getBoundingClientRect();
    const { x, y } = this.getPostion(nextRect, newCanvasRect);
    mesh.position.x = x;
    mesh.position.y = y;
    geometry.scale(nextRect.width / rect.width, nextRect.height / rect.height, 1);
    o.rect = nextRect;
    console.log(o.rect.width);
  }

  setObjects() {
    this.materials = [];
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: 0 },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uResolution: { value: new Vector4() },
      },
      vertexShader,
      fragmentShader,
      // wireframe: true,
      // side: DoubleSide,
    });

    this.elements.forEach((el) => {
      const rect = el.getBoundingClientRect();

      this.geometry = new PlaneGeometry(rect.width, rect.height, 10, 10);

      const texture = new TextureLoader().load(el.src);
      texture.needsUpdate = true;

      const material = this.material.clone();

      el.addEventListener("pointerenter", () => {
        console.log(this.material);
        console.log(el);
      });

      el.addEventListener("pointermove", () => {
        gsap.to(material.uniforms.uHover, {
          value: 1,
          duration: 1,
        });
      });

      el.addEventListener("pointerout", () => {
        console.log("out");
        gsap.to(material.uniforms.uHover, {
          value: 0,
          duration: 1,
        });
      });

      this.materials.push(material);
      material.uniforms.uTexture.value = texture;

      this.mesh = new Mesh(this.geometry, material);

      const { x, y } = this.getPostion(rect, this.canvasRect);
      this.mesh.position.x = x;
      this.mesh.position.y = y;
      this.mesh.position.z = 10;

      const o = {
        mesh: this.mesh,
        geometry: this.geometry,
        material: material,
        rect: rect,
        $el: el,
      };

      this.stage.scene.add(this.mesh);
      this.os.push(o);
    });
  }

  onUpdate(time) {
    this.os.forEach((o) => {
      this.getScroll(o);
      o.material.uniforms.uTime.value = time;
    });
  }

  onResize(props) {
    this.params.w = props.w;
    this.params.h = props.h;
    this.params.aspect = props.aspect;
    this.params.shorter = props.shorter;
    this.params.longer = props.longer;

    const newCanvasRect = this.canvas.getBoundingClientRect();
    this.os.forEach((o) => this.getResize(o, newCanvasRect));
  }
}
