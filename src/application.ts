
function FV(viewId : string) : View {
    //Use currently active?
    return null;
}

class ViewEvent {
    public view : View;
    public callback : Function;
    public cancellable : boolean;

    constructor(view : View, callback : Function, cancellable : boolean) {
        this.view = view;
        this.callback = callback;
        this.cancellable = cancellable;
    }
}

enum FragmentFlags {
    None,
    ClearTop,
}

var MAX_HISTORY_SIZE = 10;

class FragmentStackItem {
    private _fragmentClass : any = null;
    private _uriParams : any = {};
}

class FragmentRouter {
    private _url : string = "";
    private _fragment : any = null;
    private _flags : FragmentFlags = FragmentFlags.None;
}

class Application {
    public window : RootView = null;
    public root : View = null;
    public overlay : View = null;
    public rect : Rect = new Rect(0, 0, 0, 0);
    public canvas : HTMLCanvasElement = null;
    public renderer : Renderer = null;
    private _drawPending : boolean = false;
    private _layoutRequested : boolean = false;
    private _layoutPending : boolean = false;
    private _eventsPending : boolean = false;
    private _events : ViewEvent[] = [];
    private _cursor : string = "auto";
    private _hoverView : View = null;
    private _focusView : View = null;
    private _captureView : View = null; //TODO
    private _inputElement : HTMLInputElement = null;
    private _inputElementIgnores : number = 0;
    private _drawBlocks : number = 0; //Prevent requestAnimationFrame and alert() draws
    private _layoutBlocks : number = 0;
    private _layoutBroken : boolean = false;
    private _lastDrawTime : number = 0;

    private _fragmentStack : FragmentStackItem[] = [];
    private _fragmentRouters : FragmentRouter[] = [];

    constructor() {

    }

    startFragment(fragment : Fragment) {

    }

    startFragmentByName(name : string) {

    }

    $(id : string) : View {
        return this.window.findView(id);
    }

    theme() : Theme {
        return this.window.theme();
    }

    layoutRequested() : boolean {
        return this._layoutRequested;
    }

    drawPending() : boolean {
        return this._drawPending;
    }

    getFocusView() : View {
        return this._focusView;
    }

    blockLayout(block : boolean) {
        if (block) {
            this._layoutBlocks++;
        }
        else {
            this._layoutBlocks--;
        }
    }

    postEvent(event : ViewEvent) {
        this._events.push(event);

        if (!this._eventsPending) {
            this._eventsPending = true;

            setTimeout(() => {
                this._processViewEvents();
            }, 0);
        }
    }

    _processViewEvents() {
        //Note that callbacks can add new events.
        for (var i=0; i < this._events.length; ++i) {
            var event = this._events[i];
            if (!event.view.destroyed() || !event.cancellable) {
                event.callback();
            }
        }
        this._events.length = 0;
        this._eventsPending = false;
    }

    _createRootViews() {
        this.window = new RootView();
        this.window._bootstrap(this);

        this.root = new View(this.window);
        this.root.fillParent(true);
        this.root.scrollable(false);
        this.root.clickable(false);

        this.overlay = new View(this.window);
        this.overlay.fillParent(true);
        this.overlay.scrollable(false);
        this.overlay.clickable(false);
    }

    setSize(width : number, height : number) {
        if (width === this.rect.width && height === this.rect.height) {
            //Not changed.
            return;
        }

        if (Config.IS_MOBILE && width === this.rect.width) {
            //Probably a virtual keyboard change, don't do layout.
            this._drawViews();
        }
        else {
            width = Math.max(width, Config.CANVAS_MIN_WIDTH);
            height = Math.max(height, Config.CANVAS_MIN_HEIGHT);

            this.canvas.width = width;
            this.canvas.height = height;

            this.rect = new Rect(0, 0, width, height);

            //No request, do this immediately.
            this._layoutViews();
            this._drawViews();
        }
    }

    setCanvas(canvas : HTMLCanvasElement) {
        this.canvas = canvas;

        var context = canvas.getContext("2d");
        this.renderer = new Renderer(context);
        this.renderer.reset();

        this._setEventListeners(canvas);

        this._createDomInput();
        this._createRootViews();
    }

    _setEventListeners(canvas : HTMLCanvasElement) {
        if (Config.HAS_TOUCH_EVENTS) {
            canvas.addEventListener("touchstart", (event) => { this._onTouchStart(event); return false}, false);
            canvas.addEventListener("touchend", (event) => { this._onTouchEnd(event); return false}, false);
            canvas.addEventListener("touchcancel", (event) => { this._onTouchCancel(event); return false}, false);
            canvas.addEventListener("touchmove", (event) => { this._onTouchMove(event); return false}, false);
        }
        else {
            canvas.addEventListener("mousedown", (event) => { this._onMouseDown(event); return false; }, false);
            canvas.addEventListener("mouseup", (event) => { this._onMouseUp(event); return false; }, false);
            canvas.addEventListener("mousemove", (event) => { this._onMouseMove(event); return false; }, false);

            var mouseWheelListener = (event) => { this._onMouseWheel(event); return false; }
            canvas.addEventListener("mousewheel", mouseWheelListener, false);
            canvas.addEventListener("DOMMouseScroll", mouseWheelListener, false);
        }

        var keyDownListener = (event) => { this._onKeyDown(event || window.event); return false; };
        var keyUpListener = (event) => { this._onKeyUp(event || window.event); return false; };
        var keyPressListener = (event) => { this._onKeyPress(event || window.event); return false; };

        window.addEventListener("keydown", keyDownListener, false);
        window.addEventListener("keyup", keyUpListener, false);
        //window.addEventListener("keypress", keyPressListener, false);
    }

    _createDomInput() {
        var input = document.createElement("input");
        input.type = "text";
        input.value = "";
        input.style.position = "absolute";
        input.style.left = "0px";
        input.style.top = "-100px";
        input.style.width = "10px";
        input.style.height = "10px";
        input.style.zIndex = "10";

        var listener = (event) => {
            this._stopNativeEvent(event);

            var text = input.value;
            input.value = "";

            for (var i=0; i < text.length; ++i) {
                var fake = {
                    keyCode: 0,
                    ctrlKey: false,
                    metaKey: false,
                    charCode: text.charCodeAt(i)
                };
                this._onKeyPress(fake);
            }
        };
        input.onchange = listener
        input.onkeypress = () => { input.value = ""; }
        input.onpaste = () => { input.value = ""; }
        input.oninput = listener

        document.body.appendChild(input);
        this._inputElement = input;
    }

    inputElement() : HTMLInputElement {
        return this._inputElement;
    }

    inputElementText(text : string) {
        this._inputElementIgnores++;
        this._inputElement.value = text;
        this._inputElement.focus();
        this._inputElement.select();
    }

    focusInputElement(focus : boolean) {
        if (focus) {
            this._inputElement.focus();
            if (window["GuiHooks"]) {
                window["GuiHooks"].showVirtualKeyboard();
            }
        }
        else {
            this._inputElement.blur();
        }
    }

    clearInputElement() {
        this._inputElement.value = "";
    }

    setCursor(cursor : string) {
        this._cursor = cursor;
    }

    _handleViewClose(view : View) {
        if (view === this._hoverView) {
            this._setHoverView(null);
        }
        if (view === this._focusView) {
            this._setFocusView(null);
        }
        if (view === this._captureView) {
            this._stopIntercept(view);
        }
    }

    _setHoverView(view : View) {
        if (view !== this._hoverView) {
            if (this._hoverView) {
                this._hoverView.onHoverEnd();
            }
            this._hoverView = view;
            if (view) {
                view.onHoverStart();
            }
        }
    }

    _setFocusView(view : View) {
        if (view !== this._focusView) {
            if (this._focusView) {
                this._focusView.onLoseFocus();
            }
            this._focusView = view;
            if (view) {
                view.onGainFocus();
            }
        }
    }

    _startIntercept(view : View) {
        if (this._captureView === null) {
            this._captureView = view;
        }
    }

    _stopIntercept(view : View) : boolean {
        if (this._captureView === view) {
            this._captureView = null;
            return true;
        }
        return false;
    }

    _stopInterceptIfRequired(input : InputEvent) {
        if (this._captureView !== null) {
            if (input.type === InputType.MouseUp || !this._captureView.enabled()) {  //TODO OR CANCEL
                this._stopIntercept(this._captureView);
            }
        }
    }

    _convertInputEvent(event : MouseEvent, eventType : InputType) : InputEvent {
        var rect = this.canvas.getBoundingClientRect(); //TODO offsetLeft ja offsetTop ?
        var input = new InputEvent(eventType, event.clientX - rect.left, event.clientY - rect.top);
        if (eventType === InputType.MouseWheel) {
            input.scroll = Math.max(-1, Math.min(1, (event["wheelDelta"] || -event.detail)));
        }
        return input;
    }

    _convertKeyEvent(event : KeyboardEvent, eventType : InputType) : KeyEvent {
        var keyEvent = new KeyEvent(eventType);
        keyEvent.keyCode = event.keyCode;
        keyEvent.ctrlKey = event.ctrlKey;
        keyEvent.metaKey = event.metaKey;
        if (eventType === InputType.KeyPress) {
            keyEvent.charCode = event.which || event.charCode;
        }
        return keyEvent;
    }

    _createViewState(x : number, y : number, reason : WalkReason) : ViewState {
        this.renderer.resetTextAttributes();
        var state = new ViewState(this.renderer, reason);
        state.x = x;
        state.y = y;
        state.time = Date.now();
        state.bbox = this.window.rect().copy();
        return state;
    }

    _transformViews(hit : View, input : InputEvent, reason : WalkReason, callback : Function) : View {
        this.renderer.saveTransform();
        this.renderer.setIdentity();

        var parents = [];
        var parent = hit;
        while (parent !== null) {
            parents.push(parent);
            parent = parent.parent();
        }
        parents.reverse();

        var state = this._createViewState(input.x, input.y, reason);
        for (var i=0; i < parents.length; ++i) {
            parents[i]._pushViewTransform(state);
            parents[i]._pushViewTranslation(state);
        }

        var interceptor = null;

        parents.reverse();
        for (var i=0; i < parents.length; ++i) {
            this.renderer.popTransform();
            var view = parents[i];
            if (interceptor === null && view.visibility() === Visibility.Visible && view.enabled()) {
                view._updateViewState(state);
                if (callback(view, state, input)) {
                    interceptor = view;
                }
            }
            this.renderer.popTransform();
        }
        this.renderer.popTransform();

        return interceptor;
    }

    _stopNativeEvent(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
    }

    _getViewAt(input : InputEvent, startState : ViewState, viewCallback : Function, interceptCallback : Function) : View {
        return this.window._walkViewTransform(startState, null,
            (view : View, state : ViewState) => {
                var handled = false;

                if (this._captureView === null) {
                    var hitArea = view.onHitTest(state, input.x, input.y);
                    if (hitArea !== HitArea.None) {
                        var interceptor = null;
                        if (this._captureView === null) {
                            interceptor = this._transformViews(view, input, state.reason, interceptCallback);
                        }

                        if (interceptor !== null) {
                            //A view starts to intercept input events.
                            this._startIntercept(interceptor);
                            handled = true;
                        }
                        else {
                            handled = viewCallback(view, input);
                        }
                    }
                }
                return handled;
        });
    }

    _callInputEventHandler(event, eventType : InputType, checkCursor : boolean, callback : Function) {
        this._drawBlocks++;

        this._processViewEvents();

        this._cursor = "auto";

        this._stopNativeEvent(event);

        var reason = WalkReason.HitTest;
        var input = this._convertInputEvent(event, eventType);
        var startState = this._createViewState(input.x, input.y, reason);

        var interceptCallback = (view : View, state : ViewState, input : InputEvent) => {
            return view.onInterceptInputEvent(state, input);
        }

        if (this._captureView !== null) {
            //A view is currently intercepting events. Note that this
            //might call through several intercepting views. For example
            //nested flinging views will all receive the up event and stop.
            this._transformViews(this._captureView, input, reason, interceptCallback);
        }
        this._stopInterceptIfRequired(input);

        var hitView : View = null;
        if (this._captureView === null) {
            hitView = this._getViewAt(input, startState, callback, interceptCallback);
        }

        if (this._captureView !== null) {
            //TODO override hit view if intercepted or set to null?
            hitView = this._captureView;
        }

        if (hitView !== null && hitView.destroyed()) {
            //Some callback closed the view, so don't touch it.
            hitView = null;
        }

        this._setHoverView(hitView);
        if (eventType === InputType.MouseDown) {
            this._setFocusView(hitView);
        }

        if (eventType === InputType.MouseUp && hitView !== null && hitView != this._focusView) {
            //Click started on a view but was moved and released on another view.
            this._setFocusView(hitView);
        }

        this._stopInterceptIfRequired(input);

        if (eventType === InputType.MouseWheel && hitView === null && this._focusView !== null) {
            //If nobody else wanted the mouse wheel event give it to the focus view.
            var scrollCallback = (view : View, state : ViewState, input : InputEvent) => {
                if (view === this._focusView) {
                    callback(this._focusView, input);
                    return true;
                }
                return false;
            }
            this._transformViews(this._focusView, input, reason, scrollCallback);
        }

        if (checkCursor && this.canvas.style.cursor !== this._cursor) {
            this.canvas.style.cursor = this._cursor;
        }

        this._processViewEvents();

        this._drawBlocks--;
    }

    //Mouse events

    _onMouseMove(event) {
        this._callInputEventHandler(event, InputType.MouseMove, true, (view, input) => {
            return view.onInputMove(input);
        });
    }

    _onMouseUp(event) {
        this._callInputEventHandler(event, InputType.MouseUp, false, (view, input) => {
            return view.onInputUp(input);
        });
    }

    _onMouseDown(event) {
        this._callInputEventHandler(event, InputType.MouseDown, false, (view, input) => {
            return view.onInputDown(input);
        });
    }

    _onMouseWheel(event) {
        this._callInputEventHandler(event, InputType.MouseWheel, false, (view, input) => {
            return view.onInputScroll(input);
        });
    }

    //Touch events

    _convertTouchToMouseEvent(event) : any {
        this._stopNativeEvent(event);

        var result : any = {};

        var touch = event.changedTouches[0];
        result.clientX = touch.clientX;
        result.clientY = touch.clientY;

        return result;
    }

    _onTouchStart(event) {
        this._onMouseDown(this._convertTouchToMouseEvent(event));
    }

    _onTouchEnd(event) {
        this._onMouseUp(this._convertTouchToMouseEvent(event));
    }

    _onTouchCancel(event) {

    }

    _onTouchMove(event) {
        this._onMouseMove(this._convertTouchToMouseEvent(event));
    }

    //Keyboard evente

    _callKeyEventHandler(method : string, event : KeyEvent) {
        this._processViewEvents();

        //Start looking a view that handles the event up the view tree.
        //Start from the focused view. If no view has focus use the window view.
        var view = this._focusView || this.window;
        while (view !== null) {
            if (view.visibility() === Visibility.Visible && view.enabled()) {
                var handled = view[method](event);
                if (handled) {
                    break;
                }
            }
            else {
                //Views that are not visible can never get events.
                break;
            }
            view = view.parent();
        }
        this._processViewEvents();
    }

    _onKeyDown(event) {
        this._callKeyEventHandler("onKeyDown", this._convertKeyEvent(event, InputType.KeyDown));
    }

    _onKeyUp(event) {
        this._callKeyEventHandler("onKeyUp", this._convertKeyEvent(event, InputType.KeyUp));
    }

    _onKeyPress(event) {
        this._callKeyEventHandler("onKeyPress", this._convertKeyEvent(event, InputType.KeyPress));
    }

    _resetContext() {
        this.renderer.reset();
    }

    _layoutViewLoop(view : View) {
        if (this._layoutBroken) {
            return;
        }

        var start = Date.now();

        var counter = 0;
        do {
            this._layoutRequested = false;

            this._processViewEvents();

            this._resetContext();
            view.onLayout(new LayoutState());

            this._processViewEvents();

            counter++;
            if (counter > 25) {
                this._layoutBroken = true;
                var msg = "Possible layout loop, layout might be broken. Check your anchors, possibly conflicting constraints etc.";
                Log(msg);
                if (window.alert) {
                    alert(msg);
                }
                break;
            }
        }
        while (this._layoutRequested);

        var end = Date.now();
        var duration = end - start;
        Log("Layout passes: " + counter + " in " + duration + " ms ");

        //Notify that layout is ready
        view._walkViews((v : View) => {
            v.onLayoutReady();
        });
        this._processViewEvents();
    }

    _layoutViews() {
        this._processViewEvents(); //Needed for example ListView child creation without flickering.

        if (this._layoutBlocks > 0) {
            return
        }
        this.renderer.clearCache();

        this._layoutViewLoop(this.window);

        this.renderer.clearCache();
    }

    _drawViews() {
        this._processViewEvents(); //Needed for example ListView child creation without flickering.
        if (this._layoutRequested || this._drawBlocks > 0) {
            //We need to draw, but layout must be done first or we received recursive requests.
            return;
        }
        this.window._walkViews((v : View) => {
            v._onUpdate();
        });
        this._processViewEvents(); //In case update did something to the layout (animations etc.)
        if (this._layoutRequested) {
            return;
        }

        var time = Date.now();
        if (time - this._lastDrawTime > 250) {
            this._lastDrawTime = time;
            //Log("Draw at " + time);
        }

        this._resetContext();
        this.renderer.clearRect(0, 0, this.rect.width, this.rect.height);
        Counters.ViewsDrawn = 0;

        var state = this._createViewState(null, null, WalkReason.Draw);
        this.window._onDrawWalk(state);

        //Log("Views drawn: " + Counters.ViewsDrawn);
    }

    requestLayout() {
        this._layoutRequested = true;

        if (this._layoutPending) {
            return;
        }
        this._layoutPending = true;

        setTimeout(() => {
            this._layoutPending = false;

            if (this._layoutRequested) {
                this._layoutViews();
            }
            this._drawViews();
        }, 0);
    }

    requestDraw() {
        if (this._drawPending || this._layoutPending) {
            //Layout also draws, so wait for it.
            return;
        }
        this._drawPending = true;

        var callback = () => {
            this._drawPending = false;

            this._drawViews();
        }
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        }
        else {
            setTimeout(callback, Config.DRAW_SPEED_MS);
        }
    }
}
