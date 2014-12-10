/// <reference path="demo.ts" />

module layout {

export function createClipLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        
        children: [
        {
            ref: View,
            text: "Scrollable",
            id: "scrolltest",
            width: 200,
            height: 200,
            bindCenter: $parent().anchorCenter(),
            rotation: 10,
            clipChildren: false,
            background: new ColorDrawable(Color.Gray),
            
            children: [
            {
                ref: View,
                text: "Left top",
                width: 100,
                height: 100,
                bindLeft: $parent().anchorLeft(),
                bindTop: $parent().anchorTop(),
                marginLeft: -75,
                marginTop: -75,
                translationX: -50,
                background: new LayerDrawable(
                    new ColorDrawable(Color.Green),
                    new GradientDrawable([Color.Yellow, Color.Blue], 20)),
            },
            {
                ref: View,
                text: "Right top",
                width: 125,
                height: 125,
                bindRight: $parent().anchorRight(),
                bindTop: $parent().anchorTop(),
                marginRight: -160,
                marginTop: -100,
                rotation: 45,
                scaleY: 1.2,
                background: new ColorDrawable(Color.Red),
                
                children: [
                {
                    ref: View,
                    text: "Left",
                    width: 75,
                    height: 75,
                    bindLeft: $parent().anchorLeft(),
                    bindTop: $parent().anchorTop(),
                    marginLeft: -100,
                    marginTop: -50,
                    translationX: -50,
                    rotation: -30,
                    background: new LayerDrawable(
                        new ColorDrawable(Color.Green),
                        new GradientDrawable([Color.Yellow, Color.Blue], 20)),
                },
                {
                    ref: View,
                    text: "Right",
                    width: 75,
                    height: 75,
                    bindLeft: $parent().anchorLeft(),
                    bindTop: $parent().anchorTop(),
                    marginLeft: 175,
                    marginTop: 50,
                    translationX: -50,
                    background: new LayerDrawable(
                        new ColorDrawable(Color.Green),
                        new GradientDrawable([Color.Yellow, Color.Blue], 20)),
                },
                ]
            },
            {
                ref: View,
                text: "Right bottom",
                width: 125,
                height: 125,
                bindLeft: $parent().anchorLeft(),
                bindTop: $parent().anchorTop(),
                marginLeft: 100,
                marginTop: 190,
                background: new ColorDrawable(Color.Yellow),
            },
            ]
        }
        ]
    }
}

}