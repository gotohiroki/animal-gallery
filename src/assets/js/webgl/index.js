import { SetControls } from "./lib/SetControls";
import { SetGui } from "./lib/SetGui";

import { Stage } from "./Stage";
import { Plane } from "./Plane";

export class WebGL {
  constructor(body, params) {
    this.body = body;
    this.params = params;

    this.gui = null;
    this.controls = null;

    this.stage = null;
    this.plane = null;

    this.time = null;

    this.setModule();
  }

  setModule() {
    this.gui = new SetGui();
    this.stage = new Stage("#webgl", this.params);
    this.plane = new Plane(this.stage, this.params);
    this.controls = new SetControls(this.stage);
    this.onMouseMove();
    this.onUpdate();
  }

  onMouseMove() {
    this.body.addEventListener("pointermove", (event) => {
      this.plane.onPointerMove(event);
    });
  }

  // 毎フレーム呼び出す
  onUpdate() {
    requestAnimationFrame(this.onUpdate.bind(this));
    this.time += 0.05;
    if (this.plane != null) this.plane.onUpdate(this.time);
    if (this.background != null) this.background.onUpdate(this.time);
    if (this.stage != null) this.stage.onUpdate();
    if (this.controls != null) this.controls.onUpdate();
  }

  onResize(props) {
    this.params.w = props.w;
    this.params.h = props.h;
    this.params.aspect = props.aspect;
    this.params.shorter = props.shorter;
    this.params.longer = props.longer;

    this.stage.onResize(props);
    this.background.onResize(props);
    this.plane.onResize(props);
  }
}
