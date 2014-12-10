
enum WalkReason {
    HitTest = 1,
    Draw = 2
}

class ViewState {
    public renderer : Renderer;
    public reason : WalkReason;
    public x : number = null;
    public y : number = null;
    public enabled : boolean = true;
    public pressed : boolean = false;
    public focused : boolean = false
    public hovering : boolean = false;
    public selected : boolean = false;
    public time : number = null;
    public bbox : Rect = null;
    
    constructor(renderer : Renderer, reason : WalkReason) {
        this.renderer = renderer;
        this.reason = reason;
    }
    
    copy() : ViewState {
        var state = new ViewState(this.renderer, this.reason);
        state.x = this.x;
        state.y = this.y;
        state.enabled = this.enabled;
        state.pressed = this.pressed;
        state.focused = this.focused;
        state.hovering = this.hovering;
        state.selected = this.selected;
        state.time = this.time;
        state.bbox = this.bbox.copy();
        return state;
    }
}

class LayoutState {
    copy() : LayoutState {
        var state = new LayoutState();
        return state;
    }
}

enum InputType {
    MouseDown = 1,
    MouseMove = 2,
    MouseWheel = 3,
    MouseUp = 4,
    KeyDown = 5,
    KeyUp = 6,
    KeyPress = 7,
}

class InputEvent {
    public type : InputType;
    public x : number;
    public y : number;
    public scroll : number = 0;

    constructor(type : InputType, x : number, y : number) {
        this.type = type;
        this.x = x;
        this.y = y;
    }
    
    isMouseEvent() : boolean {
        return this.type >= InputType.MouseDown && this.type <= InputType.MouseUp;
    }
}

class KeyEvent {
    public type : InputType;
    public keyCode : number = null;
    public charCode : number = null;
    public ctrlKey : boolean = null;
    public metaKey : boolean = null;
    
    constructor(type : InputType) {
        this.type = type;
    }
}

class Transform {
    public alpha : number;
    public originX : number;
    public originY : number;
    public rotation : number;
    public scaleX : number;
    public scaleY : number;
    public translationX : number;
    public translationY : number;
    public skewX : number;
    public skewY : number;
    
    constructor() {
        this.alpha = 1;
        this.originX = 0.5;
        this.originY = 0.5;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.translationX = 0;
        this.translationY = 0;
        this.skewX = 0;
        this.skewY = 0;
    }
    
    isTransforming() : boolean {
        return this.originX !== 0.5 || this.originY !== 0.5 ||
            this.rotation !== 0 || this.scaleX !== 1 || this.scaleY !== 1 || 
            this.translationX !== 0 || this.translationY !== 0 ||
            this.skewX !== 0 || this.skewY !== 0;
    }
    
    copy() : Transform {
        var trans = new Transform();
        trans.alpha = this.alpha;
        trans.originX = this.originX;
        trans.originY = this.originY;
        trans.rotation = this.rotation;
        trans.scaleX = this.scaleX;
        trans.scaleY = this.scaleY;
        trans.translationX = this.translationX;
        trans.translationY = this.translationY;
        trans.skewX = this.skewX;
        trans.skewY = this.skewY;
        return trans;
    }
}

class MarginPadding {
    public left : number = 0;
    public top : number = 0;
    public right : number = 0;
    public bottom : number = 0;
    
    copy() : MarginPadding {
        var m = new MarginPadding();
        m.left = this.left;
        m.top = this.top;
        m.right = this.right;
        m.bottom = this.bottom;
        return m;
    }
    
    apply(m : MarginPadding) {
        this.left += m.left;
        this.top += m.top;
        this.right -= m.right;
        this.bottom -= m.bottom;
    }
}
