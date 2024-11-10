class Controls {
   constructor(type) {
      this.forward = false;
      this.left = false;
      this.right = false;
      this.reverse = false;

      switch (type) {
         case "KEYS":
            this.#addKeyboardListeners();
            break;
         case "AI":
            this.#addKeyboardListeners();
            break;
         case "DUMMY":
            this.forward = true;
            break;
      }
   }

   #addKeyboardListeners() {
      document.onkeydown = (event) => {
         if(!manual){
            return;
         }
         switch (event.key) {
            case "ArrowLeft":
            case "a":  // lowercase a only
               this.left = true;
               break;
            case "ArrowRight":
            case "d":  // lowercase d only
               this.right = true;
               break;
            case "ArrowUp":
            case "w":  // lowercase w only
               this.forward = true;
               break;
            case "ArrowDown":
            case "s":  // lowercase s only
               this.reverse = true;
               break;
            case "r":  // lowercase r only
               location.reload();
               break;
         }
      };

      document.onkeyup = (event) => {
         if(!manual){
            return;
         }
         switch (event.key) {
            case "ArrowLeft":
            case "a":  // lowercase a only
               this.left = false;
               break;
            case "ArrowRight": 
            case "d":  // lowercase d only
               this.right = false;
               break;
            case "ArrowUp":
            case "w":  // lowercase w only
               this.forward = false;
               break;
            case "ArrowDown":
            case "s":  // lowercase s only
               this.reverse = false;
               break;
         }
      };
   }
}
