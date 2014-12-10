/// <reference path="linearlayout.ts" />

class OverflowLayout extends LinearLayout {
    public _overflow : LinearLayout;
    public _button : Button;
    public _overflowVisibility : Visibility = Visibility.Invisible;

    constructor(parent : View) {
        super(parent);
        
        this.orientation(Orientation.X);
        
        this._overflow = this._createOverflowLinearLayout();
        this._button = this._createButton();
    }
    
    destroy() {
        this._overflow.destroy();
        super.destroy();
    }
    
    _getButtonWidth() {
        return this._button._marginRect.width + this._button.marginLeft() + this._button.marginRight();
    }
    
    onGetContentRect() : Rect {
        var rect = super.onGetContentRect();
        if (this._button.visible()) {
            rect.width += this._getButtonWidth();
        }
        return rect;
    }
    
    onLayout(state : LayoutState) {
        super.onLayout(state);

        var buttonWidth = this._getButtonWidth();
        
        if (this._scrollArea.canScroll()) {
            //Move items to overflow layout
            var children = this._children.slice(0);
            for (var i = children.length - 1; i >= 0; --i) {
                var child = children[i];
                
                if (this._isChildContent(child)) {
                    var childWidth = child.width() + child.marginLeft() + child.marginRight();
                    if (this._contentRect.width > this._marginRect.width) {
                        this.removeChild(child);
                        this._overflow.addChild(child, 0);
                        
                        super.onLayout(state);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            //Move items back from the overflow layout
            var overflows = this._overflow._children.slice(0);
            for (var i = 0; i < overflows.length; ++i) {
                var child = overflows[i];
                var childWidth = child.width() + child.marginLeft() + child.marginRight();
                if (this._contentRect.width + childWidth < this._marginRect.width + 0) {
                    this._overflow.removeChild(child);
                    this.addChild(child);
                    
                    super.onLayout(state);
                }
                else {
                    break;
                }
            }
        }
        
        super.onLayout(state);
        
        if (this._overflow._children.length > 0) {
            this._button.visibility(Visibility.Visible);
        }
        else {
            this._overflowVisibility = Visibility.Invisible;
            this._overflow.visibility(this._overflowVisibility);
            this._button.visibility(this._overflowVisibility);
        }
    }
    
    _popChildView(parent : View) : View {
        var view = null;
        if (parent._children.length > 0) {
            view = parent._children[parent._children.length - 1];
            parent.removeChild(view);
        }
        return view;
    }
    
    _createButton() : Button {
        var button = new Button(this);
        //button.wrapWidth(true);
        button.wrapHeight(false);
        button.width(50);
        button.margins(dip(10));
        button.bindTop(this.anchorTop());
        button.bindRight(this.anchorRight());
        button.bindBottom(this.anchorBottom());
        button.visibility(Visibility.Invisible);
        button.text("\u22EE");
        button.hook(button.onClick, () => {
            if (this._overflowVisibility === Visibility.Visible) {
                this._overflowVisibility = Visibility.Invisible;
            }
            else {
                this._overflowVisibility = Visibility.Visible;
            }
            this._overflow.visibility(this._overflowVisibility);
        });
        return button;
    }
    
    _createOverflowLinearLayout() : LinearLayout {
        var layout = new LinearLayout(this._app.overlay);
        layout.wrapWidth(true);
        layout.wrapHeight(true);
        layout.gravity(Gravity.CenterHorizontal);
        layout.background(new RoundedDrawable(Color.Gray));
        layout.visibility(Visibility.Invisible);
        
        //TODO translate if mobile or if not enough space below. minWidth
        //layout.bindLeft(this.anchorLeft());
        layout.bindTop(this.anchorBottom());
        layout.bindRight(this.anchorRight());
        
        return layout;
    }

}
