/// <reference path="checkedview.ts" />

class RadioGroup {
    public buttons : RadioButton[] = [];
    
    onButtonCheck(button : RadioButton) {
        //Empty
    }
    
    _addButton(button : RadioButton) {
        if (this.buttons.indexOf(button) === -1) {
            this.buttons.push(button);
        }
    }
    
    _removeButton(button : RadioButton) {
        var index = this.buttons.indexOf(button);
        if (index !== -1) {
            this.buttons.splice(index, 1);
        }
    }
    
    _checkButton(active : RadioButton) {
        for (var i=0; i < this.buttons.length; ++i) {
            var button = this.buttons[i];
            if (button !== active) {
                button.checked(false);
            }
        }
        active.checked(true);
        
        this.onButtonCheck(active);
    }
}

class RadioButton extends CheckedView {
    private _group : RadioGroup = null;

    constructor(parent : View) {
        super(parent);
        
        this._allowUserUncheck = false;
        
        this._textPad = this._theme.radioButtonPadding;
        this.padding(this._textPad);
        
        this.checkBackground(this._theme.radioButtonBackground());
        this.checkMarker(this._theme.radioButtonMarker());
    }
    
    destroy() {
        if (this._group) {
            this._group._removeButton(this);
            this._group = null;
        }
        super.destroy();
    }
    
    onCheckedChanged(checked : boolean) {
        if (this._group && checked) {
            this._group._checkButton(this);
        }
    }
    
    group(value? : RadioGroup) : RadioGroup {
        if (value !== undefined) {
            if (this._group) {
                this._group._removeButton(this);
            }
            this._group = value;
            this._group._addButton(this);
            
            if (this.checked()) {
                this._group._checkButton(this);
            }
        }
        else {
            return this._group;
        }
    }
}
