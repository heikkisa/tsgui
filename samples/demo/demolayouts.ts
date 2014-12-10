/// <reference path="demo.ts" />

module layout {

function createRandomView(text : string) : LayoutData {
    var size = dip(60);
    var width = size + Math.random() * size;
    var height = size + Math.random() * size;
    return {
        ref: View,
        width: width,
        height: height,
        margins: dip(10),
        text: text,
        textAlign: TextAlign.Center,
        background: App.theme().createGradientStateDrawable(Color.Red),
    };
}

function createRandomViews(count : number) : LayoutData[] {
    var views = [];
    for (var i=0; i < count; ++i) {
        views.push(createRandomView("Item #" + (i + 1)));
    }
    return views;
}

function createLinearLayout(orientation : Orientation, gravity : Gravity = 0) : LayoutData {
    return {
        ref: LinearLayout,
        wrapWidth: true,
        wrapHeight: true,
        margins: dip(10),
        background: new ColorDrawable(Color.Gray),
        orientation: orientation,
        gravity: gravity,
        children: createRandomViews(3)
    };
}

export function createLinearLayoutDemoView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        clickable: false,
        scrollable: false,
        
        children: [
            mergeLayouts(createLinearLayout(Orientation.Y), {
                id: "leftlinear1",
                bindLeft: $parent().anchorLeft(),
                bindTop: $parent().anchorTop(),
            }),
            mergeLayouts(createLinearLayout(Orientation.X), {
                id: "toplinear1",
                bindLeft: $id("leftlinear1").anchorRight(),
                bindTop: $parent().anchorTop(),
            }),
            mergeLayouts(createLinearLayout(Orientation.Y, Gravity.Bottom | Gravity.CenterHorizontal), {
                id: "leftlinear2",
                bindLeft: $id("leftlinear1").anchorRight(),
                bindTop: $id("toplinear1").anchorBottom(),
                bindBottom: $parent().anchorBottom(),
                wrapHeight: false,
            }),
            mergeLayouts(createLinearLayout(Orientation.X, Gravity.Right | Gravity.CenterVertical), {
                id: "toplinear2",
                bindLeft: $id("leftlinear2").anchorRight(),
                bindTop: $id("toplinear1").anchorBottom(),
                bindRight: $parent().anchorRight(),
                wrapWidth: false,
            }),
            mergeLayouts(createLinearLayout(Orientation.X, Gravity.Center), {
                id: "largelinear",
                bindLeft: $id("leftlinear2").anchorRight(),
                bindTop: $id("toplinear2").anchorBottom(),
                bindRight: $parent().anchorRight(),
                bindBottom: $parent().anchorBottom(),
                wrapWidth: false,
                wrapHeight: false,
            }),
        ]
    };
}

}

