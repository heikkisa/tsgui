
interface ScrollListener {
    theme() : Theme;
    postEvent(callback : Function);
    requestDraw();

    scrollingX(value? : number) : number;
    scrollingY(value? : number) : number;

    onFlingXEnd();
    onFlingYEnd();
};

enum ScrollerState {
    Idle = 1,
    Preparing = 2,
    Dragging = 3,
    Flinging = 4
}

class Scroller {
    public baseX : number = 0;
    public baseY : number = 0;
    public startX : number = 0;
    public startY : number = 0;
    public currentX : number = 0;
    public currentY : number = 0;
    public dragStartTimestamp : number = 0;
    public flingTargetX : number = null;
    public flingStartX : number = null;
    public flingTargetY : number = null;
    public flingStartY: number = null;
    public flingStartTimestamp : number = 0;
    public flingDurationMs : number = 100;
    public flingInterpolator : Interpolator = null;
    public state : ScrollerState = ScrollerState.Idle;
    public listener : ScrollListener;
    
    constructor(listener : ScrollListener) {
        this.listener = listener;
    }
    
    prepareScroll(baseX : number, baseY : number, x : number, y : number) {
        this.stopScroll();
        
        this.baseX = baseX;
        this.baseY = baseY;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
        this.state = ScrollerState.Preparing;
    }
    
    stopScroll() {
        this.baseX = 0;
        this.baseY = 0;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0; 
        this.dragStartTimestamp = 0;
        this.stopFlingX();
        this.stopFlingY();
        this.flingStartTimestamp = 0;
        this.flingInterpolator = null;
        this.state = ScrollerState.Idle;
    }
    
    stopFlingX() {
        var oldVelocity = this.flingTargetX;
        this.flingTargetX = null;
        this.flingStartX = null;
        if (oldVelocity !== null) {
            this.listener.postEvent(() => {
                this.listener.onFlingXEnd();
            });
        }
    }
    
    stopFlingY() {
        var oldVelocity = this.flingTargetY;
        this.flingTargetY = null;
        this.flingStartY = null;
        if (oldVelocity !== null) {
            this.listener.postEvent(() => {
                this.listener.onFlingYEnd();
            });
        }
    }
    
    _computeFlingSpeed(start : number, end : number, duration : number) : number {
        var distance = (end - start) * 100;
        return distance / duration;
    }
    
    flingDuration(speedX : number, speedY : number) : number {
        return Math.max(Math.abs(speedX), Math.abs(speedY));
    }
    
    flingSpeedX() : number {
        var dragTime = Date.now() - this.dragStartTimestamp;
        return this._computeFlingSpeed(this.startX, this.currentX, dragTime);
    }
    
    flingSpeedY() : number {
        var dragTime = Date.now() - this.dragStartTimestamp;
        return this._computeFlingSpeed(this.startY, this.currentY, dragTime);
    }
    
    isFlingSpeedOk(speed : number) : boolean {
        return Math.abs(speed) > Config.SCROLL_MIN_FLING_SPEED;
    }
    
    deltaX() : number {
        return this.currentX - this.startX;
    }
    
    deltaY() : number {
        return this.currentY - this.startY;
    }
    
    translationX() : number {
        return this.baseX + this.deltaX();
    }
    
    translationY() : number {
        return this.baseY + this.deltaY();
    }
    
    scrollTo(x : number, y : number) {
        if (this.state === ScrollerState.Preparing) {
            var deltaX = x - this.startX;
            var deltaY = y - this.startY;
            var threshold = Config.SCROLL_TOUCH_THRESHOLD;
            
            if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                this.startX = x;
                this.startY = y;
                this.dragStartTimestamp = Date.now();
                this.state = ScrollerState.Dragging;
            }
        }
        if (this.state === ScrollerState.Dragging) {
            this.currentX = x;
            this.currentY = y;
        }
    }
    
    _interpolate(from : number, to : number, mod : number) : number {
        return from + mod * (to - from);
    }
    
    _flingMod() : number {
        return (Date.now() - this.flingStartTimestamp) / this.flingDurationMs;
    }
    
    update() : number {
        var flingMod = 0;
        
        if (this.state === ScrollerState.Flinging) {
            flingMod = Math.min(this._flingMod(), 1.0);
            
            var interpolator = this.flingInterpolator;
            if (interpolator === null) {
                interpolator = DecelerateInterpolator.Shared;
            }
            var interpolation = interpolator.interpolate(flingMod);
            
            if (this.flingTargetX !== null) {
                this.baseX = this._interpolate(this.flingStartX, this.flingTargetX, interpolation);
            }
            if (this.flingTargetY !== null) {
                this.baseY = this._interpolate(this.flingStartY, this.flingTargetY, interpolation);
            }
        }
        return flingMod;
    }
    
    updateFlingState(flingMod : number) {
        if (this.state === ScrollerState.Flinging && flingMod >= 1.0) {
            this.stopScroll();
        }
    }
    
    isFlinging() {
        return this.state === ScrollerState.Flinging && this.flingTargetX !== null || this.flingTargetY !== null;
    }
    
    isScrolling() : boolean {
        return this.state !== ScrollerState.Idle;
    }
    
    flingToX(x : number, durationMs) {
        this.flingDurationMs = durationMs;

        var deltaX = this.startX - this.currentX;
        this.flingStartX = this.translationX() + deltaX;
        
        this.flingTargetX = x;
        this.flingStartTimestamp = Date.now();
        this.state = ScrollerState.Flinging;
    }
    
    flingToY(y : number, durationMs) {
        this.flingDurationMs = durationMs;

        var deltaY = this.startY - this.currentY;
        this.flingStartY = this.translationY() + deltaY;
    
        this.flingTargetY = y;
        this.flingStartTimestamp = Date.now();
        this.state = ScrollerState.Flinging;
    }
}

class ScrollBarState {
    public hoverStart : boolean = false;
    public hoverSlider : boolean = false; 
    public hoverEnd : boolean = false; 
    public scroll : number = 0;
    
    public dragged : boolean = false;
    public dragStart : number = null;
    public dragScroll : number = null;
    
    reset() : boolean {
        var wasReset = this.hoverStart || this.hoverSlider || this.hoverEnd;
        this.hoverStart = false;
        this.hoverSlider = false;
        this.hoverEnd = false; 
        this.dragged = false;
        this.dragStart = null;
        this.dragScroll = null;
        return wasReset;
    }
    
    clearHover() {
        this.hoverStart = false;
        this.hoverSlider = false;
        this.hoverEnd = false;  
    }
    
    stopDrag() {
        this.dragged = false;
        this.dragStart = null;
        this.dragScroll = null;
    }
}

class ScrollArea {
    private _rect : Rect;
    private _contentRect : Rect;
    private _stateX : ScrollBarState = new ScrollBarState();
    private _stateY : ScrollBarState = new ScrollBarState();
    private _scroller : Scroller;
    private _listener : ScrollListener;
    private _listenerCallDepth : number = 0;
    
    public barSize : number = dip(20);
    public buttonSize : number = dip(25);
    public scrollableX : boolean = true;
    public scrollableY : boolean = true;
    
    constructor(listener : ScrollListener) {
        this._scroller = new Scroller(listener);
        this._listener = listener;
    }
    
    onLayout(rect : Rect, contentRect : Rect) {
        this._rect = rect.copy();
        this._contentRect = contentRect.copy();

        this._clampScrolling(this._stateX.scroll, this._stateY.scroll);
    }
    
    clearVisualState() {
        this._stateX.clearHover();
        this._stateY.clearHover();
    }
    
    translationX() : number {
        return this._stateX.scroll;
    }
    
    translationY() : number {
        return this._stateY.scroll;
    }
    
    scrollingX(value? : number) : number {
        if (value !== undefined) {
            this._clampScrolling(value, this._stateY.scroll);
        }
        else {
            return this._stateX.scroll;
        }
    }
    
    scrollingY(value? : number) : number {
        if (value !== undefined) {
            this._clampScrolling(this._stateX.scroll, value);
        }
        else {
            return this._stateY.scroll;
        }
    }
    
    canScrollX() : boolean {
        if (this.scrollableX === false) {
            return false;
        }
        if (this._rect === null || this._contentRect === null) {
            return false;
        }
        if (this._rect.width <= 0 || this._contentRect.width <= 0) {
            return false;
        }
        return Math.ceil(this._contentRect.x) < Math.floor(this._rect.x) ||
            Math.floor(this._contentRect.right()) > Math.ceil(this._rect.right());
    }
    
    canScrollY() : boolean {
        if (this.scrollableY === false) {
            return false;
        }
        if (this._rect === null || this._contentRect === null) {
            return false;
        }
        if (this._rect.height <= 0 || this._contentRect.height <= 0) {
            return false;
        }
        return Math.ceil(this._contentRect.y) < Math.floor(this._rect.y) ||
            Math.floor(this._contentRect.bottom()) > Math.ceil(this._rect.bottom());
    }
    
    canScroll() : boolean {
        return this.canScrollX() || this.canScrollY();
    }
    
    isDragged() : boolean {
        return this._stateX.dragged || this._stateY.dragged;
    }
    
    isScrolling() : boolean {
        return this._scroller.isScrolling();
    }
    
    isFlinging() : boolean {
        return this._scroller.isFlinging();
    }
    
    isInteracting() : boolean {
        return this.isDragged() || this.isScrolling();
    }
    
    scrollState() : ScrollerState {
        return this._scroller.state;
    }
    
    stopScroll() {
        this._scroller.stopScroll();
    }
    
    onInputDown(event : InputEvent) : boolean {
        var handled = false;
        this._scroller.stopScroll();
        
        if (this.canScroll()) {
            this._scroller.prepareScroll(this.scrollingX(), this.scrollingY(), event.x, event.y);
            handled = true;
        }
        return handled;
    }
    
    onInputMove(event : InputEvent) : boolean {
        var handled = false;
        if (this.canScroll() && (this._scroller.state === ScrollerState.Preparing || this._scroller.state === ScrollerState.Dragging)) {
            this._scroller.scrollTo(event.x, event.y);
            
            if (this._scroller.state === ScrollerState.Dragging) {
                if (this.canScrollX() && Math.abs(this._scroller.deltaY()) < Config.SCROLL_AXIS_THRESHOLD) {
                    this.scrollingX(this._scroller.translationX());
                    handled = true;
                }
                if (this.canScrollY() && Math.abs(this._scroller.deltaX()) < Config.SCROLL_AXIS_THRESHOLD) {
                    this.scrollingY(this._scroller.translationY());
                    handled = true;
                }
            }
        }
        return handled;
    }
    
    onInputUp(event : InputEvent) : boolean {
        var handled = false;
        if (this.canScroll() && this._scroller.isScrolling()) {
            var scroller = this._scroller;
            var flinging = false;
            
            var flingX = scroller.flingSpeedX();
            var flingY = scroller.flingSpeedY();
            var duration = scroller.flingDuration(flingX, flingY);
            if (scroller.isFlingSpeedOk(flingX)) {
                flinging = true;
                scroller.flingToX(this.scrollingX() + flingX, duration);
            }
            if (scroller.isFlingSpeedOk(flingY)) {
                flinging = true;
                scroller.flingToY(this.scrollingY() + flingY, duration);
            }
            
            if (!flinging) {
                this.stopScroll();
            }
            
            handled = true;
        }
        return handled;
    }
    
    onInputScroll(renderer : Renderer, event : InputEvent, rect : Rect, force : boolean) : boolean {
        var handled = false;
        if (force || this._hitTestRect(renderer, rect, event)) {
            //If scrollY and scrollX pick the one mouse is hovering over?
            var speed = event.scroll * Config.SCROLL_STEP * Config.SCROLL_WHEEL_SPEED;
            if (this.canScrollY()) {
                //Y first.
                handled = true;
                this._scrollBySmooth(event, 0, speed);
            }
            else if (this.canScrollX()) {
                handled = true;
                this._scrollBySmooth(event, speed, 0);
            }
        }
        return handled;
    }
    
    scrollToX(x : number, duration : number = 100, interpolator : Interpolator = null) {
        this._scroller.flingInterpolator = interpolator;
        this._scroller.prepareScroll(this.scrollingX(), this.scrollingY(), 0, 0);
        this._scroller.flingToX(x, duration);
    }
    
    scrollToY(y : number, duration : number = 100, interpolator : Interpolator = null) {
        this._scroller.flingInterpolator = interpolator;
        this._scroller.prepareScroll(this.scrollingX(), this.scrollingY(), 0, 0);
        this._scroller.flingToY(y, duration);
    }
    
    _scrollBySmooth(event : InputEvent, x : number, y : number) {
        if (Config.SCROLL_SMOOTH) {
            var duration = 100;
            if (x) {
                this.scrollToX(this.scrollingX() + x, duration);
            }
            if (y) {
                this.scrollToY(this.scrollingY() + y, duration);
            }
        }
        else {
            this.stopScroll();
        
            if (x !== 0) {
                this.scrollingX(this.scrollingX() + x);
            }
            if (y !== 0) {
                this.scrollingY(this.scrollingY() + y);
            }
        }
    }
    
    onInterceptInputEvent(view : View, renderer : Renderer, event : InputEvent, rect : Rect) : boolean {
        var scrollX = this.canScrollX();
        var scrollY = this.canScrollY();
        
        var padding = 0;
        if (scrollX && scrollY) {
            padding = this.barSize;
        }
        
        var handled = false;
        if (event.type === InputType.MouseUp) {
            this._stateX.stopDrag();
            this._stateY.stopDrag();
            //When dragging, then moving outside view and back and release.
            view.requestDraw();
        }
        
        if (scrollX && this._hitTestBar(renderer, event, this._stateX, rect,
                this._getLeftRectX(rect, padding), 
                this._getSliderRectX(rect, padding), 
                this._getRightRectX(rect, padding), true)) {
            return true;
        }
        else {
            handled = this._stateX.reset() || handled;
        }
        
        if (scrollY && this._hitTestBar(renderer, event, this._stateY, rect,
                this._getTopRectY(rect, padding),
                this._getSliderRectY(rect, padding),
                this._getBottomRectY(rect, padding), false)) {
            return true;
        }
        else {
            handled = this._stateY.reset() || handled;
        }
        
        if (scrollX || scrollY) {
            var hit = this._hitTestRect(renderer, rect, event);
        
            if (event.type === InputType.MouseDown && hit) {
                //Only the first click needs to check if in area
                this.onInputDown(event);
            }
            else if (event.type === InputType.MouseMove) {
                //Move event starts event intercepting
                handled = this.onInputMove(event);
            }
            else if (event.type === InputType.MouseUp) {
                //Don't handle up, enables several nested views to cancel correctly.
                this.onInputUp(event);
            }
        }
        
        return handled;
    }
    
    _hitTestBar(renderer : Renderer, event : InputEvent, barState : ScrollBarState, viewRect : Rect,
            startRect : Rect, sliderRect : Rect, endRect : Rect, isX : boolean) {
        if (barState.dragged) {
            if (this._hitTestRect(renderer, viewRect, event)) {
                if (event.type === InputType.MouseMove) {
                    var p = renderer.transformPointInverse(event.x, event.y);
                
                    if (isX) {
                        var drag = this._remap(p.x, startRect.right(), endRect.x);
                        var delta = barState.dragStart - drag;
                        this.scrollingX(barState.scroll + delta * this._contentRect.width);
                        barState.dragStart = drag;
                    }
                    else {
                        var drag = this._remap(p.y, startRect.bottom(), endRect.y);
                        var delta = (barState.dragStart - drag);
                        this.scrollingY(barState.scroll + delta * this._contentRect.height);
                        barState.dragStart = drag;
                    }
                }
            }
            return true;
        }
        else {
            if (this._hitTestRect(renderer, sliderRect, event)) {
                barState.hoverSlider = true;
                if (event.type === InputType.MouseDown) {
                    this.stopScroll();
                    
                    barState.dragged = true;
                    var p = renderer.transformPointInverse(event.x, event.y);
                    
                    if (isX) {
                        barState.dragStart = this._remap(p.x, startRect.right(), endRect.x);
                        barState.dragScroll = barState.scroll;
                    }
                    else {
                        barState.dragStart = this._remap(p.y, startRect.bottom(), endRect.y);
                        barState.dragScroll = barState.scroll;
                    }
                }
                return true;
            }
            else if (this._hitTestRect(renderer, startRect, event)) {
                barState.hoverStart = true;
                if (event.type === InputType.MouseUp) {
                    if (isX) {
                        this._scrollBySmooth(event, Config.SCROLL_STEP, 0);
                    }
                    else {
                        this._scrollBySmooth(event, 0, Config.SCROLL_STEP);
                    }
                }
                return true;
            }
            else if (this._hitTestRect(renderer, endRect, event)) {
                barState.hoverEnd = true;
                if (event.type === InputType.MouseUp) {
                    if (isX) {
                        this._scrollBySmooth(event, -Config.SCROLL_STEP, 0);
                    }
                    else {
                        this._scrollBySmooth(event, 0, -Config.SCROLL_STEP);
                    }
                }
                return true;
            }
            //else if hits empty space, move the slider with a jump
        }
        return false;
    }
    
    _hitTestRect(renderer : Renderer, sliderRect : Rect, event : InputEvent) {
        return renderer.hitTestRect(event.x, event.y, 
            sliderRect.x, sliderRect.y, sliderRect.width, sliderRect.height);
    }
  
    _clampScrolling(newX : number, newY : number) {
        if (this._listenerCallDepth > 0) {
            return;
        }
    
        var clampedX = false;
        var clampedY = false;
        var oldX = this._stateX.scroll;
        var oldY = this._stateY.scroll;
    
        if (this.canScrollY()) {
            var down = (this._rect.bottom() - newY) - this._contentRect.bottom();
            if (down > 0) {
                clampedY = true;
                newY += down;
            }
            var up = this._contentRect.y - (this._rect.y - newY);
            if (up > 0) {
                clampedY = true;
                newY -= up;
            }
        }
        else {
            newY = 0;
        }
        
        if (this.canScrollX()) {
            var right = (this._rect.right() - newX) - this._contentRect.right();
            if (right > 0) {
                clampedX = true;
                newX += right;
            } 
            var left = this._contentRect.x - (this._rect.x - newX);
            if (left > 0) {
                clampedX = true;
                newX -= left;
            }
        }
        else {
            newX = 0;
        }
        
        if (clampedY) {
            this._scroller.stopFlingY();
        }
        if (clampedX) {
            this._scroller.stopFlingX();
        }
        
        //TODO This is little hackish
        this._listenerCallDepth++;
        this._listener.scrollingX(newX);
        this._listener.scrollingY(newY);
        this._listenerCallDepth--;

        this._stateX.scroll = newX;
        this._stateY.scroll = newY;
    }
  
    _remap(value : number, start : number, end : number) : number {
        return (value - start) / (end - start);
    }
    
    _computeSpan(rectStart : number, rectEnd : number, contentStart : number, contentEnd : number) : any {
        var begin = this._remap(rectStart, contentStart, contentEnd);
        var stop = this._remap(rectEnd, contentStart, contentEnd);
        return {start: begin, end: stop};
    }
    
    _interpolate(a : number, b : number, s : number) : number {
        return a + s * (b - a); 
    }
    
    _getSliderRectX(rect : Rect, padding : number) : Rect {
        var buttonWidth = this.buttonSize;
        var translation = this._stateX.scroll;
        var span = this._computeSpan(this._rect.x, this._rect.right(), 
            this._contentRect.x + translation, this._contentRect.right() + translation);
        var left = rect.x + buttonWidth;
        var right = rect.right() - buttonWidth - padding;
        var start = this._interpolate(left, right, span.start);
        var end = this._interpolate(left, right, span.end);
        return new Rect(start, rect.bottom() - this.barSize, end - start, this.barSize);
    }
    
    _getSliderRectY(rect : Rect, padding : number) : Rect {
        var buttonHeight = this.buttonSize;
        var translation = this._stateY.scroll;
        var span = this._computeSpan(this._rect.y, this._rect.bottom(), 
            this._contentRect.y + translation, this._contentRect.bottom() + translation);
        var top = rect.y + buttonHeight;
        var bottom = rect.bottom() - buttonHeight - padding;
        var start = this._interpolate(top, bottom, span.start);
        var end = this._interpolate(top, bottom, span.end);
        return new Rect(rect.right() - this.barSize, start, this.barSize, end - start);
    }
    
    _getBarX(rect : Rect, padding : number) : Rect {
        return new Rect(rect.x, rect.bottom() - this.barSize, rect.width - padding, this.barSize)
    }
    
    _getLeftRectX(rect : Rect, padding : number) : Rect {
        return new Rect(rect.x, rect.bottom() - this.barSize, this.buttonSize, this.barSize);
    }
    
    _getRightRectX(rect : Rect, padding : number) : Rect {
        return new Rect(rect.right() - this.buttonSize - padding, rect.bottom() - this.barSize, this.buttonSize, this.barSize);
    }
    
    _getBarY(rect : Rect, padding : number) : Rect {
        return new Rect(rect.right() - this.barSize, rect.y, this.barSize, rect.height - padding);
    }

    _getTopRectY(rect : Rect, padding : number) : Rect {
        return new Rect(rect.right() - this.barSize, rect.y, this.barSize, this.buttonSize);
    }
    
    _getBottomRectY(rect : Rect, padding : number) : Rect {
        return new Rect(rect.right() - this.barSize, rect.bottom() - this.buttonSize - padding, this.barSize, this.buttonSize);
    }
    
    _getSliderColor(sliderState : ScrollBarState) {
        var sliderColor = this._listener.theme().scrollBarSliderColor;
        if (sliderState.dragged) {
            return sliderColor.scaled(0.5);
        }
        else if (sliderState.hoverSlider) {
            return sliderColor.scaled(0.75);
        }
        return sliderColor;
    }
    
    onDraw(state : ViewState, rect : Rect) {
        var flingMod = this._scroller.update();
        var oldState = this._scroller.state;
        var xTrans = this._scroller.translationX();
        var yTrans = this._scroller.translationY();
        this._scroller.updateFlingState(flingMod);
        
        if (oldState === ScrollerState.Flinging) {
            this.scrollingX(xTrans);
            this.scrollingY(yTrans);
        }
    
        var scrollX = this.canScrollX();
        var scrollY = this.canScrollY();
        
        if (scrollX && scrollY) {
            this._drawBarX(state, rect, this.barSize);
            this._drawBarY(state, rect, this.barSize);
        }
        else if (scrollX) {
            this._drawBarX(state, rect, 0);
        }
        else if (scrollY) {
            this._drawBarY(state, rect, 0);
        }
    }
    
    _drawBarX(state : ViewState, rect : Rect, padding : number) {
        var renderer = state.renderer;
        var theme = this._listener.theme();
        var backgroundColor = theme.scrollBarBackgroundColor;
        var buttonColor = theme.scrollBarButtonColor;
    
        //Background
        var bar = this._getBarX(rect, padding)
        renderer.fillRect(bar.x, bar.y, bar.width, bar.height, backgroundColor);
    
        //Button left
        var leftColor = this._stateX.hoverStart ? buttonColor.scaled(0.5) : buttonColor;
        var left = this._getLeftRectX(rect, padding);
        renderer.fillRect(left.x, left.y, left.width, left.height, leftColor);
    
        //Button right
        var rightColor = this._stateX.hoverEnd ? buttonColor.scaled(0.5) : buttonColor;
        var right = this._getRightRectX(rect, padding);
        renderer.fillRect(right.x, right.y, right.width, right.height, rightColor);
    
        //Slider
        var sliderColor = this._getSliderColor(this._stateX);
        var sliderRect = this._getSliderRectX(rect, padding);
        renderer.fillRect(sliderRect.x, sliderRect.y, sliderRect.width, sliderRect.height, sliderColor);
    }
    
    _drawBarY(state : ViewState, rect : Rect, padding : number) {
        var renderer = state.renderer;
        var theme = this._listener.theme();
        var backgroundColor = theme.scrollBarBackgroundColor;
        var buttonColor = theme.scrollBarButtonColor;
    
        //Background
        var bar = this._getBarY(rect, padding);
        renderer.fillRect(bar.x, bar.y, bar.width, bar.height, backgroundColor);
    
        //Button top
        var topColor = this._stateY.hoverStart ? buttonColor.scaled(0.5) : buttonColor;
        var top = this._getTopRectY(rect, padding);
        renderer.fillRect(top.x, top.y, top.width, top.height, topColor);
    
        //Button bottom
        var bottomColor = this._stateY.hoverEnd ? buttonColor.scaled(0.5) : buttonColor;
        var bottom = this._getBottomRectY(rect, padding);
        renderer.fillRect(bottom.x, bottom.y, bottom.width, bottom.height, bottomColor);
    
        //Slider
        var sliderColor = this._getSliderColor(this._stateY);
        var sliderRect = this._getSliderRectY(rect, padding);
        renderer.fillRect(sliderRect.x, sliderRect.y, sliderRect.width, sliderRect.height, sliderColor);
    } 
}
