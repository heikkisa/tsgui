
interface AnimationListener {
    onStart();
    onProgress(pos : number);
    onFinish();
}

interface PropertyTransform {
    name : string;
    originalValue : number;
    startValue : number;
    targetValue : number;
    interpolator : Interpolator;
}

enum AnimationState {
    None = 1,
    Running = 2,
    Finished = 3,
}

class Animation {
    private _startTime : number = null;
    private _duration : number = 500;
    private _period : number = 1000; //If repeating
    private _interpolator : Interpolator = new EasingInterpolator(Easing.linear);
    private _view : View;
    private _state : AnimationState = AnimationState.None;
    private _restoreTransform : boolean = true;
    private _propertyAnimations : Object = {};
    private _listener : AnimationListener = null;
    
    constructor() {
        
    }
    
    duration(duration? : number) : number {
        if (duration !== undefined) {
            this._duration = duration;
        }
        else {
            return this._duration;
        }
    }
    
    period(period? : number) : number {
        if (period !== undefined) {
            this._period = period;
        }
        else {
            return this._period;
        }
    }
    
    restoreStartValues(value? : boolean) : boolean {
        if (value !== undefined) {
            this._restoreTransform = value;
        }
        else {
            return this._restoreTransform;
        }
    }
    
    listener(value? : AnimationListener) : AnimationListener {
        if (value !== undefined) {
            this._listener = value;
        }
        else {
            return this._listener;
        }
    }
    
    state() : AnimationState {
        return this._state;
    }
    
    start(view : View) {
        if (this._state !== AnimationState.None) {
            return;
        }
    
        view.stopAnimation();
        
        this._view = view;
        this._view._animation = this;
        this._state = AnimationState.Running;
        
        this._saveStartValues();
        
        this._view.requestDraw();
        
        if (this._listener !== null && this._listener.onStart !== null) {
            this._view.postEvent(() => {
                if (this._listener !== null) {
                    this._listener.onStart();
                }
            });
        }
    }
    
    stop() {
        if (this._state !== AnimationState.Running) {
            return;
        }
        this._state = AnimationState.Finished;
        
        if (this._view._animation === this) {
            this._view._animation = null;
            
            if (this._restoreTransform) {
                this._restoreStartValues();
            }
        }
        
        if (this._listener !== null && this._listener.onFinish !== null) {
            this._view.postEvent(() => {
                if (this._listener !== null) {
                    this._listener.onFinish();
                }
            });
        }
        
        this._view.requestDraw();
        this._view = null;
    }
    
    animate(name : string, to : number, interpolator : Interpolator = null) {
        this.animateBetween(name, null, to, interpolator);
    }
    
    animateBetween(name : string, from : number, to : number, interpolator : Interpolator = null) {
        var trans : PropertyTransform = {
            name: name,
            originalValue: null,
            startValue: from,
            targetValue: to,
            interpolator: interpolator,
        }
        this._propertyAnimations[name] = trans;
    }
    
    _saveStartValues() {
        var target = this._view;
        for (var prop in this._propertyAnimations) {
            var anim = this._propertyAnimations[prop];
            
            var startValue = null;
            if (typeof(target[prop]) === "function") {
                startValue = target[prop]();
            }
            else {
                startValue = target[prop];
            }
            if (anim.startValue === null) {
                anim.startValue = startValue;
            }
            anim.originalValue = startValue; 
        }
    }
    
    _restoreStartValues() {
        var target = this._view;
        for (var prop in this._propertyAnimations) {
            var startValue = this._propertyAnimations[prop].originalValue;
            
            if (typeof(target[prop]) === "function") {
                target[prop](startValue);
            }
            else {
                target[prop] = startValue;
            }
        }
    }
    
    _onUpdateAnimation() {
        if (this._state !== AnimationState.Running) {
            return;
        }
        
        if (this._startTime === null) {
            //Delay init the start time.
            this._startTime = Date.now();
        }
        
        //TODO use a synced animation time?
        var timeDelta = (Date.now() - this._startTime);
        
        var normalized = timeDelta / this._duration;
        if (this._duration < 0) {
            normalized = (timeDelta / this._period) % 1.0;
        }
        
        if (normalized > 1.0) {
            this._updateViewTransforms(1.0);
            this.stop();
        }
        else {
            this._updateViewTransforms(normalized);
        }
        //Can be dead at this point.
    }
    
    _interpolateValue(from : number, to : number, value : number, interpolator : Interpolator) : number {
        var mod = interpolator.interpolate(value);
        var result = from + mod * (to - from);
        return result;
    }
    
    _updateViewTransforms(interpolation : number) {
        if (this._listener !== null && this._listener.onProgress !== null) {
            this._view.postEvent(() => {
                if (this._listener !== null) {
                    this._listener.onProgress(interpolation);
                }
            });
        }
    
        var target = this._view;
        for (var prop in this._propertyAnimations) {
            var anim = this._propertyAnimations[prop];
        
            var interpolator = anim.interpolator;
            if (interpolator === null) {
                interpolator = this._interpolator;
            }
            
            var newValue = this._interpolateValue(anim.startValue, anim.targetValue, interpolation, interpolator);
            if (typeof(target[prop]) === "function") {
                target[prop](newValue);
            }
            else {
                target[prop] = newValue;
            }
        }
        this._view.requestDraw();
    }
}

class SequenceAnimation { //TODO

}

interface LayoutAnimator {
    onAnimate(view : View, from : Rect, to : Rect);
}

class TranslationLayoutAnimator implements LayoutAnimator {
    constructor(private duration : number = 500) { }

    onAnimate(view : View, from : Rect, to : Rect) {
        if (view.animation() !== null) {
            return; //TODO not needed always
        }
    
        var transX = view.translationX(); //TODO use 0, looks better when resizing fast etc.
        var transY = view.translationY();
        var xDelta = transX + (from.x - to.x);
        var yDelta = transY + (from.y - to.y);

        var anim = new Animation();
        anim.animateBetween("translationX", xDelta, transX);
        anim.animateBetween("translationY", yDelta, transY);
        anim.duration(this.duration);
        anim.start(view);
    }
}

class TeleportLayoutAnimator implements LayoutAnimator {
    constructor(private duration : number = 500) { }

    onAnimate(view : View, from : Rect, to : Rect) {
        if (view.animation() !== null) {
            return;
        }
    
        var transX = view.translationX();
        var transY = view.translationY();
        var xDelta = transX + (from.x - to.x);
        var yDelta = transY + (from.y - to.y);
        
        view.translationX(xDelta);
        view.translationY(yDelta);
        
        var halfWay = false;
        
        var anim = new Animation();
        anim.animateBetween("alpha", 1.0, 0.0, new EasingInterpolator(Easing.boomerang));
        anim.duration(this.duration);
        anim.listener({
            onStart: null,
            onProgress: (pos : number) => {
                if (halfWay === false && pos >= 0.5) {
                    halfWay = true;
                    view.translationX(transX);
                    view.translationY(transY);
                }
            },
            onFinish: function() {
                view.translationX(transX);
                view.translationY(transY);
            }
        });
        anim.start(view);
    } 
}

