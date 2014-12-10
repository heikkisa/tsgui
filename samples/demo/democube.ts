/// <reference path="demo.ts" />

module layout {

//The idea and values are all hacked togerther based on this sample:
//  http://www.paulrhayes.com/experiments/cube/multiCubes.html
//Normally you should do things in more generic manner and use DIP's if possible.

var translation = 180 / 2;
var lastAnimated : View = null;

function createCubeSide(colorMod : number, animateX : number, animateY : number) : LayoutData {
    var originalColor = new ColorDrawable(Color.Gray.scaled(colorMod));
    return {
        ref: View,
        text: TEXT,
        width: 180,
        height: 180,
        padding: dip(10),
        bindCenter: $parent().anchorCenter(),
        background: originalColor,
        
        children: [
        {
            ref: Button,
            text: "Animate",
            textSize: dip(15),
            width: 100,
            bindCenterHorizontal: $parent().anchorCenterHorizontal(),
            bindBottom: $parent().anchorBottom(),
            margins: dip(10),
            
            onClick: function(view : View) {
                var parent = view.parent();
                var interpolator = new EasingInterpolator(Easing.boomerang);
                var anim = new Animation();
                anim.animate("translationX", parent.translationX() + animateX, interpolator);
                anim.animate("translationY", parent.translationY() + animateY, interpolator);
                anim.duration(500);
                anim.start(parent);
            }
        }
        ],

        onHoveringChanged: function(view : View, hover : boolean) {
            if (hover) {
                view.background(new ColorDrawable(DemoHelper.randomColor()));
            }
            else {
                view.background(originalColor);
            }
        }
    };
}

function createCubeViews(x : number, y : number) : LayoutData[] {
    var animateX = 200;
    var animateY = 200 * 0.61;
    return [
        //Right
        mergeLayouts(createCubeSide(1.25, animateX, animateY), {
            skewY: -36,
            translationX: x + 180 - translation,
            translationY: y
        }),
        //Top
        mergeLayouts(createCubeSide(1.5, 0, -200), {
            textSize: dip(13),
            skewX: 2,
            skewY: -30,
            scaleX: 1.05,
            scaleY: 1.19,
            rotation: 60,
            translationX: x + 90 - translation,
            translationY: y - 147
        }),
        //Left
        mergeLayouts(createCubeSide(1.1, -animateX, animateY), {
            skewY: 36,
            translationX: x - translation,
            translationY: y
        }),
    ];
}

export function createCubeLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        children: createCubeViews(0, 0).concat(createCubeViews(-180, 113))
    }
}

}
