/// <reference path="demo.ts" />

module layout {

var DomElementId = "testi";

export function createTextLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        
        children: [
        {
            ref: View,
            textElement: document.getElementById(DomElementId),
            bindLeft: $parent().anchorLeft(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorCenter(),
            bindBottom: $parent().anchorBottom(),
            margins: dip(10),
            padding: dip(0),
            background: new ColorDrawable(Color.White),
        },
        {
            ref: DomView,
            bindLeft: $parent().anchorCenter(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            bindBottom: $parent().anchorBottom(),
            margins: dip(10),
            element: document.getElementById(DomElementId).cloneNode(true),
            background: new ColorDrawable(Color.White),
        }
        ]
    }
}

}
