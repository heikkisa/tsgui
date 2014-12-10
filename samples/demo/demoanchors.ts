/// <reference path="demo.ts" />

module layout {

function createAnchoredView(idAndName : string, color : Color = Color.Red) : LayoutData {
    return {
        ref: View,
        id: idAndName,
        text: idAndName,
        width: dip(100),
        height: dip(100),
        margins: dip(5),
        textAlign: TextAlign.Center,
        textSelectable: false,
        background: App.theme().createGradientStateDrawable(color),
        
        onClick: function(view : View) {
            view.visibility(Visibility.Gone);
        }
    }
}

export function createAnchorsLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,

        children: [
            //Left
            mergeLayouts(createAnchoredView("left1"), {
                bindLeft: $parent().anchorLeft(),
                bindCenterVertical: $parent().anchorCenter(),
            }),
            mergeLayouts(createAnchoredView("left2"), {
                bindLeft: $id("left1").anchorRight(),
                bindCenterVertical: $parent().anchorCenter(),
            }),
            
            //Top
            mergeLayouts(createAnchoredView("top1"), {
                bindTop: $parent().anchorTop(),
                bindCenterHorizontal: $parent().anchorCenter(),
            }),
            mergeLayouts(createAnchoredView("top2"), {
                bindTop: $id("top1").anchorBottom(),
                bindCenterHorizontal: $parent().anchorCenter(),
            }),
            
            //Right
            mergeLayouts(createAnchoredView("right1"), {
                bindRight: $parent().anchorRight(),
                bindCenterVertical: $parent().anchorCenter(),
            }),
            mergeLayouts(createAnchoredView("right2"), {
                bindRight: $id("right1").anchorLeft(),
                bindCenterVertical: $parent().anchorCenter(),
            }),
            
            //Bottom
            mergeLayouts(createAnchoredView("bottom1"), {
                bindBottom: $parent().anchorBottom(),
                bindCenterHorizontal: $parent().anchorCenter(),
            }),
            mergeLayouts(createAnchoredView("bottom2"), {
                bindBottom: $id("bottom1").anchorTop(),
                bindCenterHorizontal: $parent().anchorCenter(),
            }),
            
            //Middle
            mergeLayouts(createAnchoredView("middle", Color.Green), {
                text: "Click a box to change it's visibility to 'gone'. See how the bindings behave.",
                bindLeft: $id("left2").anchorRight(),
                bindTop: $id("top2").anchorBottom(),
                bindRight: $id("right2").anchorLeft(),
                bindBottom: $id("bottom2").anchorTop(),
            }),
            
            //Long horizontal
            mergeLayouts(createAnchoredView("top2 - right2"), {
                bindLeft: $id("top2").anchorRight(),
                bindRight: $id("right2").anchorRight(),
                bindCenterVertical: $id("top2").anchorCenterVertical(),
                height: dip(50)
            }),
        ]
    };
}
}
