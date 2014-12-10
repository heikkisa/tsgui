/// <reference path="view.ts" />

class SliderThumb {
    public value : number = 0;
    public minValue : number = 0;
    public maxValue : number = 100;
    public dragged : boolean = false;
    public hovering : boolean = false;
    public background : Drawable = EmptyDrawable.Shared;
    public selection : Drawable = EmptyDrawable.Shared;
    public thumb : Drawable = EmptyDrawable.Shared; //TODO allow null
    
    setValue(value : number) : number {
        this.value = Math.min(Math.max(value, this.minValue), this.maxValue);
        return this.value;
    }
}

class Slider extends View {
    private _tempRect : Rect = new Rect(0, 0, 0, 0);
    private _thumbs : SliderThumb[] = [];
    private _dragOffsetX : number = 0;
    private _thumbWidth : number = null;
    private _thumbHeight : number = null;
    private _barSize : number = null;

    constructor(parent : View) {
        super(parent);
        
        this._thumbWidth = this._theme.sliderThumbWidth;
        this._thumbHeight = this._theme.sliderThumbHeight;
        this._barSize = this._theme.sliderBarSize;
        
        var thumb = this.createDefaultThumb();
        this.addThumb(thumb);
        
        this.background(this._theme.createSliderBackground());
        this.padding(this._theme.sliderPadding);
        this.wrapHeight(true);
    }
    
    thumbs() : SliderThumb[] { return this._thumbs; }
    
    value(value? : number) : number { 
        return getOrSet(this, "value", this._thumbs[0], "value", this._clampValueAt(0, value), this._requestDraw); 
    }
    minValue(value? : number) : number { 
        return getOrSet(this, "minValue", this._thumbs[0], "minValue", value, this._requestDraw); 
    } 
    maxValue(value? : number) : number { 
        return getOrSet(this, "maxValue", this._thumbs[0], "maxValue", value, this._requestDraw); 
    } 
 
    valueAt(index : number, value? : number) : number { 
        return getOrSet(this, "valueAt", this._thumbs[index], "value", this._clampValueAt(index, value), this._requestDraw); 
    }
    minValueAt(index : number, value? : number) : number { 
        return getOrSet(this, "minValue", this._thumbs[index], "minValue", value, this._requestDraw); 
    } 
    maxValueAt(index : number, value? : number) : number { 
        return getOrSet(this, "maxValue", this._thumbs[index], "maxValue", value, this._requestDraw); 
    } 
    
    addThumb(thumb : SliderThumb) {
        this._thumbs.push(thumb);
        this.requestDraw();
    }
    
    createDefaultThumb() : SliderThumb {
        var thumb = new SliderThumb();
        thumb.value = 0;
        thumb.minValue = 0;
        thumb.maxValue = 100;
        thumb.background = this._theme.createSliderBarBackground();
        thumb.selection = this._theme.createSliderBarSelection();
        thumb.thumb = this._theme.createSliderBarThumb();
        return thumb;
    }
    
    _clampValueAt(index : number, value : number) : number {
        if (value === undefined) {
            return value;
        }
        else {
            return this._clampValue(this._thumbs[index], value);
        }
    }
    
    _clampValue(thumb : SliderThumb, value : number) : number {
        return R(Math.min(Math.max(value, thumb.minValue), thumb.maxValue));
    }
    
    _computeRelativeValue(thumb : SliderThumb) : number {
        return (thumb.value - thumb.minValue) / (thumb.maxValue - thumb.minValue);
    }
    
    _computeAbsoluteValue(thumb : SliderThumb, x : number, y : number) : number {
        var pr = this._paddingRect;
        var relativePos = (x - pr.x) / pr.width;
        return this._clampValue(thumb, thumb.minValue + relativePos * (thumb.maxValue - thumb.minValue));
    }
    
    _computeThumbRect(thumb : SliderThumb) : Rect {
        var pr = this._paddingRect;
        var x = (pr.x + pr.width * this._computeRelativeValue(thumb)) - this._thumbWidth / 2;
        var y = pr.centerY() - this._thumbHeight / 2;
        this._tempRect.set(x, y, this._thumbWidth, this._thumbHeight);
        return this._tempRect;
    }
    
    _computeThumbHeight(thumb : SliderThumb) : number {
        var height = 0;
        if (thumb.background.hasSize()) {
            height = Math.max(thumb.background.height);
        }
        if (thumb.selection.hasSize()) {
            height = Math.max(thumb.selection.height);
        }
        if (thumb.thumb.hasSize()) {
            height = Math.max(thumb.thumb.height);
        }
        return height;
    }
    
    onGetContentSize() : Rect {
        var content = super.onGetContentSize();
        var pad = this._addYPaddingY(0);
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            content.height = Math.max(content.height, this._computeThumbHeight(thumb) + pad);
        }
        return content;
    }
    
    _updateThumbViewState(state : ViewState, thumb : SliderThumb) {
        state.pressed = thumb.dragged;
        state.focused = false;
        state.hovering = thumb.hovering;
        state.selected = false;
    }
    
    _computeSliderVisualRect(out : Rect) {
        this._paddingRect.copyTo(out);
        out.y = out.centerY() - this._barSize / 2;
        out.height = this._barSize;
    }
    
    onDraw(state : ViewState) {
        super.onDraw(state);
        
        var thumbState = state.copy();
        
        for (var i=this._thumbs.length - 1; i >= 0; --i) {
            var thumb = this._thumbs[i];
            this._updateThumbViewState(thumbState, thumb);
            this._computeSliderVisualRect(this._tempRect);
            thumb.background.draw(thumbState, this._tempRect);
        }
        
        for (var i=this._thumbs.length - 1; i >= 0; --i) {
            var thumb = this._thumbs[i];
            this._updateThumbViewState(thumbState, thumb);
            this._computeSliderVisualRect(this._tempRect);
            this._tempRect.width *= this._computeRelativeValue(thumb); 
            thumb.selection.draw(thumbState, this._tempRect);
        }
      
        for (var i=this._thumbs.length - 1; i >= 0; --i) {
            var thumb = this._thumbs[i];
            this._updateThumbViewState(thumbState, thumb);
            var thumbRect = this._computeThumbRect(thumb);
            thumb.thumb.draw(thumbState, thumbRect);
        }
    }
    
    _isDragged() : boolean {
        for (var i=0; i < this._thumbs.length; ++i) {
            if (this._thumbs[i].dragged) {
                return true;
            }
        }
        return false;
    }
    
    onInterceptInputEvent(state : ViewState, event : InputEvent) : boolean {
        if (event.type === InputType.MouseMove && this._isDragged()) {
            return this.onInputMove(event);
        }
        return false;
    }
    
    onInputDown(event : InputEvent) : boolean {
        var handled = false;
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            var rect = this._computeThumbRect(thumb);
            if (this._app.renderer.hitTestRect(event.x, event.y, rect.x, rect.y, rect.width, rect.height)) {
                thumb.dragged = true;
                
                var thumbCenter = this._transformPointInverse(this._computeThumbRect(thumb).centerX(), 0).x;
                var p = this._transformPointInverse(event.x, 0);
                this._dragOffsetX = thumbCenter - p.x;
                
                handled = true;
                this.requestDraw();
                break;
            }
        }
        
        if (!handled) {
            var thumb = this._thumbs[0]; //Pick first. TODO pick first that has valid range
            var pr = this._paddingRect;
            if (this._app.renderer.hitTestRect(event.x, event.y, pr.x, pr.y, pr.width, pr.height)) {
                var p = this._transformPointInverse(event.x, event.y);
                var newValue = this._computeAbsoluteValue(thumb, p.x, p.y);
                this.value(newValue);
                handled = true;
            }
        }
        
        if (handled) {
            this.app()._startIntercept(this);
        } 
        return handled;
    }
    
    onInputUp(event : InputEvent) : boolean {
        this._stopDrag();
        return super.onInputUp(event);
    }
    
    onInputMove(event : InputEvent) : boolean {
        var handled = false;
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            if (thumb.dragged) {
                var p = this._transformPointInverse(event.x , event.y);
            
                var newValue = this._computeAbsoluteValue(thumb, p.x , event.y);
                if (this._thumbs.length > 1) {
                    this.valueAt(i, newValue);
                }
                else {
                    this.value(newValue); 
                }
            
                handled = true;
                //this.requestDraw();
                break;
            }
        }
        
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            var rect = this._computeThumbRect(thumb);
            if (this._app.renderer.hitTestRect(event.x, event.y, rect.x, rect.y, rect.width, rect.height)) {
                thumb.hovering = true;
                this.requestDraw();
            }
            else if (thumb.hovering) {
                thumb.hovering = false;
                this.requestDraw();
            }
        }
        
        return handled;
    }
    
    onInputScroll(event : InputEvent) : boolean {
        if (this._thumbs.length === 1) {
            var thumb = this._thumbs[0];
            this.value(thumb.value + event.scroll);
        }
        return true;
    }
    
    _stopHovers() {
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            if (thumb.hovering) {
                thumb.hovering = false;
                this.requestDraw();
            }
        }
    }
    
    _stopDrag() {
        for (var i=0; i < this._thumbs.length; ++i) {
            var thumb = this._thumbs[i];
            if (thumb.dragged) {
                thumb.dragged = false;
                this.requestDraw();
            }
        }
    }
    
    onLoseFocus() {
        super.onLoseFocus();
        
        this._stopHovers();
        this._stopDrag();
    }
    
}
