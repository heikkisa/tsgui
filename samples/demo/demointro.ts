/// <reference path="demo.ts" />

module layout {

export function createIntroLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        padding: dip(20),
        textElement: document.getElementById("intro")
    }
}

}