/// <reference path="demo.ts" />

/**
    Don't use this file as an example, it was used as a debug test during development
    to see how things work together.
*/

var TEXT = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. ";

var LONG_TEXT = "";
for (var i=0; i < 50; ++i) {
    LONG_TEXT += TEXT;
}

var FORMATTED_TEXT = 'Tama on pieni <{"size": 20, "background" : "#00FF00"}>te<{"color": "#FF0000"}>sti ja <{"size": 10}>iso</> sa</>na.</>   Sitten turhaa.';
var EDIT_TEXT = 'Try to <{"size": 20, "background" : "#00FF00"}>type te</>xt. ';

function CreateRadioButton(text, color, group, selected) {
    return {
        ref: RadioButton,
        text: text,
        background: new ColorDrawable(color),
        group: group,
        checked: selected,

        onCheckedChanged: function(view : RadioButton, checked : boolean) {
            Log(text + " checked: " + checked);
        }
    };
}

function FlowItem(text, width, height, bg) {
    return {
        text: text,
        width: width,
        height: height,
        background: bg,
        margins: dip(5),
        textAlign: TextAlign.Center,
        
        onClick: function(view : View) {
            view.visibility(Visibility.Gone);
        }
    };
}

function createDebugTestLayout() {
    var radioGroup = new RadioGroup();
    
    return {
        ref: View,
        fillParent: true,
        clickable: false,
        scrollable: true,
    
        children: [
        {
            ref: View,
            id: "baseView",
            bindLeft: $parent().anchorLeft(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            bindBottom: $parent().anchorBottom(),
            clickable: false,
            scrollable: false,
            
            children: [
            {
                ref: View,
                id: "bigtext",
                text: LONG_TEXT,
                y: 50,
                height: 400,
                rotation: 10,
                translationX: 150,
                translationY: 150,
                padding: 10,
                bindLeft: $parent().anchorLeft(),
                bindRight: $parent().anchorCenter(),
                marginLeft: 50,
                clipChildren: false,
                background: new ColorDrawable(new Color(255, 255, 0)),
                
                children: [
                {
                    text: "Second box with some text.",
                    width: 100,
                    height: 300,
                    marginLeft: 100,
                    marginRight: 10,
                    marginBottom: 15,
                    marginTop: 100, 
                    padding: 5,
                    rotation: -20,
                    bindLeft: $parent().anchorLeft(),
                    bindTop: $parent().anchorTop(),
                    bindRight: $parent().anchorRight(),
                    bindBottom: $parent().anchorBottom(),
                    background: new GradientDrawable([Color.Red, Color.Red.scaled(0.5)]),
                    
                    children:[
                    {
                        text: "Third box",
                        width: 80,
                        height: 50,
                        marginRight: 40,
                        marginBottom: 10,
                        bindRight: $parent().anchorRight(),
                        bindBottom: $parent().anchorBottom(),
                        textAlign: TextAlign.Bottom | TextAlign.Right,
                        background: new ColorDrawable(new Color(255, 255, 255))
                    },
                    {
                        text: "Fourth box",
                        width: 80,
                        height: 50,
                        marginLeft: 40,
                        bindLeft: $parent().anchorLeft(),
                        bindCenterVertical: $parent().anchorCenterVertical(),
                        background: new ColorDrawable(new Color(255, 255, 255)),
                        textColor: Color.RGB(255, 0, 0)
                    },
                    {
                        ref: ImageView,
                        id: "image",
                        bindTop: $parent().anchorTop(),
                        bindRight: $parent().anchorRight(),
                        padding: 0,
                        margins: 10,
                        rotation: 45,
                        background: new ColorDrawable(new Color(255, 0, 255)),
                        //url: "logo.png",
                        url: "images/oudrid.jpg",
                        wrapWidth: true,
                        wrapHeight: true,
                        
                        onImageLoad: function(view : ImageView, url : string, image : ImageDrawable) {
                            Log("Loaded an image: " + url);
                        }
                    },
                    {
                        text: TEXT,
                        width: 100,
                        height: 100,
                        margins: 10,
                        bindLeft: $parent().anchorLeft(),
                        bindBottom: $parent().anchorBottom(),
                        clipChildren: true,
                        background: new ColorDrawable(new Color(255, 255, 255)),
                    },
                    ]
                }
                ]
            },
            {
                ref: Button,
                text: "Button",
                textColor: Color.Red,
                id: "button",
                width: 150,
                margins: 10,
                bindTop: $parent().anchorTop(),
                bindLeft: $parent().anchorCenter(),
                bindRight: $parent().anchorRight(),
                
                onClick: function(view : Button) {
                    var view = view.app().root.findView("scrolltest");
                    if (view) {
                        var anim = new Animation();
                        anim.animate("rotation", 45);
                        anim.animate("scaleX", 1.5);
                        anim.start(view);
                    }
                    App.$("disable").enabled(true);
                },
                
                onXChanged: function(view : Button, x : number) {
                    Log("X Changed: " + x);
                }
            },
            {
                ref: Button,
                text: "Disable",
                id: "disable",
                width: 100,
                margins: 10,
                bindTop: "#button.anchorBottom()",
                bindRight: $parent().anchorRight(),
                
                onClick: function(view : Button) {
                    view.enabled(false);
                },
            },
            {
                ref: EditText,
                id: "edittext",
                width: 200,
                wrapHeight: true,
                margins: 10,
                text: EDIT_TEXT + EDIT_TEXT,
                bindTop: "parent().anchorTop()",
                bindRight: "#button.anchorLeft()",
            },
            {
                text: "Scrollable",
                id: "scrolltest",
                width: 200,
                height: 200,
                bindRight: "parent().anchorRight()",
                bindTop: "parent().anchorTop()",
                marginRight: 50,
                marginTop: 150,
                background: new ColorDrawable(Color.Gray),
                
                children:
                [
                {
                    text: "Child item 1",
                    width: 100,
                    height: 100,
                    bindLeft: "parent().anchorLeft()",
                    bindTop: "parent().anchorTop()",
                    marginLeft: -25,
                    marginTop: -75,
                    background: new LayerDrawable(
                        new ColorDrawable(Color.Green),
                        new GradientDrawable([Color.Yellow, Color.Blue], 20)),
                },
                {
                    text: "Child item 2",
                    width: 125,
                    height: 125,
                    bindLeft: "parent().anchorLeft()",
                    bindTop: "parent().anchorTop()",
                    //margins: 150,
                    marginLeft: 100,
                    marginTop: 190,
                    background: new ColorDrawable(Color.Yellow),
                }
                ]
            },
            {
                ref: FlowLayout,
                height: 150,
                id: "leftFlow",
                wrapHeight: true,
                minHeight: 50,
                bindLeft: "parent().anchorLeft()",
                bindRight: "parent().anchorCenter()",
                bindBottom: "parent().anchorBottom()",
                margins: 1,
                background: new ColorDrawable(Color.Blue),
                
                children:
                [
                    FlowItem("First", 100, 100, new ColorDrawable(Color.Red)),
                    FlowItem("Second", 100, 110, new ColorDrawable(Color.Green)),
                    FlowItem("Third", 130, 100, new ColorDrawable(Color.Yellow)),
                    FlowItem("Fourth", 100, 100, new ColorDrawable(Color.Gray)),
                    //FlowItem("Fifth", 100, 100, new ColorDrawable(Color.White)),
                ]
            },
            {
                ref: FlowLayout,
                id: "rightFlow",
                bindLeft: "#leftFlow.anchorRight()",
                bindTop: "parent().anchorCenter()",
                bindRight: "parent().anchorRight()",
                bindBottom: "parent().anchorBottom()",
                bindLeftWeight: 0.25,
                bindRightWeight: 0.9,
                bindTopWeight: -0.5,
                bindBottomWeight: 1,
                margins: 5,
                background: new ColorDrawable(Color.Blue),
                clipChildDrawing: true,
                
                children:
                [
                    FlowItem("A", 50, 50, new ColorDrawable(Color.Red)),
                    FlowItem("B", 50, 50, new ColorDrawable(Color.Green)),
                    FlowItem("C", 50, 50, new ColorDrawable(Color.Yellow)),
                ]
            },
            {
                ref: ListLayout,
                width: 250,
                height: 250,
                text: "list layout",
                bindRight: "parent().anchorRight()",
                bindBottom: "parent().anchorBottom()", //Somehow attach to FlowLayout...
                marginRight: 50,
                marginBottom: 125,
                rotation: -10,
                //clipChildren: true,
                background: new ColorDrawable(Color.Gray),
            },
            {
                ref: LinearLayout,
                id: "leftlinear",
                wrapWidth: true,
                wrapHeight: true,
                bindLeft: "parent().anchorLeft()",
                bindTop: "parent().anchorTop()",
                margins: 10,
                background: new ColorDrawable(Color.Gray),
                
                children:
                [
                    FlowItem("1", 50, 50, new ColorDrawable(Color.Red)),
                    FlowItem("2", 75, 50, new ColorDrawable(Color.Green)),
                    FlowItem("3", 50, 50, new ColorDrawable(Color.Yellow)),
                    FlowItem("4", 50, 50, new ColorDrawable(Color.Red)),
                    FlowItem("5", 50, 50, new ColorDrawable(Color.White)),
                ]
            },
            {
                ref: Slider,
                width: 250,
                bindTop: "#edittext.anchorBottom()",
                bindCenterHorizontal: "parent().anchorCenter()",
                marginTop: 35,
                value: 50,
                rotation: 10,
                minValue: 30,
                maxValue: 86,
                
                onValueChanged: function(view : Slider, value : number) {
                    Log("Slider value: " + value);
                    view.app().root.findView("bigtext").rotation(value - 10);
                },
                
                onValueAtChanged: function(view : Slider, index : number, value : number) {
                    Log("Slider value: " + index + " to " + value);
                }
            },
            {
                ref: CheckBox,
                id: "checkbox",
                text: "Check option adf adgad gadfg adfg ad gad fg d",
                width: 150,
                bindLeft: "parent().anchorLeft()",
                bindTop: "#leftlinear.anchorBottom()",
                marginLeft: 10,
                marginTop: 20,
                background: new ColorDrawable(Color.Yellow),
                
                onCheckedChanged: function(view : CheckBox, checked : boolean) {
                    Log("Checked x: " + checked);
                }
            },
            {
                ref: LinearLayout,
                width: 150,
                bindLeft: "parent().anchorLeft()",
                bindTop: "#checkbox.anchorBottom()",
                gravity: Gravity.StretchX,
                wrapHeight: true,
                marginLeft: 10,
                marginTop: 20,
                background: new ColorDrawable(Color.Green),
                
                children: [
                    CreateRadioButton("First option", Color.Yellow, radioGroup, false),
                    CreateRadioButton("Second longer option radio", Color.Green, radioGroup, true),
                    CreateRadioButton("Third option radio text", Color.Gray, radioGroup, false),
                ]
            }
            ]
        },
        {
            ref: Button,
            height: 50,
            text: "Hide",
            bindLeft: "#leftFlow.anchorRight()",
            bindRight: "#rightFlow.anchorLeft()",
            bindBottom: "#baseView.anchorBottomContent()",
            
            onClick: function(view : Button, event : InputEvent) {
                var view = view.app().root.findView("leftFlow");
                if (view) {
                    view.visibility(Visibility.Gone);
                }
            }
        }
        ]
    };
}
