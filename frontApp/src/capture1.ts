export class Rectangle {
  static readonly DEFAULT_WIDTH = 300;
  static readonly DEFAULT_HEIGHT = 200;
  static readonly RADIUS = 8;
  static readonly LINE_WIDTH = 3;

  top: number;
  left: number;
  width: number;
  height: number;
  private initialCanvasWidth: number;
  private initialCanvasHeight: number;
  private canvas: HTMLCanvasElement;
  private dragState: DragState = DragState.None;
  private mouseX = 0;
  private mouseY = 0;
  private startX = 0;
  private startY = 0;

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
      const { width, height } = video.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      this.canvas = canvas;

      this.width = Rectangle.DEFAULT_WIDTH;
      this.height = Rectangle.DEFAULT_HEIGHT;
      this.top = canvas.height / 2 - this.height / 2;
      this.left = canvas.width / 2 - this.width / 2;

      this.initialCanvasWidth = canvas.width;
      this.initialCanvasHeight = canvas.height;
      this.drawRectInCanvas();
  }

  repositionCanvas(video: HTMLVideoElement) {
      const { width, height } = video.getBoundingClientRect();
      this.canvas.width = width;
      this.canvas.height = height;

      const widthRatio = this.canvas.width / this.initialCanvasWidth;
      const heightRatio = this.canvas.height / this.initialCanvasHeight;

      this.left *= widthRatio;
      this.top *= heightRatio;
      this.width *= widthRatio;
      this.height *= heightRatio;

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

  private drawCorners() {
      this.drawCircle(this.left, this.top);
      this.drawCircle(this.left + this.width, this.top);
      this.drawCircle(this.left + this.width, this.top + this.height);
      this.drawCircle(this.left, this.top + this.height);
  }

  mouseUp() {
      this.dragState = DragState.None;
  }

  mouseDown(e: MouseEvent) {
      const pos = this.getMousePos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;

      this.dragState = this.getDragState(this.mouseX, this.mouseY);

      if (this.dragState === DragState.Move) {
          this.startX = this.mouseX;
          this.startY = this.mouseY;
      }

      this.drawRectInCanvas();
  }

  mouseMove(e: MouseEvent) {
      const pos = this.getMousePos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
      this.canvas.style.cursor = this.getCursorStyle(this.mouseX, this.mouseY);

      if (this.dragState !== DragState.None) {
          e.preventDefault();
          e.stopPropagation();
      }

      if (this.dragState === DragState.Move) {
          const dx = this.mouseX - this.startX;
          const dy = this.mouseY - this.startY;
          if (this.isValidMove(dx, dy)) {
              this.left += dx;
              this.top += dy;
          }
          this.startX = this.mouseX;
          this.startY = this.mouseY;
      } else if (this.dragState !== DragState.None) {
          this.resizeRectangle(this.dragState, this.mouseX, this.mouseY);
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

  private getDragState(x: number, y: number): DragState {
      if (this.checkCloseEnough(x, this.left) && this.checkCloseEnough(y, this.top)) {
          return DragState.TopLeft;
      } else if (this.checkCloseEnough(x, this.left + this.width) && this.checkCloseEnough(y, this.top)) {
          return DragState.TopRight;
      } else if (this.checkCloseEnough(x, this.left) && this.checkCloseEnough(y, this.top + this.height)) {
          return DragState.BottomLeft;
      } else if (this.checkCloseEnough(x, this.left + this.width) && this.checkCloseEnough(y, this.top + this.height)) {
          return DragState.BottomRight;
      } else if (this.checkInRect(x, y)) {
          return DragState.Move;
      } else if (y >= this.top && y <= this.top + this.height) {
          if (x >= this.left - Rectangle.LINE_WIDTH && x <= this.left + Rectangle.LINE_WIDTH) {
              return DragState.Left;
          } else if (x >= this.left + this.width - Rectangle.LINE_WIDTH && x <= this.left + this.width + Rectangle.LINE_WIDTH) {
              return DragState.Right;
          }
      } else if (x >= this.left && x <= this.left + this.width) {
          if (y >= this.top - Rectangle.LINE_WIDTH && y <= this.top + Rectangle.LINE_WIDTH) {
              return DragState.Top;
          } else if (y >= this.top + this.height - Rectangle.LINE_WIDTH && y <= this.top + this.height + Rectangle.LINE_WIDTH) {
              return DragState.Bottom;
          }
      }
      return DragState.None;
  }

  private getCursorStyle(x: number, y: number): string {
      switch (this.getDragState(x, y)) {
          case DragState.TopLeft:
          case DragState.BottomRight:
              return "nwse-resize";
          case DragState.TopRight:
          case DragState.BottomLeft:
              return "nesw-resize";
          case DragState.Left:
          case DragState.Right:
              return "e-resize";
          case DragState.Top:
          case DragState.Bottom:
              return "s-resize";
          case DragState.Move:
              return "move";
          default:
              return "default";
      }
  }

  private isValidMove(dx: number, dy: number): boolean {
      return (
          this.left + dx > 0 &&
          this.left + dx + this.width < this.canvas.width &&
          this.top + dy > 0 &&
          this.top + dy + this.height < this.canvas.height
      );
  }

  private resizeRectangle(dragState: DragState, x: number, y: number) {
      let newWidth, newHeight;

      switch (dragState) {
          case DragState.TopLeft:
              newWidth = this.left + this.width - x;
              newHeight = this.top + this.height - y;
              if (newWidth > 150 && newHeight > 150) {
                  this.width = newWidth;
                  this.height = newHeight;
                  this.left = x;
                  this.top = y;
              }
              break;
          case DragState.TopRight:
              newWidth = x - this.left;
              newHeight = this.top + this.height - y;
              if (newWidth > 150 && newHeight > 150) {
                  this.width = newWidth;
                  this.height = newHeight;
                  this.top = y;
              }
              break;
          case DragState.BottomLeft:
              newWidth = this.left + this.width - x;
              newHeight = y - this.top;
              if (newWidth > 150 && newHeight > 150) {
                  this.width = newWidth;
                  this.height = newHeight;
                  this.left = x;
              }
              break;
          case DragState.BottomRight:
              newWidth = x - this.left;
              newHeight = y - this.top;
              if (newWidth > 150 && newHeight > 150) {
                  this.width = newWidth;
                  this.height = newHeight;
              }
              break;
          case DragState.Left:
              newWidth = this.left + this.width - x;
              if (newWidth > 150) {
                  this.width = newWidth;
                  this.left = x;
              }
              break;
          case DragState.Right:
              newWidth = x - this.left;
              if (newWidth > 150) {
                  this.width = newWidth;
              }
              break;
          case DragState.Top:
              newHeight = this.top + this.height - y;
              if (newHeight > 150) {
                  this.height = newHeight;
                  this.top = y;
              }
              break;
          case DragState.Bottom:
              newHeight = y - this.top;
              if (newHeight > 150) {
                  this.height = newHeight;
              }
              break;
      }
  }
}

export enum DragState {
  None,
  Move,
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
  Left,
  Right,
  Top,
  Bottom,
}
