
//RendererRounding - some subpixel rendering looks bad,
//better to just use integer values in most cases.
function RR(value : number) : number {
    return Math.round(value);
}

var _CACHE_FONT_STATE = false;
var _USE_CANVAS_TRANSFORM = false;

class RendererImage {
    public _image : HTMLImageElement; //TODO This had some nice abstract class?
    public width : number;
    public height : number;
    
    constructor(image : HTMLImageElement) {
        this._image = image;
        this.width = image.width;
        this.height = image.height;
    }
}

interface TransformStackItem {
    matrix : MatrixTransform;
    inverted : MatrixTransform;
}

class Renderer {
    private _context : CanvasRenderingContext2D;
    private _alphaStack : number[] = [];
    private _activeFont : string = "";
    private _textCache : any = {};
    private _transformCount : number = 0;
    private _transformStack : TransformStackItem[] = [null];
    private _scale : number;
    public compositor : Compositor = new Compositor();
    
    constructor(context : CanvasRenderingContext2D) {
        this._context = context;
        this._scale = window.devicePixelRatio || 1;
    }
    
    _S(value : number) : number {
        return Math.floor(value * this._scale);
    }
    
    reset() {
        this._context.beginPath();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        
        var stackSize = this._transformStack.length;
        this._transformStack = [this._newTransform(new MatrixTransform())];
        
        this._activeFont = "";
        
        if (this._transformCount !== 0 || stackSize !== 1) {
            Log("Invalid transform count, pushes not matched by a pop");
        }
    }
    
    getTransform() : MatrixTransform {
        return this._topTransform().matrix;
    }
    
    _newTransform(m : MatrixTransform) : TransformStackItem {
        return {
            matrix: m.copy(),
            inverted: null
        };
    }
    
    transformPointInverse(x : number, y : number) : Point {
        var top = this._topTransform();
        if (top.inverted === null) {
            //Lazy create inverted matrices.
            top.inverted = top.matrix.copy();
            top.inverted.invert();
        }
        return top.inverted.transformPoint(x, y);
    }
    
    transformRectToAABB(r : Rect, out : Rect) {
        var m = this._topTransform().matrix;
        var points : Point[] = [
            {x: r.x, y: r.y},
            {x: r.x + r.width, y: r.y},
            {x: r.x, y: r.y + r.height},
            {x: r.x + r.width, y: r.y + r.height},
        ];
        
        var left = null;
        var top = null;
        var right = null;
        var bottom = null;
        for (var i=0; i < 4; ++i) {
            var point = points[i];
            var p = m.transformPoint(point.x, point.y);
            
            if (left === null || p.x < left) {
                left = p.x;
            }
            if (top === null || p.y < top) {
                top = p.y;
            }
            if (right === null || p.x > right) {
                right = p.x;
            }
            if (bottom === null || p.y > bottom) {
                bottom = p.y;
            }
        }
        out.x = left;
        out.y = top;
        out.width = right - left;
        out.height = bottom - top;
    }
    
    setIdentity() {
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        
        var top = this._topTransform();
        top.matrix.identity();
        top.inverted = null;
    }
    
    clearCache() {
        this._textCache = {};
    }
    
    resetTextAttributes() {
        this._context.textBaseline = "top";
        this._context.textAlign = "left";
    }
    
    alpha() : number {
        return this._context.globalAlpha;
    }
    
    pushAlpha(alpha : number) {
        var oldAlpha = this._context.globalAlpha;
        this._alphaStack.push(oldAlpha);
        this._context.globalAlpha = oldAlpha * alpha;
    }
    
    popAlpha() {
        var alpha = this._alphaStack.pop();
        this._context.globalAlpha = alpha;
    }
    
    shadow(blur : number, xOffset : number = 0, yOffset : number = 0, color : Color = Color.Black) {
        this._context.shadowBlur = blur;
        this._context.shadowOffsetX = xOffset;
        this._context.shadowOffsetY = yOffset;
        this._context.shadowColor = color.rgba();
    }

    clearRect(x : number, y : number, width : number, height : number) {
        if (Config.IS_ANDROID) {
            //Workaround for bug http://code.google.com/p/android/issues/detail?id=35474
            this._context.fillStyle = "#FFFFFF";
            this._context.fillRect(RR(x), RR(y), RR(width), RR(height));
        }
        else {
            this._context.clearRect(RR(x), RR(y), RR(width), RR(height));
        }
    }
    
    pushClipRect(x : number, y : number, width : number, height : number) {
        this._context.save();
        this._context.beginPath();
        this._context.rect(RR(x), RR(y), RR(width), RR(height));
        this._context.clip();
    }
    
    popClipRect() {
        this._context.restore();
    }
    
    //TODO this should only be called using untransforment Renderer, like
    //from onLayout() because scaling can change text size. Make sure
    //text does not layout in it's draw()... Or put scaling etc. to cache key, too
    measureText(text : string, font : string) : number {
        var cacheKey = text + font;
        var cacheWidth = this._textCache[cacheKey];
        if (cacheWidth !== undefined) {
            return cacheWidth;
        }
    
        if (_CACHE_FONT_STATE && this._activeFont !== font) {
            this._activeFont = font;
            this._context.font = font;
        }
        else {
            this._context.font = font;
        }
        var width = Math.floor(this._context.measureText(text).width);
        
        this._textCache[cacheKey] = width;
        
        return width
    }
    
    drawText(text : string, x : number, y : number, color : Color, font : string) {
        if (_CACHE_FONT_STATE && this._activeFont !== font) {
            this._activeFont = font;
            this._context.font = font;
        }
        else {
            this._context.font = font;
        }
        //this._context.beginPath();
        this._context.fillStyle = color.rgba();
        this._context.fillText(text, RR(x), RR(y));
    }
    
    fillRect(x : number, y : number, width : number, height : number, color : Color) {
        //this._context.beginPath();
        this._context.fillStyle = color.rgba();
        this._context.fillRect(RR(x), RR(y), RR(width), RR(height));
    }
    
    strokeRect(x : number, y : number, width : number, height : number, color : Color, lineWidth : number = 1) {
        //this._context.beginPath();
        this._context.lineWidth = lineWidth;
        this._context.strokeStyle = color.rgba();
        this._context.strokeRect(RR(x), RR(y), RR(width), RR(height));
    }
    
    _roundedRectPath(x : number, y : number, w : number, h : number, r : number) {
        if (w < 2 * r) {
            r = RR(w / 2);
        }
        if (h < 2 * r) {
            r = RR(h / 2);
        }
        var context = this._context;
        context.beginPath();
        context.moveTo(x + r, y);
        context.arcTo(x + w,  y,     x + w, y + h, r);
        context.arcTo(x + w,  y + h, x,     y + h, r);
        context.arcTo(x,      y + h, x,     y,     r);
        context.arcTo(x,      y,     x + w, y,     r);
        context.closePath();
    }
    
    fillRoundedRect(x : number, y : number, width : number, height : number, color : Color, rounding : number) {
        this._roundedRectPath(RR(x), RR(y), RR(width), RR(height), RR(rounding));
        
        this._context.fillStyle = color.rgba();
        this._context.fill();
    }
    
    _createGradient(x : number, y : number, width : number, height : number, colors : Color[]) : CanvasGradient {
        var gradient = this._context.createLinearGradient(0, y, 0, y + height);
        for (var i=0; i < colors.length; ++i) {
            var color = colors[i].rgba();
            gradient.addColorStop(i / (colors.length - 1), color);
        }
        return gradient;
    }
    
    _fillRoundedGradient(x : number, y : number, width : number, height : number, gradient : CanvasGradient, rounding : number) {
        this._roundedRectPath(RR(x), RR(y), RR(width), RR(height), RR(rounding));
        if (Config.IS_ANDROID) {
            //TODO workaround for Android bug (?) where old alpha is used with gradients.
            this._context.fillStyle = "rgba(255, 255, 255, 1.0)"; 
        }
        this._context.fillStyle = gradient;
        this._context.fill();
    }
    
    fillRoundedGradient(x : number, y : number, width : number, height : number, colors : Color[], rounding : number) {
        var gradient = this._createGradient(x, y, width, height, colors); //TODO slow on Firefox
        this._fillRoundedGradient(x, y, width, height, gradient, rounding);
    }
    
    drawImage(image : RendererImage, sx : number, sy : number, swidth : number, sheight : number,
            x : number, y : number, width : number, height : number) {
        this._context.drawImage(image._image, RR(sx), RR(sy), RR(swidth), RR(sheight), RR(x), RR(y), RR(width), RR(height));
    }
    
    drawImageAt(image : RendererImage, x : number, y : number) {
        this._context.drawImage(image._image, RR(x), RR(y));
    }
    
    drawCanvasAt(canvas : HTMLCanvasElement, x : number, y : number) {
        this._context.drawImage(canvas, RR(x), RR(y));
    }
    
    drawLine(x1 : number, y1 : number, x2 : number, y2 : number, color : Color, width : number = 1) {
        this._context.beginPath();
        this._context.moveTo(x1, y1);
        this._context.lineTo(x2, y2);
        
        this._context.lineWidth = width;
        this._context.strokeStyle = color.rgba();
        this._context.stroke();
    }
    
    hitTestRect(xp : number, yp : number, x : number, y : number, width : number, height : number) : boolean {
        this._context.beginPath();
        this._context.rect(x, y, width, height);
        return this._context.isPointInPath(xp, yp);
    }
    
    toRadians(value : number) : number {
        return value * Math.PI / 180;
    }
    
    translate(x : number, y : number) {
        if (_USE_CANVAS_TRANSFORM) {
            this._context.translate(x, y);
        }
        else {
            var top = this._topTransform();
            top.matrix.translate(x, y);
            top.inverted = null;
            
            this._applyTopTransform();
        }
    }
    
    _applyTopTransform() {
        var t = this._topTransform().matrix;
        var m = t.m;
        this._context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (!t.isInvertible()) {
            Log("Render transform is not invertible!");
        }
    }
    
    _topTransform() : TransformStackItem {
        return this._transformStack[this._transformStack.length - 1];
    }
    
    pushTransform(transform : Transform, xOrigin : number, yOrigin : number) {
        this.saveTransform();
    
        var MIN_SCALE = 0.00001; //Prevent non-invertible matrices
        var scaleX = transform.scaleX;
        if (scaleX === 0) {
            scaleX = MIN_SCALE;
        }
        
        var scaleY = transform.scaleY;
        if (scaleY === 0) {
            scaleY = MIN_SCALE;
        }
        
        //Avoid blurring so round coordinates
        xOrigin = RR(xOrigin);
        yOrigin = RR(yOrigin);
        var xTrans = RR(transform.translationX); 
        var yTrans = RR(transform.translationY);
        
        var rotation = this.toRadians(transform.rotation % 360);
    
        if (_USE_CANVAS_TRANSFORM) {
            var context = this._context;
            
            context.translate(xOrigin, yOrigin);
            context.translate(xTrans, yTrans);
            context.rotate(rotation);
            //context.scale(this._transform.scaleX, this._transform.scaleY);
            //context.transform(this._transform.scaleX, this._toRadians(this._transform.skewY), this._toRadians(this._transform.skewX), this._transform.scaleY, 0, 0);
            //See http://www.w3schools.com/css3/css3_2dtransforms.asp for reference.
            context.transform(1, this.toRadians(transform.skewY), this.toRadians(transform.skewX), 1, 0, 0);
            context.scale(scaleX, scaleY);
            context.translate(-xOrigin, -yOrigin);
        }
        else {
            var top = this._topTransform().matrix;
            
            top.translate(xOrigin, yOrigin);
            top.translate(xTrans, yTrans);
            top.rotate(rotation);
            //top.scale(this._transform.scaleX, this._transform.scaleY);
            //context.transform(this._transform.scaleX, this._toRadians(this._transform.skewY), this._toRadians(this._transform.skewX), this._transform.scaleY, 0, 0);
            //See http://www.w3schools.com/css3/css3_2dtransforms.asp for reference.
            //top.transform(1, this.toRadians(transform.skewY), this.toRadians(transform.skewX), 1, 0, 0);
            top.skew(this.toRadians(transform.skewX), this.toRadians(transform.skewY));
            top.scale(scaleX, scaleY); //TODO don't allow 0's makes matrxi non-invertible?
            top.translate(-xOrigin, -yOrigin);
            
            this._applyTopTransform()
        }
    }
    
    pushTransformRect(transform : Transform, rect : Rect) {
        var xOrigin = rect.x + transform.originX * rect.width;
        var yOrigin = rect.y + transform.originY * rect.height;
        this.pushTransform(transform, xOrigin, yOrigin);
    }
    
    saveTransform() {
        if (_USE_CANVAS_TRANSFORM) {
            this._context.save();
        }
        else {
            var top = this._topTransform();
            this._transformStack.push(this._newTransform(top.matrix));
        }
        this._transformCount++;
    }
    
    popTransform() {
        if (_USE_CANVAS_TRANSFORM) {
            this._context.restore();
        }
        else {
            this._transformStack.pop();
            this._applyTopTransform();
        }
        this._transformCount--;
    }
    
}
