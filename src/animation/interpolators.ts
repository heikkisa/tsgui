
interface Interpolator {
    interpolate(pos : number) : number;
}

interface EasingFunction {
    (pos : number) : number;
}

//TODO: https://github.com/jeremyckahn/shifty/blob/master/src/shifty.formulas.js

class Easing {
    static linear(pos) {
        return pos;
    }

    static boomerang(pos) {
        return ((pos >= 0.5) ? 1.0 - pos : pos) * 2;
    }
    
    static inQuad(pos){
        return Math.pow(pos, 2);
    }

    static outQuad(pos){
        return -(Math.pow((pos-1), 2) -1);
    }

    static inOutQuad(pos){
        if ((pos/=0.5) < 1) {
            return 0.5*Math.pow(pos,2);
        }
        return -0.5 * ((pos-=2)*pos - 2);
    }

    static inCubic(pos){
        return Math.pow(pos, 3);
    }

    static outCubic(pos){
        return (Math.pow((pos-1), 3) +1);
    }

    static inOutCubic(pos){
        if ((pos/=0.5) < 1) {
            return 0.5*Math.pow(pos,3);
        }
        return 0.5 * (Math.pow((pos-2),3) + 2);
    }

    static inQuart(pos){
        return Math.pow(pos, 4);
    }

    static outQuart(pos){
        return -(Math.pow((pos-1), 4) -1);
    }

    static inOutQuart(pos){
        if ((pos/=0.5) < 1) {
            return 0.5*Math.pow(pos,4);
        }
        return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    }

    static inQuint(pos){
        return Math.pow(pos, 5);
    }

    static outQuint(pos){
        return (Math.pow((pos-1), 5) +1);
    }

    static inOutQuint(pos){
        if ((pos/=0.5) < 1) {
            return 0.5*Math.pow(pos,5);
        }
        return 0.5 * (Math.pow((pos-2),5) + 2);
    }

    static inSine(pos){
        return -Math.cos(pos * (Math.PI/2)) + 1;
    }

    static outSine(pos){
        return Math.sin(pos * (Math.PI/2));
    }

    static inOutSine(pos){
        return (-0.5 * (Math.cos(Math.PI*pos) -1));
    }

    static inExpo(pos){
        return (pos===0) ? 0 : Math.pow(2, 10 * (pos - 1));
    }

    static outExpo(pos){
        return (pos===1) ? 1 : -Math.pow(2, -10 * pos) + 1;
    }

    static inOutExpo(pos){
        if (pos===0) {
            return 0;
        }
        if (pos===1) {
            return 1;
        }
        if ((pos/=0.5) < 1) {
            return 0.5 * Math.pow(2,10 * (pos-1));
        }
        return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
    }

    static inCirc(pos){
        return -(Math.sqrt(1 - (pos*pos)) - 1);
    }

    static outCirc(pos){
        return Math.sqrt(1 - Math.pow((pos-1), 2));
    }

    static inOutCirc(pos){
        if ((pos/=0.5) < 1) {
            return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
    }

    static outBounce(pos){
        if ((pos) < (1/2.75)) {
            return (7.5625*pos*pos);
        } 
        else if (pos < (2/2.75)) {
            return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
        } 
        else if (pos < (2.5/2.75)) {
            return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
        } 
        else {
            return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
        }
    }

    static inBack(pos){
        var s = 1.70158;
        return (pos)*pos*((s+1)*pos - s);
    }

    static outBack(pos){
        var s = 1.70158;
        return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
    }

    static inOutBack(pos){
        var s = 1.70158;
        if ((pos/=0.5) < 1) {
            return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
        }
        return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
    }

    static elastic(pos) {
        return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
    }

    static swingFromTo(pos) {
        var s = 1.70158;
        return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
            0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
    }

    static swingFrom(pos) {
        var s = 1.70158;
        return pos*pos*((s+1)*pos - s);
    }

    static swingTo(pos) {
        var s = 1.70158;
        return (pos-=1)*pos*((s+1)*pos + s) + 1;
    }

    static bounce(pos) {
        if (pos < (1/2.75)) {
            return (7.5625*pos*pos);
        } 
        else if (pos < (2/2.75)) {
            return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
        } 
        else if (pos < (2.5/2.75)) {
            return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
        } 
        else {
            return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
        }
    }

    static bouncePast(pos) {
        if (pos < (1/2.75)) {
            return (7.5625*pos*pos);
        } 
        else if (pos < (2/2.75)) {
            return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
        } 
        else if (pos < (2.5/2.75)) {
            return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
        } 
        else {
            return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
        }
    }

    static fromTo(pos) {
        if ((pos/=0.5) < 1) {
            return 0.5*Math.pow(pos,4);
        }
        return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    }

    static from(pos) {
        return Math.pow(pos,4);
    }

    static to(pos) {
        return Math.pow(pos,0.25);
    }
}

class EasingInterpolator implements Interpolator {
    constructor(easing : EasingFunction) { 
        this.interpolate = easing; //Replace the method
    }

    interpolate(pos : number) : number {
        return null;
    }
}

class OvershootInterpolator implements Interpolator {
    constructor(private tension : number = 1.0) { }
    
    interpolate(pos : number) : number {
        pos -= 1.0;
        return pos * pos * ((this.tension + 1) * pos + this.tension) + 1.0;
    }
}

class DecelerateInterpolator implements Interpolator {
    public static Shared : DecelerateInterpolator = new DecelerateInterpolator(); //TODO not used?

    constructor(private factor : number = 1.0) {
    }
    
    interpolate(pos : number) : number {
        var result = 0;
        if (this.factor === 1.0) {
            result = (1.0 - (1.0 - pos) * (1.0 - pos));
        }
        else {
            result = (1.0 - Math.pow((1.0 - pos), 2 * this.factor));
        }
        return result;
    } 
}

class ConstantInterpolator implements Interpolator {
    constructor(private constant : number, private from : number = 0, private to : number = 1) { }

    interpolate(pos : number) : number {
        return (pos >= this.constant) ? this.to : this.from;
    }
}

class CycleInterpolator implements Interpolator {
    constructor(private cycles : number) { }

    interpolate(pos : number) : number {
        return Math.sin(2 * this.cycles * Math.PI * pos);
    }
}

//Catmull-Rom spline interpolator
class SplineInterpolator implements Interpolator {
    private p0 : Point;
    private p1 : Point;
    private p2 : Point;
    private p3 : Point;

    constructor(y0 : number, y1 : number, y2 : number, y3 : number) { 
        this.p0 = {x: 0, y: y0};
        this.p1 = {x: 1, y: y1};
        this.p2 = {x: 2, y: y2};
        this.p3 = {x: 3, y: y3};
    }

    interpolate(pos : number) : number {
        var p0 = this.p0;
        var p1 = this.p1;
        var p2 = this.p2;
        var p3 = this.p3;
        var t = pos;
        var t2 = t * t;
        var t3 = t2 * t;
        //Only interpolate the y-component of the spline
        return 0.5 * ((2.0 * p1.y) +
            (-p0.y + p2.y) * t +
            (2.0 * p0.y - 5.0 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3.0 * p1.y - 3.0 * p2.y + p3.y) * t3);
    }
}
