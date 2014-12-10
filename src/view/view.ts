/// <reference path="../structs.ts" />

function R(value : number) : number {
    return Math.round(value);
}

enum Visibility {
    Visible = 1,
    Invisible = 2,
    Gone = 3,
}

enum HitArea {
    None,
    Client,
    Drag,
}

function _Floor(value : number) : number {
    if (value !== undefined) {
        value = Math.floor(value);
    }
    return value;
}

class View {
    public _app : Application = null;
    public _parent : View = null;
    public _children : View[] = [];
    public _rect : Rect = new Rect(0, 0, 0, 0);
    public _contentRect : Rect = new Rect(0, 0, 0, 0);
    public _marginRect : Rect = new Rect(0, 0, 0, 0);
    public _paddingRect : Rect = new Rect(0, 0, 0, 0); 
    public _transform : Transform = new Transform();
    public _bind : Anchors = new Anchors(null);
    public _anchors : Anchors;
    public _text : TextValue;
    public _background : Drawable = null;
    public _margins : MarginPadding = new MarginPadding();
    public _padding : MarginPadding = new MarginPadding();
    public _id : string = "";
    public _scrollArea : ScrollArea;
    public _wrapWidth : boolean = false;
    public _wrapHeight : boolean = false;
    public _maxWidth : number = 99999;
    public _maxHeight : number = 99999;
    public _minWidth : number = 0;
    public _minHeight : number = 0;
    public _animation : Animation = null;
    public _clipChildren : boolean = false;
    public _clipTextFast : boolean = true;
    public _clickable : boolean = true;
    public _clickStarted : boolean = false;
    public _lastClickTime : number = 0;
    public _measureChildMargins : boolean = false;
    public _theme : Theme = null;
    public _blockLayout : number = 0;
    //States
    public _enabled : boolean = true;
    public _pressed : boolean = false;
    public _hovering : boolean = false;
    public _selected : boolean = false;
    public _visibility : Visibility = Visibility.Visible;
    public _zIndex : number = 0;
    
    public _requestLayoutText : Function;
    public _requestLayout : Function;
    public _requestDraw : Function;
    
    constructor(parent : View) {
        this._anchors = new Anchors(this);
        this._scrollArea = new ScrollArea(this);

        this._createRequestHandlers();
        
        if (parent) {
            this._text = new TextValue(parent._app.renderer);
            this._theme = parent._theme;
            this._text.selectable = this._theme.viewTextSelectable;
        }
        this._reparent(parent);
    }

    _createRequestHandlers() {
        this._requestLayoutText = () => {
            this.requestLayout();
        }
        this._requestLayout = () => { 
            this.requestLayout(); 
        };
        this._requestDraw = () => { 
            this.requestDraw(); 
        };
    }
    
    //Rect
    x(value? : number) : number { return getOrSet(this, "x", this._rect, "x", _Floor(value), this._requestLayout); }
    y(value? : number) : number { return getOrSet(this, "y", this._rect, "y", _Floor(value), this._requestLayout); }  
    width(value? : number) : number { return getOrSet(this, "width", this._rect, "width", _Floor(value), this._requestLayout); }  
    height(value? : number) : number { return getOrSet(this, "height", this._rect, "height", _Floor(value), this._requestLayout); }  

    wrapWidth(value? : boolean) : boolean { return getOrSet(this, "wrapWidth", this, "_wrapWidth", value, this._requestLayout); }  
    wrapHeight(value? : boolean) : boolean { return getOrSet(this, "wrapHeight", this, "_wrapHeight", value, this._requestLayout); }  
    
    maxWidth(value? : number) : number { return getOrSet(this, "maxWidth", this, "_maxWidth", _Floor(value), this._requestLayout); }  
    maxHeight(value? : number) : number { return getOrSet(this, "maxHeight", this, "_maxHeight", _Floor(value), this._requestLayout); }  
    
    minWidth(value? : number) : number { return getOrSet(this, "minWidth", this, "_minWidth", _Floor(value), this._requestLayout); }  
    minHeight(value? : number) : number { return getOrSet(this, "minHeight", this, "_minHeight", _Floor(value), this._requestLayout); }  
    
    //Transform
    alpha(value? : number) : number { return getOrSet(this, "alpha", this._transform, "alpha", value, this._requestDraw); }
    originX(value? : number) : number { return getOrSet(this, "originX", this._transform, "originX", value, this._requestDraw); }
    originY(value? : number) : number { return getOrSet(this, "originY", this._transform, "originY", value, this._requestDraw); }
    rotation(value? : number) : number { return getOrSet(this, "rotation", this._transform, "rotation", value, this._requestDraw); }
    scaleX(value? : number) : number { return getOrSet(this, "scaleX", this._transform, "scaleX", value, this._requestDraw); }
    scaleY(value? : number) : number { return getOrSet(this, "scaleY", this._transform, "scaleY", value, this._requestDraw); }
    translationX(value? : number) : number { return getOrSet(this, "translationX", this._transform, "translationX", value, this._requestDraw); }
    translationY(value? : number) : number { return getOrSet(this, "translationY", this._transform, "translationY", value, this._requestDraw); }
    skewX(value? : number) : number { return getOrSet(this, "skewX", this._transform, "skewX", value, this._requestDraw); }
    skewY(value? : number) : number { return getOrSet(this, "skewY", this._transform, "skewY", value, this._requestDraw); }
    
    //Bind
    bindLeft(value? : Anchor) : Anchor { return getOrSet(this, "bindLeft", this._bind, "left", value, this._requestLayout); }
    bindTop(value? : Anchor) : Anchor { return getOrSet(this, "bindTop", this._bind, "top", value, this._requestLayout); }
    bindRight(value? : Anchor) : Anchor { return getOrSet(this, "bindRight", this._bind, "right", value, this._requestLayout); }
    bindBottom(value? : Anchor) : Anchor { return getOrSet(this, "bindBottom", this._bind, "bottom", value, this._requestLayout); }
    bindCenter(value? : Anchor) : Anchor { return getOrSet(this, "bindCenter", this._bind, "center", value, this._requestLayout); }
    bindCenterHorizontal(value? : Anchor) : Anchor { return getOrSet(this, "bindCenterHorizontal", this._bind, "centerHorizontal", value, this._requestLayout); }
    bindCenterVertical(value? : Anchor) : Anchor { return getOrSet(this, "bindCenterVertical", this._bind, "centerVertical", value, this._requestLayout); }
    fillParent(value? : boolean) {
        if (value) {
            this.bindLeft(this._parent.anchorLeft());
            this.bindTop(this._parent.anchorTop());
            this.bindRight(this._parent.anchorRight());
            this.bindBottom(this._parent.anchorBottom());
        }
    }
    
    //Weights
    bindLeftWeight(value? : number) : number { return getOrSet(this, "bindLeftWeight", this._bind, "leftWeight", value, this._requestLayout); }
    bindRightWeight(value? : number) : number { return getOrSet(this, "bindRightWeight", this._bind, "rightWeight", value, this._requestLayout); }
    bindTopWeight(value? : number) : number { return getOrSet(this, "bindTopWeight", this._bind, "topWeight", value, this._requestLayout); }
    bindBottomWeight(value? : number) : number { return getOrSet(this, "bindBottomWeight", this._bind, "bottomWeight", value, this._requestLayout); }
    
    //Anchors
    anchorLeft() : Anchor { return this._anchors.left; }
    anchorTop() : Anchor { return this._anchors.top; }
    anchorRight() : Anchor { return this._anchors.right; }
    anchorBottom() : Anchor { return this._anchors.bottom; }
    anchorCenter() : Anchor { return this._anchors.center; }
    anchorCenterHorizontal() : Anchor { return this._anchors.centerHorizontal; }
    anchorCenterVertical() : Anchor { return this._anchors.centerVertical; }
    
    //Content anchors
    anchorLeftContent() : Anchor { return this._anchors.leftContent; }
    anchorTopContent() : Anchor { return this._anchors.topContent; }
    anchorRightContent() : Anchor { return this._anchors.rightContent; }
    anchorBottomContent() : Anchor { return this._anchors.bottomContent; }
    anchorCenterContent() : Anchor { return this._anchors.centerContent; }
    anchorCenterHorizontalContent() : Anchor { return this._anchors.centerHorizontalContent; }
    anchorCenterVerticalContent() : Anchor { return this._anchors.centerVerticalContent; }
    
    //Text
    text(value? : string) : string { return getOrSet(this, "text", this._text, "text", value, this._requestLayoutText); }
    textElement(value : HTMLElement) {
        if (value !== undefined) {
            this._text.textElement(value);
            this._requestLayoutText();
        }
    }
    
    textSize(value : number) {
        if (value !== undefined) {
            this._text.textSize(value);
            this.requestLayout();
        }
    }
    
    textAlign(value : TextAlign) {
        if (value !== undefined) {
            this._text.textAlign(value);
            this.requestLayout();
        }
    }
    
    textColor(value : Color) {
        if (value !== undefined) {
            this._text.textColor(value);
            this.requestLayout();
        }
    }
    
    textSelectable(value? : boolean) : boolean { return getOrSet(this, "textSelectable", this._text, "selectable", value, this._requestDraw); }
    
    //Margins
    marginLeft(value? : number) : number { return getOrSet(this, "marginLeft", this._margins, "left", value, this._requestLayout); }
    marginTop(value? : number) : number { return getOrSet(this, "marginTop", this._margins, "top", value, this._requestLayout); }
    marginRight(value? : number) : number { return getOrSet(this, "marginRight", this._margins, "right", value, this._requestLayout); }
    marginBottom(value? : number) : number { return getOrSet(this, "marginBottom", this._margins, "bottom", value, this._requestLayout); }
    margins(value : number) {
        if (value !== undefined) {
            this.marginLeft(value);
            this.marginTop(value);
            this.marginRight(value);
            this.marginBottom(value);
        }
    }
    
    //Padding
    paddingLeft(value? : number) : number { return getOrSet(this, "paddingLeft", this._padding, "left", value, this._requestLayout); }
    paddingTop(value? : number) : number { return getOrSet(this, "paddingTop", this._padding, "top", value, this._requestLayout); }
    paddingRight(value? : number) : number { return getOrSet(this, "paddingRight", this._padding, "right", value, this._requestLayout); }
    paddingBottom(value? : number) : number { return getOrSet(this, "paddingBottom", this._padding, "bottom", value, this._requestLayout); }
    padding(padding : number) {
        if (padding !== undefined) {
            this.paddingLeft(padding);
            this.paddingTop(padding);
            this.paddingRight(padding);
            this.paddingBottom(padding);
        }
    }
    
    scrollToX(value : number, duration : number = 100, interpolator : Interpolator = null) { 
        this._scrollArea.scrollToX(value, duration, interpolator);
        this.requestDraw();
    }
    
    scrollToY(value : number, duration : number = 100, interpolator : Interpolator = null) { 
        this._scrollArea.scrollToY(value, duration, interpolator);
        this.requestDraw();
    }
    
    scrollingX(value? : number) : number { return getOrSet(this, "scrollingX", this._scrollArea, "scrollingX", value, this._requestDraw); }
    scrollingY(value? : number) : number { return getOrSet(this, "scrollingY", this._scrollArea, "scrollingY", value, this._requestDraw); }
    scrollableX(value? : boolean) : boolean { return getOrSet(this, "scrollableX", this._scrollArea, "scrollableX", value, this._requestDraw); }
    scrollableY(value? : boolean) : boolean { return getOrSet(this, "scrollableY", this._scrollArea, "scrollableY", value, this._requestDraw); }
    scrollable(value : boolean) {
        if (value !== undefined) {
            this.scrollableX(value);
            this.scrollableY(value);
        }
    }
    
    onFlingXEnd() { }
    onFlingYEnd() { }
    
    clickable(value? : boolean) : boolean { return getOrSet(this, "clickable", this, "_clickable", value, this._requestDraw); }
    
    //States
    enabled(value? : boolean) : boolean { return getOrSet(this, "enabled", this, "_enabled", value, this._requestDraw); }
    pressed(value? : boolean) : boolean { return getOrSet(this, "pressed", this, "_pressed", value, this._requestDraw); }
    hovering(value? : boolean) : boolean { return getOrSet(this, "hovering", this, "_hovering", value, this._requestDraw); }
    selected(value? : boolean) : boolean { return getOrSet(this, "selected", this, "_selected", value, this._requestDraw); }
    
    visibility(value? : Visibility) : Visibility {
        var oldValue = this._visibility;
        var result = getOrSet(this, "visibility", this, "_visibility", value, this._requestDraw);
        if ((oldValue !== value) && (oldValue == Visibility.Gone || value == Visibility.Gone)) {
            //TODO what about when intercepting view goes invisible?
            this._requestLayout();
        }
        return result;
    }
    
    visible() : boolean { return this._visibility === Visibility.Visible; }

    zIndex(value? : boolean) : boolean { return getOrSet(this, "zIndex", this, "_zIndex", value, this._requestDraw); }
    
    focused() : boolean { return this === this._app.getFocusView(); } //TODO make real property with onChanged etc.
    
    clipChildren(clip? : boolean) { return getOrSet(this, "clipChildren", this, "_clipChildren", clip, this._requestDraw); }

    clipTextFast(clip? : boolean) : boolean { return getOrSet(this, "clipTextFast", this, "_clipTextFast", clip, this._requestDraw); }
    
    children() : View[] { return this._children; }
    
    background(value? : Drawable) : Drawable { return getOrSet(this, "background", this, "_background", value, this._requestDraw); }
    
    id(value? : string) : string { return getOrSet(this, "id", this, "_id", value); }
    
    parent() : View { return this._parent; }
    
    app() : Application { return this._app; }
    
    rect() : Rect { return this._marginRect; }
    
    theme() : Theme { return this._theme; }
    
    animation() : Animation { return this._animation; }
    
    requestLayout() {
        if (this._app && this._blockLayout === 0) {
            this._app.requestLayout();
        }
    }
    
    requestDraw() {
        if (this._app) {
            this._app.requestDraw();
        }
    }
    
    inflate(layout : LayoutData, index : number = -1) : View {
        var inflater = new Inflater(); //TODO creates garbage
        var child = inflater.inflate(layout, this);
        if (index >= 0 && index <= this._children.length) {
            this._children.splice(this._children.indexOf(child), 1);
            this._children.splice(index, 0, child);
        }
        return child;
    }
    
    postEvent(callback : Function, cancellable : boolean = true) {
        this._app.postEvent(new ViewEvent(this, callback, cancellable));
    }

    stopAnimation() { //TODO rename to just animation()?
        if (this._animation) {
            this._animation.stop();
            this._animation = null;
        }
    }
    
    destroyChildren() {
        var children = this._children.slice(0);
        for (var i=0; i < children.length; ++i) {
            children[i].destroy();
        }
        this.requestLayout();
    }
    
    destroy() {
        this.destroyChildren();
        
        //Must have a parent, root view should never be destroyed.
        this._parent.removeChild(this);
    
        this.stopAnimation();
    
        this._app._handleViewClose(this);
    
        this.requestLayout();
        
        this._app = null;
        //TODO destroy anchors etc.?
    }
    
    destroyed() : boolean { return this._app === null; }
    
    addChild(child : View, index : number = -1) {
        if (child._parent !== null) {
            throw new Error("Can't add view with existing parent");
        }
        child._reparent(this, index);
    }
    
    removeChild(child : View) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child._parent = null;
            this.requestLayout();
        }
        else {
            Log("Can't remove child");
        }
    }
    
    _reparent(parent : View, index : number = -1) {
        if (this._parent) {
            //TODO remove from old parent.
        }
    
        if (parent) {
            this._parent = parent;
            this._app = parent._app;
            
            if (index === -1) {
                index = this._parent._children.length;
            }
            this._parent._children.splice(index, 0, this);
            
            this.requestLayout();
        }
    }
    
    _clampWidth(width : number) : number {
        return MathUtils.clamp(width, this._minWidth, this._maxWidth);
    }
    
    _clampHeight(height : number) : number {
        return MathUtils.clamp(height, this._minHeight, this._maxHeight);
    }

    _updateRects() {
        var bind = this._bind;
        var x = this._rect.x;
        var y = this._rect.y;
        var w = this._rect.width;
        var h = this._rect.height;
        
        var leftMargin = 0;
        var topMargin = 0;
        var rightMargin = 0;
        var bottomMargin = 0;
        
        var leftPadding = this._padding.left;
        var topPadding = this._padding.top;
        var rightPadding = this._padding.right;
        var bottomPadding = this._padding.bottom;

        //X position
        if (bind.left.isSet()) {
            x = bind.left.x;
            leftMargin += this._margins.left;
            rightMargin += this._margins.left;
        }
        
        //Width
        if (bind.right.isSet()) {
            w = bind.right.x - x;
            rightMargin -= this._margins.right;
            if (!bind.left.isSet()) {
                w = this._rect.width;
                x = bind.right.x - w;
                leftMargin -= this._margins.right;
            }
            else {
                rightMargin -= this._margins.left;
            }
        }
        
        //Y position
        if (bind.top.isSet()) {
            y = bind.top.y;
            topMargin += this._margins.top;
            bottomMargin += this._margins.top;
        }
        
        //Height
        if (bind.bottom.isSet()) {
            h = bind.bottom.y - y;
            bottomMargin -= this._margins.bottom;
            if (!bind.top.isSet()) {
                h = this._rect.height;
                y = bind.bottom.y - h;
                topMargin -= this._margins.bottom;
            }
            else {
                bottomMargin -= this._margins.top;
            }
        }
        
        //Width and height before applying any weights.
        var preWidth = w;
        var preHeight = h;
        
        //Left weight
        if (bind.left.isSet()) {
            var leftCut = ((preWidth / 2) * (1 - bind.leftWeight));
            x = x + leftCut;
            w = preWidth - leftCut;
        }
        
        //Right weight
        if (bind.right.isSet()) {
            var rightCut = ((preWidth / 2) * (1 - bind.rightWeight));
            w = w - rightCut;
        }

        //Top weight
        if (bind.top.isSet()) {
            var topCut = ((preHeight / 2) * (1 - bind.topWeight));
            y = y + topCut;
            h = preHeight - topCut;
        }
        
        //Bottom weight
        if (bind.bottom.isSet()) {
            var bottomCut = ((preHeight / 2) * (1 - bind.bottomWeight));
            h = h - bottomCut;
        }
        
        //Centering
        if (bind.centerHorizontal.isSet()) {
            x = bind.centerHorizontal.view._marginRect.centerX() - w / 2;
            leftMargin = 0;
            rightMargin = 0;
        }
        if (bind.centerVertical.isSet()) {
            y = bind.centerVertical.view._marginRect.centerY() - h / 2;
            topMargin = 0;
            bottomMargin = 0;
        }
        if (bind.center.isSet()) {
            x = bind.center.view._marginRect.centerX() - w / 2;
            y = bind.center.view._marginRect.centerY() - h / 2;
            leftMargin = 0;
            topMargin = 0;
            rightMargin = 0;
            bottomMargin = 0;
        }
        
        if (this._visibility === Visibility.Gone) {
            if (bind.centerHorizontal.isSet()) {
                x = x + w / 2;
            }
            if (bind.centerVertical.isSet()) {
                y = y + h / 2;
            }
            w = 0;
            h = 0;
            leftMargin = 0;
            topMargin = 0;
            rightMargin = 0;
            bottomMargin = 0;
        }
        
        var baseWidth = w - (leftMargin - rightMargin);
        var clampedWidth = this._clampWidth(baseWidth);
        if (R(baseWidth) !== R(clampedWidth) && clampedWidth > 0) {
            x += this._adjustClampedX(x, baseWidth, clampedWidth);
        }
        
        var baseHeight = h - (topMargin - bottomMargin);
        var clampedHeight = this._clampHeight(baseHeight);
        if (R(baseHeight) !== R(clampedHeight) && clampedHeight > 0) {
            y += this._adjustClampedX(y, baseHeight, clampedHeight);
        }
        
        //TODO margin can change, but layout is not updated if other parameters stay the same?!
        this._marginRect.x = x + leftMargin;
        this._marginRect.y = y + topMargin;
        this._marginRect.width = clampedWidth;
        this._marginRect.height = clampedHeight;
        
        //TODO adjust margin x and y if size clamped and bindings in bottom or right? 
        
        this._paddingRect.x = this._marginRect.x + leftPadding;
        this._paddingRect.y = this._marginRect.y + topPadding;
        this._paddingRect.width = this._marginRect.width - (leftPadding + rightPadding);
        this._paddingRect.height = this._marginRect.height - (topPadding + bottomPadding);
        
        this.x(x);
        this.y(y);
        this.width(w);
        this.height(h);
    }
    
    _adjustClampedX(x : number, baseWidth : number, clampedWidth : number) : number {
        var bind = this._bind;
        var adjust = 0;
        
        if (bind.center.isSet() || bind.centerHorizontal.isSet()) {
            adjust = (baseWidth - clampedWidth) / 2;
        }
        else if (!bind.left.isSet() && bind.right.isSet()) {
            adjust = -(clampedWidth - baseWidth) * bind.rightWeight;
        }
        else if (bind.left.isSet() && bind.right.isSet()) {
            adjust = -(clampedWidth - baseWidth) / 2 * (bind.leftWeight * bind.rightWeight);
        }
        return adjust;
    }
    
    _adjustClampedY(y : number, baseHeight : number, clampedHeight : number) : number {
        var bind = this._bind;
        var adjust = 0;
        
        if (bind.center.isSet() || bind.centerVertical.isSet()) {
            adjust = (baseHeight - clampedHeight) / 2;
        }
        else if (!bind.top.isSet() && bind.bottom.isSet()) {
            adjust = -(clampedHeight - baseHeight) * bind.bottomWeight;
        }
        else if (bind.top.isSet() && bind.bottom.isSet()) {
            adjust = -(clampedHeight - baseHeight) / 2 * (bind.topWeight * bind.bottomWeight);
        }
        return adjust;
    }
    
    _isChildContent(child : View) : boolean {
        var ok = (child._visibility !== Visibility.Gone);
        if (ok && this._measureChildMargins) {
            ok = !child._bind.isAnySet();
        }
        return ok;
    }
    
    onGetContentRect() : Rect {
        var margins = this._measureChildMargins;
        var left = this._marginRect.x;
        var top = this._marginRect.y;
        var right = this._paddingRect.x + this._text.width(); //No right pad for text
        var bottom = this._paddingRect.y + this._text.height() + this._padding.bottom;
        
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (this._isChildContent(child)) {
                var r = child._marginRect; //TODO ONLY CONSIDER IMMEDIATE CHILD CONTENT?
                left = Math.min(left, r.x - (margins ? child.marginLeft() : 0));
                top = Math.min(top, r.y - (margins ? child.marginTop() : 0));
                right = Math.max(right, r.right() + (margins ? child.marginRight() : 0));
                bottom = Math.max(bottom, r.bottom() + (margins ? child.marginBottom() : 0));
            }
        }
        
        this._contentRect.x = left;
        this._contentRect.y = top;
        this._contentRect.width = right - left;
        this._contentRect.height = bottom - top;
        return this._contentRect;
    }
    
    _updateContentRect() {
        this._contentRect = this.onGetContentRect();
    }
    
    _addYPaddingY(value : number) {
        return value + this._padding.top + this._padding.bottom;
    }
    
    _computeChildrenBounds(views : View[], contentBottom : number = null) : Rect {
        var left = null;
        var top = null;
        var right = null;
        var bottom = null;
        for (var i=0; i < views.length; ++i) {
            var view = views[i];
            if (this._isChildContent(view)) {
                var r = view._marginRect;
                var x = view.marginLeft() + view.marginRight();
                var y = view.marginTop() + view.marginBottom();
                
                left = (left !== null) ? Math.min(left, r.x) : r.x;
                top = (top !== null) ? Math.min(top, r.y) : r.y;
                right = (right !== null) ? Math.max(right, r.right() + x) : r.right() + x;
                bottom = (bottom !== null) ? Math.max(bottom, r.bottom() + y) : r.bottom() + y;
            }
        }
        
        if (left === null) {
            //No visible children
            return null;
        }
        else {
            if (contentBottom !== null) {
                bottom = Math.max(bottom, contentBottom);
            }
            return new Rect(left, top, right - left, bottom - top);
        }
    }
    
    onGetContentSize() : Rect {
        //TODO empty layouts have always height if wrapHeight...
        var textWidth = this._padding.left + this._text.width(); //No right pad for text
        var textHeight = this._addYPaddingY(this._text.height());
        
        var content = this._computeChildrenBounds(this._children, this._paddingRect.y + textHeight);
        if (content) {
            return content;
        }
        else {
            return new Rect(0, 0, Math.max(this._marginRect.width, textWidth), textHeight);
        }
    }
    
    _layoutText() {
        this._text.onLayout(this._paddingRect);
    }
    
    _updateScrollArea() {
        this._scrollArea.onLayout(this._marginRect, this._contentRect);
    }
    
    onLayout(state : LayoutState) {
        this._updateRects();
        
        this._anchors.update();
        
        if (this._visibility === Visibility.Gone) {
            return;
        }
        
        this._layoutText();
        
        for (var i=0; i < this._children.length; ++i) {
            this._children[i].onLayout(state.copy());
        }
        this._updateContentRect();
        
        if (this._wrapWidth || this._wrapHeight) {
            var content = this.onGetContentSize();
            if (content) {
                if (this._wrapWidth) {
                    this.width(this._clampWidth(content.width)); 
                }
                if (this._wrapHeight) {
                    this.height(this._clampHeight(content.height)); 
                }
            }
        }
        
        this._updateScrollArea();
    }
    
    onLayoutReady() {
        //Empty
    }
    
    _toRadians(value : number) : number {
        return value * Math.PI / 180; //TODO to MathUtils
    }
    
    //TODO accept var args?
    findView(id : string) : View {
        return this._walkViews((view : View) => { return view._id === id; });
    }
    
    $find(id : string) : View {
        return this._app.root.findView(id);
    }
    
    _walkViews(callback : any) : View {
        if (callback(this)) {
            return this;
        }
        for (var i=0; i < this._children.length; ++i) {
            var result = this._children[i]._walkViews(callback);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
    
    _updateViewState(state : ViewState) {
        state.enabled = state.enabled && this._enabled;
        state.pressed = this._pressed;
        state.focused = this.focused();
        state.hovering = this._hovering;
        state.selected = this._selected;
        //Boungin box was updated earlier.
    }
    
    _pushViewTranslation(state : ViewState) {
        state.renderer.saveTransform();
        this._applyScrollTranslation(state);
    }
    
    _applyScrollTranslation(state : ViewState) {
        state.renderer.translate(this._scrollArea.translationX(), this._scrollArea.translationY());
    }
    
    onTransform(transform : Transform) : Transform {
        return transform;
    }
    
    _pushViewTransform(state : ViewState) {
        var newTransform = this.onTransform(this._transform);
        state.renderer.pushTransformRect(newTransform, this._marginRect);
    }
    
    _pushViewTransformAndTestHit(state : ViewState) : boolean {
        this._pushViewTransform(state);
        
        var valid = this._updateBBoxAndTestIntersection(state);
        
        if (valid && this._clipChildren && state.reason === WalkReason.HitTest) {
            //Used only in hit testing, stop if the point is outside view area.
            var mr = this._marginRect;
            if (!state.renderer.hitTestRect(state.x, state.y, mr.x, mr.y, mr.width, mr.height)) {
                valid = false;
            }
        }
        
        if (!valid) {
            //Undo the transform we needed to make for testing.
            state.renderer.popTransform();
        }
        return valid;
    }
    
    
    _updateBBoxAndTestIntersection(state : ViewState) : boolean {
        var bbox = new Rect(0, 0, 0, 0);
        state.renderer.transformRectToAABB(this._marginRect, bbox);
        var overlaps = bbox.overlaps(state.bbox);
        if (this._parent === null || this._clipChildren) {
            bbox.intersection(state.bbox);
            if (bbox.isEmpty()) {
                overlaps = false;
            }
            state.bbox = bbox;
        }
        return overlaps;
    }
    
    _walkViewTransformChildren(state : ViewState, preCallback : any, 
            postCallback? : any, preChildCallback? : any, postChildCallback? : any) : View {
        //Sort must be stable. TODO crates a lot garbage, could precompute.
        var children = Sort.stable(this._children, function(a : View, b : View) : number {
            return a._zIndex - b._zIndex;
        });
        
        if (state.reason !== WalkReason.Draw) {
            //Draw in reverse order to visualize the real event receiving order to the user.
            children.reverse();
        }

        var resultView = null;
        for (var i=0; i < children.length; ++i) {
            resultView = children[i]._walkViewTransform(state.copy(), preCallback, 
                postCallback, preChildCallback, postChildCallback);
            if (resultView !== null) {
                break;
            }
        }
        return resultView;
    }
    
    _walkViewTransform(state : ViewState, preCallback : any, postCallback? : any, 
            preChildCallback? : any, postChildCallback? : any) : View {
        if (this._visibility !== Visibility.Visible) {
            return null;
        }
        if (state.reason === WalkReason.HitTest && !this._enabled) {
            return null;
        }
    
        var renderer = state.renderer;
        var mr = this._marginRect;
        
        if (!this._pushViewTransformAndTestHit(state)) {
            return null;
        }
        Counters.ViewsDrawn++;
        
        var pushAlpha = (state.reason === WalkReason.Draw) && (this._transform.alpha < 1);
        if (pushAlpha) {
            renderer.pushAlpha(this._transform.alpha);
        }
        
        this._updateViewState(state);
        
        var resultView = null;
    
        if (preCallback && preCallback(this, state)) {
            resultView = this;
        }
    
        if (resultView === null) {
            renderer.saveTransform();
            
            var pushClip = this._clipChildren && state.reason === WalkReason.Draw;
            if (pushClip) {
                renderer.pushClipRect(mr.x, mr.y, mr.width, mr.height);
            }
            this._applyScrollTranslation(state);
        
            if (preChildCallback) {
                //Only for visiting / drawing.
                preChildCallback(this, state);
            }
            
            resultView = this._walkViewTransformChildren(state.copy(), 
                preCallback, postCallback, preChildCallback, postChildCallback);
            
            if (resultView === null && postChildCallback) {
                if (postChildCallback(this, state)) {
                    resultView = this;
                }
            }
            renderer.popTransform();
            if (pushClip) {
                renderer.popClipRect();
            }
            
            if (resultView === null && postCallback) {
                if (postCallback(this, state)) {
                    resultView = this;
                }
            }
        }
        if (pushAlpha) {
            renderer.popAlpha();
        }
        renderer.popTransform();
        
        return resultView;
    }
    
    _transformPointInverse(x : number, y : number) : Point {
        return this._app.renderer.transformPointInverse(x, y);
    }
    
    _debugDraw(state : ViewState) {
        var r = this._rect;
        var mr = this._marginRect;
        var pr = this._paddingRect;
        state.renderer.strokeRect(r.x, r.y, r.width, r.height, Color.Black);
        state.renderer.strokeRect(mr.x, mr.y, mr.width, mr.height, Color.Red);
        state.renderer.strokeRect(pr.x, pr.y, pr.width, pr.height, Color.Green);
        
        var bbox = state.bbox; 
        state.renderer.saveTransform();
        state.renderer.setIdentity();
        state.renderer.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height, Color.Black);
        state.renderer.popTransform();
    }
    
    _onUpdate() {
        if (this._animation) {
            this._animation._onUpdateAnimation();
        }
    }
    
    onDraw(state : ViewState) {
        if (this._background) {
            this._background.draw(state, this._marginRect);
        }
        //this._debugDraw(state);
    }
    
    onDrawTop(state : ViewState) {
        if (this._scrollArea.canScroll()) {
            this._scrollArea.onDraw(state, this._marginRect);
            if (this._scrollArea.isScrolling()) {
                this.requestDraw();
            }
        }
    }
    
    onDrawPreChildren(state : ViewState) {
        this._text.drawText(state, this.focused(), this._scrollArea.translationY(), this._clipTextFast);
    }
    
    _onDrawWalk(startState : ViewState) {
        this._walkViewTransform(startState, 
            (view : View, state : ViewState) => {
                view.onDraw(state);
            }, 
            (view : View, state : ViewState) => {
                view.onDrawTop(state);
            }, 
            (view : View, state : ViewState) => {
                view.onDrawPreChildren(state);
        });
    }
    
    onGetHitRect() : Rect {
        return this._marginRect;
    }
    
    onHitTest(state : ViewState, x : number, y : number) : HitArea {
        var r = this.onGetHitRect();
        if (state.renderer.hitTestRect(x, y, r.x, r.y, r.width, r.height)) {
            return HitArea.Client;
        }
        return HitArea.None;
    }
    
    onInterceptInputEvent(state : ViewState, event : InputEvent) : boolean {
        var handled = false;
        var eventType = event.type;
        if (eventType === InputType.MouseMove || eventType == InputType.MouseDown || eventType === InputType.MouseUp) {
            //Check the scrolling button interception. We are in the scrollbar owning view's transformation,
            //so there is no need to adjust event (x, y) positions.
            if (this._scrollArea.onInterceptInputEvent(this, this._app.renderer, event, this._marginRect)) {
                handled = true;
                
                if (eventType === InputType.MouseMove && this._scrollArea.scrollState() === ScrollerState.Dragging) {
                    //We are scrolling, steal the focus to avoid accidental clicks to child views.
                    this._app._setFocusView(this);
                    this._text.clearSelection();
                }
                this.requestDraw(); //TODO slow?
            }
            else {
                if (this._app._stopIntercept(this)) {
                    this.requestDraw(); //TODO slow?
                }
            }
        } 
        return handled;
    }
    
    _updateDoubleDownEventTime(event : InputEvent) : boolean {
        var isDoubleEvent = false;
        var time = Date.now();
        if (Math.abs(this._lastClickTime - time) < Config.DOUBLE_CLICK_TIME_MS) {
            isDoubleEvent = true;
        }
        this._lastClickTime = time;
        return isDoubleEvent;
    }

    onInputDown(event : InputEvent) : boolean {
        var isDoubleEvent = this._updateDoubleDownEventTime(event);
    
        var handled = false;
        if (isDoubleEvent) {
            handled = this.onInputDoubleDown(event);
        }

        if (!handled) {
            handled = this._text.onInputDown(event, this, isDoubleEvent);
        }
        
        if (!handled && this._clickable) {
            this.pressed(true);
            this._clickStarted = true;
        }
        return this._clickable || handled;
    }
    
    onInputDoubleDown(event : InputEvent) : boolean {
        return false;
    }
    
    onInputUp(event : InputEvent) : boolean {
        this.pressed(false);
    
        var handled = this._text.onInputUp(event, this);
        
        if (this._clickStarted) {
            this._clickStarted = false;
            this.onClick(event);
        }
        return this._clickable || handled;
    }
    
    onInputMove(event : InputEvent) : boolean {
        if (this._text.onInputMove(event, this)) {
            return true;
        }
        return this._clickable;
    }
    
    onInputScroll(event : InputEvent) : boolean {
        var handled = false;
        if (this._scrollArea.canScroll()) {
            handled = this._scrollArea.onInputScroll(this._app.renderer, 
                event, this._marginRect, this.focused());
            if (handled) {
                this.requestDraw(); //TODO slow...
            }
        }
        return handled;
    }
    
    onClick(event : InputEvent) {
        //Empty
    }
    
    onKeyDown(event : KeyEvent) : boolean {
        return false;
    }
    
    onKeyUp(event : KeyEvent) : boolean {
        return false;
    }
    
    onKeyPress(event : KeyEvent) : boolean {
        return false;
    }
    
    onGainFocus() { //TODO no need, use onXXChanged

    }
    
    onLoseFocus() {
        this.pressed(false);
        this._clickStarted = false;
        this._text.clearSelection();
        this._text._stopClicking();
        //this._scrollArea.stopScroll();
    }
    
    onHoverStart() {
        this.hovering(true);
        if (this._clickStarted) {
            this.pressed(true);
        }
    }
    
    onHoverEnd() {
        this.hovering(false);
        this.pressed(false);
        
        if (this._scrollArea.canScroll()) {
            this._scrollArea.clearVisualState();
            this.requestDraw();
        }
    }
    
    onInflate() {
        //Empty
    }
    
    hook(method : Function, callback : Function);
    hook(method : string, callback : Function);
    hook(method : any, callback : Function) {
        HookHelper.hookMethod(this, method, callback);
    }
    
    unhook(method : Function, callback : Function);
    unhook(method : string, callback : Function);
    unhook(method : any, callback : Function) {
        HookHelper.unhookMethod(this, method, callback);
    }
}

