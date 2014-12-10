
class MatrixTransform {
    public m : number[];
    
    constructor() {
        this.identity();
    }
    
    copy() : MatrixTransform {
        var m = new MatrixTransform();
        m.m[0] = this.m[0];
        m.m[1] = this.m[1];
        m.m[2] = this.m[2];
        m.m[3] = this.m[3];
        m.m[4] = this.m[4];
        m.m[5] = this.m[5];
        return m;
    }
    
    determinant() : number {
        return this.m[0] * this.m[3] - this.m[1] * this.m[2];
    }
    
    isInvertible() : boolean {
        return this.determinant() !== 0;
    }
    
    identity() {
        this.m = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];
    }
    
    multiply(matrix : MatrixTransform) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
    }
    
    invert() {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]); //TODO check if zero
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
    }
    
    rotate(radians : number) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    }
    
    translate(x : number, y : number) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
    }
    
    scale(sx : number, sy : number) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
    }
    
    shear(sx : number, sy : number) {
        var a = this.m[0];
        var b = this.m[1];
        
        this.m[0] += sy * this.m[2];
        this.m[1] += sy * this.m[3];
        this.m[2] += sx * a;
        this.m[3] += sx * b;
    }
    
    skew(sx : number, sy : number) {
        this.shear(sx, sy);
    }
    
    transformPoint(px : number, py : number) : Point {
        var x = px; //TODO unneeded temporary variables
        var y = py;
        px = x * this.m[0] + y * this.m[2] + this.m[4];
        py = x * this.m[1] + y * this.m[3] + this.m[5];
        return {x: px, y: py};
    }
}
