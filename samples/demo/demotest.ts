/// <reference path="demo.ts" />

module layout {

function createInfoView(name : string, target : Object, ... props : string[]) : LayoutData {
    var values = [];
    for (var i=0; i < props.length; ++i) {
        values.push("" + target[props[i]]);
    }

    return {
        ref: View,
        marginTop: dip(10),
        width: dip(300),
        wrapHeight: true,
        text: name + ": " + values.join(", ")
    };
}

export function createTestLayoutView() : LayoutData {
    return {
        ref: LinearLayout,
        fillParent: true,
        margins: dip(5),
        children: [
        {
            ref: ImageView,
            wrapWidth: true,
            wrapHeight: true,
            url: "images/test.png"
        },
        {
            ref: ImageView,
            marginTop: dip(5),
            width: 100,
            height: 100,
            url: "images/test.png"
        },
        {
            ref: ImageView,
            marginTop: dip(5),
            width: dip(100),
            height: dip(100),
            url: "images/test.png"
        },
        
            createInfoView("devicePixelRatio", window, "devicePixelRatio"),
            createInfoView("backingStoreRatio", window, "backingStoreRatio"),
            createInfoView("Screen size", screen, "width", "height"),
            createInfoView("documentElement size", document.documentElement, "clientWidth", "clientHeight"),
        ]
    };
}

}
