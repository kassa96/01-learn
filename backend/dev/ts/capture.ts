export class Rectangle {
    static readonly DEFAULT_WIDTH = 300;
    static readonly DEFAULT_HEIGHT = 200;
    static readonly RADIUS = 8;
    static readonly LINE_WIDTH = 3;
    top: number;
    left: number;
     width: number;
     height: number;
    private  initialCanvasWidth: number;
    private initialCanvasHeight: number;
    canvas: HTMLCanvasElement;
    private dragTL = false;
    private dragTR = false;
    private dragBL = false;
    private dragBR = false;
    private leftSide = false;
    private rightSide = false;
    private topSide = false;
    private bottomSide = false;
    private dragWholeRect = false;
    private mouseX = 0;
    private mouseY = 0;
    private startX = 0;
    private startY = 0;
  
    constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
      const { width, height } = video.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      this.canvas = canvas;
  
      // Initial rectangle setup
      this.width = Rectangle.DEFAULT_WIDTH;
      this.height = Rectangle.DEFAULT_HEIGHT;
      this.top = canvas.height / 2 - this.height / 2;
      this.left = canvas.width / 2 - this.width / 2;
  
      // Store initial canvas dimensions
      this.initialCanvasWidth = canvas.width;
      this.initialCanvasHeight = canvas.height;
      this.drawRectInCanvas();
    }
  
    repositionCanvas(video: HTMLVideoElement) {
      const { width, height } = video.getBoundingClientRect();
      this.canvas.width = width;
      this.canvas.height = height;
  
      // Calculate the new ratios
      const widthRatio = this.canvas.width / this.initialCanvasWidth;
      const heightRatio = this.canvas.height / this.initialCanvasHeight;
  
      // Adjust rectangle size and position based on new ratios
      this.left *= widthRatio;
      this.top *= heightRatio;
      this.width *= widthRatio;
      this.height *= heightRatio;
  
      // Update initial canvas dimensions to the new ones
      this.initialCanvasWidth = this.canvas.width;
      this.initialCanvasHeight = this.canvas.height;
  
      this.drawRectInCanvas();
    }
  
    drawRectInCanvas() {
      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;
  
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      ctx.beginPath();
      ctx.lineWidth = Rectangle.LINE_WIDTH;
      ctx.fillStyle = "rgba(199, 87, 231, 0.2)";
      ctx.strokeStyle = "#c757e7";
      ctx.rect(this.left, this.top, this.width, this.height);
      ctx.fill();
      ctx.stroke();
  
      this.drawCorners();
    }
  
    private drawCircle(x: number, y: number) {
      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;
  
      ctx.fillStyle = "#c757e7";
      ctx.beginPath();
      ctx.arc(x, y, Rectangle.RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  
    drawCorners() {
      this.drawCircle(this.left, this.top);
      this.drawCircle(this.left + this.width, this.top);
      this.drawCircle(this.left + this.width, this.top + this.height);
      this.drawCircle(this.left, this.top + this.height);
    }
    mouseUp() {
      this.dragTL = this.dragTR = this.dragBL = this.dragBR = false;
      this.leftSide = this.rightSide = this.bottomSide = this.topSide = false;
      this.dragWholeRect = false;
    }
    mouseDown(e: MouseEvent) {
      const pos = this.getMousePos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
  if (
        this.checkCloseEnough(this.mouseX, this.left) &&
        this.checkCloseEnough(this.mouseY, this.top)
      ) {
        this.dragTL = true;
      } else if (
        this.checkCloseEnough(this.mouseX, this.left + this.width) &&
        this.checkCloseEnough(this.mouseY, this.top)
      ) {
        this.dragTR = true;
      } else if (
        this.checkCloseEnough(this.mouseX, this.left) &&
        this.checkCloseEnough(this.mouseY, this.top + this.height)
      ) {
        this.dragBL = true;
      } else if (
        this.checkCloseEnough(this.mouseX, this.left + this.width) &&
        this.checkCloseEnough(this.mouseY, this.top + this.height)
      ) {
        this.dragBR = true;
      }else if (this.mouseY >= this.top &&
               this.mouseY <= this.top + this.height &&
               this.mouseX >= this.left  - Rectangle.LINE_WIDTH &&
               this.mouseX <= this.left + Rectangle.LINE_WIDTH){
               this.leftSide = true;
          }
        else if (this.mouseY >= this.top &&
                this.mouseY <= this.top + this.height &&
                this.mouseX >= this.left + this.width  - Rectangle.LINE_WIDTH &&
                this.mouseX <= this.left + this.width + Rectangle.LINE_WIDTH){
                this.rightSide = true;
        }else if (this.mouseY >= this.top - Rectangle.LINE_WIDTH &&
          this.mouseY <= this.top + Rectangle.LINE_WIDTH &&
          this.mouseX >= this.left &&
          this.mouseX <= this.left + this.width) {
            this.topSide = true;
          }else if (this.mouseY >= this.top + this.height  - Rectangle.LINE_WIDTH &&
            this.mouseY <= this.top + this.height + Rectangle.LINE_WIDTH &&
            this.mouseX >= this.left &&
            this.mouseX <= this.left + this.width){
              this.bottomSide = true;
          }
      else if (this.checkInRect(this.mouseX, this.mouseY)) {
        this.dragWholeRect = true;
        this.startX = this.mouseX;
        this.startY = this.mouseY;
      }
  
      this.drawRectInCanvas();
    }
  
    mouseMove(e: MouseEvent) {
      const pos = this.getMousePos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
      if (
        (this.checkCloseEnough(this.mouseX, this.left) &&
          this.checkCloseEnough(this.mouseY, this.top)) ||
        (this.checkCloseEnough(this.mouseX, this.left + this.width) &&
          this.checkCloseEnough(this.mouseY, this.top + this.height))
      ) {
        this.canvas.style.cursor = "nwse-resize"; 
         } else if (
        (this.checkCloseEnough(this.mouseX, this.left + this.width) &&
          this.checkCloseEnough(this.mouseY, this.top)) ||
        (this.checkCloseEnough(this.mouseX, this.left) &&
          this.checkCloseEnough(this.mouseY, this.top + this.height))
      ) {
        this.canvas.style.cursor = "nesw-resize"; 
          } else if (
        (this.mouseY >= this.top &&
          this.mouseY <= this.top + this.height &&
          this.mouseX >= this.left - Rectangle.LINE_WIDTH &&
          this.mouseX <= this.left + Rectangle.LINE_WIDTH) ||
        (this.mouseY >= this.top &&
          this.mouseY <= this.top + this.height &&
          this.mouseX >= this.left + this.width  - Rectangle.LINE_WIDTH &&
          this.mouseX <= this.left + this.width + Rectangle.LINE_WIDTH)
      ) {
        this.canvas.style.cursor = "e-resize";
      } else if (
        (this.mouseY >= this.top  - Rectangle.LINE_WIDTH &&
          this.mouseY <= this.top + Rectangle.LINE_WIDTH &&
          this.mouseX >= this.left &&
          this.mouseX <= this.left + this.width) ||
        (this.mouseY >= this.top + this.height  - Rectangle.LINE_WIDTH &&
          this.mouseY <= this.top + this.height + Rectangle.LINE_WIDTH &&
          this.mouseX >= this.left &&
          this.mouseX <= this.left + this.width)
      ) {
        this.canvas.style.cursor = "s-resize";
      } else if (this.checkInRect(this.mouseX, this.mouseY)) {
        this.canvas.style.cursor = "move"; 
      } else {
        this.canvas.style.cursor = "default";
      }
      if (this.dragWholeRect) {
        e.preventDefault();
        e.stopPropagation();
        const dx = this.mouseX - this.startX;
        const dy = this.mouseY - this.startY;
        if (
          this.left + dx > 0 &&
          this.left + dx + this.width < this.canvas.width
        ) {
          this.left += dx;
        }
        if (
          this.top + dy > 0 &&
          this.top + dy + this.height < this.canvas.height
        ) {
          this.top += dy;
        }
        this.startX = this.mouseX;
        this.startY = this.mouseY;
      } else if (this.dragTL) {
        const newWidth = this.left + this.width - this.mouseX;
        const newHeight = this.top + this.height - this.mouseY;
        if (newWidth > 150 && newHeight > 150) {
          this.width = newWidth;
          this.height = newHeight;
          this.left = this.mouseX;
          this.top = this.mouseY;
        }
      } else if (this.dragTR) {
        const newWidth = this.mouseX - this.left;
        const newHeight = this.top + this.height - this.mouseY;
        if (newWidth > 150 && newHeight > 150) {
          this.width = newWidth;
          this.height = newHeight;
          this.top = this.mouseY;
        }
      } else if (this.dragBL) {
        const newWidth = this.left + this.width - this.mouseX;
        const newHeight = this.mouseY - this.top;
        if (newWidth > 150 && newHeight > 150) {
          this.width = newWidth;
          this.height = newHeight;
          this.left = this.mouseX;
        }
      } else if (this.dragBR) {
        const newWidth = this.mouseX - this.left;
        const newHeight = this.mouseY - this.top;
        if (newWidth > 150 && newHeight > 150) {
          this.width = newWidth;
          this.height = newHeight;
        }
      }
      else if (this.leftSide) {
        const newWidth = this.left + this.width - this.mouseX;
        if (newWidth > 150) {
          this.width = newWidth;
          this.left = this.mouseX;
        }
      }
      else if (this.rightSide){
        const newWidth = this.mouseX - this.left;
        if (newWidth > 150) {
          this.width = newWidth;
        }
      }else if (this.topSide){
        const newHeight = this.top + this.height - this.mouseY;
        if (newHeight > 150) {
          this.height = newHeight;
          this.top = this.mouseY;
        }
      }else if (this.bottomSide){
        const newHeight = this.mouseY - this.top;
        if (newHeight > 150) {
          this.height= newHeight;
        }
      }
  
      this.drawRectInCanvas();
    }
    private getMousePos(e: MouseEvent) {
      const boundingRect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - boundingRect.left,
        y: e.clientY - boundingRect.top,
      };
    }
  
    private checkInRect(x: number, y: number) {
      return (
        x > this.left + Rectangle.LINE_WIDTH &&
        x < this.left + this.width - Rectangle.LINE_WIDTH &&
        y > this.top + Rectangle.LINE_WIDTH &&
        y < this.top + this.height - Rectangle.LINE_WIDTH
      );
    }
  
    private checkCloseEnough(p1: number, p2: number) {
      return Math.abs(p1 - p2) < Rectangle.RADIUS;
    }
  }
  