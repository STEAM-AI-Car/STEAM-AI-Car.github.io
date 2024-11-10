class MultiDecisionBoundary {
   constructor(
      container,
      nn,
      colors,
      simplified = false,
      size = 500,
      s_1 = null,
      s_2 = null
   ) {
      this.container = container;
      this.canvas = document.createElement("canvas");
      this.canvas.height = size;
      this.canvas.width = size;
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.s_1 = s_1;
      this.s_2 = s_2;
      this.nn = nn;
      this.sel1 = 0;
      this.sel2 = 0;
      const imgs = nn.inputNodes.map((n) => images[n.label].gray);
      this.s_1.src = imgs[this.sel1].src;
      this.s_2.src = imgs[this.sel2].src;
      this.simplified = simplified || defaultOptions["simplified"];
      this.defaultValues = [];
      for (let i = 0; i < this.nn.inputNodes.length; i++) {
         this.defaultValues[i] = 0;
      }

      this.colors = colors;

      container.appendChild(document.createElement("br"));
      this.div = document.createElement("div");
      container.appendChild(this.div);

      //console.log(options,options.entries());
      //array iterator (second one)
      /*
      for (const [index, optionText] of options.entries()) {
         //for (const optionText of options) {
         const optionElement = document.createElement("button");
         optionElement.value = optionText;
         optionElement.textContent = optionText;
         optionElement.style.backgroundColor = this.colors[index];
         optionElement.style.color = "white"
         optionElement.style.cursor = "default";
         this.div.appendChild(optionElement);
      }*/

      this.canvas.addEventListener("click", () => {
         /*if(defaultOptions["decFilter"]){
            if(decBoundaryHolder.style.filter=="brightness(20%)"){
               decBoundaryHolder.style.filter="brightness(100%)";
            }else{
               decBoundaryHolder.style.filter="brightness(20%)";
            }
         }*/
         this.simplified = !this.simplified || defaultOptions["simplified"];
         
         localStorage.setItem("simplified", this.simplified);

         triggerDecisionBoundaryUpdate = true;
      });

      this.handleMarkedInput();

      this.s_1.onclick = () => {
         this.sel1++;
         if (this.sel1 == this.sel2) {
            this.sel1++;
         }
         if (this.sel1 >= this.nn.inputNodes.length) {
            this.sel1 = 0;
         }
         if (this.sel1 == this.sel2) {
            this.sel1++;
         }
         if (this.sel1 >= this.nn.inputNodes.length) {
            this.sel1 = 0;
         }
         this.s_1.src = imgs[this.sel1].src;
         for (let i = 0; i < bestCar.nn.inputNodes.length; i++) {
            bestCar.nn.inputNodes[i].marked = false;
            if (i == this.sel1) {
               bestCar.nn.inputNodes[i].marked = 1;
            }
            if (i == this.sel2 && bestCar.nn.inputNodes.length > 1) {
               bestCar.nn.inputNodes[i].marked = 2;
            }
         }
         save();
      };
      this.s_2.onclick = () => {
         this.sel2++;
         if (this.sel2 == this.sel1) {
            this.sel2++;
         }
         if (this.sel2 >= this.nn.inputNodes.length) {
            this.sel2 = 0;
         }
         if (this.sel2 == this.sel1) {
            this.sel2++;
         }
         if (this.sel2 >= this.nn.inputNodes.length) {
            this.sel2 = 0;
         }
         this.s_2.src = imgs[this.sel2].src;
         for (let i = 0; i < bestCar.nn.inputNodes.length; i++) {
            bestCar.nn.inputNodes[i].marked = false;
            if (i == this.sel1) {
               bestCar.nn.inputNodes[i].marked = 1;
            }
            if (i == this.sel2 && bestCar.nn.inputNodes.length > 1) {
               bestCar.nn.inputNodes[i].marked = 2;
            }
         }
         save();
      };

      this.updateImage();
   }

   handleMarkedInput() {
      const imgs = this.nn.inputNodes.map((n) => images[n.label].gray);

      this.sel1 = -1;
      this.sel2 = -1;

      for (let i = 0; i < this.nn.inputNodes.length; i++) {
         if (this.nn.inputNodes[i].marked == 1) {
            this.sel1 = i;
         }
         if (this.nn.inputNodes[i].marked == 2) {
            this.sel2 = i;
         }
      }

      if (this.sel1 == -1) {
         this.sel1 = 0;
         this.nn.inputNodes[0].marked = 1;
      }
      if (this.sel2 == -1) {
         if (this.nn.inputNodes.length > 1) {
            this.sel2 = 1;
            this.nn.inputNodes[1].marked = 2;
         } else {
            this.sel2 = 0;
         }
      }
      this.s_1.src = imgs[this.sel1].src;
      this.s_2.src = imgs[this.sel2].src;
   }

   updateBrain(nn) {
      this.nn = NN.load(JSON.parse(JSON.stringify(nn)));
      this.updateImage();
   }

   update1DImage() {
      const y = this.canvas.height / 2 - pixelSize / 2;
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = "lighter";
      for (let x = 0; x < this.canvas.width; x += pixelSize) {
         const point = this.nn.inputNodes.map((n) => n.value); //levels[0].inputs//this.defaultValues;//this.brain.levels[0].inputs.map((i) => 0);
         if (point[0] == undefined) {
            for (let i = 0; i < point.length; i++) {
               point[i] = 0;
            }
         }
         for (let i = 0; i < this.nn.inputNodes.length; i++) {
            if (this.sel1 == i) {
               point[i] = 2 * (x / this.canvas.width) - 1;
            }
         }
         const outputs = this.nn.feedForward(point, !this.simplified);
         let any = false;
         for (let i = 0; i < outputs.length; i++) {
            try{
               if(i==0 && !c1.checked){
                  continue;
               }
               if(i==1 && !c2.checked){
                  continue;
               }
               if(i==2 && !c3.checked){
                  continue;
               }
               if(i==3 && !c4.checked){
                  continue;
               }
            }catch(err){}
            if (!this.simplified) {
               this.ctx.globalAlpha = 1;
               this.ctx.fillStyle =
                  this.nn.colors[carInfo.brainOptions.outputs[i]];
               this.ctx.fillRect(
                  x,
                  this.canvas.height / 2 -
                     outputs[i] * (this.canvas.height / 2),
                  pixelSize,
                  this.canvas.height * 2
               );
            } else if (outputs[i] == 1) {
               any = true;
               this.ctx.globalAlpha = 1;
               this.ctx.fillStyle =
                  this.nn.colors[carInfo.brainOptions.outputs[i]];
               this.ctx.fillRect(x, y - 10, pixelSize, 21);
               //this.ctx.fillRect(x, y - this.canvas.height, pixelSize, this.canvas.height*2);
            }
         }
      }
      this.bg = new Image();
      this.bg.src = this.canvas.toDataURL();
      this.ctx.globalCompositeOperation = "source-over";
   }

   updateImage() {
      if (
         this.nn.inputNodes.length == 1 ||
         this.nn.inputNodes.filter((n) => n.marked != 0).length == 1
      ) {
         this.update1DImage();
         this.s_2.style.visibility="hidden";
         return;
      }
      this.s_2.style.visibility="visible";
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = "lighter";
      for (let x = 0; x < this.canvas.width; x += pixelSize) {
         for (let y = 0; y < this.canvas.height; y += pixelSize) {
            const point = this.nn.inputNodes.map((n) => n.value); //levels[0].inputs//this.defaultValues;//this.brain.levels[0].inputs.map((i) => 0);
            if (point[0] == undefined) {
               for (let i = 0; i < point.length; i++) {
                  point[i] = 0;
               }
            }
            for (let i = 0; i < this.nn.inputNodes.length; i++) {
               if (this.sel2 == i) {
                  point[i] = 2 * (1 - y / this.canvas.height) - 1;
               }
               if (this.sel1 == i) {
                  point[i] = 2 * (x / this.canvas.width) - 1;
               }
            }
            const outputs = this.nn.feedForward(point, !this.simplified);
            let any = false;
            for (let i = 0; i < outputs.length; i++) {
               try{
                  if(i==0 && !c1.checked){
                     continue;
                  }
                  if(i==1 && !c2.checked){
                     continue;
                  }
                  if(i==2 && !c3.checked){
                     continue;
                  }
                  if(i==3 && !c4.checked){
                     continue;
                  }
               }catch(err){}
               if (!this.simplified) {
                  this.ctx.globalAlpha = Math.max(
                     0,
                     Math.min(1, 4*outputs[i] + 1)
                  );
                  this.ctx.fillStyle =
                     this.nn.colors[carInfo.brainOptions.outputs[i]];
                  this.ctx.fillRect(x, y, pixelSize, pixelSize);
                  this.ctx.globalAlpha = 1;
               } else if (outputs[i] == 1) {
                  any = true;
                  this.ctx.fillStyle =
                     this.nn.colors[carInfo.brainOptions.outputs[i]];
                  this.ctx.fillRect(x, y, pixelSize, pixelSize);
               }
            }
         }
      }

      this.bg = new Image();
      this.bg.src = this.canvas.toDataURL();
      this.ctx.globalCompositeOperation = "source-over";
   }

   draw1D(inputNodesArray) {
      this.ctx.drawImage(this.bg, 0, 0);
      drawArrow(
         this.ctx,
         0,
         this.canvas.height / 2,
         this.canvas.width,
         this.canvas.height / 2,
         4,
         "black"
      );
      drawArrow(
         this.ctx,
         0,
         this.canvas.height / 2,
         this.canvas.width,
         this.canvas.height / 2
      );
      new Point(this.canvas.width / 2, this.canvas.height / 2).draw(this.ctx, {
         color: "white",
         size: 14,
      });

      for (const inputNodes of inputNodesArray) {
         let x = null;
         let xNode = null;
         for (let i = 0; i < inputNodes.length; i++) {
            if (this.sel1 == i) {
               x = inputNodes[i];
               xNode = this.nn.inputNodes[i];
            }
         }
         const loc = {
            x: ((x + 1) / 2) * this.canvas.width,
            y: this.canvas.height / 2, //((1 - y.value) / 2) * this.canvas.height,
         };

         this.ctx.beginPath();
         this.ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2);
         this.ctx.fillStyle = "yellow";
         this.ctx.strokeStyle = "black";
         this.ctx.fill();
         this.ctx.stroke();

         const imggray = images[xNode.label]["gray"];
         this.s_1.src = imggray.src;

         if (xNode.angle) {
            this.s_1.style.transform = "rotate(" + -xNode.angle + "rad)";
         } else {
            this.s_1.style.transform = "";
         }
      }
      this.drawSimplified();
   }

   drawSimplified() {
      if (this.simplified) {
         this.ctx.fillStyle = "white";
         this.ctx.strokeStyle = "black";
         this.ctx.textAlign = "left";
         this.ctx.textBaseline = "top";
         this.ctx.font = "bold 24px Arial";
         this.ctx.lineWidth = 1;
         this.ctx.fillText("simplified", 4, 4);
         this.ctx.strokeText("simplified", 4, 4);
      }
   }

   draw(inputNodesArray,damagedArray) {
      if (this.nn.inputNodes.length < 1) {
         return;
      }
      if (
         this.nn.inputNodes.length == 1 ||
         this.nn.inputNodes.filter((n) => n.marked != 0).length <= 1
      ) {
         this.draw1D(inputNodesArray,damagedArray);
         return;
      }

      this.ctx.drawImage(this.bg, 0, 0);
      drawArrow(
         this.ctx,
         0,
         this.canvas.height / 2,
         this.canvas.width,
         this.canvas.height / 2,
         4,
         "black"
      );
      drawArrow(
         this.ctx,
         this.canvas.width / 2,
         this.canvas.height,
         this.canvas.width / 2,
         0,
         4,
         "black"
      );
      drawArrow(
         this.ctx,
         0,
         this.canvas.height / 2,
         this.canvas.width,
         this.canvas.height / 2
      );
      drawArrow(
         this.ctx,
         this.canvas.width / 2,
         this.canvas.height,
         this.canvas.width / 2,
         0
      );
      new Point(this.canvas.width / 2, this.canvas.height / 2).draw(this.ctx, {
         color: "white",
         size: 14,
      });

      for (let i=0;i<inputNodesArray.length;i++){//const inputNodes of inputNodesArray) {
         const inputNodes=inputNodesArray[i];
         const damaged=damagedArray[i];
         let x = null;
         let y = null;
         let xNode = null;
         let yNode = null;
         for (let i = 0; i < inputNodes.length; i++) {
            if (this.sel1 == i) {
               x = inputNodes[i];
               xNode = this.nn.inputNodes[i];
            }
            if (this.sel2 == i) {
               y = inputNodes[i];
               yNode = this.nn.inputNodes[i];
            }
         }
         const loc = {
            x: ((x + 1) / 2) * this.canvas.width,
            y: ((1 - y) / 2) * this.canvas.height,
         };

         this.ctx.beginPath();
         this.ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2);
         this.ctx.fillStyle = damaged?"red":"yellow";
         this.ctx.strokeStyle = "black";
         this.ctx.fill();
         this.ctx.stroke();

         const imggray = images[xNode.label]["gray"];
         this.s_1.src = imggray.src;

         if (xNode.angle) {
            this.s_1.style.transform = "rotate(" + -xNode.angle + "rad)";
         } else {
            this.s_1.style.transform = "";
         }
         //console.log(this.s_1.style.transform);
         const imggray2 = images[yNode.label]["gray"];
         this.s_2.src = imggray2.src;

         if (yNode.angle) {
            this.s_2.style.transform = "rotate(" + -yNode.angle + "rad)";
         }else {
            this.s_2.style.transform = "";
         }
      }

      this.drawSimplified();
   }
}
