/// <reference path="layout.ts" />

class LayerLayout extends Layout {
    constructor(parent : View) {
        super(parent);
    }
    
    onLayoutChildren() {
        var x = this._marginRect.x;
        var y = this._marginRect.y;

        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (this._isChildContent(child)) {
                child.x(x + child.marginLeft());
                child.y(y + child.marginTop());
            }
        }
    }
}
