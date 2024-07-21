var Rectangle = /** @class */ (function () {
    function Rectangle(canvas, video) {
        this.dragTL = false;
        this.dragTR = false;
        this.dragBL = false;
        this.dragBR = false;
        this.leftSide = false;
        this.rightSide = false;
        this.topSide = false;
        this.bottomSide = false;
        this.dragWholeRect = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.startX = 0;
        this.startY = 0;
        var _a = video.getBoundingClientRect(), width = _a.width, height = _a.height;
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
    Rectangle.prototype.repositionCanvas = function (video) {
        var _a = video.getBoundingClientRect(), width = _a.width, height = _a.height;
        this.canvas.width = width;
        this.canvas.height = height;
        // Calculate the new ratios
        var widthRatio = this.canvas.width / this.initialCanvasWidth;
        var heightRatio = this.canvas.height / this.initialCanvasHeight;
        // Adjust rectangle size and position based on new ratios
        this.left *= widthRatio;
        this.top *= heightRatio;
        this.width *= widthRatio;
        this.height *= heightRatio;
        // Update initial canvas dimensions to the new ones
        this.initialCanvasWidth = this.canvas.width;
        this.initialCanvasHeight = this.canvas.height;
        this.drawRectInCanvas();
    };
    Rectangle.prototype.drawRectInCanvas = function () {
        var ctx = this.canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.beginPath();
        ctx.lineWidth = Rectangle.LINE_WIDTH;
        ctx.fillStyle = "rgba(199, 87, 231, 0.2)";
        ctx.strokeStyle = "#c757e7";
        ctx.rect(this.left, this.top, this.width, this.height);
        ctx.fill();
        ctx.stroke();
        this.drawCorners();
    };
    Rectangle.prototype.drawCircle = function (x, y) {
        var ctx = this.canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.fillStyle = "#c757e7";
        ctx.beginPath();
        ctx.arc(x, y, Rectangle.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    };
    Rectangle.prototype.drawCorners = function () {
        this.drawCircle(this.left, this.top);
        this.drawCircle(this.left + this.width, this.top);
        this.drawCircle(this.left + this.width, this.top + this.height);
        this.drawCircle(this.left, this.top + this.height);
    };
    Rectangle.prototype.mouseUp = function () {
        this.dragTL = this.dragTR = this.dragBL = this.dragBR = false;
        this.leftSide = this.rightSide = this.bottomSide = this.topSide = false;
        this.dragWholeRect = false;
    };
    Rectangle.prototype.mouseDown = function (e) {
        var pos = this.getMousePos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
        if (this.checkCloseEnough(this.mouseX, this.left) &&
            this.checkCloseEnough(this.mouseY, this.top)) {
            this.dragTL = true;
        }
        else if (this.checkCloseEnough(this.mouseX, this.left + this.width) &&
            this.checkCloseEnough(this.mouseY, this.top)) {
            this.dragTR = true;
        }
        else if (this.checkCloseEnough(this.mouseX, this.left) &&
            this.checkCloseEnough(this.mouseY, this.top + this.height)) {
            this.dragBL = true;
        }
        else if (this.checkCloseEnough(this.mouseX, this.left + this.width) &&
            this.checkCloseEnough(this.mouseY, this.top + this.height)) {
            this.dragBR = true;
        }
        else if (this.mouseY >= this.top &&
            this.mouseY <= this.top + this.height &&
            this.mouseX >= this.left - Rectangle.LINE_WIDTH &&
            this.mouseX <= this.left + Rectangle.LINE_WIDTH) {
            this.leftSide = true;
        }
        else if (this.mouseY >= this.top &&
            this.mouseY <= this.top + this.height &&
            this.mouseX >= this.left + this.width - Rectangle.LINE_WIDTH &&
            this.mouseX <= this.left + this.width + Rectangle.LINE_WIDTH) {
            this.rightSide = true;
        }
        else if (this.mouseY >= this.top - Rectangle.LINE_WIDTH &&
            this.mouseY <= this.top + Rectangle.LINE_WIDTH &&
            this.mouseX >= this.left &&
            this.mouseX <= this.left + this.width) {
            this.topSide = true;
        }
        else if (this.mouseY >= this.top + this.height - Rectangle.LINE_WIDTH &&
            this.mouseY <= this.top + this.height + Rectangle.LINE_WIDTH &&
            this.mouseX >= this.left &&
            this.mouseX <= this.left + this.width) {
            this.bottomSide = true;
        }
        else if (this.checkInRect(this.mouseX, this.mouseY)) {
            this.dragWholeRect = true;
            this.startX = this.mouseX;
            this.startY = this.mouseY;
        }
        this.drawRectInCanvas();
    };
    Rectangle.prototype.mouseMove = function (e) {
        var pos = this.getMousePos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
        if ((this.checkCloseEnough(this.mouseX, this.left) &&
            this.checkCloseEnough(this.mouseY, this.top)) ||
            (this.checkCloseEnough(this.mouseX, this.left + this.width) &&
                this.checkCloseEnough(this.mouseY, this.top + this.height))) {
            this.canvas.style.cursor = "nwse-resize";
        }
        else if ((this.checkCloseEnough(this.mouseX, this.left + this.width) &&
            this.checkCloseEnough(this.mouseY, this.top)) ||
            (this.checkCloseEnough(this.mouseX, this.left) &&
                this.checkCloseEnough(this.mouseY, this.top + this.height))) {
            this.canvas.style.cursor = "nesw-resize";
        }
        else if ((this.mouseY >= this.top &&
            this.mouseY <= this.top + this.height &&
            this.mouseX >= this.left - Rectangle.LINE_WIDTH &&
            this.mouseX <= this.left + Rectangle.LINE_WIDTH) ||
            (this.mouseY >= this.top &&
                this.mouseY <= this.top + this.height &&
                this.mouseX >= this.left + this.width - Rectangle.LINE_WIDTH &&
                this.mouseX <= this.left + this.width + Rectangle.LINE_WIDTH)) {
            this.canvas.style.cursor = "e-resize";
        }
        else if ((this.mouseY >= this.top - Rectangle.LINE_WIDTH &&
            this.mouseY <= this.top + Rectangle.LINE_WIDTH &&
            this.mouseX >= this.left &&
            this.mouseX <= this.left + this.width) ||
            (this.mouseY >= this.top + this.height - Rectangle.LINE_WIDTH &&
                this.mouseY <= this.top + this.height + Rectangle.LINE_WIDTH &&
                this.mouseX >= this.left &&
                this.mouseX <= this.left + this.width)) {
            this.canvas.style.cursor = "s-resize";
        }
        else if (this.checkInRect(this.mouseX, this.mouseY)) {
            this.canvas.style.cursor = "move";
        }
        else {
            this.canvas.style.cursor = "default";
        }
        if (this.dragWholeRect) {
            e.preventDefault();
            e.stopPropagation();
            var dx = this.mouseX - this.startX;
            var dy = this.mouseY - this.startY;
            if (this.left + dx > 0 &&
                this.left + dx + this.width < this.canvas.width) {
                this.left += dx;
            }
            if (this.top + dy > 0 &&
                this.top + dy + this.height < this.canvas.height) {
                this.top += dy;
            }
            this.startX = this.mouseX;
            this.startY = this.mouseY;
        }
        else if (this.dragTL) {
            var newWidth = this.left + this.width - this.mouseX;
            var newHeight = this.top + this.height - this.mouseY;
            if (newWidth > Rectangle.MIN_WIDTH && newHeight > Rectangle.MIN_HEIGHT) {
                this.width = newWidth;
                this.height = newHeight;
                this.left = this.mouseX;
                this.top = this.mouseY;
            }
        }
        else if (this.dragTR) {
            var newWidth = this.mouseX - this.left;
            var newHeight = this.top + this.height - this.mouseY;
            if (newWidth > Rectangle.MIN_WIDTH && newHeight > Rectangle.MIN_HEIGHT) {
                this.width = newWidth;
                this.height = newHeight;
                this.top = this.mouseY;
            }
        }
        else if (this.dragBL) {
            var newWidth = this.left + this.width - this.mouseX;
            var newHeight = this.mouseY - this.top;
            if (newWidth > Rectangle.MIN_WIDTH && newHeight > Rectangle.MIN_HEIGHT) {
                this.width = newWidth;
                this.height = newHeight;
                this.left = this.mouseX;
            }
        }
        else if (this.dragBR) {
            var newWidth = this.mouseX - this.left;
            var newHeight = this.mouseY - this.top;
            if (newWidth > Rectangle.MIN_WIDTH && newHeight > Rectangle.MIN_HEIGHT) {
                this.width = newWidth;
                this.height = newHeight;
            }
        }
        else if (this.leftSide) {
            var newWidth = this.left + this.width - this.mouseX;
            if (newWidth > Rectangle.MIN_WIDTH) {
                this.width = newWidth;
                this.left = this.mouseX;
            }
        }
        else if (this.rightSide) {
            var newWidth = this.mouseX - this.left;
            if (newWidth > Rectangle.MIN_WIDTH) {
                this.width = newWidth;
            }
        }
        else if (this.topSide) {
            var newHeight = this.top + this.height - this.mouseY;
            if (newHeight > Rectangle.MIN_HEIGHT) {
                this.height = newHeight;
                this.top = this.mouseY;
            }
        }
        else if (this.bottomSide) {
            var newHeight = this.mouseY - this.top;
            if (newHeight > Rectangle.MIN_HEIGHT) {
                this.height = newHeight;
            }
        }
        this.drawRectInCanvas();
    };
    Rectangle.prototype.getMousePos = function (e) {
        var boundingRect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - boundingRect.left,
            y: e.clientY - boundingRect.top,
        };
    };
    Rectangle.prototype.checkInRect = function (x, y) {
        return (x > this.left + Rectangle.LINE_WIDTH &&
            x < this.left + this.width - Rectangle.LINE_WIDTH &&
            y > this.top + Rectangle.LINE_WIDTH &&
            y < this.top + this.height - Rectangle.LINE_WIDTH);
    };
    Rectangle.prototype.checkCloseEnough = function (p1, p2) {
        return Math.abs(p1 - p2) < Rectangle.RADIUS;
    };
    Rectangle.DEFAULT_WIDTH = 300;
    Rectangle.DEFAULT_HEIGHT = 200;
    Rectangle.RADIUS = 8;
    Rectangle.LINE_WIDTH = 3;
    Rectangle.MIN_WIDTH = 100;
    Rectangle.MIN_HEIGHT = 30;
    return Rectangle;
}());
export { Rectangle };
