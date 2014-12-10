/// <reference path="view.ts" />

class Button extends View {
    constructor(parent : View) {
        super(parent);
        
        var pad = this._theme.buttonPadding;
        this.padding(pad);
        this.paddingTop(pad * 2);
        this.paddingBottom(pad * 2);
        
        this.textSize(this._theme.buttonTextSize);
        this.textAlign(TextAlign.Center);
        this.textSelectable(false);
        this.clickable(true);
        this.background(this._theme.createButtonBackground());
        this.wrapHeight(true); //TODO not good by default
    }
}
