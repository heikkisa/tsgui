/// <reference path="demo.ts" />

module layout {

var IdLeftFlow = "leftflow";
var itemCounter = 1;

function createRandomView(text : string, size : number, randomize : number = 1) : LayoutData {
    var width = size + (Math.random() * randomize) * size;
    var height = size + (Math.random() * randomize) * size;
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

function createRandomViews(count : number, size : number, randomize : number) : LayoutData[] {
    var views = [];
    for (var i=0; i < count; ++i) {
        views.push(createRandomView("#" + (i + 1), size, randomize));
    }
    return views;
}

export function createFlowLayoutDemoView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        scrollable: false,
        
        children: [
        {
            ref: Button,
            id: "newbutton",
            text: "New item",
            bindLeft: $parent().anchorLeft(),
            bindRight: $parent().anchorCenter(),
            bindBottom: $parent().anchorBottom(),
            margins: dip(10),
            onClick: function(view : Button) {
                //Add a random view to a random location.
                var flow = App.$(IdLeftFlow);
                var itemIndex = DemoHelper.randomValue(0, flow.children().length);
                flow.inflate(createRandomView("New #" + (itemCounter++), dip(50)), itemIndex);
            }
        },
        {
            ref: FlowLayout,
            id: IdLeftFlow,
            bindLeft: $parent().anchorLeft(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorCenter(),
            bindBottom: $id("newbutton").anchorTop(),
            margins: dip(10),
            layoutAnimator: new TranslationLayoutAnimator(),
            fitChildren: true, //Try to fit children tigthly vertically
            background: new ColorDrawable(Color.Gray),
            children: createRandomViews(20, dip(50), 1)
        },
        {
            ref: FlowLayout,
            bindLeft: $parent().anchorCenter(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            bindBottom: $parent().anchorBottom(),
            margins: dip(10),
            layoutAnimator: new TeleportLayoutAnimator(),
            gravity: Gravity.Center, //Gravity for the whole content
            rowGravity: Gravity.Center, //Gravity for each row
            maxColumns: 4,
            background: new ColorDrawable(Color.Gray),
            children: createRandomViews(15, dip(100), 0)
        },
        ]
    };
}

}