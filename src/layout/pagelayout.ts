/// <reference path="layout.ts" />

class PageLayout extends Layout {
    public _snapChildren : boolean = true;
    public _snapDuration : number = 250;
    public _childWidth : number = 1.0;

    constructor(parent : View) {
        super(parent);
        
        this._scrollArea.buttonSize = 0;
        
        //this.scrollableY(false);
    }
    
    snapChildren(value? : boolean) : boolean {
        return getOrSet(this, "snapChildren", this, "_snapChildren", value, this._requestLayout);
    }
    
    snapDuration(value? : number) : number {
        return getOrSet(this, "snapDuration", this, "_snapDuration", value, this._requestDraw);
    }
    
    childWidth(value? : number) : number {
        return getOrSet(this, "childWidth", this, "_childWidth", value, this._requestLayout);
    }
    
    onGetContentRect() : Rect {
        var rect = super.onGetContentRect();
        if (rect.width > 0) {
            var pad = this._contentPadX();
            rect.x -= pad;
            rect.width += pad * 2;
        }
        rect.height += this._scrollBarSize();
        return rect;
    }
    
    onGetContentSize() : Rect {
        var size = super.onGetContentSize();
        size.height += this._scrollBarSize();
        return size;
    }
    
    _scrollBarSize() : number {
        if (this._children.length > 1) {
            return this._scrollArea.barSize;
        }
        return 0;
    }
    
    _stop() {
        this._repositionCurrentScroll(this._snapDuration);
    }
    
    onLoseFocus() {
        super.onLoseFocus();
        
        this._stop();
    }
    
    onLayoutChildren() {
        var barSize = this._scrollBarSize();
        var x = this._marginRect.x;
        var y = this._marginRect.y;
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (child._visibility === Visibility.Gone) { //TODO isChildContent() etc.
                continue;
            }
            var w = this._marginRect.width * this._childWidth;
            
            child.x(x + child.marginLeft());
            child.y(y + child.marginTop());
            child.width(w - child.marginLeft() - child.marginRight());
            if (child.wrapHeight()) {
                child.height(child._clampHeight(child.height()));
            }
            else {
                child.height(child._clampHeight(this._marginRect.height - barSize - child.marginTop() - child.marginBottom()));
            }
            
            x += w + child.marginRight();
        }
    }
    
    _contentPadX() : number {
        return ((1 - this._childWidth) * (this._marginRect.width / 2));
    }
    
    _getScrollingViewIndex() : number {
        var x = this._marginRect.centerX();
        var scrollingX = this.scrollingX();
    
        var closestDistance = null;
        var closest = null;
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (child.visibility() === Visibility.Visible) {
                var childX = child._marginRect.centerX() + scrollingX;
                var distance = Math.abs(childX - x);
                if (closest === null || distance < closestDistance) {
                    closestDistance = distance;
                    closest = i;
                }
            }
        }
        return closest;
    }
    
    scrollToChild(index : number, durationMs : number = 250) {
        if (index < 0 || index >= this._children.length) {
            return;
        }
        var child = this._children[index];
        var scrollX = (this._marginRect.x - child._marginRect.x) + child.marginLeft() + this._contentPadX();
        
        if (Math.floor(scrollX) !== Math.floor(this.scrollingX())) {
            //Scroll only if needed
            if (durationMs > 0) {
                this.scrollToX(scrollX, durationMs);
            }
            else {
                this.scrollingX(scrollX);
            }
        }
    }
    
    _repositionCurrentScroll(durationMs : number) {
        if (this._snapChildren) {
            var index = this._getScrollingViewIndex();
            if (index !== null) {
                this.scrollToChild(index, durationMs);
            }
        }
    }
    
    onInterceptInputEvent(state : ViewState, event : InputEvent) : boolean {
        var handled = super.onInterceptInputEvent(state, event);
        if (event.type === InputType.MouseUp && !this._scrollArea.isFlinging()) { //TODO or cancel
            this._stop();
        }
        return handled;
    }
    
    onInputScroll(event : InputEvent) : boolean {
        var index = this._getScrollingViewIndex();
        if (index !== null) {
            this.scrollToChild(index - event.scroll, this._snapDuration);
            return true;
        }
        return false;
    }
    
    _transformViews() { //TODO only change visible views
        var left = this._marginRect.x;
        var right = this._marginRect.right();
        var middle = this._marginRect.centerX();
        
        var scrollingX = this.scrollingX();
        
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (child.visibility() === Visibility.Visible) {
                var childX = child._marginRect.centerX() + scrollingX;
                var position = (childX - middle) / this._marginRect.width;
                
                if (position < -1.0) {
                    position = -1.0;
                }
                else if (position > 1.0) {
                    position = 1.0;
                }
                this.onTransformView(child, position);
            }
        }
    }
    
    onTransformView(view : View, position : number) {
    
    }
    
    onScrollingXChanged() {
        this._transformViews();
    }
    
    onFlingXEnd() {
        if (!this._scrollArea.isInteracting()) {
            this._repositionCurrentScroll(this._snapDuration);
        }
    }

    onLayoutReady() {
        super.onLayoutReady();
    
        if (!this._scrollArea.isInteracting()) {
            this._repositionCurrentScroll(0);
        }
        this._transformViews();
    }
}
