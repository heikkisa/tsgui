/// <reference path="demo.ts" />

module layout {

function createButton() : LayoutData {
    return {
        ref: Button,
        text: "Button",
        width: dip(150),
        margins: dip(10)
    };
}

function createCheckBox() : LayoutData {
    return {
        ref: CheckBox,
        text: "This is a checkbox",
        width: dip(200),
        margins: dip(10),
        background: new ColorDrawable(DemoHelper.randomColor())
    };
}

function createRadioButton(text : string, group : RadioGroup) : LayoutData {
    return {
        ref: RadioButton,
        text: text,
        group: group,
        background: new ColorDrawable(DemoHelper.randomColor())
    };
}

function createRadioButtons() : LayoutData {
    var radioGroup = new RadioGroup();
    return {
        ref: LinearLayout,
        width: dip(200),
        gravity: Gravity.StretchX,
        wrapHeight: true,
        margins: dip(10),
        children: [
            createRadioButton("Radiobutton 1", radioGroup),
            createRadioButton("Radiobutton 2", radioGroup),
            createRadioButton("Radiobutton 3", radioGroup),
        ]
    };
}

function createSlider() : LayoutData {
    return {
        ref: Slider,
        width: dip(200),
        margins: dip(10),
        value: 25,
        background: new ColorDrawable(DemoHelper.randomColor())
    };
}

function createSlider2() : LayoutData {
    return {
        ref: Slider,
        width: dip(200),
        margins: dip(10),
        background: new ColorDrawable(DemoHelper.randomColor()),
        onInflate: function(slider : Slider) {
            //Add a second slider thumb.
            var thumb = slider.createDefaultThumb();
            thumb.value = 50;
            //thumb.minValue = 50; //TODO 
            thumb.selection = new ColorDrawable(Color.Green);
            slider.addThumb(thumb);
            slider.valueAt(0, 10);
            slider.valueAt(1, 50);
        }
    };
}

function createEditText() : LayoutData {
    return {
        ref: EditText,
        text: "Editable text",
        width: dip(200),
        wrapHeight: true,
        margins: dip(10),
    };
}

function createChoices() : LayoutData {
    return {
        ref: ChoiceView,
        width: dip(200),
        wrapHeight: true,
        margins: dip(10),
        choice: 1,
        choices: ["First choice", "Second choice", "Third choice", "Fourth choice"]
    };
}

export function createWidgetsLayoutDemoView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        scrollable: false,
        children: [
        {
            ref: FlowLayout,
            fillParent: true,
            //fitChildren: true,
            margins: dip(10),
            children: [
                createButton(),
                createChoices(),  
                createCheckBox(),
                createRadioButtons(),
                createSlider(),
                createSlider2(),
                createEditText()
            ]
        }
        ]
    };
}

}