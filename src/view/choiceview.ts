/// <reference path="view.ts" />

class ChoiceView extends View {
    public _listLayout : ListLayout;
    public _listAdapter : LayoutDataAdapter;
    public _choices : string[] = [];
    public _choice : number = 0;

    constructor(parent : View) {
        super(parent);
        
        this.textSelectable(false);
        this.padding(dip(5));
        this.background(this._theme.createRoundedStateDrawable(Color.Red));
        
        this._listAdapter = this._createChoiceAdapter();
        this._listLayout = this._createChoiceListLayout();
        this._listLayout.adapter(this._listAdapter);
    }
    
    choice(value? : number) : number {
        return getOrSet(this, "choice", this, "_choice", value, () => {
            this._listAdapter.refresh();
            this._updateText();
        });
    }
    
    choices(value? : string[]) : string[] {
        return getOrSet(this, "choices", this, "_choices", value, () => {
            this._listAdapter.model(value);
            this._updateText();
            this.requestLayout();
        });
    }
    
    destroy() {
        this._listLayout.destroy();
    
        super.destroy();
    }
    
    adapter(value? : ViewAdapter) : ViewAdapter {
        return getOrSet(this, "adapter", this._listLayout, "adapter", value, this._requestLayout); //TODO test
    }
    
    _animateList(from : number, to : number, listener : AnimationListener) {
        var animation = new Animation();
        animation.animateBetween("alpha", from, to);
        animation.listener(listener);
        animation.duration(250);
        animation.start(this._listLayout);
    }
    
    _updateText() {
        if (this._choice < this._choices.length) {
            this.text(this._choices[this._choice]);
        }
    }
    
    onClick() {
        if (this._listLayout.visible()) {
            //Fade out
            this._animateList(1, 0, {
                onStart: null,
                onProgress: null,
                onFinish: () => {
                    this._listLayout.visibility(Visibility.Invisible);
                }
            });
        }
        else {
            //Fade in
            this._animateList(0, 1, {
                onStart: () => {
                    this._listLayout.visibility(Visibility.Visible);
                },
                onProgress: null,
                onFinish: null
            });
        }
    }
    
    onLoseFocus() {
        super.onLoseFocus();
        //this._listLayout.visibility(Visibility.Invisible);
    }
    
    _createChoiceListLayout() : ListLayout {
        var overlay = this._app.overlay;
        var list = new ListLayout(overlay);
        list.visibility(Visibility.Invisible);
        list.wrapHeight(true);
        list.background(new RoundedDrawable(Color.Gray));
        
        if (0) {
            //list.width(dip(300));
            list.maxWidth(dip(300));
            list.bindCenterVertical(overlay.anchorCenter());
            list.bindLeft(overlay.anchorLeft());
            list.bindRight(overlay.anchorRight());
            //list.bindCenter(overlay.anchorCenter());
        }
        else {
            //TODO translate if mobile or if not enough space below. minWidth
            list.bindLeft(this.anchorLeft());
            list.bindTop(this.anchorBottom());
            list.bindRight(this.anchorRight());
        }
        return list;
    }

    _createChoiceAdapter() : LayoutDataAdapter {
        var adapter = new LayoutDataAdapter((index : number, item : any, parent : View) : LayoutData => {
            return this._crateChoiceItemView(index, item, parent);
        }, this._choices);
        return adapter;
    }
    
    _crateChoiceItemView(index : number, item : any, parent : View) : LayoutData {
        var original = this;
        var color = (original._choice === index) ? Color.Green : Color.Yellow;
        return {
            ref: View,
            text: this._choices[index],
            textSize: dip(18),
            textSelectable: false,
            wrapHeight: true,
            margins: dip(5),
            padding: dip(5),
            background: this._theme.createRoundedStateDrawable(color),
            onClick: function(view : View) {
                original.choice(index);
                original._listLayout.visibility(Visibility.Invisible);
            }
        };
    }
    
}
