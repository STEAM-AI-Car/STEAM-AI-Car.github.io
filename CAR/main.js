function generateCarInspector(index) {
   const container = document.createElement("div");
   container.id = "carInspector";
   const c = document.createElement("canvas");
   c.width = rightBarWidth;

   const c3Margin = 20;
   const c3 = document.createElement("canvas");
   c3.height = rightBarWidth;
   c3.width = rightBarWidth;
   c3.style.borderRadius = "50%";
   c3.style.border = "2px solid green";
   c3.style.margin = c3Margin + "px";

   c3.style.backgroundColor = "#333";

   miniMap = new MiniMap(c3, world.graph, rightBarWidth - c3Margin * 2);

   if (!showMiniMap) {
      c3.style.display = "none";
   }

   miniMap.targets = targets;

   Visualizer.addEventListeners(c);
   const d = document.createElement("div");

   // Add mouse tracking to the decision boundary canvas
   d.addEventListener("mousemove", (e) => {
      const rect = d.getBoundingClientRect();
      d._mouseX = e.clientX - rect.left;
      d._mouseY = e.clientY - rect.top;
   });
   
   d.addEventListener("mouseleave", () => {
      d._mouseX = undefined;
      d._mouseY = undefined;
   });

   const s_1 = document.createElement("img");
   const holder = document.createElement("div");
   const vert = document.createElement("div");
   const s_2 = document.createElement("img");
   //add a range slider to holder
   const range = document.createElement("input");

   const checkBoxes = document.createElement("div");
   checkBoxes.style.display = "flex";
   checkBoxes.style.flexDirection = "row";
   checkBoxes.style.position = "absolute";

   const s1 = document.createElement("span");
   const s2 = document.createElement("span");
   const s3 = document.createElement("span");
   const s4 = document.createElement("span");

   const _c1 = document.createElement("input");
   const _c2 = document.createElement("input");
   const _c3 = document.createElement("input");
   const _c4 = document.createElement("input");
   _c1.type = "checkbox";
   _c2.type = "checkbox";
   _c3.type = "checkbox";
   _c4.type = "checkbox";
   _c1.id = "c1";
   _c2.id = "c2";
   _c3.id = "c3";
   _c4.id = "c4";
   _c1.classList.add("checkbox");
   _c2.classList.add("checkbox");
   _c3.classList.add("checkbox");
   _c4.classList.add("checkbox");
   _c1.checked = localStorage.getItem("c1Hide") != "true";
   _c2.checked = localStorage.getItem("c2Hide") != "true";
   _c3.checked = localStorage.getItem("c3Hide") != "true";
   _c4.checked = localStorage.getItem("c4Hide") != "true";
   _c1.addEventListener("change", () => {
      localStorage.setItem("c1Hide", !_c1.checked);
   });
   _c2.addEventListener("change", () => {
      localStorage.setItem("c2Hide", !_c2.checked);
   });
   _c3.addEventListener("change", () => {
      localStorage.setItem("c3Hide", !_c3.checked);
   });
   _c4.addEventListener("change", () => {
      localStorage.setItem("c4Hide", !_c4.checked);
   });

   s1.classList.add("custom-checkbox");
   l1 = document.createElement("label");
   l1.classList.add("checkbox-label");
   l1.appendChild(s1);
   checkBoxes.appendChild(_c1);
   checkBoxes.appendChild(l1);
   s2.classList.add("custom-checkbox");
   l2 = document.createElement("label");
   l2.classList.add("checkbox-label");
   l2.appendChild(s2);
   checkBoxes.appendChild(_c2);
   s3.classList.add("custom-checkbox");
   l3 = document.createElement("label");
   l3.classList.add("checkbox-label");
   l3.appendChild(s3);
   checkBoxes.appendChild(_c3);
   s4.classList.add("custom-checkbox");
   l4 = document.createElement("label");
   l4.classList.add("checkbox-label");
   l4.appendChild(s4);

   s1.style.backgroundColor = "gray";
   s2.style.backgroundColor = "blue";
   s3.style.backgroundColor = "red";
   s4.style.backgroundColor = "green";

   checkBoxes.appendChild(_c4);
   checkBoxes.appendChild(l4);
   l1.id = "l1";
   l2.id = "l2";
   l3.id = "l3";
   l4.id = "l4";

   setTimeout(() => {
      l1.htmlFor = "c1";
      l2.htmlFor = "c2";
      l3.htmlFor = "c3";
      l4.htmlFor = "c4";
   }, 1000);

   range.type = "range";
   range.min = 1;
   range.max = 11;
   range.value = pixelSize;
   range.step = 1;
   range.style.width = decisionBoundarySize + "px";
   range.style.border = "none";
   range.style.outline = "none";
   range.style.cursor = "pointer";
   //range.style.background="yellow";
   range.style.height = "10px";
   range.style.paddingBottom =
      typeof InstallTrigger !== "undefined" ? "0" : "10px";
   range.style.filter = "grayscale(100%)";
   range.addEventListener("change", (e) => {
      pixelSize = Number(e.target.value);
      localStorage.setItem("pixelSize", pixelSize);
      triggerDecisionBoundaryUpdate = true;
   });
   holder.appendChild(vert);
   holder.appendChild(s_1);
   if (defaultOptions.showCheckboxes) {
      vert.appendChild(checkBoxes);
   }
   checkBoxes.classList.add("chkBox");
   vert.appendChild(s_2);
   vert.appendChild(d);
   if (defaultOptions.pixelControl) {
      vert.appendChild(range);
   }
   holder.style.display = "flex";
   holder.style.alignItems = "center";
   holder.style.justifyContent = "center";
   holder.style.marginLeft = "34px";
   holder.id = "decBoundaryHolder";

   s_1.classList.add("labelSelector");
   s_2.classList.add("labelSelector");
   s_1.style.marginTop = defaultOptions.pixelControl ? "14px" : "40px";

   const db = multiDecisionBoundary
      ? new MultiDecisionBoundary(
           d,
           cars[index].nn,
           outputColors,
           localStorage.getItem("simplified") == "true",
           decisionBoundarySize,
           s_1,
           s_2
        )
      : new DecisionBoundary(d, cars[index].nn);
   //container.appendChild(c);
   container.appendChild(nnCanvas);
   //container.appendChild(nnCanvas2);
   container.appendChild(c3);
   if (showDecisionBoundary) {
      container.appendChild(holder);
   }
   inspectionSection.appendChild(container);
   container.style.marginRight = "5px";
   container.style.display = "flex";
   container.style.flexDirection = "column";
   container.style.backgroundColor = optimizing ? "#630" : "#444";
   decisionBoundaries.push(db);
   Visualizer.decisionBoundary = db;
   networkCtxts.push(c.getContext("2d"));

   nnViewport = new Viewport(nnCanvas, 1, null, false, false);
   nnEditor = new NNEditor(nnViewport, bestCar.nn);
   if (showVerticalButtons && !optimizing) {
      nnEditor.enable(defaultOptions.mouseEdit);
   }
}

function save() {
   if (defaultOptions.useHardCodedBrain) {
      //return;
   }
   if (!bestCar) {
      alert("All cars are damaged");
   }
   triggerDecisionBoundaryUpdate = true;
   //const brainCopy=JSON.parse(JSON.stringify(bestCar.brain));
   //brainCopy.levels[0].inputs=new Array(brainCopy.levels[0].inputs.length)
   /*brainCopy.levels[0].inputs=new Array(brainCopy.levels[0].inputs.length)
   this.inputs = new Array(inputCount);
   this.outputs = new Array(outputCount);
   this.biases = new Array(outputCount);*/
   convertBrain(bestCar);

   const brainString = JSON.stringify(bestCar.brain);
   localStorage.setItem("bestBrain", brainString);

   const carString = JSON.stringify(bestCar);
   localStorage.setItem("car_" + sessionName, carString);
}

function convertBrain(car) {
   const b = NN.load(car.nn); //.balancedNN;
   b.feedForward(b.inputNodes.map((n) => 0));
   const maxLayer = Math.max(...b.outputNodes.map((n) => n.layer));

   const nextIndex = [];
   for (let i = 0; i <= maxLayer; i++) {
      nextIndex[i] = b.points.filter((p) => p.layer == i).length;
   }

   for (let i = 0; i < b.outputNodes.length; i++) {
      while (b.outputNodes[i].layer < maxLayer) {
         const segsToPoint = b.segments.filter((s) =>
            s.p2.equals(b.outputNodes[i])
         );
         if (segsToPoint.length > 0) {
            const p = new Point(0, 0);
            p.bias = b.outputNodes[i].bias;
            b.outputNodes[i].bias = 0;
            p.index = nextIndex[b.outputNodes[i].layer]; //b.points.filter(p=>p.layer==b.outputNodes[i].layer && !p.outputNode).length
            nextIndex[b.outputNodes[i].layer]++;
            p.layer = b.outputNodes[i].layer;
            for (const s of segsToPoint) {
               s.p2 = p;
            }
            const seg = new Segment(p, b.outputNodes[i]);
            seg.weight = 0.1;
            b.segments.push(seg);
            b.points.push(p);
         }
         b.outputNodes[i].layer++;
      }
   }

   for (let i = 0; i <= maxLayer; i++) {
      const pts = b.points.filter((p) => p.layer == i);
      for (let j = 0; j < pts.length; j++) {
         pts[j].index = j;
      }
   }

   car.brain = NNEditor.brainFromNN(b);
}

function download() {
   const carString = localStorage.getItem("car_" + sessionName);
   if (!carString) {
      alert("No car to download");
      return;
   }
   const element = document.createElement("a");
   element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," +
         encodeURIComponent("let carInfo = " + carString)
   );
   /*
   let fileName = prompt("File Name", "brain.json");
   if (fileName.indexOf(".json") == -1) {
      fileName += ".json";
   }
*/
   const fileName = "name.car";
   element.setAttribute("download", fileName);

   element.click();
}

function discard() {
   localStorage.clear();
   carInfo = backupCarInfo;
   resetCars();
   //location.reload();
   /*
   localStorage.removeItem("defaultOptions");
   localStorage.removeItem("bestBrain");
   localStorage.removeItem("car");
   localStorage.removeItem("selectedWeightsAndBiases");
   */

   /*
   NeuralNetwork.mutate(bestCar.brain, 1);
   bestCar.setOptions(bestCar);
   save();*/
}

function generateCars(N, markings) {
   const cars = [];
   let i = 0;
   while (i < N) {
      const { center, directionVector, width, height } =
         markings[i % markings.length];
      //const maxSpeed = defaultOptions.maxSpeeds[i % defaultOptions.maxSpeeds.length];
      //for (let i = 1; i <= N; i++) {
      //cars.push(new Car(center.x, center.y, 30, 50, "AI", -angle(direction)));

      const alpha = -angle(directionVector);
      cars.push(
         new Car(center.x, center.y, alpha, {
            ...defaultOptions, //,
            //maxSpeed,
            color: carColors[0], //i % carColors.length],
         })
      );
      i++;
   }
   return cars;
}

let lastBestI = -1;
function animate() {
   const thisLoop = new Date();
   const fps = 1000 / (thisLoop - lastLoop);
   lastLoop = thisLoop;
   const realCarSpeed = (fps * 60 * bestCar.speed * 10) / 1000;

   if (followBestCar) {
      if (followBestCar instanceof Car) {
         viewport.offset = scale(followBestCar, -1);
      } else {
         viewport.offset = scale(bestCar, -1);
      }
   }
   viewport.reset();
   /*
   for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road.borders, []);
   }*/

   // MAKE SURE CHANGE ABOVE AS WELL
   lightBorders = world.markings
      .filter(
         (m) => m instanceof Light && (m.state == "red" || m.state == "yellow")
      )
      .map((s) => [s.border.p1, s.border.p2]);

   for (let i = cars.length-1; i >=0;i--) {
      //cars[i].update(road.borders, traffic);

      let minDist = Number.MAX_SAFE_INTEGER;
      let nearest = null;
      if(crossing && cars[i].polygon && polysIntersect(crossing.poly.points,cars[i].polygon)){
         timerOn=false;
      }
      for (const t of targets) {
         const d = distance(t.center, cars[i]);
         if (d < minDist) {
            minDist = d;
            nearest = t;
         }
      }

      //keep car layers not 1 layer

      const segs = world.getNearestGraphSegments(cars[i]);
      if (
         !cars[i].segment ||
         segs.filter((s) => s.equals(cars[i].segment)).length == 0
      ) {
         cars[i].segment = segs[0];
      }
      if (segs.length > 0 && !segs[0].equals(cars[i].segment)) {
         if (cars[i].segment.connectedTo(segs[0])) {
            cars[i].segment = segs[0];
            cars[i].layer = segs[0].layer;
         }
      }
      for (const seg of segs) {
         if (seg.connectedTo(cars[i].segment) && seg.layer == 1) {
            cars[i].layer = 1;
         }
      }
      /*
      const segs = getNearestSegments(cars[i], world.graph.segments, 100);
      let changeLayer = true;
      for (const seg of segs) {
         if (seg.layer == cars[i].layer) {
            changeLayer = false;
            break;
         }
      }
      if (cars[i].layer==null||changeLayer) {
         cars[i].layer = segs[0].layer;
         cars[i].segment=segs[0];
      }*/

      //console.log(segs,cars[i].layer);
      //console.log(seg);
      //const roadBorders = world.getNearbyRoadBorders(cars[i]).map((s) => [s.p1, s.p2]);
      const _borders = world
         .getNearbyRoadBorders(cars[i]) //world.roadBorders
         .filter((b) => b.layer == cars[i].layer)
         //find connections of different levels. if nearby to connection, consider both //!!!!!!!!!!!!!!!!

         //.filter((b) => b.connectedTo(cars[i].segment))
         //.filter((b) => b.layer == cars[i].layer || b.connectedTo(cars[i].segment))
         .map((s) => [s.p1, s.p2]);
      _borders.push(
         ...world.getNearbyItemBorders(cars[i]).map((s) => [s.p1, s.p2])
      );

      const carBorders = [];
      if (!optimizing) {
         for (let j = 0; j < cars.length; j++) {
            if (j != i) {
               const c = cars[j];
               if (!c.invulnerable && c.polygon) {
                  carBorders.push([c.polygon[0], c.polygon[1]]);
                  carBorders.push([c.polygon[1], c.polygon[2]]);
                  carBorders.push([c.polygon[2], c.polygon[3]]);
                  carBorders.push([c.polygon[3], c.polygon[0]]);
               }
            }
         }
      }

      cars[i].update(
         _borders,
         carBorders,
         stopBorders,
         lightBorders,
         yieldCrossingBorders,
         nearest
      );

   }

   if(defaultOptions.applyShortestPath){
      timer.innerHTML="Time: "+(time/60).toFixed(1);
   }
   if(timerOn){
      time++;
   }

   if (!optimizing && collisionsOn) {
      for (let i = 0; i < cars.length - 1; i++) {
         for (let j = i + 1; j < cars.length; j++) {
            if (!cars[i].invulnerable && !cars[j].invulnerable) {
               if (polysIntersect(cars[i].polygon, cars[j].polygon)) {
                  cars[i].damaged = true;
                  cars[j].damaged = true;
                  cars[i].activateRespaunSequence();
                  cars[j].activateRespaunSequence();
               }
            }
         }
      }
   }

   /*
   const aliveCars = cars.filter((c) => c.damaged == false);
   const carSubset = aliveCars.length != 0 ? aliveCars : cars;
   bestCar = carSubset.find(
      (c) => c.distance == Math.max(...carSubset.map((c) => c.distance))
   );*/
   let bestI = -1;
   let bestFittness = 0;
   for (let i = 0; i < cars.length; i += carMarkings.length) {
      let fittness = cars[i].fittness;
      let allAlive = !cars[i].damaged;
      let allStopped = cars[i].speed == 0;
      for (let j = 1; j < carMarkings.length && i + j < cars.length; j++) {
         fittness += cars[i + j].fittness;
         allAlive &= !cars[i + j].damaged;
         allStopped &= cars[i + j].speed == 0;
      }
      if (allAlive && (allStopped || stopForFittness == false)) {
         if (fittness >= bestFittness) {
            bestFittness = fittness;
            //if(cars[i].brain.tick==null){
            //cars[i].brain.tick = cars[i].ticks;
            // }
            bestI = i;
         }
      }
   }
   for (let i = 0; i < cars.length; i++) {
      cars[i].marked = false;
   }
   //debugger;
   if (bestI != -1) {
      bestCar = cars[bestI];
      if (lastBestI != bestI) {
         //save();
      }
      lastBestI = bestI;
      //console.log(bestCar.brain.tick)
      for (let j = 0; j < carMarkings.length && j + bestI < cars.length; j++) {
         cars[bestI + j].marked = true;
      }
   }

   /*
   carCanvas.height = carCanvas.height;
   networkCanvas.height = networkCanvas.height;

   carCtx.save();

   carCtx.scale(ZOOM, ZOOM);
   carCtx.translate(
      -bestCar.x + (carCanvas.width * 0.5) / ZOOM,
      -bestCar.y + (carCanvas.height * 0.5) / ZOOM
   );
   world.draw(carCtx, bestCar);
*/

   world.cars = cars;
   world.bestCar = bestCar;
   const viewPoint = scale(viewport.getOffset(), -1);

   const graphEditor = new GraphEditor(viewport, world.graph);

   const regScaler = 2;
   const regionWidth = carCanvas.width * regScaler;
   const regionHeight = carCanvas.height * regScaler;
   const activeRegion = new Polygon([
      new Point(viewPoint.x - regionWidth / 2, viewPoint.y - regionHeight / 2),
      new Point(viewPoint.x - regionWidth / 2, viewPoint.y + regionHeight / 2),
      new Point(viewPoint.x + regionWidth / 2, viewPoint.y + regionHeight / 2),
      new Point(viewPoint.x + regionWidth / 2, viewPoint.y - regionHeight / 2),
   ]);

   miniMap.update(viewPoint);
   world.draw(carCtx, viewPoint, false, activeRegion, optimizing);


   nnViewport.reset();
   nnEditor.graph = bestCar.nn;
   nnEditor.display();
   
   if (!bestCar.damaged) {
      //nnViewport.reset();
      //nnEditor.graph = bestCar.nn;
      //nnEditor.display();
   } else {
      //nnEditor.canvas.style.filter="grayscale(100%)";
      //nnEditor.disable();
   }
   //miniMap.update(bestCar);

   /*
   for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(carCtx);
   }
   carCtx.globalAlpha = 0.2;
   for (let i = 0; i < cars.length; i++) {
      cars[i].draw(carCtx);
   }
   carCtx.globalAlpha = 1;
   bestCar.draw(carCtx, true);

   carCtx.restore();
*/
   //console.log(cars[0].brain.levels[0].inputs,cars[1].brain.levels[0].inputs)
   //console.log(cars[0].inputs,cars[1].inputs)
   /*if (!optimizing) {
      for (let i = 0; i < cars.length; i++) {
         const ctx = networkCtxts[i];
         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
         ctx.lineDashOffset = -time / 50;
         Visualizer.drawNetwork(
            ctx,
            cars[i].brain,
            cars[i].brainOptions.outputs,
            outputColors
         );
         decisionBoundaries[i].draw(cars[i].inputs);
      }
   } else {*/
   const ctx = networkCtxts[0];
   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   ctx.lineDashOffset = -time / 50;
   //ALWAYS UPDATING NOW

   if (showDecisionBoundary) {
      /*if (
         optimizeDecBoundary ||
         !decisionBoundaries[0].nn.equals(bestCar.nn) ||
         triggerDecisionBoundaryUpdate // || optimizeDecBoundary==false
      ) {*/
      if (defaultOptions.optimizeDecisionBoundary) {
         if (
            triggerDecisionBoundaryUpdate ||
            !decisionBoundaries[0].nn.equals(bestCar.nn)
         ) {
            decisionBoundaries[0].updateBrain(bestCar.nn);
            triggerDecisionBoundaryUpdate=false;
         }
      } else {
         decisionBoundaries[0].updateBrain(bestCar.nn);
      }
      //   triggerDecisionBoundaryUpdate = false;
      //}

      //if (bestCar.nn.inputNodes.filter((n) => n.marked == true).length != 0) {

      decisionBoundaries[0].draw(
         //cars.filter((c) => c.damaged == false).map((c) => c.inputs)
         cars.map((c) => c.inputs),
         cars.map((c) => c.damaged)
      );
      //} else {
      //}
   }
   //}

   /*
   nnCtx2.clearRect(0, 0, nnCtx2.canvas.width, nnCtx2.canvas.height);
   Visualizer.drawNetwork(
      nnCtx2,
      bestCar.brain,
      bestCar.brainOptions.outputs,
      outputColors
   );
   */
   requestAnimationFrame(animate);
}

function loadBrain(event) {
   const fileInput = event.target;
   const file = fileInput.files[0];

   if (!file) {
      console.error("No file selected.");
      return;
   }

   const reader = new FileReader();

   reader.onload = function (event) {
      const fileContent = event.target.result;
      /*const jsonData = JSON.parse(fileContent);
      bestCar.brain = jsonData;*/
      localStorage.setItem("bestBrain", fileContent);
      location.reload();
   };

   reader.readAsText(file);
}

function loadCar(event) {
   const fileInput = event.target;
   const file = fileInput.files[0];

   if (!file) {
      console.error("No file selected.");
      return;
   }

   const reader = new FileReader();

   reader.onload = function (event) {
      const fileContent = event.target.result;
      /*const jsonData = JSON.parse(fileContent);
      bestCar.brain = jsonData;*/
      const jsonData = fileContent.substring(13);
      localStorage.setItem("car_" + sessionName, jsonData);
      localStorage.removeItem("selectedWeightsAndBiases");
      location.reload();
   };

   reader.readAsText(file);
}

function loadWorld(event) {
   const fileInput = event.target;
   const file = fileInput.files[0];

   if (!file) {
      console.error("No file selected.");
      return;
   }

   const reader = new FileReader();

   reader.onload = function (event) {
      const fileContent = event.target.result;
      //const jsonData = JSON.parse(fileContent);
      //world.load(jsonData);
      //world.generate(false);
      localStorage.setItem("world", fileContent);
      location.reload();
   };

   reader.readAsText(file);
}

function stopOptimize(){
   localStorage.removeItem("optimizing");
   test();
}
function optimize() {
   /*if (localStorage.getItem("optimizing") == "on") {
      localStorage.removeItem("optimizing");
      test();
   } else {*/
      localStorage.setItem("optimizing", "on");
      test(); /*
      localStorage.setItem("optimizing", "on");
      location.reload();*/
   //}
}

function test() {
   resetCars();
   /*
   localStorage.removeItem("optimizing");
   location.reload();
   */
}

function updateOptions() {
   let updateBrain = bestCar.sensorOptions.rayCount != Number(rayCount.value);
   if (
      bestCar.sensorOptions.rayCount != Number(rayCount.value) ||
      bestCar.sensorOptions.rayLength != Number(rayLength.value) ||
      bestCar.sensorOptions.raySpread != Number(raySpread.value) ||
      bestCar.sensorOptions.rayOffset != Number(rayOffset.value)
   ) {
      bestCar.sensorOptions.rayCount = Number(rayCount.value);
      bestCar.sensorOptions.rayLength = Number(rayLength.value);
      bestCar.sensorOptions.raySpread = Number(raySpread.value);
      bestCar.sensorOptions.rayOffset = Number(rayOffset.value);
      bestCar.setSensorOptions(bestCar);
   }

   const newOutputs = [];

   if (output_forward.style.backgroundColor == "white") {
      newOutputs.push("🠉");
   }
   if (output_left.style.backgroundColor == "white") {
      newOutputs.push("🠈");
   }
   if (output_right.style.backgroundColor == "white") {
      newOutputs.push("🠊");
   }
   if (output_reverse.style.backgroundColor == "white") {
      newOutputs.push("🠋");
   }

   const newExtraInputs = [];
   if (speedOnOff.checked) {
      newExtraInputs.push("⏱️");
   }
   if (stopOnOff.checked) {
      newExtraInputs.push("🛑");
   }
   if (lightOnOff.checked) {
      newExtraInputs.push("🚦");
   }
   if (targetsOnOff.checked) {
      newExtraInputs.push("🎯"); //!!! REMEMBER IN CAR
   }
   if (crossingOnOff.checked) {
      newExtraInputs.push("🚶");
   }
   if (yieldOnOff.checked) {
      newExtraInputs.push("⚠️");
   }
   if (parkingOnOff.checked) {
      newExtraInputs.push("🅿️");
   }
   if (carDetectorOnOff.checked) {
      newExtraInputs.push("🚙");
   }

   let newHiddenLayerNodeCounts = [];
   if (hiddenOnOff.checked) {
      newHiddenLayerNodeCounts = hiddenCount.value
         .split(",")
         .map((s) => Number(s));
   }

   if (
      updateBrain ||
      JSON.stringify(newOutputs) !=
         JSON.stringify(bestCar.brainOptions.outputs) ||
      JSON.stringify(newHiddenLayerNodeCounts) !=
         JSON.stringify(bestCar.brainOptions.hiddenLayerNodeCounts) ||
      JSON.stringify(newExtraInputs) !=
         JSON.stringify(bestCar.brainOptions.extraInputs)
   ) {
      bestCar.brainOptions.hiddenLayerNodeCounts = newHiddenLayerNodeCounts;
      bestCar.brainOptions.outputs = newOutputs;
      bestCar.brainOptions.extraInputs = newExtraInputs;
      bestCar.setBrainOptions(bestCar);
      localStorage.removeItem("selectedWeightsAndBiases");
   }

   //bestCar.type = aiOnOff.checked ? "AI" : "KEYS";

   //bestCar.autoForward = autoForwardOnOff.checked;

   bestCar.setTypeAndAutoForward(bestCar);

   //bestCar.setSensorAndBrainOptions(bestCar);
   setInterfaceOptions(bestCar, defaultOptions);
   save();
   //discard();
   //save();
   location.reload();
}

function zeroBrain() {
   NeuralNetwork.makeZeros(bestCar.brain);
   save();
}

function tryGiveBrain(newBrain) {
   for (let i = 0; i < bestCar.brain.levels.length; i++) {
      for (let j = 0; j < bestCar.brain.levels[i].biases.length; j++) {
         try {
            if (newBrain.levels[i].biases[j]) {
               bestCar.brain.levels[i].biases[j] = newBrain.levels[i].biases[j];
            } else {
               throw new Error("not defined");
            }
         } catch (err) {
            bestCar.brain.levels[i].biases[j] = 0;
         }
      }
      for (let j = 0; j < bestCar.brain.levels[i].weights.length; j++) {
         for (let k = 0; k < bestCar.brain.levels[i].weights[j].length; k++) {
            try {
               if (newBrain.levels[i].weights[j][k]) {
                  bestCar.brain.levels[i].weights[j][k] =
                     newBrain.levels[i].weights[j][k];
               } else {
                  throw new Error("not defined");
               }
            } catch (err) {
               bestCar.brain.levels[i].weights[j][k] = 0;
            }
         }
      }
   }
}

function updateMutation() {
   localStorage.setItem("mutation", mutationSld.value / 100);
}

function changeTarget(el) {
   miniMap.img = new Image();
   const theCars = optimizing ? cars : [bestCar];
   switch (el.value) {
      case "Wärtsilä":
         target = world.markings.filter((m) => m instanceof Target)[0];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/karelia.png";
         miniMap.destination = target.center;
         linkToVisit = links["Karelia"];
         break;
      case "Solenovo":
         target = world.markings.filter((m) => m instanceof Target)[1];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/solenovo.png";
         miniMap.destination = target.center;
         linkToVisit = links["Solenovo"];
         break;
      case "Karelics":
         target = world.markings.filter((m) => m instanceof Target)[2];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/karelics.png";
         miniMap.destination = target.center;
         linkToVisit = links["Karelics"];
         break;
      case "UEF":
         target = world.markings.filter((m) => m instanceof Target)[3];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/uef.png";
         miniMap.destination = target.center;
         linkToVisit = links["UEF"];
         break;
      case "CGI":
         target = world.markings.filter((m) => m instanceof Target)[4];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/cgi.png";
         miniMap.destination = target.center;
         linkToVisit = links["CGI"];
         break;
      case "Arbonaut":
         target = world.markings.filter((m) => m instanceof Target)[5];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/arbonaut.png";
         miniMap.destination = target.center;
         linkToVisit = links["Arbonaut"];
         break;
      case "Tikkarinne":
         target = world.markings.filter((m) => m instanceof Target)[6];
         assignPath(theCars, target);
         miniMap.img.src = "imgs/karelia.png";
         miniMap.destination = target.center;
         linkToVisit = links["Karelia"];
         break;
   }
   goingToImg.src = miniMap.img.src;
}

function assignPath(cars, target) {
   for (const car of cars) {
      car.segment = getNearestSegment(car, world.graph.segments);
      car.destination = target;
      const {segs,envs} = world.generateShortestPathBorders(car, target.center);
      car.assignedBorders = segs;
      car.envelopes=envs;
   }
}

function giveAllPaths() {
   if (targets.length == 0) {
      return;
   }

   for (let i = cars.length - 1; i >= 0; i--) {
      let targetIndex = 0;
      switch (i) {
         case 0:
            targetIndex = 0;
            break;
         case 1:
            targetIndex = 5;
            break;
         case 2:
            targetIndex = 4;
            break;
         case 3:
            targetIndex = 6;
            break;
      }
      cars[i].polygon = cars[i].createPolygon();
      cars[i].segment = getNearestSegment(cars[i], world.graph.segments);
      cars[i].assignedBorders = world.generateShortestPathBorders(
         cars[i],
         targets[targetIndex].center
      );
      cars[i].destination = targets[targetIndex];
   }
}
