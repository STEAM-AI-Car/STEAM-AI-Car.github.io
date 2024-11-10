class NNEditor {
   constructor(viewport, graph) {
      this.viewport = viewport;
      this.canvas = viewport.canvas;
      this.graph = graph;

      this.ctx = this.canvas.getContext("2d");

      this.selected = null;
      this.hovered = null;
      this.hoveredSegment = null;
      this.dragging = false;
      this.mouse = null;
      this.dragStarted = false;

      this.markedInputs = [];
   }

   static brainFromNN(nn) {
      const levelCount = Math.max(...nn.outputNodes.map((n) => n.layer));
      const hiddenLayerNodeCounts = [];
      for (let i = 1; i < levelCount; i++) {
         hiddenLayerNodeCounts.push(
            nn.points.filter((p) => p.layer == i).length
         );
      }
      const brain = new NeuralNetwork([
         nn.inputNodes.length,
         ...hiddenLayerNodeCounts,
         nn.outputNodes.length
      ]);
      for (let lev = 0; lev < brain.levels.length; lev++) {
         const level = brain.levels[lev];
         const baseLayer = lev;
         const { inputs, outputs, weights, biases } = level;
         for(let i=0;i<inputs.length;i++){
            inputs[i]=0;
         }
         for(let i=0;i<outputs.length;i++){
            outputs[i]=0;
         }
         for (let i = 0; i < biases.length; i++) {
            biases[i]=0;
            const point= nn.points
               .filter((p) => p.layer == baseLayer + 1)
               .find((p) => p.index == i);
            if(point){
               biases[i] =point.bias;
            }
         }
         for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
               weights[i][j]=0;
               const seg = nn.segments
                  .filter(
                     (s) =>
                        s.p1.layer == baseLayer && s.p2.layer == baseLayer + 1
                  )
                  .find((s) => s.p1.index == i && s.p2.index == j);
               if(seg){
                  weights[i][j]=seg.weight
               }
            }
         }
      }

      return brain;
   }

   static graphFromCar(car, cWidth, cHeight) {
      const network = car.brain;

      const inputLabels = new Array(car.sensor.rayCount)
         .fill("⬆")
         .concat(car.brainOptions.extraInputs);
      const rayAngles = [];
      for (let i = 0; i < car.sensor.rayCount; i++) {
         const rayAngle =
            car.sensor.rayOffset +
            lerp(
               car.sensor.raySpread / 2,
               -car.sensor.raySpread / 2,
               car.sensor.rayCount == 1 ? 0.5 : i / (car.sensor.rayCount - 1)
            );
         rayAngles.push(rayAngle);
      }
      const outputLabels = car.brainOptions.outputs;
      const margin = 50;
      const left = margin;
      const top = margin;
      const width = cWidth - margin * 2;
      const height = cHeight - margin * 2;
      const bottom = top + height;
      const right = left + width;

      const levelHeight = height / network.levels.length;

      const points = [];
      const segments = [];
      for (let lev = 0; lev < network.levels.length; lev++) {
         const levelTop = bottom - (lev + 1) * levelHeight;
         const levelBottom = bottom - lev * levelHeight;
         const level = network.levels[lev];
         const { inputs, outputs, weights, biases } = level;

         for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.getNodeX(inputs, i, left, right);
            let point = new Point(x, levelBottom);
            const found = points.find((p) => p.equals(point));
            if (found) {
               point = found;
            } else {
               points.push(point);
            }
            point.index = i;
            point.value = inputs[i];
            point.levelIndex = lev;
            point.inputNode = lev == 0;
            if (point.inputNode) {
               point.label = inputLabels[i];
               point.angle = rayAngles[i];
            }
         }

         for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.getNodeX(outputs, i, left, right);
            let point = new Point(x, levelTop);
            const found = points.find((p) => p.equals(point));
            if (found) {
               point = found;
            } else {
               points.push(point);
            }
            point.index = i;
            point.value = outputs[i];
            point.bias = biases[i];
            point.levelIndex = lev;
            point.outputNode = lev == network.levels.length - 1;
            if (point.outputNode) {
               point.label = outputLabels[i];
            }
         }

         for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
               let p1 = new Point(
                  Visualizer.getNodeX(inputs, i, left, right),
                  levelBottom
               );
               let found = points.find((p) => p.equals(p1));
               if (found) {
                  p1 = found;
               }
               let p2 = new Point(
                  Visualizer.getNodeX(outputs, j, left, right),
                  levelTop
               );
               found = points.find((p) => p.equals(p2));
               if (found) {
                  p2 = found;
               }
               const seg = new Segment(p1, p2);
               seg.weight = weights[i][j];
               segments.push(seg);
            }
         }
      }
      const nn = new NN(points, segments);
      nn.height = cHeight;
      nn.width = cWidth;
      return nn;
   }

   markAll() {
      for (const point of this.graph.points) {
         if (!point.inputNode) {
            point.marked = true;
         }
      }
      for (const seg of this.graph.segments) {
         seg.marked = true;
      }
      save();
   }

   unmarkAll() {
      for (const point of this.graph.points) {
         if (!point.inputNode) {
            point.marked = false;
         }
      }
      for (const seg of this.graph.segments) {
         seg.marked = false;
      }
      save();
   }

   removeAllSegments() {
      this.graph.segments.length = 0;
      save();
   }

   zeroAll() {
      for (const point of this.graph.points) {
         if (!point.inputNode) {
            point.bias = 0;
         }
      }
      for (const seg of this.graph.segments) {
         seg.weight = 0;
      }
      save();
   }

   enable(fullEdit=false) {
      if(fullEdit){
         this.#addEventListeners();
      }else{
         this.#addWheelListeners();
      }
   }

   disable() {
      this.#removeEventListeners();
      this.selected = false;
      this.hovered = false;
   }

   #addWheelListeners(){
      this.boundKeyDown = this.#handleKeyDown.bind(this);
      this.boundKeyUp = this.#handleKeyUp.bind(this);
      this.boundMouseWheel = this.#handleMouseWheel.bind(this);
      this.boundMouseMove = this.#handleMouseMove.bind(this);
      this.canvas.addEventListener("wheel", this.boundMouseWheel);
      this.canvas.addEventListener("mousemove", this.boundMouseMove);
      window.addEventListener("keydown", this.boundKeyDown);
      window.addEventListener("keyup", this.boundKeyUp);
   }

   #addEventListeners() {
      this.boundKeyUp = this.#handleKeyUp.bind(this);
      this.boundKeyDown = this.#handleKeyDown.bind(this);
      this.boundMouseWheel = this.#handleMouseWheel.bind(this);
      this.boundMouseDown = this.#handleMouseDown.bind(this);
      this.boundMouseMove = this.#handleMouseMove.bind(this);
      this.boundMouseUp = () => {
         this.dragging = false;
         if (this.dragStarted || (this.selected && this.selected.outputNode)) {
            this.selected = null;
         }
         save();
      };
      this.boundContextMenu = (evt) => evt.preventDefault();
      window.addEventListener("keydown", this.boundKeyDown);
      window.addEventListener("keyup", this.boundKeyUp);
      this.canvas.addEventListener("wheel", this.boundMouseWheel);
      this.canvas.addEventListener("mousedown", this.boundMouseDown);
      this.canvas.addEventListener("mousemove", this.boundMouseMove);
      document.addEventListener("mouseup", this.boundMouseUp);
      this.canvas.addEventListener("contextmenu", this.boundContextMenu);
   }

   #removeEventListeners() {
      window.removeEventListener("keydown", this.boundKeyDown);
      window.removeEventListener("keyup", this.boundKeyUp);
      this.canvas.removeEventListener("wheel", this.boundMouseWheel);
      this.canvas.removeEventListener("mousedown", this.boundMouseDown);
      this.canvas.removeEventListener("mousemove", this.boundMouseMove);
      document.removeEventListener("mouseup", this.boundMouseUp);
      this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
   }

   #handleKeyDown(evt) {
      const key = evt.key;
      switch (key) {
         /*
         case "Delete":
            if (this.hovered) {
               if (this.hovered.inputNode || this.hovered.outputNode) {
                  console.error("Can't delete");
               } else {
                  this.#removePoint(this.hovered);
                  this.hovered = null;
                  save();
               }
            } else if (this.hoveredSegment) {
               this.graph.removeSegment(this.hoveredSegment);
               this.hoveredSegment = null;
               save();
            }
            break;*/
         case "0":
            if (this.hovered) {
               this.hovered.bias = 0;
               save();
            } else if (this.hoveredSegment) {
               this.hoveredSegment.weight = 0;
               save();
            }
            break;
         case "+":
            if (this.hovered && this.hovered.bias) {
               this.hovered.bias += 0.01;
               save();
            } else if (this.hoveredSegment) {
               this.hoveredSegment.weight += 0.01;
               save();
            }
            break;
         case "-":
            if (this.hovered && this.hovered.bias) {
               this.hovered.bias -= 0.01;
               save();
            } else if (this.hoveredSegment) {
               this.hoveredSegment.weight -= 0.01;
               save();
            }
            break;
         case "n":
            this.showingAllHighlights=true;
            break;
         /*
         case "m":
            if (this.hovered) {
               // && !this.hovered.inputNode) {
               this.hovered.marked = !this.hovered.marked;
               save();
            } else if (this.hoveredSegment) {
               this.hoveredSegment.marked = !this.hoveredSegment.marked;
               save();
            }
            break;*/
         /*
            case "v":
                if (
                    this.hovered &&
                    (this.hovered.inputNode || this.hovered.outputNode)
                ) {
                    this.hovered.view = !this.hovered.view;
                    save();
                }
                break;*/
      }
   }

   #handleKeyUp(evt) {
      const key = evt.key;
      switch (key) {
         case "n":
            this.showingAllHighlights=false;
            break;
      }
   }

   #handleMouseWheel(evt) {
      const dir = Math.sign(evt.deltaY);
      const step = evt.shiftKey ? -0.01 : -0.1;
      if (this.hovered) {
         if (this.hovered.inputNode) {
            return;
         }
         this.hovered.bias += dir * step;
         this.hovered.bias = Math.round(this.hovered.bias * 100) / 100;
         this.hovered.bias = Math.max(-1, Math.min(1, this.hovered.bias));
         if (Math.abs(this.hovered.bias) < 0.01) {
            this.hovered.bias = 0;
         }
         save();
         
         discardBtn.style.opacity = 1;
         discardBtn.style.pointerEvents="";
      }
      if (this.hoveredSegment) {
         this.hoveredSegment.weight += dir * step;
         this.hoveredSegment.weight =
            Math.round(this.hoveredSegment.weight * 100) / 100;
         this.hoveredSegment.weight = Math.max(
            -1,
            Math.min(1, this.hoveredSegment.weight)
         );
         if (Math.abs(this.hoveredSegment.weight) < 0.01) {
            this.hoveredSegment.weight = 0;
         }
         save();
         discardBtn.style.opacity = 1;
         discardBtn.style.pointerEvents="";
      }
   }

   #handleMouseMove(evt) {
      this.mouse = this.viewport.getMouse(evt, true);
      this.mouse.value = 0;
      this.mouse.bias = 0;

      this.hovered = getNearestPoint(
         this.mouse,
         this.graph.points,
         30 * this.viewport.zoom
      );
      if (!this.hovered) {
         this.hoveredSegment = getNearestSegment(
            this.mouse,
            this.graph.segments,
            30 * this.viewport.zoom
         );
      } else {
         this.hoveredSegment = null;
      }
      if (this.dragging == true && this.selected) {
         this.selected.x = this.mouse.x;
         this.selected.y = this.mouse.y;
         this.dragStarted = true;
      }
   }

   #handleMouseDown(evt) {
      if (evt.button == 2 || evt.ctrlKey) {
         // right click
         if (this.selected) {
            this.selected = null;
         } else if (this.hovered) {
            if (this.hovered.inputNode || this.hovered.outputNode) {
               console.error("Can't delete");
            } else {
               this.#removePoint(this.hovered);
            }
         } else if (this.hoveredSegment) {
            this.graph.removeSegment(this.hoveredSegment);
            this.hoveredSegment = null;
         }
      }
      if (evt.button == 0) {
         // left click
         if (this.hovered) {
            //this.#select(this.hovered);
            if (this.selected) {
               if (this.hovered.inputNode || this.selected.outputNode) {
                  this.dragging = false;
                  this.selected = null;
                  return;
               }
               const seg = new Segment(this.selected, this.hovered);
               seg.weight = 0;
               this.graph.tryAddSegment(seg);
               this.selected = null;
            } else {
               //if(!this.hovered.outputNode){
               this.#select(this.hovered);
            }
            this.dragging = true;
            this.dragStarted = false;
            return;
         }
         if (this.selected && !this.selected.outputNode) {
            this.dragging = false;
            this.#addPoint(this.mouse);
            this.selected = null;
            return;
         }
         //this.#select(this.mouse);
         //this.hovered = this.mouse;
      }

      /* no middle click
      if (evt.button == 1) {
         // middle click
         if (this.hoveredSegment) {
            this.hoveredSegment.marked = !this.hoveredSegment.marked;
            triggerDecisionBoundaryUpdate = true;
            save();
            return;
         }
         if (this.hovered) {
            if (!this.hovered.inputNode) {
               this.hovered.marked = !this.hovered.marked;
               triggerDecisionBoundaryUpdate = true;
               save();
            }
            return;
         }
      }*/
   }

   #addPoint(point) {
      this.graph.addPoint(this.mouse);
      const seg = new Segment(this.selected, point);
      seg.weight = 0;
      this.graph.tryAddSegment(seg);
      this.selected = null;
      this.hovered = point;
   }

   #select(point) {
      if (this.selected) {
         const seg = new Segment(this.selected, point);
         seg.weight = 0;
         this.graph.tryAddSegment(seg);
      }
      this.selected = point;
   }

   #removePoint(point) {
      this.graph.removePoint(point);
      this.hovered = null;
      if (this.selected == point) {
         this.selected = null;
      }
   }

   dispose() {
      this.graph.dispose();
      this.selected = null;
      this.hovered = null;
   }

   showAllHighlights(){
      for(const seg of this.graph.segments){
         this.showHighlightAtPoint(seg.weight,average(seg.p1,seg.p2));
      }
      for(const point of this.graph.points){
         if(point.bias!=null){
            this.showHighlightAtPoint(point.bias,point);
         }else{
            this.showVariableAtPoint(point);
            //this.showHighlightAtPoint(point.value,point);
         }
      }
   }
   showVariableAtPoint(point){
      const rad = NN.nodeSize * 0.7; 
      this.ctx.fillStyle = "white"; //getRGBA(val);
      this.ctx.strokeStyle = "black"; //getRGBA(val);
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "bold " + rad * 1 + "px Arial";
      this.ctx.lineWidth = 15;
      this.ctx.beginPath();
      const vals=["x","y","z","t","u","v","w"];
      const fix = vals[this.graph.inputNodes.indexOf(point)];
      //if (value != null) {
      //   const fix = value.toFixed(2);
         this.ctx.strokeText(fix, point.x, point.y);
         this.ctx.fillText(fix, point.x, point.y);
      //} 
      this.ctx.restore();
   }
   showHighlightAtPoint(value,point) {
      const rad = NN.nodeSize * 0.7; /*
        this.ctx.save();
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "white";
        this.ctx.rect(this.mouse.x, this.mouse.y - rad, rad, rad);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.arc(
            this.mouse.x + rad,
            this.mouse.y - rad,
            rad,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
*/
      this.ctx.fillStyle = getRGBA(value);
      this.ctx.strokeStyle = "black"; //getRGBA(val);
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "bottom";
      this.ctx.font = "bold " + rad * 0.8 + "px Arial";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (value != null) {
         const fix = value.toFixed(2);
         this.ctx.strokeText(fix, point.x, point.y);
         this.ctx.fillStyle = "gray"
         this.ctx.fillText(fix, point.x, point.y);
         this.ctx.fillStyle = getRGBA(value);
         this.ctx.fillText(fix, point.x, point.y);
      } /*
            ctx.strokeText(
               val.toFixed(2),
               Visualizer.mouse.x + rad,
               Visualizer.mouse.y - rad
            );*/

      this.ctx.restore();
   }

   showHighlight(value) {
      const rad = NN.nodeSize * 0.7; /*
        this.ctx.save();
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "white";
        this.ctx.rect(this.mouse.x, this.mouse.y - rad, rad, rad);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.arc(
            this.mouse.x + rad,
            this.mouse.y - rad,
            rad,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
*/
      this.ctx.fillStyle = "white"; //getRGBA(val);
      this.ctx.strokeStyle = "black"; //getRGBA(val);
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "bottom";
      this.ctx.font = "bold " + rad * 0.8 + "px Arial";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (value != null) {
         const fix = value.toFixed(2);
         this.ctx.strokeText(fix, this.mouse.x, this.mouse.y);
         this.ctx.fillText(fix, this.mouse.x, this.mouse.y);
      } /*
            ctx.strokeText(
               val.toFixed(2),
               Visualizer.mouse.x + rad,
               Visualizer.mouse.y - rad
            );*/

      this.ctx.restore();
   }

   display() {
      if (this.hoveredSegment) {
         this.hoveredSegment.draw(this.ctx, {
                width: NN.lineWidth + 4,
                color: "rgba(255,255,255,0.5)",
            });
         /* this.hoveredSegment.draw(this.ctx, {
                width: NN.lineWidth + 2,
                color: "rgb(68, 68, 68)",
            });*/

            /*
         drawArrow2(
            this.hoveredSegment.p1,
            this.hoveredSegment.p2,
            this.ctx,
            "rgba(255,255,255,0.5)",
            NN.nodeSize / 2 + NN.lineWidth / 2 + 4,
            NN.nodeSize * 0.8,
            "rgba(255,255,255,0.5)",
            2.4
         );*/
      }
      if (this.hovered) {
         this.hovered.draw(this.ctx, {
            size: NN.nodeSize + NN.lineWidth + 4,
            color: "rgba(255,255,255,0.5)",
         });
      }
      this.graph.draw(this.ctx);

      if (this.selected && !this.selected.outputNode) {
         //new Segment(this.selected, intent).draw(this.ctx, { color:"#AAA",dash: [3, 3] });
         if (this.hovered && this.hovered!=this.selected) {
            if (!this.hovered.inputNode) {
               /*drawArrow2(
                  this.selected,
                  this.hovered,
                  this.ctx,
                  "white",
                  NN.nodeSize / 2 + NN.lineWidth / 2 + 4
               );*/
               const seg = new Segment(this.selected, this.hovered);
               seg.draw(this.ctx, {
                  color: "rgba(0,0,0,0.5)",
                  width: NN.lineWidth*1,
               });
               seg.draw(this.ctx, {
                  color: "rgba(255,255,255,0.5)",
                  width: NN.lineWidth*1,
                  dash: [7,7]
               });
            }
         } else {
            //drawArrow2(this.selected, this.mouse, this.ctx, "white", 0);
            const seg = new Segment(this.selected, this.mouse);
            seg.draw(this.ctx, {
               color: "rgba(0,0,0,0.5)",
               width: NN.lineWidth*1,
            });
            seg.draw(this.ctx, {
               color: "rgba(255,255,255,0.5)",
               width: NN.lineWidth*1,
               dash: [7,7]
            });
         }
         this.selected.draw(this.ctx, { color: "rgba(255,255,255,0.3)", size: NN.nodeSize*1});
      }
      if (this.specialEdit) {
         if (this.mouse) {
            this.mouse.draw(this.ctx, { size: this.radius * 2 });
         }
      }

      
      if(this.showingAllHighlights){
         this.showAllHighlights();
      }else{
         if (this.hoveredSegment) {
            this.showHighlight(this.hoveredSegment.weight);
         }
         if (this.hovered) {
            this.showHighlight(
               this.hovered.bias != null ? this.hovered.bias : this.hovered.value
            );
         }     
      }
   }
}
