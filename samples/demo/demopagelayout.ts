/// <reference path="demo.ts" />

module layout {

var PAGE_ITEM_COUNT = 10;

/**
    It is possible set PageLayout.onTransformView() to a transform function that
    will apply transforms to each child view as the user scrolls the layout.
    This one is little over-the-top, most users probably don't want to see
    this much movement.
*/
function transformPage(layout : PageLayout, view : View, position : number) {
    //Make transforms little more subtle
    var scaling = position / 3;
    var alpha = position / 2;
    if (position >= 0) {
        view.alpha(1 - alpha);
        view.scaleX(1 - scaling);
        view.scaleY(1 - scaling);
    }
    else {
        view.alpha(1 + alpha);
        view.scaleX(1 + scaling);
        view.scaleY(1 + scaling);
    }
}

function createPageView(text : string) : LayoutData {
    return {
        ref: View,
        text: text,
        textAlign: TextAlign.Center,
        margins: dip(10),
        background: new ColorDrawable(DemoHelper.randomColor())
    };
}

function createPageViews(count : number) : LayoutData[] {
    var views = [];
    for (var i=0; i < count; ++i) {
        views.push(createPageView("Page #" + (i + 1) + ", swipe or scroll to change"));
    }
    return views;
}

var IdPageLayout = "pagelayout";
var IdButton = "scrollbutton";

export function createPageLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        marginBottom: dip(20),
        
        children: [
        {
            ref: Button,
            id: IdButton,
            width: dip(250),
            text: "Scroll to a random page",
            textSize: dip(15),
            bindCenterHorizontal: $parent().anchorCenter(),
            bindBottom: $parent().anchorBottom(),
            onClick: function(view : Button) {
                var layout = <PageLayout>App.$(IdPageLayout);
                var index = DemoHelper.randomValue(0, layout.children().length);
                var duration = 500;
                layout.scrollToChild(index, duration);
            }
        },
        {
            ref: PageLayout,
            id: IdPageLayout,
            bindLeft: $parent().anchorLeft(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            bindBottom: $id(IdButton).anchorTop(),
            margins: dip(20),
            background: new ColorDrawable(Color.Black),
            snapChildren: true,
            snapDuration: 250, //Milliseconds
            childWidth: 1.0, //100% from the layout width
            onTransformView: transformPage,
            children: createPageViews(PAGE_ITEM_COUNT)
        }
        ]
    }
}

}
