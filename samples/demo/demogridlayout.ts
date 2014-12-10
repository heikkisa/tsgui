/// <reference path="demo.ts" />

module layout {

var GRID_ITEMS = 14;

function createRandomView(text : string) : LayoutData {
    var size = dip(50);
    var width = size + Math.random() * size;
    var height = size + Math.random() * size;
    return {
        ref: View,
        width: width,
        height: height,
        margins: dip(10),
        text: text,
        textAlign: TextAlign.Center,
        background: new RoundedDrawable(DemoHelper.randomColor()),
        
        children: [
        {
            ref: View,
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            width: dip(20),
            height: dip(20),
            margins: dip(5),
            text: "X",
            textAlign: TextAlign.Center,
            textSelectable: false,
            background: App.theme().createGradientStateDrawable(Color.Yellow, dip(5)), //TODO IE round bug...
            
            onClick: function(view : View) {
                view.parent().destroy();
            }
        }
        ]
    };
}

function createRandomViews(count : number) : LayoutData[] {
    var views = [];
    for (var i=0; i < count; ++i) {
        views.push(createRandomView("#" + (i + 1)));
    }
    return views;
}

export function createGridLayoutDemoView() : LayoutData {
    return {
        ref: LinearLayout,
        bindLeft: $parent().anchorLeft(),
        bindTop: $parent().anchorTop(),
        bindRight: $parent().anchorRight(),
        wrapHeight: true,
        gravity: Gravity.StretchX,
        
        children: [
        {
            ref: GridLayout,
            wrapHeight: true,
            margins: dip(10),
            layoutAnimator: new TranslationLayoutAnimator(),
            background: new ColorDrawable(Color.Gray),
            columns: 4,
            cellGravity: Gravity.CenterVertical | Gravity.StretchX,
            stretchColumns: true,
            children: createRandomViews(GRID_ITEMS)
        },
        {
            ref: GridLayout,
            wrapHeight: true,
            margins: dip(10),
            layoutAnimator: new TranslationLayoutAnimator(),
            background: new ColorDrawable(Color.Gray),
            columns: 4,
            gravity: Gravity.CenterHorizontal,
            cellGravity: Gravity.Center,
            stretchColumns: false,
            children: createRandomViews(GRID_ITEMS)
        },
        ]
    };
}

}
