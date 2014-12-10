interface AdapterListener {
    onAdapterRefresh(): any;
}
declare class ViewAdapter {
    _listener: AdapterListener;
    constructor();
    _adapterListener(view: AdapterListener): void;
    refresh(): void;
    getCount(): number;
    getItem(index: number): any;
    getView(index: number, parent: View): View;
}
declare class ArrayAdapter extends ViewAdapter {
    private _data;
    constructor();
    model(model?: any[]): any[];
    getCount(): number;
    getItem(index: number): any;
    getView(index: number, parent: View): View;
}
interface LayoutCreator {
    (index: number, item: any, parent: View): LayoutData;
}
declare class LayoutDataAdapter extends ArrayAdapter {
    private _layout;
    constructor(creator?: LayoutCreator, data?: any[]);
    layout(layout?: LayoutCreator): LayoutCreator;
    _getLayoutData(index: number, parent: View): LayoutData;
    getView(index: number, parent: View): View;
}
declare class TestAdapter extends ArrayAdapter {
    constructor();
    createTestData(): void;
    getView(index: number, parent: View): View;
}
interface AnimationListener {
    onStart(): any;
    onProgress(pos: number): any;
    onFinish(): any;
}
interface PropertyTransform {
    name: string;
    originalValue: number;
    startValue: number;
    targetValue: number;
    interpolator: Interpolator;
}
declare enum AnimationState {
    None = 1,
    Running = 2,
    Finished = 3,
}
declare class Animation {
    private _startTime;
    private _duration;
    private _period;
    private _interpolator;
    private _view;
    private _state;
    private _restoreTransform;
    private _propertyAnimations;
    private _listener;
    constructor();
    duration(duration?: number): number;
    period(period?: number): number;
    restoreStartValues(value?: boolean): boolean;
    listener(value?: AnimationListener): AnimationListener;
    state(): AnimationState;
    start(view: View): void;
    stop(): void;
    animate(name: string, to: number, interpolator?: Interpolator): void;
    animateBetween(name: string, from: number, to: number, interpolator?: Interpolator): void;
    _saveStartValues(): void;
    _restoreStartValues(): void;
    _onUpdateAnimation(): void;
    _interpolateValue(from: number, to: number, value: number, interpolator: Interpolator): number;
    _updateViewTransforms(interpolation: number): void;
}
declare class SequenceAnimation {
}
interface LayoutAnimator {
    onAnimate(view: View, from: Rect, to: Rect): any;
}
declare class TranslationLayoutAnimator implements LayoutAnimator {
    private duration;
    constructor(duration?: number);
    onAnimate(view: View, from: Rect, to: Rect): void;
}
declare class TeleportLayoutAnimator implements LayoutAnimator {
    private duration;
    constructor(duration?: number);
    onAnimate(view: View, from: Rect, to: Rect): void;
}
interface Interpolator {
    interpolate(pos: number): number;
}
interface EasingFunction {
    (pos: number): number;
}
declare class Easing {
    static linear(pos: any): any;
    static boomerang(pos: any): number;
    static inQuad(pos: any): number;
    static outQuad(pos: any): number;
    static inOutQuad(pos: any): number;
    static inCubic(pos: any): number;
    static outCubic(pos: any): number;
    static inOutCubic(pos: any): number;
    static inQuart(pos: any): number;
    static outQuart(pos: any): number;
    static inOutQuart(pos: any): number;
    static inQuint(pos: any): number;
    static outQuint(pos: any): number;
    static inOutQuint(pos: any): number;
    static inSine(pos: any): number;
    static outSine(pos: any): number;
    static inOutSine(pos: any): number;
    static inExpo(pos: any): number;
    static outExpo(pos: any): number;
    static inOutExpo(pos: any): number;
    static inCirc(pos: any): number;
    static outCirc(pos: any): number;
    static inOutCirc(pos: any): number;
    static outBounce(pos: any): number;
    static inBack(pos: any): number;
    static outBack(pos: any): number;
    static inOutBack(pos: any): number;
    static elastic(pos: any): number;
    static swingFromTo(pos: any): number;
    static swingFrom(pos: any): number;
    static swingTo(pos: any): number;
    static bounce(pos: any): number;
    static bouncePast(pos: any): number;
    static fromTo(pos: any): number;
    static from(pos: any): number;
    static to(pos: any): number;
}
declare class EasingInterpolator implements Interpolator {
    constructor(easing: EasingFunction);
    interpolate(pos: number): number;
}
declare class OvershootInterpolator implements Interpolator {
    private tension;
    constructor(tension?: number);
    interpolate(pos: number): number;
}
declare class DecelerateInterpolator implements Interpolator {
    private factor;
    static Shared: DecelerateInterpolator;
    constructor(factor?: number);
    interpolate(pos: number): number;
}
declare class ConstantInterpolator implements Interpolator {
    private constant;
    private from;
    private to;
    constructor(constant: number, from?: number, to?: number);
    interpolate(pos: number): number;
}
declare class CycleInterpolator implements Interpolator {
    private cycles;
    constructor(cycles: number);
    interpolate(pos: number): number;
}
declare class SplineInterpolator implements Interpolator {
    private p0;
    private p1;
    private p2;
    private p3;
    constructor(y0: number, y1: number, y2: number, y3: number);
    interpolate(pos: number): number;
}
declare function FV(viewId: string): View;
declare class ViewEvent {
    view: View;
    callback: Function;
    cancellable: boolean;
    constructor(view: View, callback: Function, cancellable: boolean);
}
declare enum FragmentFlags {
    None = 0,
    ClearTop = 1,
}
declare var MAX_HISTORY_SIZE: number;
declare class FragmentStackItem {
    private _fragmentClass;
    private _uriParams;
}
declare class FragmentRouter {
    private _url;
    private _fragment;
    private _flags;
}
declare class Application {
    window: RootView;
    root: View;
    overlay: View;
    rect: Rect;
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    private _drawPending;
    private _layoutRequested;
    private _layoutPending;
    private _eventsPending;
    private _events;
    private _cursor;
    private _hoverView;
    private _focusView;
    private _captureView;
    private _inputElement;
    private _inputElementIgnores;
    private _drawBlocks;
    private _layoutBlocks;
    private _layoutBroken;
    private _lastDrawTime;
    private _fragmentStack;
    private _fragmentRouters;
    constructor();
    startFragment(fragment: Fragment): void;
    startFragmentByName(name: string): void;
    $(id: string): View;
    theme(): Theme;
    layoutRequested(): boolean;
    drawPending(): boolean;
    getFocusView(): View;
    blockLayout(block: boolean): void;
    postEvent(event: ViewEvent): void;
    _processViewEvents(): void;
    _createRootViews(): void;
    setSize(width: number, height: number): void;
    setCanvas(canvas: HTMLCanvasElement): void;
    _setEventListeners(canvas: HTMLCanvasElement): void;
    _createDomInput(): void;
    inputElement(): HTMLInputElement;
    inputElementText(text: string): void;
    focusInputElement(focus: boolean): void;
    clearInputElement(): void;
    setCursor(cursor: string): void;
    _handleViewClose(view: View): void;
    _setHoverView(view: View): void;
    _setFocusView(view: View): void;
    _startIntercept(view: View): void;
    _stopIntercept(view: View): boolean;
    _stopInterceptIfRequired(input: InputEvent): void;
    _convertInputEvent(event: MouseEvent, eventType: InputType): InputEvent;
    _convertKeyEvent(event: KeyboardEvent, eventType: InputType): KeyEvent;
    _createViewState(x: number, y: number, reason: WalkReason): ViewState;
    _transformViews(hit: View, input: InputEvent, reason: WalkReason, callback: Function): View;
    _stopNativeEvent(event: any): void;
    _getViewAt(input: InputEvent, startState: ViewState, viewCallback: Function, interceptCallback: Function): View;
    _callInputEventHandler(event: any, eventType: InputType, checkCursor: boolean, callback: Function): void;
    _onMouseMove(event: any): void;
    _onMouseUp(event: any): void;
    _onMouseDown(event: any): void;
    _onMouseWheel(event: any): void;
    _convertTouchToMouseEvent(event: any): any;
    _onTouchStart(event: any): void;
    _onTouchEnd(event: any): void;
    _onTouchCancel(event: any): void;
    _onTouchMove(event: any): void;
    _callKeyEventHandler(method: string, event: KeyEvent): void;
    _onKeyDown(event: any): void;
    _onKeyUp(event: any): void;
    _onKeyPress(event: any): void;
    _resetContext(): void;
    _layoutViewLoop(view: View): void;
    _layoutViews(): void;
    _drawViews(): void;
    requestLayout(): void;
    requestDraw(): void;
}
declare class AppConfig {
    CANVAS_MIN_WIDTH: number;
    CANVAS_MIN_HEIGHT: number;
    HAS_TOUCH_EVENTS: boolean;
    IS_MOBILE: boolean;
    IS_ANDROID: boolean;
    SCROLL_TOUCH_THRESHOLD: number;
    SCROLL_SMOOTH: boolean;
    SCROLL_STEP: number;
    SCROLL_WHEEL_SPEED: number;
    SCROLL_MIN_FLING_SPEED: number;
    SCROLL_AXIS_THRESHOLD: number;
    DRAW_SPEED_MS: number;
    DOUBLE_CLICK_TIME_MS: number;
}
declare var Config: AppConfig;
declare class Compositor {
    constructor();
    _getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
    compositeText(text: string, font: string, color: Color, width: number, height: number): HTMLCanvasElement;
}
declare enum WalkReason {
    HitTest = 1,
    Draw = 2,
}
declare class ViewState {
    renderer: Renderer;
    reason: WalkReason;
    x: number;
    y: number;
    enabled: boolean;
    pressed: boolean;
    focused: boolean;
    hovering: boolean;
    selected: boolean;
    time: number;
    bbox: Rect;
    constructor(renderer: Renderer, reason: WalkReason);
    copy(): ViewState;
}
declare class LayoutState {
    copy(): LayoutState;
}
declare enum InputType {
    MouseDown = 1,
    MouseMove = 2,
    MouseWheel = 3,
    MouseUp = 4,
    KeyDown = 5,
    KeyUp = 6,
    KeyPress = 7,
}
declare class InputEvent {
    type: InputType;
    x: number;
    y: number;
    scroll: number;
    constructor(type: InputType, x: number, y: number);
    isMouseEvent(): boolean;
}
declare class KeyEvent {
    type: InputType;
    keyCode: number;
    charCode: number;
    ctrlKey: boolean;
    metaKey: boolean;
    constructor(type: InputType);
}
declare class Transform {
    alpha: number;
    originX: number;
    originY: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    translationX: number;
    translationY: number;
    skewX: number;
    skewY: number;
    constructor();
    isTransforming(): boolean;
    copy(): Transform;
}
declare class MarginPadding {
    left: number;
    top: number;
    right: number;
    bottom: number;
    copy(): MarginPadding;
    apply(m: MarginPadding): void;
}
declare function Log(text: string): void;
declare function ThrowError(text: string): void;
declare function getOrSet<T>(owner: View, name: string, property: Object, key: string, value: T, callback?: Function): T;
interface Point {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
declare class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    set(x: number, y: number, width: number, height: number): void;
    copy(): Rect;
    copyTo(rect: Rect): void;
    isEmpty(): boolean;
    equals(rect: Rect): boolean;
    adjust(value: number): void;
    overlaps(r2: Rect): boolean;
    intersection(r: Rect): void;
    centerX(): number;
    centerY(): number;
    right(): number;
    bottom(): number;
    toString(): string;
}
declare class Color {
    static White: Color;
    static Black: Color;
    static Red: Color;
    static Green: Color;
    static Blue: Color;
    static Yellow: Color;
    static Gray: Color;
    static TextSelection: Color;
    private r;
    private g;
    private b;
    private a;
    private _rgba;
    constructor(r?: number, g?: number, b?: number, a?: number);
    static RGB(r: number, g: number, b: number): Color;
    static RGB8(r: number, g: number, b: number): Color;
    static RGBA(r: number, g: number, b: number, a: number): Color;
    static fromString(color: string): Color;
    inverted(): Color;
    scaled(value: number): Color;
    rgba(): string;
}
declare class Anchor {
    view: View;
    x: number;
    y: number;
    weight: number;
    constructor(view: View);
    set(x: number, y: number): void;
    isSet(): boolean;
}
declare class Anchors {
    view: View;
    left: Anchor;
    leftWeight: number;
    top: Anchor;
    topWeight: number;
    right: Anchor;
    rightWeight: number;
    bottom: Anchor;
    bottomWeight: number;
    center: Anchor;
    centerHorizontal: Anchor;
    centerVertical: Anchor;
    leftContent: Anchor;
    topContent: Anchor;
    rightContent: Anchor;
    bottomContent: Anchor;
    centerContent: Anchor;
    centerHorizontalContent: Anchor;
    centerVerticalContent: Anchor;
    constructor(view: View);
    update(): void;
    isAnySet(): boolean;
}
interface SortComparator<T> {
    (a: T, b: T): number;
}
declare class Sort {
    static stable<T>(data: T[], compare: SortComparator<T>): T[];
    static _merge<T>(left: T[], right: T[], compare: SortComparator<T>): T[];
}
declare var _devPixRatio: number;
declare function dip(value: number): number;
interface LayoutData {
    ref: any;
}
declare function mergeLayouts(a: LayoutData, b: Object): LayoutData;
declare class Counters {
    static ViewsDrawn: number;
}
declare class MathUtils {
    static randomValue(start: number, end: number): number;
    static clamp(value: number, min: number, max: number): number;
}
declare class _ViewRef {
    command: string;
    constructor(command: string);
    _chain(command: string): _ViewRef;
    parent(): _ViewRef;
    anchorLeft(): _ViewRef;
    anchorTop(): _ViewRef;
    anchorRight(): _ViewRef;
    anchorBottom(): _ViewRef;
    anchorCenter(): _ViewRef;
    anchorCenterHorizontal(): _ViewRef;
    anchorCenterVertical(): _ViewRef;
    anchorLeftContent(): _ViewRef;
    anchorTopContent(): _ViewRef;
    anchorRightContent(): _ViewRef;
    anchorBottomContent(): _ViewRef;
    anchorCenterContent(): _ViewRef;
    anchorCenterHorizontalContent(): _ViewRef;
    anchorCenterVerticalContent(): _ViewRef;
}
declare function $parent(): _ViewRef;
declare function $id(id: string): _ViewRef;
declare class Drawable {
    padding: MarginPadding;
    width: number;
    height: number;
    transform: Transform;
    private _tempRect;
    constructor();
    _updateSize(drawable: Drawable): void;
    hasSize(): boolean;
    draw(state: ViewState, rect: Rect): void;
    drawArea(state: ViewState, x: number, y: number, width: number, height: number): void;
    onDraw(state: ViewState, rect: Rect): void;
}
declare class EmptyDrawable extends Drawable {
    static Shared: EmptyDrawable;
    constructor();
    draw(state: ViewState, rect: Rect): void;
    drawArea(state: ViewState, x: number, y: number, width: number, height: number): void;
}
interface FunctionDrawableCallback {
    (state: ViewState, rect: Rect): any;
}
declare class FunctionDrawable extends Drawable {
    private _callback;
    constructor(callback: FunctionDrawableCallback);
    onDraw(state: ViewState, rect: Rect): void;
}
declare class ColorDrawable extends Drawable {
    private color;
    constructor(color: Color);
    static RGB(r: number, g: number, b: number): ColorDrawable;
    onDraw(state: ViewState, rect: Rect): void;
}
declare class RoundedDrawable extends Drawable {
    private color;
    private radius;
    constructor(color: Color, radius?: number);
    onDraw(state: ViewState, rect: Rect): void;
}
declare class GradientDrawable extends Drawable {
    private colors;
    private radius;
    private _gradient;
    private _gradientRect;
    constructor(colors: Color[], radius?: number);
    onDraw(state: ViewState, rect: Rect): void;
}
declare class LayerDrawable extends Drawable {
    private drawables;
    constructor(...drawables: Drawable[]);
    onDraw(state: ViewState, rect: Rect): void;
}
declare enum VF {
    Enabled,
    Pressed,
    Focused,
    Hovering,
    Selected,
    All,
    Any = 0,
}
interface VisualState {
    statesOn: VF;
    statesOff: VF;
}
interface DrawableState extends VisualState {
    drawable: Drawable;
}
declare function viewStateToVisualFlags(state: ViewState): VF;
declare function testVisualFlags(state: VisualState, flags: VF): boolean;
declare function makeDrawableState(drawable: Drawable, on: VF, off?: VF): DrawableState;
declare class StateDrawable extends Drawable {
    private states;
    constructor(states: DrawableState[]);
    _removeStates(vf: VF): void;
    onDraw(state: ViewState, rect: Rect): void;
}
declare enum ImageFlags {
    Default = 0,
    AlignLeft = 0,
    AlignTop = 0,
    AlignRight,
    AlignBottom,
    AlignCenterHorizontal,
    AlignCenterVertical,
    AlignCenter,
    Scale,
    ScaleAspectUp,
    ScaleAspectDown,
    ScaleAspect,
}
declare class ImageDrawable extends Drawable {
    image: RendererImage;
    imageFlags: ImageFlags;
    constructor(image: RendererImage);
    onDraw(state: ViewState, rect: Rect): void;
}
declare class MatrixTransform {
    m: number[];
    constructor();
    copy(): MatrixTransform;
    determinant(): number;
    isInvertible(): boolean;
    identity(): void;
    multiply(matrix: MatrixTransform): void;
    invert(): void;
    rotate(radians: number): void;
    translate(x: number, y: number): void;
    scale(sx: number, sy: number): void;
    shear(sx: number, sy: number): void;
    skew(sx: number, sy: number): void;
    transformPoint(px: number, py: number): Point;
}
declare function RR(value: number): number;
declare var _CACHE_FONT_STATE: boolean;
declare var _USE_CANVAS_TRANSFORM: boolean;
declare class RendererImage {
    _image: HTMLImageElement;
    width: number;
    height: number;
    constructor(image: HTMLImageElement);
}
interface TransformStackItem {
    matrix: MatrixTransform;
    inverted: MatrixTransform;
}
declare class Renderer {
    private _context;
    private _alphaStack;
    private _activeFont;
    private _textCache;
    private _transformCount;
    private _transformStack;
    private _scale;
    compositor: Compositor;
    constructor(context: CanvasRenderingContext2D);
    _S(value: number): number;
    reset(): void;
    getTransform(): MatrixTransform;
    _newTransform(m: MatrixTransform): TransformStackItem;
    transformPointInverse(x: number, y: number): Point;
    transformRectToAABB(r: Rect, out: Rect): void;
    setIdentity(): void;
    clearCache(): void;
    resetTextAttributes(): void;
    alpha(): number;
    pushAlpha(alpha: number): void;
    popAlpha(): void;
    shadow(blur: number, xOffset?: number, yOffset?: number, color?: Color): void;
    clearRect(x: number, y: number, width: number, height: number): void;
    pushClipRect(x: number, y: number, width: number, height: number): void;
    popClipRect(): void;
    measureText(text: string, font: string): number;
    drawText(text: string, x: number, y: number, color: Color, font: string): void;
    fillRect(x: number, y: number, width: number, height: number, color: Color): void;
    strokeRect(x: number, y: number, width: number, height: number, color: Color, lineWidth?: number): void;
    _roundedRectPath(x: number, y: number, w: number, h: number, r: number): void;
    fillRoundedRect(x: number, y: number, width: number, height: number, color: Color, rounding: number): void;
    _createGradient(x: number, y: number, width: number, height: number, colors: Color[]): CanvasGradient;
    _fillRoundedGradient(x: number, y: number, width: number, height: number, gradient: CanvasGradient, rounding: number): void;
    fillRoundedGradient(x: number, y: number, width: number, height: number, colors: Color[], rounding: number): void;
    drawImage(image: RendererImage, sx: number, sy: number, swidth: number, sheight: number, x: number, y: number, width: number, height: number): void;
    drawImageAt(image: RendererImage, x: number, y: number): void;
    drawCanvasAt(canvas: HTMLCanvasElement, x: number, y: number): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color, width?: number): void;
    hitTestRect(xp: number, yp: number, x: number, y: number, width: number, height: number): boolean;
    toRadians(value: number): number;
    translate(x: number, y: number): void;
    _applyTopTransform(): void;
    _topTransform(): TransformStackItem;
    pushTransform(transform: Transform, xOrigin: number, yOrigin: number): void;
    pushTransformRect(transform: Transform, rect: Rect): void;
    saveTransform(): void;
    popTransform(): void;
}
interface ViewHook {
    (): any;
    _previousHook: ViewHook;
    _nextHook: ViewHook;
    _callback: Function;
}
declare class HookHelper {
    static _addTargetArgument(v: any, args: any): any[];
    static _methodToName(target: any, method: any): string;
    static hookMethod(target: any, method: Function, callback: Function): any;
    static hookMethod(target: any, method: string, callback: Function): any;
    static unhookMethod(target: any, method: Function, callback: Function): any;
    static unhookMethod(target: any, method: string, callback: Function): any;
    static unhookAll(target: any): void;
}
declare function _inflaterTargetPropertyLookup(target: View, attribute: string): any;
declare function _inflaterLookupProperty(root: View, target: View, attribute: string): View;
declare class Inflater {
    inflate(view: LayoutData, root: View): View;
    _sortProperties(properties: any): string[];
    _buildView(properties: LayoutData, parent: View, root: View): View;
}
declare function R(value: number): number;
declare enum Visibility {
    Visible = 1,
    Invisible = 2,
    Gone = 3,
}
declare enum HitArea {
    None = 0,
    Client = 1,
    Drag = 2,
}
declare function _Floor(value: number): number;
declare class View {
    _app: Application;
    _parent: View;
    _children: View[];
    _rect: Rect;
    _contentRect: Rect;
    _marginRect: Rect;
    _paddingRect: Rect;
    _transform: Transform;
    _bind: Anchors;
    _anchors: Anchors;
    _text: TextValue;
    _background: Drawable;
    _margins: MarginPadding;
    _padding: MarginPadding;
    _id: string;
    _scrollArea: ScrollArea;
    _wrapWidth: boolean;
    _wrapHeight: boolean;
    _maxWidth: number;
    _maxHeight: number;
    _minWidth: number;
    _minHeight: number;
    _animation: Animation;
    _clipChildren: boolean;
    _clipTextFast: boolean;
    _clickable: boolean;
    _clickStarted: boolean;
    _lastClickTime: number;
    _measureChildMargins: boolean;
    _theme: Theme;
    _blockLayout: number;
    _enabled: boolean;
    _pressed: boolean;
    _hovering: boolean;
    _selected: boolean;
    _visibility: Visibility;
    _zIndex: number;
    _requestLayoutText: Function;
    _requestLayout: Function;
    _requestDraw: Function;
    constructor(parent: View);
    _createRequestHandlers(): void;
    x(value?: number): number;
    y(value?: number): number;
    width(value?: number): number;
    height(value?: number): number;
    wrapWidth(value?: boolean): boolean;
    wrapHeight(value?: boolean): boolean;
    maxWidth(value?: number): number;
    maxHeight(value?: number): number;
    minWidth(value?: number): number;
    minHeight(value?: number): number;
    alpha(value?: number): number;
    originX(value?: number): number;
    originY(value?: number): number;
    rotation(value?: number): number;
    scaleX(value?: number): number;
    scaleY(value?: number): number;
    translationX(value?: number): number;
    translationY(value?: number): number;
    skewX(value?: number): number;
    skewY(value?: number): number;
    bindLeft(value?: Anchor): Anchor;
    bindTop(value?: Anchor): Anchor;
    bindRight(value?: Anchor): Anchor;
    bindBottom(value?: Anchor): Anchor;
    bindCenter(value?: Anchor): Anchor;
    bindCenterHorizontal(value?: Anchor): Anchor;
    bindCenterVertical(value?: Anchor): Anchor;
    fillParent(value?: boolean): void;
    bindLeftWeight(value?: number): number;
    bindRightWeight(value?: number): number;
    bindTopWeight(value?: number): number;
    bindBottomWeight(value?: number): number;
    anchorLeft(): Anchor;
    anchorTop(): Anchor;
    anchorRight(): Anchor;
    anchorBottom(): Anchor;
    anchorCenter(): Anchor;
    anchorCenterHorizontal(): Anchor;
    anchorCenterVertical(): Anchor;
    anchorLeftContent(): Anchor;
    anchorTopContent(): Anchor;
    anchorRightContent(): Anchor;
    anchorBottomContent(): Anchor;
    anchorCenterContent(): Anchor;
    anchorCenterHorizontalContent(): Anchor;
    anchorCenterVerticalContent(): Anchor;
    text(value?: string): string;
    textElement(value: HTMLElement): void;
    textSize(value: number): void;
    textAlign(value: TextAlign): void;
    textColor(value: Color): void;
    textSelectable(value?: boolean): boolean;
    marginLeft(value?: number): number;
    marginTop(value?: number): number;
    marginRight(value?: number): number;
    marginBottom(value?: number): number;
    margins(value: number): void;
    paddingLeft(value?: number): number;
    paddingTop(value?: number): number;
    paddingRight(value?: number): number;
    paddingBottom(value?: number): number;
    padding(padding: number): void;
    scrollToX(value: number, duration?: number, interpolator?: Interpolator): void;
    scrollToY(value: number, duration?: number, interpolator?: Interpolator): void;
    scrollingX(value?: number): number;
    scrollingY(value?: number): number;
    scrollableX(value?: boolean): boolean;
    scrollableY(value?: boolean): boolean;
    scrollable(value: boolean): void;
    onFlingXEnd(): void;
    onFlingYEnd(): void;
    clickable(value?: boolean): boolean;
    enabled(value?: boolean): boolean;
    pressed(value?: boolean): boolean;
    hovering(value?: boolean): boolean;
    selected(value?: boolean): boolean;
    visibility(value?: Visibility): Visibility;
    visible(): boolean;
    zIndex(value?: boolean): boolean;
    focused(): boolean;
    clipChildren(clip?: boolean): boolean;
    clipTextFast(clip?: boolean): boolean;
    children(): View[];
    background(value?: Drawable): Drawable;
    id(value?: string): string;
    parent(): View;
    app(): Application;
    rect(): Rect;
    theme(): Theme;
    animation(): Animation;
    requestLayout(): void;
    requestDraw(): void;
    inflate(layout: LayoutData, index?: number): View;
    postEvent(callback: Function, cancellable?: boolean): void;
    stopAnimation(): void;
    destroyChildren(): void;
    destroy(): void;
    destroyed(): boolean;
    addChild(child: View, index?: number): void;
    removeChild(child: View): void;
    _reparent(parent: View, index?: number): void;
    _clampWidth(width: number): number;
    _clampHeight(height: number): number;
    _updateRects(): void;
    _adjustClampedX(x: number, baseWidth: number, clampedWidth: number): number;
    _adjustClampedY(y: number, baseHeight: number, clampedHeight: number): number;
    _isChildContent(child: View): boolean;
    onGetContentRect(): Rect;
    _updateContentRect(): void;
    _addYPaddingY(value: number): number;
    _computeChildrenBounds(views: View[], contentBottom?: number): Rect;
    onGetContentSize(): Rect;
    _layoutText(): void;
    _updateScrollArea(): void;
    onLayout(state: LayoutState): void;
    onLayoutReady(): void;
    _toRadians(value: number): number;
    findView(id: string): View;
    $find(id: string): View;
    _walkViews(callback: any): View;
    _updateViewState(state: ViewState): void;
    _pushViewTranslation(state: ViewState): void;
    _applyScrollTranslation(state: ViewState): void;
    onTransform(transform: Transform): Transform;
    _pushViewTransform(state: ViewState): void;
    _pushViewTransformAndTestHit(state: ViewState): boolean;
    _updateBBoxAndTestIntersection(state: ViewState): boolean;
    _walkViewTransformChildren(state: ViewState, preCallback: any, postCallback?: any, preChildCallback?: any, postChildCallback?: any): View;
    _walkViewTransform(state: ViewState, preCallback: any, postCallback?: any, preChildCallback?: any, postChildCallback?: any): View;
    _transformPointInverse(x: number, y: number): Point;
    _debugDraw(state: ViewState): void;
    _onUpdate(): void;
    onDraw(state: ViewState): void;
    onDrawTop(state: ViewState): void;
    onDrawPreChildren(state: ViewState): void;
    _onDrawWalk(startState: ViewState): void;
    onGetHitRect(): Rect;
    onHitTest(state: ViewState, x: number, y: number): HitArea;
    onInterceptInputEvent(state: ViewState, event: InputEvent): boolean;
    _updateDoubleDownEventTime(event: InputEvent): boolean;
    onInputDown(event: InputEvent): boolean;
    onInputDoubleDown(event: InputEvent): boolean;
    onInputUp(event: InputEvent): boolean;
    onInputMove(event: InputEvent): boolean;
    onInputScroll(event: InputEvent): boolean;
    onClick(event: InputEvent): void;
    onKeyDown(event: KeyEvent): boolean;
    onKeyUp(event: KeyEvent): boolean;
    onKeyPress(event: KeyEvent): boolean;
    onGainFocus(): void;
    onLoseFocus(): void;
    onHoverStart(): void;
    onHoverEnd(): void;
    onInflate(): void;
    hook(method: Function, callback: Function): any;
    hook(method: string, callback: Function): any;
    unhook(method: Function, callback: Function): any;
    unhook(method: string, callback: Function): any;
}
declare enum Gravity {
    Left = 0,
    Top = 0,
    Right,
    Bottom,
    CenterHorizontal,
    CenterVertical,
    Center,
    StretchX,
    StretchY,
    Stretch,
}
interface LayoutAnimationItem {
    view: View;
    rect: Rect;
}
declare class Layout extends View {
    _layoutAnimator: LayoutAnimator;
    _layoutAnimationItems: LayoutAnimationItem[];
    constructor(parent: View);
    layoutAnimator(value?: LayoutAnimator): LayoutAnimator;
    onLayout(state: LayoutState): void;
    onLayoutChildren(): void;
    onLayoutReady(): void;
    _adjustChildrenLayoutBlock(view: View, count: number): void;
    _saveLayoutAnimationItems(): void;
    _rectMoved(a: Rect, b: Rect): boolean;
    _animateLayout(): void;
    _applyGravityToRect(rect: Rect, bounds: Rect, gravity: Gravity): void;
    _applyGravityToChildren(views: View[], bounds: Rect, gravity: Gravity, orientation?: Orientation): void;
}
declare class FlowLayout extends Layout {
    private _maxColumns;
    private _gravity;
    private _rowGravity;
    private _fitChildren;
    constructor(parent: View);
    maxColumns(value?: number): number;
    gravity(value?: Gravity): Gravity;
    rowGravity(value?: Gravity): Gravity;
    fitChildren(value?: boolean): boolean;
    _tryFitChild(view: View, previousRow: View[]): void;
    _adjustRows(rows: View[][]): void;
    onLayoutChildren(): void;
}
interface GridItem {
    view: View;
    width: number;
    height: number;
    row: number;
    column: number;
}
declare class GridRow {
    items: GridItem[];
    height: number;
    rowIndex: number;
    constructor(index: number);
    updateHeight(): void;
}
declare class GridColumn {
    items: GridItem[];
    width: number;
    columnIndex: number;
    constructor(index: number);
    updateWidth(): void;
}
declare class GridLayout extends Layout {
    private _columns;
    private _gravity;
    private _cellGravity;
    private _stretchColumns;
    private _tempCellRect;
    private _tempBoundsRect;
    columns(value: number): number;
    gravity(value?: Gravity): Gravity;
    cellGravity(value?: Gravity): Gravity;
    stretchColumns(value?: Gravity): Gravity;
    constructor(parent: View);
    _calculateGridRows(): GridRow[];
    _calculateGridColumns(rows: GridRow[]): GridColumn[];
    _placeViewToGrid(item: GridItem, x: number, y: number, rows: GridRow[], columns: GridColumn[]): void;
    _stretchColumnCells(columns: GridColumn[]): void;
    onLayoutChildren(): void;
}
declare class LayerLayout extends Layout {
    constructor(parent: View);
    onLayoutChildren(): void;
}
declare enum Orientation {
    X,
    Y,
}
declare class LinearLayout extends Layout {
    private _orientation;
    private _gravity;
    constructor(parent: View);
    orientation(value?: Orientation): Orientation;
    gravity(value?: Gravity): Gravity;
    onLayoutChildren(): void;
}
declare class ListLayout extends Layout implements AdapterListener {
    private _adapter;
    private _createViewsPending;
    constructor(parent: View);
    onAdapterRefresh(): void;
    _createAdapterViews(): void;
    adapter(adapter?: ViewAdapter): ViewAdapter;
    destroy(): void;
    onLayoutChildren(): void;
}
declare class OverflowLayout extends LinearLayout {
    _overflow: LinearLayout;
    _button: Button;
    _overflowVisibility: Visibility;
    constructor(parent: View);
    destroy(): void;
    _getButtonWidth(): number;
    onGetContentRect(): Rect;
    onLayout(state: LayoutState): void;
    _popChildView(parent: View): View;
    _createButton(): Button;
    _createOverflowLinearLayout(): LinearLayout;
}
declare class PageLayout extends Layout {
    _snapChildren: boolean;
    _snapDuration: number;
    _childWidth: number;
    constructor(parent: View);
    snapChildren(value?: boolean): boolean;
    snapDuration(value?: number): number;
    childWidth(value?: number): number;
    onGetContentRect(): Rect;
    onGetContentSize(): Rect;
    _scrollBarSize(): number;
    _stop(): void;
    onLoseFocus(): void;
    onLayoutChildren(): void;
    _contentPadX(): number;
    _getScrollingViewIndex(): number;
    scrollToChild(index: number, durationMs?: number): void;
    _repositionCurrentScroll(durationMs: number): void;
    onInterceptInputEvent(state: ViewState, event: InputEvent): boolean;
    onInputScroll(event: InputEvent): boolean;
    _transformViews(): void;
    onTransformView(view: View, position: number): void;
    onScrollingXChanged(): void;
    onFlingXEnd(): void;
    onLayoutReady(): void;
}
interface ScrollListener {
    theme(): Theme;
    postEvent(callback: Function): any;
    requestDraw(): any;
    scrollingX(value?: number): number;
    scrollingY(value?: number): number;
    onFlingXEnd(): any;
    onFlingYEnd(): any;
}
declare enum ScrollerState {
    Idle = 1,
    Preparing = 2,
    Dragging = 3,
    Flinging = 4,
}
declare class Scroller {
    baseX: number;
    baseY: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    dragStartTimestamp: number;
    flingTargetX: number;
    flingStartX: number;
    flingTargetY: number;
    flingStartY: number;
    flingStartTimestamp: number;
    flingDurationMs: number;
    flingInterpolator: Interpolator;
    state: ScrollerState;
    listener: ScrollListener;
    constructor(listener: ScrollListener);
    prepareScroll(baseX: number, baseY: number, x: number, y: number): void;
    stopScroll(): void;
    stopFlingX(): void;
    stopFlingY(): void;
    _computeFlingSpeed(start: number, end: number, duration: number): number;
    flingDuration(speedX: number, speedY: number): number;
    flingSpeedX(): number;
    flingSpeedY(): number;
    isFlingSpeedOk(speed: number): boolean;
    deltaX(): number;
    deltaY(): number;
    translationX(): number;
    translationY(): number;
    scrollTo(x: number, y: number): void;
    _interpolate(from: number, to: number, mod: number): number;
    _flingMod(): number;
    update(): number;
    updateFlingState(flingMod: number): void;
    isFlinging(): boolean;
    isScrolling(): boolean;
    flingToX(x: number, durationMs: any): void;
    flingToY(y: number, durationMs: any): void;
}
declare class ScrollBarState {
    hoverStart: boolean;
    hoverSlider: boolean;
    hoverEnd: boolean;
    scroll: number;
    dragged: boolean;
    dragStart: number;
    dragScroll: number;
    reset(): boolean;
    clearHover(): void;
    stopDrag(): void;
}
declare class ScrollArea {
    private _rect;
    private _contentRect;
    private _stateX;
    private _stateY;
    private _scroller;
    private _listener;
    private _listenerCallDepth;
    barSize: number;
    buttonSize: number;
    scrollableX: boolean;
    scrollableY: boolean;
    constructor(listener: ScrollListener);
    onLayout(rect: Rect, contentRect: Rect): void;
    clearVisualState(): void;
    translationX(): number;
    translationY(): number;
    scrollingX(value?: number): number;
    scrollingY(value?: number): number;
    canScrollX(): boolean;
    canScrollY(): boolean;
    canScroll(): boolean;
    isDragged(): boolean;
    isScrolling(): boolean;
    isFlinging(): boolean;
    isInteracting(): boolean;
    scrollState(): ScrollerState;
    stopScroll(): void;
    onInputDown(event: InputEvent): boolean;
    onInputMove(event: InputEvent): boolean;
    onInputUp(event: InputEvent): boolean;
    onInputScroll(renderer: Renderer, event: InputEvent, rect: Rect, force: boolean): boolean;
    scrollToX(x: number, duration?: number, interpolator?: Interpolator): void;
    scrollToY(y: number, duration?: number, interpolator?: Interpolator): void;
    _scrollBySmooth(event: InputEvent, x: number, y: number): void;
    onInterceptInputEvent(view: View, renderer: Renderer, event: InputEvent, rect: Rect): boolean;
    _hitTestBar(renderer: Renderer, event: InputEvent, barState: ScrollBarState, viewRect: Rect, startRect: Rect, sliderRect: Rect, endRect: Rect, isX: boolean): boolean;
    _hitTestRect(renderer: Renderer, sliderRect: Rect, event: InputEvent): boolean;
    _clampScrolling(newX: number, newY: number): void;
    _remap(value: number, start: number, end: number): number;
    _computeSpan(rectStart: number, rectEnd: number, contentStart: number, contentEnd: number): any;
    _interpolate(a: number, b: number, s: number): number;
    _getSliderRectX(rect: Rect, padding: number): Rect;
    _getSliderRectY(rect: Rect, padding: number): Rect;
    _getBarX(rect: Rect, padding: number): Rect;
    _getLeftRectX(rect: Rect, padding: number): Rect;
    _getRightRectX(rect: Rect, padding: number): Rect;
    _getBarY(rect: Rect, padding: number): Rect;
    _getTopRectY(rect: Rect, padding: number): Rect;
    _getBottomRectY(rect: Rect, padding: number): Rect;
    _getSliderColor(sliderState: ScrollBarState): Color;
    onDraw(state: ViewState, rect: Rect): void;
    _drawBarX(state: ViewState, rect: Rect, padding: number): void;
    _drawBarY(state: ViewState, rect: Rect, padding: number): void;
}
declare enum TextStyle {
    None = 0,
    Overline = 1,
    LineThrough = 2,
    Underline = 4,
    Bold = 8,
    Italic = 16,
}
declare class TextAttributes implements VisualState {
    textColor: Color;
    textSize: number;
    textFont: string;
    textAlign: TextAlign;
    textSpacing: number;
    background: Drawable;
    style: TextStyle;
    alignBaseline: boolean;
    cursor: string;
    statesOn: VF;
    statesOff: VF;
    textSelectionColor: Color;
    copy(): TextAttributes;
    clear(): void;
}
interface TextNodeSplit {
    first: TextNode;
    second: TextNode;
}
declare class TextNodeSpan {
    visualFlags: VF;
}
declare class TextNode {
    text: string;
    startIndex: number;
    endIndex: number;
    rect: Rect;
    margins: MarginPadding;
    attributes: TextAttributes[];
    span: TextNodeSpan;
    lineBreak: boolean;
    onClick: Function;
    canvas: HTMLCanvasElement;
    copy(): TextNode;
    defaultAttribute(): TextAttributes;
    activeAttribute(): TextAttributes;
    _font(attrs: TextAttributes): string;
    measure(renderer: Renderer): void;
    guessRightPadding(): number;
    drawBackground(state: ViewState, x: number, y: number, selection: TextSelection): void;
    draw(state: ViewState, x: number, y: number, selection: TextSelection, caretPosition: number): void;
    _estimateBisectHint(maxWidth: number): number;
    _measureSubstring(renderer: Renderer, text: string, imid: number, imax: number, font: string): number;
    needsSplitting(renderer: Renderer, maxWidth: number): boolean;
    _findSplitPosition(renderer: Renderer, boundingWidth: number, maxWidth: number, font: string): number;
    split(renderer: Renderer, boundingWidth: number, maxWidth: number): TextNodeSplit;
    _findSeparator(index: number): number;
}
interface TextNodeParser {
    parse(): TextNode[];
}
declare class SimpleTagParser implements TextNodeParser {
    private _text;
    private _nodes;
    private _attributeStack;
    constructor(text: string);
    _currentAttrs(): TextAttributes;
    _newNode(): TextNode;
    _saveNode(text: string, node: TextNode, endIndex: number): TextNode;
    _parseNodeProperties(text: string, startIndex: number, endIndex: number): TextAttributes;
    _resetNodeIndices(): void;
    parse(): TextNode[];
}
interface ParsedElement {
    element: HTMLElement;
    texts: Text[];
    margins: MarginPadding;
}
declare class ElementParser implements TextNodeParser {
    private _root;
    private _nodes;
    private _elements;
    constructor(root: HTMLElement);
    _currentElement(): ParsedElement;
    _pushElement(element: HTMLElement): void;
    _trimText(text: string): string;
    _popElement(): void;
    _isSpanTag(tagName: string): boolean;
    _pushText(text: Text): void;
    _handleClickListener(element: HTMLElement, node: TextNode): void;
    _endsWith(str: string, suffix: string): boolean;
    _stringToNumber(value: string, ignore: string): number;
    _applyStyleIf(attrs: TextAttributes, style: TextStyle, value: string, match: string): void;
    _styleToNodeAttributes(element: HTMLElement, style: CSSStyleDeclaration): TextAttributes;
    _styleToMargins(parent: MarginPadding, style: CSSStyleDeclaration): MarginPadding;
    _parseNode(node: Node): void;
    parse(): TextNode[];
}
declare function _rangesOverlap(x1: number, x2: number, y1: number, y2: number): boolean;
declare function _rangeContains(x1: number, x2: number, value: number): boolean;
declare function _updateRect(rect: Rect, items: any[]): void;
declare class TextHitResult {
    lineIndex: number;
    charIndex: number;
    char: string;
    node: TextNode;
    constructor(lineIndex: number, charIndex: number, char: string, node: TextNode);
}
declare class TextSelection {
    startIndex: number;
    endIndex: number;
    active: boolean;
    constructor();
    start(): number;
    end(): number;
    isSet(): boolean;
}
declare class TextLine {
    nodes: TextNode[];
    rect: Rect;
    lineIndex: number;
    margins: MarginPadding;
    textSpacing: number;
    update(): void;
}
interface NodeWalkCallback {
    (node: TextNode): any;
}
declare enum TextAlign {
    Default = 0,
    Left = 0,
    Top = 0,
    Right = 1,
    Bottom = 2,
    CenterHorizontal = 4,
    CenterVertical = 8,
    Center,
}
declare class TextValue {
    private _renderer;
    private _boundsRect;
    private _textRect;
    private _nodes;
    private _lines;
    private _caretPosition;
    private _overrides;
    private _clickedNode;
    selectable: boolean;
    interactive: boolean;
    selection: TextSelection;
    constructor(renderer: Renderer);
    text(value?: string): string;
    textElement(value: HTMLElement): void;
    _setNodesFromParser(parser: TextNodeParser): void;
    _createNodesFromParser(parser: TextNodeParser): TextNode[];
    _joinNodeText(): string;
    length(): number;
    caret(position?: number): number;
    _clampCaret(value: number): number;
    textSize(size: number): void;
    textAlign(align: TextAlign): void;
    textColor(color: Color): void;
    width(): number;
    height(): number;
    hasCaret(): boolean;
    clearSelection(): void;
    selectedText(): string;
    selectWordAt(position: number): void;
    selectText(start: number, end: number): void;
    _findSeparator(node: TextNode, position: number, direction: number): number;
    addText(value: string): void;
    deleteChar(): void;
    deleteSelection(): boolean;
    deleteRange(start: number, end: number): boolean;
    _walkNodes(callback: NodeWalkCallback): void;
    _clearLines(): void;
    _getCaretNode(): TextNode;
    _getTextNodeAtPosition(charIndex: number): TextNode;
    _getCharAt(x: number, y: number, line: TextLine, node: TextNode): number;
    _getLineNodeAt(x: number, y: number, line: TextLine): TextNode;
    _getLineAt(x: number, y: number): TextLine;
    getTextAt(x: number, y: number): TextHitResult;
    _applyOverrides(node: TextNode): void;
    _copyNodes(): TextNode[];
    _layoutLinesAndNodes(): void;
    _layoutLine(nodes: TextNode[], y: number): TextLine;
    _splitLine(line: TextLine, nodes: TextNode[], node: TextNode, boundsWidth: number, maxWidth: number): void;
    _adjustLinesAndNodes(): void;
    _updateNodeIndices(nodes: TextNode[], index: number): number;
    _alignLinesAndNodes(): void;
    onLayout(bounds: Rect): void;
    _drawLineNodes(method: string, state: ViewState, drawCaret: boolean, scrollY: number, clipFast: boolean): void;
    drawText(state: ViewState, drawCaret: boolean, scrollY: number, clipFast: boolean): void;
    _getTextHitAt(view: View, x: number, y: number): TextHitResult;
    onInputDown(event: InputEvent, view: View, isDoubleEvent: boolean): boolean;
    _setSelectedTextToDom(view: View): void;
    _invalidateTextNode(dirtyNode: TextNode): void;
    _stopClicking(): boolean;
    onInputUp(event: InputEvent, view: View): boolean;
    onInputMove(event: InputEvent, view: View): boolean;
}
declare class Theme {
    scrollBarAlpha: number;
    scrollBarBackgroundColor: Color;
    scrollBarButtonColor: Color;
    scrollBarSliderColor: Color;
    viewTextSelectable: boolean;
    buttonPadding: number;
    buttonTextSize: number;
    buttonBackgroundColor: Color;
    createButtonBackground(): Drawable;
    editTextPadding: number;
    editTextBackgroundColor: Color;
    createEditTextBackground(): Drawable;
    sliderPadding: number;
    sliderBarSize: number;
    sliderThumbWidth: number;
    sliderThumbHeight: number;
    sliderBackgroundColor: Color;
    sliderBarBackgroundColor: Color;
    sliderBarSelectionColor: Color;
    sliderBarThumbColor: Color;
    createSliderBackground(): Drawable;
    createSliderBarBackground(): Drawable;
    createSliderBarSelection(): Drawable;
    createSliderBarThumb(): Drawable;
    checkedViewPadding: number;
    checkedBackgroundSize: number;
    checkedMarkerSize: number;
    checkBoxRounding: number;
    checkBoxBackgroundSize: number;
    checkBoxMarkerSize: number;
    checkBoxPadding: number;
    checkBoxBackgroundColor: Color;
    checkBoxMarkerColor: Color;
    checkBoxBackground(): Drawable;
    checkBoxMarker(): Drawable;
    radioButtonRounding: number;
    radioButtonBackgroundSize: number;
    radioButtonMarkerSize: number;
    radioButtonPadding: number;
    radioButtonBackgroundColor: Color;
    radioButtonMarkerColor: Color;
    radioButtonBackground(): Drawable;
    radioButtonMarker(): Drawable;
    createCheckedViewDrawable(color: Color, rounding: number, size: number): StateDrawable;
    createGradientStateDrawable(color: Color, rounding?: number): StateDrawable;
    createRoundedStateDrawable(color: Color): StateDrawable;
}
declare class Button extends View {
    constructor(parent: View);
}
declare class CheckedView extends View {
    private _box;
    private _marker;
    private _tempRect;
    private _checked;
    _textPad: number;
    _allowUserUncheck: boolean;
    constructor(parent: View);
    checked(value?: boolean): boolean;
    checkBackground(value?: Drawable): Drawable;
    checkMarker(value?: Drawable): Drawable;
    onGetContentSize(): Rect;
    _updateRects(): void;
    _boxRect(drawable: Drawable): Rect;
    onClick(event: InputEvent): void;
    onDraw(state: ViewState): void;
}
declare class CheckBox extends CheckedView {
    constructor(parent: View);
}
declare class ChoiceView extends View {
    _listLayout: ListLayout;
    _listAdapter: LayoutDataAdapter;
    _choices: string[];
    _choice: number;
    constructor(parent: View);
    choice(value?: number): number;
    choices(value?: string[]): string[];
    destroy(): void;
    adapter(value?: ViewAdapter): ViewAdapter;
    _animateList(from: number, to: number, listener: AnimationListener): void;
    _updateText(): void;
    onClick(): void;
    onLoseFocus(): void;
    _createChoiceListLayout(): ListLayout;
    _createChoiceAdapter(): LayoutDataAdapter;
    _crateChoiceItemView(index: number, item: any, parent: View): LayoutData;
}
declare class DomView extends View {
    private static VENDOR_PREFIXES;
    private _element;
    private _hasBeenVisible;
    constructor(parent: View);
    element(value?: HTMLElement): HTMLElement;
    createElement(name: string): void;
    destroy(): void;
    _setElement(element: HTMLElement): void;
    _updateElementRect(): void;
    _updateElementTransform(state: ViewState): void;
    _setStyle(name: string, value: string): void;
    _px(value: number): string;
    onLayoutReady(): void;
    onDraw(state: ViewState): void;
}
declare class EditText extends View {
    constructor(parent: View);
    onInputMove(event: InputEvent): boolean;
    onGainFocus(): void;
    onLoseFocus(): void;
    onKeyDown(event: KeyEvent): boolean;
    onKeyUp(event: KeyEvent): boolean;
    onKeyPress(event: KeyEvent): boolean;
}
declare class Fragment extends View {
    constructor(parent: View);
}
declare enum ImageStatus {
    None = 0,
    Loading = 1,
    Ready = 2,
    Error = 3,
    Aborted = 4,
}
declare class ImageView extends View {
    private _url;
    private _loadCounter;
    private _imageDrawable;
    private _imageStatus;
    private _imageFlags;
    constructor(parent: View);
    imageFlags(value?: ImageFlags): ImageFlags;
    url(value?: string): string;
    image(value?: ImageDrawable): ImageDrawable;
    status(): ImageStatus;
    onImageLoad(url: string, image: ImageDrawable): void;
    onImageError(url: string): void;
    onImageAbort(url: string): void;
    _isLoadCurrent(counter: number): boolean;
    _loadImage(url: string): void;
    onGetContentSize(): Rect;
    onDraw(state: ViewState): void;
}
declare class RadioGroup {
    buttons: RadioButton[];
    onButtonCheck(button: RadioButton): void;
    _addButton(button: RadioButton): void;
    _removeButton(button: RadioButton): void;
    _checkButton(active: RadioButton): void;
}
declare class RadioButton extends CheckedView {
    private _group;
    constructor(parent: View);
    destroy(): void;
    onCheckedChanged(checked: boolean): void;
    group(value?: RadioGroup): RadioGroup;
}
declare class RootView extends Fragment {
    constructor();
    _bootstrap(app: Application): void;
    onLayout(state: LayoutState): void;
}
declare class SliderThumb {
    value: number;
    minValue: number;
    maxValue: number;
    dragged: boolean;
    hovering: boolean;
    background: Drawable;
    selection: Drawable;
    thumb: Drawable;
    setValue(value: number): number;
}
declare class Slider extends View {
    private _tempRect;
    private _thumbs;
    private _dragOffsetX;
    private _thumbWidth;
    private _thumbHeight;
    private _barSize;
    constructor(parent: View);
    thumbs(): SliderThumb[];
    value(value?: number): number;
    minValue(value?: number): number;
    maxValue(value?: number): number;
    valueAt(index: number, value?: number): number;
    minValueAt(index: number, value?: number): number;
    maxValueAt(index: number, value?: number): number;
    addThumb(thumb: SliderThumb): void;
    createDefaultThumb(): SliderThumb;
    _clampValueAt(index: number, value: number): number;
    _clampValue(thumb: SliderThumb, value: number): number;
    _computeRelativeValue(thumb: SliderThumb): number;
    _computeAbsoluteValue(thumb: SliderThumb, x: number, y: number): number;
    _computeThumbRect(thumb: SliderThumb): Rect;
    _computeThumbHeight(thumb: SliderThumb): number;
    onGetContentSize(): Rect;
    _updateThumbViewState(state: ViewState, thumb: SliderThumb): void;
    _computeSliderVisualRect(out: Rect): void;
    onDraw(state: ViewState): void;
    _isDragged(): boolean;
    onInterceptInputEvent(state: ViewState, event: InputEvent): boolean;
    onInputDown(event: InputEvent): boolean;
    onInputUp(event: InputEvent): boolean;
    onInputMove(event: InputEvent): boolean;
    onInputScroll(event: InputEvent): boolean;
    _stopHovers(): void;
    _stopDrag(): void;
    onLoseFocus(): void;
}
