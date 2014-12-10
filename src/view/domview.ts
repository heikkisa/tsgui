/// <reference path="view.ts" />

//TODO: 
//-visibilty changes to DOM
//-location updated tied to drawing, if goes off-screen DOM stays put

class DomView extends View {
    private static VENDOR_PREFIXES = ["Moz", "Webkit", "ms", "O"];

    private _element : HTMLElement = null;
    private _hasBeenVisible : boolean = false;

    constructor(parent : View) {
        super(parent);
    }
    
    element(value? : HTMLElement) : HTMLElement {
        return getOrSet(this, "element", this, "_element", value, () => {
            this._setElement(value);
            this.requestLayout();
        }); 
    }
    
    createElement(name : string) {
        if (name !== undefined) {
            this._setElement(document.createElement(name));
        }
    }
    
    destroy() {
        super.destroy();
        
        if (this._element !== null) {
            if (this._element.parentNode !== null) {
                this._element.parentNode.removeChild(this._element);
            }
            this._element = null;
        }
    }

    _setElement(element : HTMLElement) {
        if (element.parentNode !== null) {
            element.parentNode.removeChild(element);
        }
        document.body.appendChild(element);
    
        if (this._hasBeenVisible && this.visible()) {
            element.style.visibility = "visible";
        }
        else {
            element.style.visibility = "hidden";
        }
        element.style.opacity = "1";
        element.style.position = "absolute";
        element.style.zIndex = "10";
        element.style.margin = "0px";
        element.style.padding = "0px";
        this._element = element;
        
        this._updateElementRect();
    }
    
    _updateElementRect() {
        if (this._element === null) {
            return;
        }
        var r = this._marginRect;
        var element = this._element;
        element.style.left = this._px(0);
        element.style.top = this._px(0);
        element.style.width = this._px(r.width - 1);
        element.style.height = this._px(r.height - 1);
    }
    
    _updateElementTransform(state : ViewState) {
        if (this._element === null) {
            return;
        }
        var r = this._marginRect;
        var matrix = state.renderer.getTransform();
        var copy = matrix.copy(); //TODO wastes memory
        copy.translate(r.x, r.y);
        
        //TODO fix zero scaling here

        var transform = "matrix(" + copy.m.join(",") + ")";
        this._setStyle("transform", transform);
        this._setStyle("transformOrigin", "0% 0%");
        this._setStyle("opacity", "" + state.renderer.alpha());
    }
    
    _setStyle(name : string, value : string) {
        if (name in this._element.style) {
            this._element.style[name] = value;
        }
        else {
            var capName = name.charAt(0).toUpperCase() + name.slice(1);
            for (var i=0; i < DomView.VENDOR_PREFIXES.length; ++i) {
                var prop = DomView.VENDOR_PREFIXES[i] + capName;
                if (prop in this._element.style) {
                    this._element.style[prop] = value;
                    break;
                }
            }
        }
    }
    
    _px(value : number) : string {
        return  R(value) + "px";
    }
    
    onLayoutReady() {
        this._updateElementRect();
    }
    
    onDraw(state : ViewState) {
        super.onDraw(state);
        
        if (this._hasBeenVisible === false) {
            this._hasBeenVisible = true;
            if (this.visible() && this._element !== null) {
                this._element.style.visibility = "visible";
            }
        }
        
        this._updateElementTransform(state);
    }
    
}
