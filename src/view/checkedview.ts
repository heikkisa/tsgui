/// <reference path="view.ts" />

class CheckedView extends View {
    private _box : Drawable = null;
    private _marker : Drawable = null;
    private _tempRect : Rect = new Rect(0, 0, 0, 0);
    private _checked : boolean = false;
    public _textPad : number = null;
    public _allowUserUncheck : boolean = true;

    constructor(parent : View) {
        super(parent);
        
        this._textPad = this._theme.checkedViewPadding;

        this.padding(this._textPad);
        this.wrapHeight(true);
        this.textAlign(TextAlign.CenterVertical);
        this.textSelectable(false);
    }
    
    checked(value? : boolean) : boolean { return getOrSet(this, "checked", this, "_checked", value, this._requestDraw); }
    
    checkBackground(value? : Drawable) : Drawable { return getOrSet(this, "checkBackground", this, "_box", value, this._requestLayout); }
    checkMarker(value? : Drawable) : Drawable { return getOrSet(this, "checkMarker", this, "_marker", value, this._requestLayout); }
    
    onGetContentSize() : Rect {
        var content = super.onGetContentSize();
        if (this._box && this._box.hasSize()) {
            content.height = Math.max(content.height, this._box.height + this._textPad * 2);
        }
        return content;
    }
    
    _updateRects() {
        super._updateRects();
        
        var box = this._boxRect(this._box);
        this._paddingRect.x += box.width + this._textPad;
        this._paddingRect.width -= box.width + (this._textPad * 2);
    }
    
    _boxRect(drawable : Drawable) : Rect {
        var width = 0;
        var height = 0;
        if (drawable.hasSize()) {
            width = drawable.width;
            height = drawable.height;
        }
        else {
            var size = Math.min(this._paddingRect.width, this._paddingRect.height);
            width = size;
            height = size;
        }

        this._tempRect.x = this._paddingRect.x - width - this._textPad;
        this._tempRect.y = this._paddingRect.y;
        this._tempRect.width = width;
        this._tempRect.height = height;
        return this._tempRect;
    }
    
    onClick(event : InputEvent) {
        if (this.checked() && !this._allowUserUncheck) {
            return;
        }
        this.checked(!this.checked());
    }

    onDraw(state : ViewState) {
        super.onDraw(state);
        
        var stateCopy = state.copy();
        stateCopy.selected = this._checked;
        
        var rect = this._boxRect(this._box);
        this._box.draw(stateCopy, rect);
        
        if (this._marker.hasSize()) {
            var xDelta = rect.width - this._marker.width;
            var yDelta = rect.height - this._marker.height;
            rect.x += xDelta;
            rect.y += yDelta;
            rect.width -= xDelta * 2;
            rect.height -= yDelta * 2;
        }
        else {
            //Just esimate some probably reasonable looking size.
            var estimated = Math.min(rect.width, rect.height);
            rect.adjust(estimated / 5.0);
        }
        this._marker.draw(stateCopy, rect);
    }
}
