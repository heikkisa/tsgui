/// <reference path="demo.ts" />

module layout {

var IdAnimated = "animated";
var ViewText = "Animated view";

interface AnimationCallback {
    (view: View);
}

interface AnimationItem {
    name : string;
    callback : AnimationCallback;
}

var ANIMATIONS : AnimationItem[] = [
    {name: "Shake", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("translationX", dip(-20), new CycleInterpolator(2));
        anim.duration(250);
        anim.start(view);
    }},
    {name: "Jump linear", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("translationX", dip(-200));
        anim.animate("translationY", dip(-100), new EasingInterpolator(Easing.boomerang));
        anim.animate("rotation", -180);
        anim.duration(1000);
        anim.start(view);
    }},
    {name: "Jump spline", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("translationX", dip(-200));
        anim.animate("translationY", dip(-200), new SplineInterpolator(-5, 0, 0, -5));
        anim.animate("rotation", -180);
        anim.duration(1500);
        anim.start(view);
    }},
    {name: "Bounce", callback : function(view: View) {
        var bouncer = new EasingInterpolator(Easing.bounce);
        var anim = new Animation();
        anim.animate("translationY", dip(100), bouncer);
        anim.animate("scaleX", 1.2, bouncer);
        anim.animate("scaleX", 1.2, bouncer);
        anim.duration(1000);
        anim.start(view);
    }},
    {name: "Fade out", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("alpha", 0.0);
        anim.duration(500);
        anim.start(view);
    }},
    {name: "3 blinks", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("alpha", 0.0, new CycleInterpolator(3));
        anim.duration(1500);
        anim.start(view);
    }},
    {name: "Pulsate", callback : function(view: View) {
        var cycler = new CycleInterpolator(3);
        var anim = new Animation();
        anim.animate("scaleX", 1.1, cycler);
        anim.animate("scaleY", 1.1, cycler);
        anim.duration(1500);
        anim.start(view);
    }},
    {name: "Pop", callback : function(view: View) {
        var anim = new Animation();
        anim.animateBetween("scaleX", 0.1, 1);
        anim.animateBetween("scaleY", 0.1, 1);
        anim.animateBetween("alpha", 0.1, 1);
        anim.duration(250);
        anim.start(view);
    }},
    {name: "Rotate forever", callback : function(view: View) {
        var anim = new Animation();
        anim.animate("rotation", 360);
        anim.duration(-1); //Negative means infinite
        anim.period(1000);
        anim.start(view);
    }},
    {name: "Hinge", callback : function(view: View) {
        var anim = new Animation();
        anim.animateBetween("originX", 1, 1); //Constant animation
        anim.animateBetween("originY", 0, 0);
        anim.animateBetween("rotation", -45, -90, new CycleInterpolator(3));
        anim.duration(2500);
        anim.start(view);
    }},
    {name: "Random", callback : function(view: View) {
        var easing = new EasingInterpolator(Easing.boomerang);
        var anim = new Animation();
        anim.animate("translationX", DemoHelper.randomValue(-200, 200), easing);
        anim.animate("translationY", DemoHelper.randomValue(-200, 200), easing);
        anim.animate("scaleX", DemoHelper.randomValue(10, 100) / 100, easing);
        anim.animate("scaleY", DemoHelper.randomValue(10, 100) / 100, easing);
        anim.animate("skewX", DemoHelper.randomValue(10, 25), easing);
        anim.animate("skewY", DemoHelper.randomValue(10, 25), easing);
        anim.animate("rotation", DemoHelper.randomValue(-180, 180), easing);
        anim.animate("alpha", DemoHelper.randomValue(50, 100) / 100, easing);
        anim.duration(1000);
        anim.start(view);
    }},
    {name: "Random easing", callback : function(view: View) {
        var randomEasingName = pickRandomProperty(Easing);
        var randomEasing = Easing[randomEasingName];
    
        var anim = new Animation();
        anim.animate("translationX", dip(-200), new EasingInterpolator(randomEasing));
        anim.duration(1500);
        anim.listener({
            onStart: function() {
                view.text(randomEasingName);
            },
            onProgress: null,
            onFinish: function() {
                view.text(ViewText);
            }
        });
        anim.start(view);
    }},
    {name: "Stop", callback : function(view: View) {
        App.$(IdAnimated).stopAnimation();
    }},
];

function pickRandomProperty(obj : Object) : string {
    var keys = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            keys.push(prop);
        }
    }
    return keys[keys.length * Math.random() << 0]; 
} 

function createTransformButton(name : string, callback : AnimationCallback) : LayoutData {
    return {
        ref: Button,
        text: name,
        textSize: dip(15),
        width: dip(175),
        margins: dip(10),
        onClick: function(view : Button) {
            callback(App.$(IdAnimated));
        }
    }
}

function createTransformButtons(transforms : AnimationItem[]) : LayoutData[] {
    var buttons = []
    for (var i=0; i < transforms.length; ++i) {
        var item = transforms[i];
        buttons.push(createTransformButton(item.name, item.callback));
    }
    return buttons;
}

export function createAnimationLayoutView() : LayoutData {
    return {
        ref: LinearLayout,
        fillParent: true,
        gravity: Gravity.CenterHorizontal | Gravity.StretchX,
        
        children: [
        {
            ref: Layout,
            height: dip(400),
            margins: dip(10),
            
            children: [
            {
                ref: View,
                id: IdAnimated,
                text: ViewText,
                textAlign: TextAlign.Center,
                bindCenter: $parent().anchorCenter(),
                width: dip(150),
                height: dip(150),
                background: new ColorDrawable(Color.White),
            }
            ]
        },
        {
            ref: FlowLayout,
            id: "buttons",
            wrapHeight: true,
            background: new ColorDrawable(Color.Red),
            margins: dip(10),
            gravity: Gravity.Center,
            rowGravity: Gravity.Right,
            children: createTransformButtons(ANIMATIONS)
        }
        ]
    }
}

}
