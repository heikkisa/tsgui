/// <reference path="demo.ts" />

module layout {

/**
    This demo shows how to transform visible view properties. You can either
    use an animation to change them gradually or modify them directly by
    calling View.translationX(100), View.rotation(45) etc.
*/

interface ClickCallback {
    (animation : Animation, size : number);
}

interface TransformItem {
    name : string;
    callback : ClickCallback;
}

var TRANSFORMS : TransformItem[] = [
    {name: "Translate left", callback : function(animation : Animation, size : number) {
        animation.animate("translationX", -size);
    }},
    {name: "Translate up", callback : function(animation : Animation, size : number) {
        animation.animate("translationY", -size);
    }},
    {name: "Translate right", callback : function(animation : Animation, size : number) {
        animation.animate("translationX", size);
    }},
    {name: "Translate down", callback : function(animation : Animation, size : number) {
        animation.animate("translationY", size);
    }},
    {name: "Scale X", callback : function(animation : Animation, size : number) {
        animation.animate("scaleX", 2.0);
    }},
    {name: "Scale Y", callback : function(animation : Animation, size : number) {
        animation.animate("scaleY", 2.0);
    }},
    {name: "Skew X", callback : function(animation : Animation, size : number) {
        animation.animate("skewX", 45.0);
    }},
    {name: "Skew Y", callback : function(animation : Animation, size : number) {
        animation.animate("skewY", 45.0);
    }},
    {name: "Rotate", callback : function(animation : Animation, size : number) {
        animation.animate("rotation", 360);
    }},
    {name: "Alpha", callback : function(animation : Animation, size : number) {
        animation.animate("alpha", 0.2);
    }},
    {name: "Flip X", callback : function(animation : Animation, size : number) {
        animation.animate("scaleX", -1);
    }},
    {name: "Flip Y", callback : function(animation : Animation, size : number) {
        animation.animate("scaleY", -1);
    }},
    {name: "Reset", callback : function(animation : Animation, size : number) {
        //Do nothing
    }},
];

var IdAnimated = "animated";

function createTransformedViewContent() : LayoutData {
    return {
        ref: View,
        clipChildren: true,
        fillParent: true,
        
        children: [
        {
            ref: View,
            id: "leftText",
            text: LONG_TEXT.substring(0, 1500),
            padding: dip(10),
            wrapHeight: true,
            bindLeft: $parent().anchorLeft(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorCenter(),
        },
        {
            ref: ImageView,
            id: "image",
            wrapWidth: true,
            wrapHeight: true,
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            margins: dip(25),
            url: "images/nature.jpg",
        },
        {
            ref: Button,
            id: "dummybutton",
            text: "Hide",
            bindLeft: $id("leftText").anchorRight(),
            bindTop: $id("image").anchorBottom(),
            bindRight: $id("image").anchorRight(),
            marginLeft: dip(10),
            marginTop: dip(10),
            alpha: 0.75,
            onClick: function(view: Button) {
                App.$(IdAnimated).visibility(Visibility.Gone);
            }
        },/*
        {
            ref: DomView,
            height: dip(30),
            bindLeft: "#leftText.anchorRight()",
            bindTop: "#dummybutton.anchorBottom()",
            bindRight: "#image.anchorRight()",
            marginLeft: dip(10),
            marginTop: dip(10),
            createElement: "input"
        }*/
        ]
    }
}

function createDefaultAnimation() : Animation {
    var anim = new Animation();
    //Don't restore any value when the animation ends.
    anim.restoreStartValues(false);
    //Animate all "transforms" to defaults, they can be overriden later.
    //This creates a nice effect where those transforms that were
    //not overriden return to their default values.
    anim.animate("translationX", 0);
    anim.animate("translationY", 0);
    anim.animate("scaleX", 1);
    anim.animate("scaleY", 1);
    anim.animate("skewX", 0);
    anim.animate("skewY", 0);
    anim.animate("rotation", 0);
    anim.animate("alpha", 1);
    return anim;
}

function createTransformButton(name : string, callback : ClickCallback) : LayoutData {
    return {
        ref: Button,
        text: name,
        textSize: dip(15),
        width: dip(175),
        margins: dip(10),
        onClick: function(view : Button) {
            var view = App.$(IdAnimated);
            view.visibility(Visibility.Visible); //Show it if it is hidden.
            
            var animation = createDefaultAnimation();
            var rect = view.rect();
            callback(animation, Math.min(rect.width, rect.height) / 2);
            animation.start(view);
        }
    }
}

function createTransformButtons(transforms : TransformItem[]) : LayoutData[] {
    var buttons = []
    for (var i=0; i < transforms.length; ++i) {
        var item = transforms[i];
        buttons.push(createTransformButton(item.name, item.callback));
    }
    return buttons;
}

export function createTransformLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        
        children: [
        {
            ref: FlowLayout,
            id: "buttons",
            wrapHeight: true,
            bindLeft: $parent().anchorLeft(),
            bindRight: $parent().anchorRight(),
            bindBottom: $parent().anchorBottom(),
            background: new ColorDrawable(Color.Red),
            margins: dip(10),
            zIndex: 1,
            gravity: Gravity.Center,
            children: createTransformButtons(TRANSFORMS)
        },
        {
            ref: View,
            id: "animated",
            bindTop: $parent().anchorTop(),
            bindBottom: $id("buttons").anchorTop(),
            bindCenterHorizontal: $parent().anchorCenter(),
            background: new ColorDrawable(Color.Green),
            margins: dip(10),
            minWidth: dip(300),
            maxHeight: dip(200),
            children: [createTransformedViewContent()]
        }
        ]
    }
}

}