/// <reference path="view.ts" />

class EditText extends View {
    constructor(parent : View) {
        super(parent);
        
        this._text.interactive = true;
        this._text.selectable = true;
        
        this.padding(this._theme.editTextPadding);
        this.background(this._theme.createEditTextBackground());
    }
    
    onInputMove(event : InputEvent) : boolean {
        var handled = super.onInputMove(event);
        this.app().setCursor("text");
        return handled;
    }
    
    onGainFocus() {
        super.onGainFocus();
        this.app().focusInputElement(true);
    }
    
    onLoseFocus() {
        super.onLoseFocus();
        this.app().focusInputElement(false);
    }
    
    onKeyDown(event : KeyEvent) : boolean {
        if (event.keyCode === 8) { //Backspace
            this._text.deleteChar();
            this._requestLayoutText();
        }
        else if (event.keyCode === 37) { //Left arrow
            this._text.caret(this._text.caret() - 1);
            this._text.clearSelection();
            this.requestDraw();
        }
        else if (event.keyCode === 39) { //Right arrow
            this._text.caret(this._text.caret() + 1);
            this._text.clearSelection();
            this.requestDraw();
        }
        return true;
    }
    
    onKeyUp(event : KeyEvent) : boolean {
        return true;
    }
    
    onKeyPress(event : KeyEvent) : boolean {
        /*
        var isCharacter = !event.ctrlKey && !event.metaKey; //Very rough
        if (isCharacter) {
            if (event.keyCode !== 8) {
                var charStr = String.fromCharCode(event.charCode);
                if (charStr === " " || charStr.trim().length > 0) {
                    this._text.addText(charStr); //TODO filter here in or TextValue?
                    this._requestLayoutText();
                }
            }
            this.app().inputElement().value = "  ";
        }*/
        
        this._text.addText(String.fromCharCode(event.charCode)); //TODO filter here in or TextValue?
        this._requestLayoutText();
         
        return true;
    }
    
}
