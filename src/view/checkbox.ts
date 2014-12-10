/// <reference path="checkedview.ts" />

class CheckBox extends CheckedView {
    constructor(parent : View) {
        super(parent);
        
        this._textPad = this._theme.checkBoxPadding;
        this.padding(this._textPad);
        
        this.checkBackground(this._theme.checkBoxBackground());
        this.checkMarker(this._theme.checkBoxMarker());
    }
}
