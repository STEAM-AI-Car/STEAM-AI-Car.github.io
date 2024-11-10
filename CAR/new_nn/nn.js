class NN extends Graph {
   static nodeSize = 45;
   static lineWidth = 10;
   constructor(points, segments) {
      super(points, segments);
      this.colors = {};
      this.colors["🠉"] = outputColors[0];
      this.colors["🠈"] = outputColors[1];
      this.colors["🠊"] = outputColors[2];
      this.colors["🠋"] = outputColors[3];
      this.inputNodes = points.filter((p) => p.inputNode);
      this.outputNodes = points.filter((p) => p.outputNode);
   }

   static load(info, height = null, width = null) {
      const graph = Graph.load(info);

      let yScaler = 1;
      let xScaler = 1;
      const margin = 50;
      if (height) {
         const maxY = Math.max(...info.points.map((p) => p.y));
         const minY = Math.min(...info.points.map((p) => p.y));
         yScaler = height / info.height; //(height - margin - margin) / (maxY - minY);
      }
      if (width) {
         xScaler = width / info.width;
      }
      for (let i = 0; i < info.points.length; i++) {
         graph.points[i].angle = info.points[i].angle;
         graph.points[i].value = info.points[i].value;
         graph.points[i].bias = info.points[i].bias;
         graph.points[i].inputNode = info.points[i].inputNode;
         graph.points[i].outputNode = info.points[i].outputNode;
         graph.points[i].label = info.points[i].label;
         graph.points[i].marked = info.points[i].marked;
         graph.points[i].view = info.points[i].view;
         graph.points[i].y = info.points[i].y * yScaler; //margin + (info.points[i].y - margin) * yScaler;
         graph.points[i].x = info.points[i].x * xScaler;
      }
      for (let i = 0; i < info.segments.length; i++) {
         graph.segments[i].weight = info.segments[i].weight;
         graph.segments[i].marked = info.segments[i].marked;
         /*
         graph.segments[i].p1.y =
            margin + (info.segments[i].p1.y - margin) * yScaler;
         graph.segments[i].p2.y =
            margin + (info.segments[i].p2.y - margin) * yScaler;
            */

         graph.segments[i].p1.y = info.segments[i].p1.y * yScaler;
         graph.segments[i].p2.y = info.segments[i].p2.y * yScaler;
         graph.segments[i].p1.x = info.segments[i].p1.x * xScaler;
         graph.segments[i].p2.x = info.segments[i].p2.x * xScaler;
      }
      const nn = new NN(graph.points, graph.segments);
      nn.height = height;
      nn.width = width;
      return nn;
   }

   equals(nn) {
      try {
         for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].bias != nn.points[i].bias) {
               return false;
            }
            if (
               this.points[i].inputNode &&
               this.points[i].marked != nn.points[i].marked
            ) {
               return false;
            }
         }
         for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].weight != nn.segments[i].weight) {
               return false;
            }
         }
      } catch (err) {
         return false;
      }
      return true;
   }

   mutate(amount) {
      for (const point of this.points) {
         if (!point.inputNode) {
            if (!point.marked) {
               point.bias = lerp(
                  point.bias,
                  Math.round(100 * (Math.random() * 2 - 1)) / 100,
                  amount
               );
            }
         }
      }
      for (const seg of this.segments) {
         if (!seg.marked) {
            seg.weight = lerp(
               seg.weight,
               Math.round(100 * (Math.random() * 2 - 1)) / 100,
               amount
            );
         }
      }
   }

   feedForward(givenInputs, fuzzy = false) {
      for (const point of this.points) {
         point.value = null;
         point.inCount = 0;
         point.outCount = 0;
         point.cnt = 0;
         point.sum = 0;
      }
      for (const seg of this.segments) {
         seg.p1.outCount++;
         seg.p2.inCount++;
         seg.signal = null;
      }
      for (const point of this.points) {
         if (point.inCount == 0) {
            point.value = -point.bias > 0 ? 1 : 0;
         }
      }
      let layer = 0;
      for (let i = 0; i < givenInputs.length; i++) {
         this.inputNodes[i].value = givenInputs[i];
         this.inputNodes[i].layer = layer;
         this.inputNodes[i].index = i;
      }

      let ok = false;
      let processedPoints = 0;
      let cnt = 0;
      let processedSegments = 0;
      let indices = [];
      while (ok == false) {
         ok = true;
         layer++;
         const segsFromPointsWithValues = this.segments.filter(
            (s) => s.p1.value != null && s.signal == null
         );
         for (const seg of segsFromPointsWithValues) {
            seg.signal = seg.weight * seg.p1.value;
            processedSegments++;
         }

         const segsToPointsWithoutValues = this.segments.filter(
            (s) => s.p2.value == null && s.signal != null
         );
         for (const seg of segsToPointsWithoutValues) {
            seg.p2.cnt++;
            seg.p2.sum += seg.signal;
         }
         for (const seg of segsToPointsWithoutValues) {
            if (seg.p2.cnt == seg.p2.inCount) {
               seg.p2.value = seg.p2.sum - seg.p2.bias > 0 ? 1 : 0;
               seg.p2.fuzzy = seg.p2.sum - seg.p2.bias;
               if (!seg.p2.layer) {
                  seg.p2.layer = layer;
                  if (indices[layer] >= 0) {
                     indices[layer]++;
                  } else {
                     indices[layer] = 0;
                  }
                  seg.p2.index = indices[layer];
               }
            } else {
               seg.p2.cnt = 0;
               seg.p2.sum = 0;
            }
         }


         if (processedSegments != this.segments.length) {
            ok = false;
         }
      }

      
      for (let i = 0; i < this.outputNodes.length; i++) {
         this.outputNodes[i].index = i;
         if(!this.outputNodes[i].layer){
            this.outputNodes[i].layer=1;
         }
      }


      //this.balancedNN=JSON.parse(JSON.stringify(this));


      /*
      
      for (const point of this.points) {
         if(point.value==null){
            point.value=-point.bias>0?1:0;
         }
      }*/
      if (fuzzy) {
         return this.outputNodes.map((n) => n.fuzzy);
      } else {
         return this.outputNodes.map((n) => n.value);
      }
   }

   drawNode(point, ctx) {
      ctx.beginPath();
      const size = NN.nodeSize;
      const rad = size / 2;
      ctx.arc(point.x, point.y, rad, 0, Math.PI * 2);

      /*
        if (point.view) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 30;
            ctx.stroke();
        }
        */

      ctx.fillStyle = "black";
      ctx.fill();
      if (!point.inputNode) {
         if (point.outputNode) {
            ctx.fillStyle = getRGBA_old(point.value); //"rgba(255,255,255," + point.value + ")"; //getRGBA(point.value);
            ctx.fill();
         } else {
            ctx.fillStyle = getRGBA_old(point.value); //"rgba(255,255,255," + point.value + ")"; //getRGBA(point.value);
            ctx.fill();
         }
      }

      ctx.strokeStyle = "black";
      ctx.lineWidth = 10;
      ctx.stroke();

      if (point.bias != null) {
         const oldDashOffset = ctx.lineDashOffset;
         if (point.marked) {
            ctx.lineDashOffset = 0;
         }
         ctx.setLineDash([7, 7]);
         ctx.lineWidth = NN.lineWidth;
         //ctx.strokeStyle = "rgba(255,255,255,0.3)";
         //ctx.stroke();
         ctx.strokeStyle = getRGBA(point.bias);
         ctx.stroke();
         ctx.setLineDash([]);
         ctx.lineDashOffset = oldDashOffset;
      }

      if (point.label) {
         /*if(point.inputNode){
            return;
         }*/
         ctx.beginPath();
         ctx.textAlign = "center";
         ctx.textBaseline = "middle";
         ctx.fillStyle = this.colors[point.label];
         ctx.strokeStyle = "black"; //ctx.fillStyle;
         //ctx.fillStyle = "black";
         //ctx.strokeStyle = "white";
         ctx.font = rad * 1.5 + "px Arial";
         const top = point.inputNode
            ? point.y + rad * 0.1
            : point.y + rad * 0.1;
         if (point.outputNode) {
            /*ctx.fillText(point.label, point.x, top);
            ctx.lineWidth = 1;
            ctx.strokeText(point.label, point.x, top);*/
            
            ctx.save();
            ctx.translate(point.x, top);
            const imggray = images[point.label][this.colors[point.label]];
            ctx.drawImage(imggray, -imggray.width / 2, -imggray.height / 2);
            ctx.restore();
         }
         if (point.inputNode) {
            const imggray = images[point.label]["gray"];
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.translate(point.x, top);
            if (point.angle) {
               ctx.rotate(-point.angle);
            }
            ctx.drawImage(imggray, -imggray.width / 2, -imggray.height / 2);

            const img =
               point.value < 0
                  ? images[point.label]["cyan"]
                  : images[point.label]["yellow"];
            ctx.globalAlpha = Math.abs(point.value);
            ctx.drawImage(img, -imggray.width / 2, -imggray.height / 2);
            ctx.restore();
         }
      }
   }

   draw(ctx) {
      ctx.lineDashOffset = Math.floor(
         (100000 - (new Date().getTime() % 100000)) / 50
      );
      const adjustment = 4;

      for (const seg of this.segments) {
         if (seg.marked) {
            seg.draw(ctx, {
               color: "#888",
               width: NN.lineWidth*2
            });/*
            drawArrow2(
               seg.p1,
               seg.p2,
               ctx,
               "#800",
               NN.nodeSize / 2 + NN.lineWidth / 2 + adjustment,
               NN.nodeSize * 0.8,
               "#800",
               3.2
            );*/
         }
      }
      const size = NN.nodeSize + NN.lineWidth * 2;
      const rad = size / 2;
      for (const point of this.points) {
         if (point.marked && !point.inputNode) {
            ctx.beginPath();
            ctx.arc(
               point.x,
               point.y,
               point.inputNode ? rad * 0.9 : rad,
               0,
               Math.PI * 2
            );
            ctx.fillStyle = point.inputNode ? "#FFF" : "#888";
            ctx.fill();
         }
      }

      for (const seg of this.segments) {
         const oldDashOffset = ctx.lineDashOffset;
         if (seg.marked) {
            ctx.lineDashOffset = 0;
         }
         seg.draw(ctx, {
            color: "black",
            width: NN.lineWidth,
         });

         //ctx.setLineDash([]);
         /*seg.draw(ctx, {
                color: "white", //"rgba(255,255,255,0.3)",
                dash: [7, 3],
                width: 4,
            });*/
         seg.draw(ctx, {
            color: getRGBA(seg.weight), //getRGBA(seg.weight*0.7+(seg.p1.value*seg.weight*0.3)),
            dash: [7, 7],
            width: NN.lineWidth,
         });
         /*
         drawArrow2(
            seg.p1,
            seg.p2,
            ctx,
            "#000",
            NN.nodeSize / 2 + NN.lineWidth / 2 + adjustment,
            NN.nodeSize * 0.8,
            getRGBA(seg.weight),
            1,
            false
         );*/

         ctx.lineDashOffset = oldDashOffset;
      }
      for (const point of this.points) {
         this.drawNode(point, ctx);
      }
   }
}
