/// <reference path="layout.ts" />

enum Orientation {
    X = 1 << 0,
    Y = 1 << 1,
}

class LinearLayout extends Layout {
    private _orientation : Orientation = Orientation.Y;
    private _gravity : Gravity = 0;

    constructor(parent : View) {
        super(parent);
    }
    
    orientation(value? : Orientation) : Orientation { 
        return getOrSet(this, "orientation", this, "_orientation", value, this._requestLayout); 
    }
    
    gravity(value? : Gravity) : Gravity { 
        return getOrSet(this, "gravity", this, "_gravity", value, this._requestLayout); 
    }
    
    onLayoutChildren() {
        var x = this._marginRect.x;
        var y = this._marginRect.y;

        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (!this._isChildContent(child)) {
                continue;
            }
            //TODO unbind all?
            
            var childWidth = child.width() + child.marginLeft();
            var childHeight = child.height() + child.marginTop();

            child.x(x + child.marginLeft());
            child.y(y + child.marginTop());
            
            if (this._orientation === Orientation.X) {
                x += childWidth;
            }
            else {
                y += childHeight;
            }
        }
        this._applyGravityToChildren(this._children, this._marginRect, this._gravity, this._orientation);
    }
}
