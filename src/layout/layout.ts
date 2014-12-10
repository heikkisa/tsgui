/// <reference path="../view/view.ts" />

//TODO almost same as TextAlign...
enum Gravity {
    Left = 0,
    Top = 0,
    Right = 1 << 0,
    Bottom = 1 << 1,
    CenterHorizontal = 1 << 2,
    CenterVertical = 1 << 3,
    Center = CenterHorizontal | CenterVertical,
    StretchX = 1 << 4,
    StretchY = 1 << 5,
    Stretch = StretchX | StretchY
}

interface LayoutAnimationItem {
    view : View;
    rect : Rect;
}

class Layout extends View {
    public _layoutAnimator : LayoutAnimator = null;
    public _layoutAnimationItems : LayoutAnimationItem[] = null;

    constructor(parent : View) {
        super(parent);
        
        this._measureChildMargins = true;
        this.clipChildren(true);
    }
    
    layoutAnimator(value? : LayoutAnimator) : LayoutAnimator {
        return getOrSet(this, "layoutAnimator", this, "_layoutAnimator", value, this._requestDraw); 
    }
    
    onLayout(state : LayoutState) {
        super.onLayout(state);
        if (this._visibility === Visibility.Gone) {
            return;
        }
        this._saveLayoutAnimationItems();
        
        this._adjustChildrenLayoutBlock(this, 1);
        this.onLayoutChildren();
        this._adjustChildrenLayoutBlock(this, -1);

        super.onLayout(state);
    }
    
    onLayoutChildren() {
    
    }
    
    onLayoutReady() {
        super.onLayoutReady();
    
        this._animateLayout();
    }
    
    _adjustChildrenLayoutBlock(view : View, count : number) {
        for (var i=0; i < view._children.length; ++i) {
            //TODO if more than one child level deep... Not needed anymore anyway?
            view._children[i]._blockLayout += count;
        }
    }
    
    _saveLayoutAnimationItems() {
        if (this._layoutAnimator !== null && this._layoutAnimationItems === null) {
            this._layoutAnimationItems = [];
            
            for (var i=0; i < this._children.length; ++i) {
                var child = this._children[i];
                this._layoutAnimationItems.push({
                    view: child,
                    rect: child._marginRect.copy()
                });
            }
        }
    }
    
    _rectMoved(a : Rect, b : Rect) : boolean {
        return (R(a.x) !== R(b.x)) || (R(a.y) !== R(b.y));
    }
    
    _animateLayout() {
        if (this._layoutAnimator !== null && this._layoutAnimationItems !== null) {
            for (var i=0; i < this._layoutAnimationItems.length; ++i) {
                var item = this._layoutAnimationItems[i];
                var oldRect = item.rect;
                var newRect = item.view._marginRect;
                if (this._rectMoved(oldRect, newRect)) {
                    this._layoutAnimator.onAnimate(item.view, oldRect, newRect);
                }
            }
        }
        this._layoutAnimationItems = null;
    }
    
    _applyGravityToRect(rect : Rect, bounds : Rect, gravity : Gravity) {
        if (gravity & Gravity.Right) {
            rect.x = bounds.right() - rect.width;
        }
        else if (gravity & Gravity.StretchX) {
            rect.x = bounds.x;
            rect.width = bounds.width;
        }
        else if (gravity & Gravity.CenterHorizontal) {
            rect.x = bounds.centerX() - (rect.width / 2);
        }

        if (gravity & Gravity.Bottom) {
            rect.y = bounds.bottom() - rect.height;
        }
        else if (gravity & Gravity.StretchY) {
            rect.y = bounds.y;
            rect.height = bounds.height;
        }
        else if (gravity & Gravity.CenterVertical) {
            rect.y = bounds.centerY() - (rect.height / 2);
        }
    }
    
    _applyGravityToChildren(views : View[], bounds : Rect, gravity : Gravity, orientation : Orientation = null) {
        var content = this._computeChildrenBounds(views);
        if (content === null) {
            return;
        }
        
        var alignRight = gravity & Gravity.Right;
        var alignBottom = gravity & Gravity.Bottom;
        var centerX = gravity & Gravity.CenterHorizontal;
        var centerY = gravity & Gravity.CenterVertical;
        
        var rightShift = Math.floor(bounds.right() - content.width - bounds.x);
        var middleShiftX = Math.floor(rightShift / 2);
        
        var bottomShift = Math.floor(bounds.bottom() - content.height - bounds.y);
        var middleShiftY = Math.floor(bottomShift / 2);
        
        for (var i=0; i < views.length; ++i) {
            var child = views[i];
            if (!this._isChildContent(child)) {
                continue;
            }
        
            if (alignRight) {
                child.x(child.x() + rightShift);
            }
            else if (gravity & Gravity.StretchX) {
                child.x(bounds.x + child.marginLeft());
                child.width(child._clampWidth(bounds.width - child.marginLeft() - child.marginRight()));
            }
            
            if (centerX) {
                if (orientation && (orientation & Orientation.Y)) {
                    //Center one line of views horizontally.
                    var w = child.width() + child.marginLeft() + child.marginRight();
                    var childShiftX = Math.floor((content.width - w) / 2);
                    child.x(child.x() + middleShiftX + childShiftX);
                }
                else {
                    child.x(child.x() + middleShiftX);
                }
            }
            
            if (alignBottom) {
                child.y(child.y() + bottomShift);
            }
            else if (gravity & Gravity.StretchY) {
                child.y(bounds.y + child.marginTop());
                child.height(child._clampHeight(bounds.height - child.marginTop() - child.marginBottom()));
            }
            
            if (centerY) {
                if (orientation && (orientation & Orientation.X)) {
                    //Center one line of views vertically.
                    var h = child.height() + child.marginTop() + child.marginBottom();
                    var childShiftY = Math.floor((content.height - h) / 2);
                    child.y(child.y() + middleShiftY + childShiftY);
                }
                else {
                    child.y(child.y() + middleShiftY);
                }
            }
        }
    }
}
