
interface AnimationCreator {
    (translateX : number, translateY : number) : Animation;
}

var RandomInAnimations : AnimationCreator[] = [
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationY", translateY, 0);
        anim.animateBetween("scaleX", 0, 1);
        anim.animateBetween("scaleY", 0, 1);
        anim.animateBetween("alpha", 0, 1);
        return anim;
    },
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationY", 0, 0);
        anim.animateBetween("scaleX", 0, 1);
        anim.animateBetween("scaleY", 0, 1);
        anim.animateBetween("alpha", 0, 1);
        return anim;
    },
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationX", translateX, 0);
        anim.animateBetween("alpha", 0, 1);
        return anim;
    },
];

var RandomOutAnimations : AnimationCreator[] = [
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationY", 0, translateY);
        anim.animateBetween("scaleX", 1, 0);
        anim.animateBetween("scaleY", 1, 0);
        anim.animateBetween("alpha", 1, 0);
        return anim;
    },
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationY", 0, 0);
        anim.animateBetween("scaleX", 1, 0);
        anim.animateBetween("scaleY", 1, 0);
        anim.animateBetween("alpha", 1, 0);
        return anim;
    },
    function(translateX : number, translateY : number) : Animation {
        var anim = new Animation();
        anim.animateBetween("translationX", 0, translateX);
        anim.animateBetween("alpha", 1, 0);
        return anim;
    },
];

class DemoHelper {

    //Random value between start and end, end is non-inclusive
    static randomValue(start : number, end : number) : number {
        return Math.floor(Math.random() * (end - start) + start);
    }

    static randomColor() : Color {
        var r = DemoHelper.randomValue(100, 255);
        var g = DemoHelper.randomValue(100, 255);
        var b = DemoHelper.randomValue(100, 255);
        return new Color(r, g, b);
    }
    
    static randomAnimation(creators : AnimationCreator[], translateX : number, translateY : number) : Animation {
        var func = creators[DemoHelper.randomValue(0, creators.length)];
        return func(translateX, translateY);
    }
    
}
