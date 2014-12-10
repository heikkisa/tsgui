
function Log(text : string) {
    if (console && console.log) {
        console.log(text);
    }
    if (window["GuiHooks"]) {
        window["GuiHooks"].showToast(text);
    }
}

function ThrowError(text : string) {
    Log(text);
    throw new Error(text);
}

function getOrSet<T>(owner : View, name : string, property : Object, key : string, value : T, callback? : Function) : T {
    var isFunction = typeof(property[key]) === "function";

    if (value !== undefined) {
        var oldValue = isFunction ? property[key]() : property[key];
        if (oldValue === undefined) {
            Log("Invalid property: " + name)
        }
        else if (value !== oldValue) { //Critical, otherwise layouts do it forever.
            if (isFunction) {
                property[key](value);
            }
            else {
                property[key] = value;
            }
 
            var changeCallbackName = "on" + name.charAt(0).toUpperCase() + name.slice(1) + "Changed";
            if (changeCallbackName in owner) {
                owner.postEvent(function() { 
                    owner[changeCallbackName](value); //TODO mutable value can be changed...
                });
            }
            
            if (callback) {
                callback();
            }
        }
    }
    else {
        return isFunction ? property[key]() : property[key];
    }
}

interface Point {
    x : number;
    y : number;
}

interface Size {
    width: number;
    height: number;
}

class Rect {
    constructor(public x : number, public y : number, public width : number, public height : number) {
    }
    
    set(x : number, y : number, width : number, height : number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    copy() : Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }
    
    copyTo(rect : Rect) {
        rect.x = this.x;
        rect.y = this.y;
        rect.width = this.width;
        rect.height = this.height;
    }
    
    isEmpty() : boolean {
        return this.width <= 0 || this.height <= 0;
    }
    
    equals(rect : Rect) : boolean {
        //Round values?
        return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
    }
    
    adjust(value : number) { //TODO rename, better name
        this.x += value;
        this.y += value;
        this.width -= value * 2;
        this.height -= value * 2;
    }

    overlaps(r2 : Rect) : boolean {
       var r1 = this;
       return !(r1.x + r1.width < r2.x || r1.y + r1.height < r2.y || r1.x > r2.x + r2.width || r1.y > r2.y + r2.height);
    }
    
    intersection(r : Rect) {
        var newX = Math.max(this.x, r.x);
        var newY = Math.max(this.y, r.y);
        var newWidth = Math.min(this.x + this.width, r.x + r.width) - newX;
        var newHeight = Math.min(this.y + this.height, r.y + r.height) - newY;

        this.x = newX;
        this.y = newY;
        this.width = newWidth;
        this.height = newHeight;
    }
    
    //Usually canvas hit tests are requires.
    /*
    isRectInside(rect : Rect) : boolean {
        return rect.x >= this.x && rect.y >= this.y && rect.right() <= this.right() && rect.bottom() <= this.bottom();
    }
    
    isPointInside(x : number, y : number) : boolean {
        return x >= this.x && x < this.right() && y > this.y && y < this.bottom();
    }*/
    
    centerX() : number {
        return this.x + this.width / 2;
    }
    
    centerY() : number {
        return this.y + this.height / 2;
    }
    
    right() : number {
        return this.x + this.width;
    }
    
    bottom() : number {
        return this.y + this.height;
    }
    
    toString() : string {
        return "Rect(" + this.x + ", " + this.y + ", " + this.width + ", " + this.height + ")";
    }
}

class Color {
    public static White : Color = new Color(255, 255, 255);
    public static Black : Color = new Color(0, 0, 0);
    public static Red : Color = new Color(255, 0, 0);
    public static Green : Color = new Color(0, 255, 0);
    public static Blue : Color = new Color(0, 0, 255);
    public static Yellow : Color = new Color(255, 255, 0);
    public static Gray : Color = new Color(128, 128, 128);
    public static TextSelection : Color = new Color(50, 151, 253);

    private r : number;
    private g : number;
    private b : number;
    private a : number;
    private _rgba : string;
    
    constructor(r : number = 0, g : number = 0, b : number = 0, a : number = 1) { 
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        
        //TODO clamp and normalized values. and clamp this.x values, not only _rgba strings
        if (a < 1) {
            this._rgba = "rgba(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + ", " + a + ")";
        }
        else {
            this._rgba = "rgb(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + ")";
        }
    }
    
    static RGB(r : number, g : number, b : number) : Color {
        return new Color(r, g, b);
    }
    
    static RGB8(r : number, g : number, b : number) : Color {
        return new Color(r, g, b);
    }
    
    static RGBA(r : number, g : number, b : number, a : number) : Color {
        return new Color(r, g, b, a);
    }
    
    static fromString(color : string) : Color {
        var rgbHex = color.match(/^#([0-9a-f]{6})$/i);
        if (rgbHex) {
            var hit = rgbHex[1];
            return new Color(parseInt(hit.substr(0, 2), 16), 
                parseInt(hit.substr(2, 2), 16), 
                parseInt(hit.substr(4, 2), 16));
        }
        else {
            var rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
            if (rgb) {
                return new Color(parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10));
            }
        }
        return null;
    }
    
    inverted() : Color {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }
    
    scaled(value : number) : Color {
        var r = this.r * value;
        var g = this.g * value;
        var b = this.b * value;
        return new Color(r, g, b, this.a);
    }
    
    rgba() : string {
        return this._rgba;
    }
}

class Anchor {
    public x : number;
    public y : number;
    public weight : number; //Not used for now
    
    constructor(public view : View) { }
    
    set(x : number, y : number) {
        this.x = x;
        this.y = y;
        this.weight = 1.0;
    }
    
    isSet() : boolean {
        return this.view !== null;
    }
}

class Anchors {
    public view : View;
    
    public left : Anchor;
    public leftWeight : number;
    public top : Anchor;
    public topWeight : number;
    public right : Anchor;
    public rightWeight : number;
    public bottom : Anchor;
    public bottomWeight : number;
    public center : Anchor;
    public centerHorizontal : Anchor;
    public centerVertical : Anchor;

    public leftContent : Anchor;
    public topContent : Anchor;
    public rightContent : Anchor;
    public bottomContent : Anchor;
    public centerContent : Anchor;
    public centerHorizontalContent : Anchor;
    public centerVerticalContent : Anchor;
    
    constructor(view : View) {
        this.view = view;
        
        this.left = new Anchor(view);
        this.leftWeight = 1;
        this.top = new Anchor(view);
        this.topWeight = 1;
        this.right = new Anchor(view);
        this.rightWeight = 1;
        this.bottom = new Anchor(view);
        this.bottomWeight = 1;
        this.center = new Anchor(view);
        this.centerHorizontal = new Anchor(view);
        this.centerVertical = new Anchor(view);
        
        this.leftContent = new Anchor(view);
        this.topContent = new Anchor(view);
        this.rightContent = new Anchor(view);
        this.bottomContent = new Anchor(view);
        this.centerContent = new Anchor(view);
        this.centerHorizontalContent = new Anchor(view);
        this.centerVerticalContent = new Anchor(view);
    }
    
    update() {
        this.left.set(this.left.view._marginRect.x, null);
        this.top.set(null, this.top.view._marginRect.y);
        this.right.set(this.right.view._marginRect.right(), null);
        this.bottom.set(null, this.bottom.view._marginRect.bottom());
        this.center.set(this.center.view._marginRect.centerX(), this.center.view._marginRect.centerY());
        this.centerHorizontal.set(this.centerHorizontal.view._marginRect.centerX(), null);
        this.centerVertical.set(null, this.centerVertical.view._marginRect.centerY());
        
        var x = 0;
        var y = 0;
        this.leftContent.set(this.left.view._contentRect.x + x, null);
        this.topContent.set(null, this.top.view._contentRect.y + y);
        this.rightContent.set(this.right.view._contentRect.right() + x, null);
        this.bottomContent.set(null, this.bottom.view._contentRect.bottom() + y);
        this.centerContent.set(this.center.view._contentRect.centerX() + x, this.center.view._contentRect.centerY() + y);
        this.centerHorizontalContent.set(this.centerHorizontal.view._contentRect.centerX() + x, null);
        this.centerVerticalContent.set(null, this.centerVertical.view._contentRect.centerY() + y);
    }
    
    isAnySet() : boolean {
        return this.left.isSet() || this.top.isSet() || this.right.isSet() || this.bottom.isSet() || 
            this.center.isSet() || this.centerHorizontal.isSet() || this.centerVertical.isSet();
    }
}

interface SortComparator<T> {
    (a : T, b : T) : number;
}

class Sort {
    //This stable sort is a merge sort.

    static stable<T>(data : T[], compare : SortComparator<T>) : T[] {
        var length = data.length;
        var middle = Math.floor(length / 2);

        if (length < 2) {
            return data;
        }
            
        return Sort._merge(
            Sort.stable(data.slice(0, middle), compare),
            Sort.stable(data.slice(middle, length), compare),
            compare);
    }
    
    static _merge<T>(left : T[], right : T[], compare : SortComparator<T>) : T[] {
        var result : T[] = [];

        while (left.length > 0 || right.length > 0) {
            if (left.length > 0 && right.length > 0) {
                if (compare(left[0], right[0]) <= 0) {
                    result.push(left[0]);
                    left = left.slice(1);
                }
                else {
                    result.push(right[0]);
                    right = right.slice(1);
                }
            }
            else if (left.length > 0) {
                result.push(left[0]);
                left = left.slice(1);
            }
            else if (right.length > 0) {
                result.push(right[0]);
                right = right.slice(1);
            }
        }
        return result;
    }
}

var _devPixRatio = window.devicePixelRatio || 1;

function dip(value : number) : number {
    return R(1 * value); //1 dip can go under 0, might not draw well?
}

interface LayoutData {
    ref : any;
}

function mergeLayouts(a : LayoutData, b : Object) : LayoutData {
    for (var prop in b) { 
        a[prop] = b[prop]; 
    }
    return a;
}

class Counters {
    static ViewsDrawn : number = 0;
}

class MathUtils {
    static randomValue(start : number, end : number) : number {
        return Math.floor(Math.random() * (end - start) + start);
    }
    
    static clamp(value : number, min : number, max : number) : number {
        return Math.max(Math.min(value, max), min);
    }
}

class _ViewRef {
    public command : string = "";
    
    constructor(command : string) {
        this.command = this.command + command;
    }
    
    _chain(command : string) : _ViewRef {
        return new _ViewRef(this.command + "." + command);
    }
    
    parent() : _ViewRef { return this._chain("parent()"); }
    
    anchorLeft() : _ViewRef { return this._chain("anchorLeft()"); }
    anchorTop() : _ViewRef { return this._chain("anchorTop()"); }
    anchorRight() : _ViewRef { return this._chain("anchorRight()"); }
    anchorBottom() : _ViewRef { return this._chain("anchorBottom()"); }
    anchorCenter() : _ViewRef { return this._chain("anchorCenter()"); }
    anchorCenterHorizontal() : _ViewRef { return this._chain("anchorCenterHorizontal()"); }
    anchorCenterVertical() : _ViewRef { return this._chain("anchorCenterVertical()"); }
    
    anchorLeftContent() : _ViewRef { return this._chain("anchorLeftContent()"); }
    anchorTopContent() : _ViewRef { return this._chain("anchorTopContent()"); }
    anchorRightContent() : _ViewRef { return this._chain("anchorRightContent()"); }
    anchorBottomContent() : _ViewRef { return this._chain("anchorBottomContent()"); }
    anchorCenterContent() : _ViewRef { return this._chain("anchorCenterContent()"); }
    anchorCenterHorizontalContent() : _ViewRef { return this._chain("anchorCenterHorizontalContent()"); }
    anchorCenterVerticalContent() : _ViewRef { return this._chain("anchorCenterVerticalContent()"); }
}

function $parent() : _ViewRef {
    return new _ViewRef("parent()");
}

function $id(id : string) : _ViewRef {
    return new _ViewRef("#" + id);
}