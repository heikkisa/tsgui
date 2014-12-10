
class Theme {

    //Scrollbars
    scrollBarAlpha : number = 0.7;
    scrollBarBackgroundColor : Color = Color.RGBA(200, 200, 200, 0.5);
    scrollBarButtonColor : Color = Color.RGBA(200, 150, 200, this.scrollBarAlpha);
    scrollBarSliderColor : Color = Color.RGBA(150, 190, 250, this.scrollBarAlpha);
    
    //View
    viewTextSelectable : boolean = true;
    
    //Button
    buttonPadding : number = dip(5);
    buttonTextSize : number = dip(23);
    buttonBackgroundColor : Color = new Color(220, 220, 220);
    createButtonBackground() : Drawable { return this.createGradientStateDrawable(this.buttonBackgroundColor); }
    
    //EditText
    editTextPadding : number = dip(5);
    editTextBackgroundColor : Color = new Color(200, 200, 200);
    createEditTextBackground() : Drawable { return this.createRoundedStateDrawable(this.editTextBackgroundColor); }
    
    //Slider
    sliderPadding : number = dip(5);
    sliderBarSize : number = dip(10);
    sliderThumbWidth : number = dip(25);
    sliderThumbHeight: number = dip(20);
    sliderBackgroundColor : Color = new Color(255, 128, 0);
    sliderBarBackgroundColor : Color = new Color(255, 0, 0);
    sliderBarSelectionColor : Color = new Color(255, 255, 0);
    sliderBarThumbColor : Color = new Color(220, 220, 220);
    createSliderBackground() : Drawable { return new ColorDrawable(this.sliderBackgroundColor); } //Or null
    createSliderBarBackground() : Drawable { return new ColorDrawable(this.sliderBarBackgroundColor); }
    createSliderBarSelection() : Drawable { return new ColorDrawable(this.sliderBarSelectionColor); }
    createSliderBarThumb() : Drawable { 
        var drawable = this.createGradientStateDrawable(this.sliderBarThumbColor);
        drawable.width = this.sliderThumbWidth;
        drawable.height = this.sliderThumbHeight;
        return drawable;
    }
    
    //CheckedView
    checkedViewPadding : number = dip(5);
    checkedBackgroundSize : number = dip(25);
    checkedMarkerSize : number = dip(20);
    
    //CheckBox
    checkBoxRounding : number = dip(5);
    checkBoxBackgroundSize : number = this.checkedBackgroundSize;
    checkBoxMarkerSize : number = this.checkedMarkerSize;
    checkBoxPadding : number = this.checkedViewPadding;
    checkBoxBackgroundColor : Color = new Color(255, 128, 0);
    checkBoxMarkerColor : Color = new Color(255, 0, 0);
    checkBoxBackground() : Drawable {
        var drawable = this.createCheckedViewDrawable(this.checkBoxBackgroundColor, this.checkBoxRounding, this.checkBoxBackgroundSize);
        drawable._removeStates(VF.Selected);
        return drawable;
    }
    checkBoxMarker() : Drawable { 
        var drawable = this.createCheckedViewDrawable(this.checkBoxMarkerColor, this.checkBoxRounding, this.checkBoxMarkerSize);
        drawable._removeStates(VF.Pressed | VF.Hovering);
        return drawable;
    }
    
    //RadioButton
    radioButtonRounding : number = dip(15);
    radioButtonBackgroundSize : number = this.checkedBackgroundSize;
    radioButtonMarkerSize : number = this.checkedMarkerSize;
    radioButtonPadding : number = this.checkedViewPadding;
    radioButtonBackgroundColor : Color = new Color(255, 0, 128);
    radioButtonMarkerColor : Color = new Color(0, 0, 255);
    radioButtonBackground() : Drawable {
        var drawable = this.createCheckedViewDrawable(this.radioButtonBackgroundColor, this.radioButtonRounding, this.radioButtonBackgroundSize);
        drawable._removeStates(VF.Selected);
        return drawable;
    }
    radioButtonMarker() : Drawable { 
        var drawable = this.createCheckedViewDrawable(this.radioButtonMarkerColor, this.radioButtonRounding, this.radioButtonMarkerSize);
        drawable._removeStates(VF.Pressed | VF.Hovering);
        return drawable;
    }
    
    //Common helper methods
    
    createCheckedViewDrawable(color : Color, rounding : number, size : number) : StateDrawable {
        var drawable = this.createGradientStateDrawable(color, rounding);
        drawable.width = size;
        drawable.height = size;
        return drawable;
    }

    createGradientStateDrawable(color : Color, rounding : number = 15) : StateDrawable {
        var scale = 0.5;
        var states = [
            makeDrawableState(new GradientDrawable([color, color.scaled(scale * 1.5)], rounding), VF.Any, VF.Enabled), //Disabled
            //makeDrawableState(new ColorDrawable(Color.Red), VF.Any, VF.Enabled), //Disabled
            makeDrawableState(new GradientDrawable([color.inverted(), color.scaled(scale).inverted()], rounding), VF.Selected), //Selected
            makeDrawableState(new GradientDrawable([color.scaled(scale), color], rounding), VF.Pressed), //Pressed
            makeDrawableState(new GradientDrawable([color, color.scaled(scale * 0.7)], rounding), VF.Hovering), //Hovering
            makeDrawableState(new GradientDrawable([color, color.scaled(scale)], rounding), VF.Any) //Default
        ];
        return new StateDrawable(states);
    }
    
    createRoundedStateDrawable(color : Color) : StateDrawable {
        var scale = 0.5;
        var states = [
            makeDrawableState(new ColorDrawable(Color.Red), VF.Any, VF.Enabled), //Disabled
            makeDrawableState(new RoundedDrawable(color.scaled(scale).inverted()), VF.Selected), //Selected
            makeDrawableState(new RoundedDrawable(color.scaled(1.1)), VF.Focused), //Focused
            makeDrawableState(new RoundedDrawable(color.scaled(0.8)), VF.Pressed), //Pressed (TODO never used, focused first)
            makeDrawableState(new RoundedDrawable(color.scaled(0.9)), VF.Hovering), //Hovering
            makeDrawableState(new RoundedDrawable(color), VF.Any) //Default
        ];
        return new StateDrawable(states);
    }
}

