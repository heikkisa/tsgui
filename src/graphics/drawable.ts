/// <reference path="../structs.ts" />
/// <reference path="../utils.ts" />

class Drawable {
    public padding : MarginPadding = new MarginPadding();
    public width : number = -1;
    public height : number = -1;
    public transform : Transform = null;
    private _tempRect : Rect = new Rect(0, 0, 0, 0);

    constructor() { }
    
    _updateSize(drawable : Drawable) {
        if (drawable) {
            this.width = Math.max(this.width, drawable.width);
            this.height = Math.max(this.height, drawable.height);
        }
    }

    hasSize() : boolean {
        return this.width >= 0 && this.height >= 0;
    }
    
    draw(state : ViewState, rect : Rect) {
        this.drawArea(state, rect.x, rect.y, rect.width, rect.height);
    }
    
    drawArea(state : ViewState, x : number, y : number, width : number, height : number) {
        this._tempRect.set(x, y, width, height);
        
        var transformed = this.transform !== null && this.transform.isTransforming();
        if (transformed) {
            state.renderer.pushTransformRect(this.transform, this._tempRect);
        }
        this.onDraw(state, this._tempRect);
        
        if (transformed) {
            state.renderer.popTransform();
        }
    }
    
    onDraw(state : ViewState, rect : Rect) {
        //Empty
    }
}

class EmptyDrawable extends Drawable {
    public static Shared = new EmptyDrawable();

    constructor() { 
        super();
    }
    
    draw(state : ViewState, rect : Rect) {
        //Do nothing
    }
    
    drawArea(state : ViewState, x : number, y : number, width : number, height : number) {
        //Do nothing
    }
}

interface FunctionDrawableCallback {
    (state : ViewState, rect : Rect);
}

class FunctionDrawable extends Drawable {
    private _callback : FunctionDrawableCallback;

    constructor(callback : FunctionDrawableCallback) { 
        super();
        this._callback = callback;
    }
    
    onDraw(state : ViewState, rect : Rect) {
        this._callback(state, rect);
    }
}

class ColorDrawable extends Drawable {
    constructor(private color : Color) {
        super();
    }
    
    public static RGB(r : number, g : number, b : number) : ColorDrawable {
        return new ColorDrawable(Color.RGB(r, g, b));
    }

    onDraw(state : ViewState, rect : Rect) {
        state.renderer.fillRect(rect.x, rect.y, rect.width, rect.height, this.color);
    }
}

class RoundedDrawable extends Drawable {
    constructor(private color : Color, private radius : number = dip(15)) { 
        super();
    }

    onDraw(state : ViewState, rect : Rect) {
        //state.renderer.shadow(3); //TODO
        state.renderer.fillRoundedRect(rect.x, rect.y, rect.width, rect.height, this.color, this.radius);
        //state.renderer.shadow(0);
    }
}

class GradientDrawable extends Drawable {
    private _gradient : CanvasGradient = null;
    private _gradientRect : Rect = new Rect(0, 0, 0, 0);

    constructor(private colors : Color[], private radius : number = 15) { 
        super();
    }
    
    onDraw(state : ViewState, rect : Rect) {
        if (this._gradient === null || !rect.equals(this._gradientRect)) {
            //Only create gradients when we must, cache them otherwise.
            this._gradient = state.renderer._createGradient(rect.x, rect.y, 
                rect.width, rect.height, this.colors);
            rect.copyTo(this._gradientRect);
        }
        state.renderer._fillRoundedGradient(rect.x, rect.y, 
            rect.width, rect.height, this._gradient, this.radius);
    }
}

class LayerDrawable extends Drawable {
    private drawables : Drawable[];

    constructor(... drawables : Drawable[]) { 
        super();
        
        this.drawables = drawables;
        for (var i=0; i < drawables.length; ++i) {
            this._updateSize(drawables[i]);
        }
    }
    
    onDraw(state : ViewState, rect : Rect) {
        for (var i=0; i < this.drawables.length; ++i) {
            this.drawables[i].draw(state, rect);
        }
    }
}

enum VF {
    Enabled = 1 << 0,
    Pressed = 1 << 1,
    Focused = 1 << 2,
    Hovering = 1 << 3,
    Selected = 1 << 4,
    All = Enabled | Pressed | Focused | Hovering | Selected,
    Any = 0,
    //Parent = 1 << 5,
    //Child = 1 << 6,
    //Default = Enabled | Parent | Child,
}

interface VisualState {
    statesOn : VF;
    statesOff : VF;
}

interface DrawableState extends VisualState {
    drawable : Drawable;
}

function viewStateToVisualFlags(state : ViewState) : VF {
    var vf : VF = 0;
    if (state.enabled) {
        vf |= VF.Enabled;
    }
    if (state.pressed) {
        vf |= VF.Pressed;
    }
    if (state.focused) {
        vf |= VF.Focused;
    }
    if (state.hovering) {
        vf |= VF.Hovering;
    }
    if (state.selected) {
        vf |= VF.Selected;
    }
    return vf;
}

function testVisualFlags(state : VisualState, flags : VF) : boolean {
    return ((state.statesOn & flags) === state.statesOn && !(state.statesOff & flags));
}

function makeDrawableState(drawable : Drawable, on : VF, off : VF = VF.Any) : DrawableState {
    return {
        statesOn: on,
        statesOff: off,
        drawable: drawable
    };
}

class StateDrawable extends Drawable {
    private states : DrawableState[];
    
    constructor(states : DrawableState[]) { 
        super();
        
        this.states = states;
        for (var i=0; i < states.length; ++i) {
            this._updateSize(states[i].drawable);
        }
    }
    
    _removeStates(vf : VF) {
        //TODO must not affect size.
        for (var i = this.states.length - 1; i >= 0; i--){
            if (this.states[i].statesOn & vf){
                this.states.splice(i, 1);
            }
        }
    }
    
    onDraw(state : ViewState, rect : Rect) {
        var vf = viewStateToVisualFlags(state);
        
        for (var i=0; i < this.states.length; ++i) {
            var ds = this.states[i];
            if (testVisualFlags(ds, vf)) {
                ds.drawable.draw(state, rect);
                break;
            }
        }
    }
}

enum ImageFlags {
    Default = 0,
    AlignLeft = 0,
    AlignTop = 0,
    AlignRight = 1 << 0,
    AlignBottom = 1 << 1,
    AlignCenterHorizontal = 1 << 2,
    AlignCenterVertical = 1 << 3,
    AlignCenter = AlignCenterHorizontal | AlignCenterVertical,
    Scale = 1 << 4,
    ScaleAspectUp = 1 << 5, //Not implemented
    ScaleAspectDown = 1 << 6,
    ScaleAspect = ScaleAspectUp | ScaleAspectDown
}

class ImageDrawable extends Drawable {
    public image : RendererImage;
    public imageFlags : ImageFlags = ImageFlags.ScaleAspectDown | ImageFlags.AlignCenter;

    constructor(image : RendererImage) {
        super();
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    
    onDraw(state : ViewState, rect : Rect) {
        var img = this.image;
        var flags = this.imageFlags;
    
        var leftClip = 0;
        var topClip = 0;
        var widthClip = img.width;
        var heightClip = img.height;
    
        var left = 0;
        var top = 0;
        var width = img.width;
        var height = img.height;
    
        if (flags & ImageFlags.Scale) {
            width = rect.width;
            height = rect.height;
        }
        else {
            if (flags & ImageFlags.ScaleAspectUp && (img.width < rect.width || img.height < rect.height)) {
                //Image is smaller than our drawing area, so scale it up.
                //TODO
            }
            if (flags & ImageFlags.ScaleAspectDown && (img.width > rect.width || img.height > rect.height)) {
                //Image is larger than our drawing area, so scale it down.
                var maxWidth = rect.width;
                var maxHeight = rect.height;
                var ratio = 0;
                var resultWidth = 0;
                var resultHeight = 0;
                
                if (width > maxWidth) {
                    ratio = maxWidth / width;
                    resultWidth = maxWidth;
                    resultHeight = height * ratio;
                    height = height * ratio;
                    width = width * ratio;
                }
                if (height > maxHeight) {
                    ratio = maxHeight / height;
                    resultHeight = maxHeight;
                    resultWidth = width * ratio;
                    width = width * ratio;
                }
                width = resultWidth;
                height = resultHeight;
            }
            
            if (flags & ImageFlags.AlignCenterHorizontal) {
                left = (rect.width / 2) - (width / 2);
            }
            else if (flags & ImageFlags.AlignRight) {
                left = rect.width - width;
            }
            
            if (flags & ImageFlags.AlignCenterVertical) {
                top = (rect.height / 2) - (height / 2);
            }
            else if (flags & ImageFlags.AlignBottom) {
                top = rect.height - height;
            }
        }
    
        state.renderer.drawImage(img, leftClip, topClip, widthClip, heightClip,
            rect.x + left, rect.y + top, width, height);
    }
}
