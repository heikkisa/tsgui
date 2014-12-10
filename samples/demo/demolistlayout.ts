/// <reference path="demo.ts" />

module layout {

var Images = ["castle.jpg", "clouds.jpg", "nature.jpg"];

var listItems = [];
for (var i=0; i < 100; ++i) {
    listItems.push("Item #" + (i + 1));
}

function createHeaderItem(index : number, item : string, parent : View) : LayoutData {
    return {
        ref: View,
        text: "Header at " + (index + 1),
        textSize: dip(20),
        textAlign: TextAlign.Center,
        textColor: Color.White,
        textSelectable: false,
        wrapHeight: true,
        margins: dip(5),
        padding: dip(5),
        background: new ColorDrawable(Color.Black)
    };
}

function createSimpleItem(index : number, item : string, parent : View) : LayoutData {
    var bgColor = (index % 2) ? Color.Red : Color.Green;
    return {
        ref: View,
        text: item,
        textSelectable: false,
        wrapHeight: true,
        minHeight: dip(DemoHelper.randomValue(25, 75)),
        margins: dip(5),
        padding: dip(5),
        background: parent.theme().createGradientStateDrawable(bgColor),
        onClick: function(view : View) {
            view.destroy();
        }
    };
}

function createComplexItem(index : number, item : string, parent : View) : LayoutData {
    var imageId = "listImage" + index; //TODO $parent().$id(x) etc.
    var titleId = "listTitle" + index;
    var margin = dip(10);
    return {
        ref: LayerLayout,
        wrapHeight: true,
        height: 100,
        margins: dip(5),
        background: new ColorDrawable(Color.White.scaled(0.8)),
        
        children: [
        {
            ref: ImageView,
            id: imageId,
            margins: margin,
            url: "images/" + Images[MathUtils.randomValue(0, Images.length)],
            wrapWidth: true,
            wrapHeight: true,
        },
        {
            ref: View,
            id: titleId,
            margins: margin,
            bindLeft: $id(imageId).anchorRight(),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            text: "Item #" + (index + 1),
            textSize: dip(20),
            wrapHeight: true,
        },
        {
            ref: View,
            margins: margin,
            bindLeft: $id(imageId).anchorRight(),
            bindTop: $id(titleId).anchorBottom(),
            bindRight: $parent().anchorRight(),
            text: "Description for item " + (index + 1) + " goes here",
            wrapHeight: true,
        }
        ]
    };
}

function createListItem(index : number, item : string, parent : View) : LayoutData {
    if (index % 5 === 0) {
        return createHeaderItem(index, item, parent);
    }
    else if (index % 3 == 0) {
        return createComplexItem(index, item, parent);
    }
    else {
        return createSimpleItem(index, item, parent);
    }
}

export function createListLayoutDemoView() : LayoutData {
    return {
        ref: ListLayout,
        fillParent: true,
        margins: dip(30),
        background: new ColorDrawable(Color.Gray),
        adapter: new LayoutDataAdapter(createListItem, listItems)
    };
}

}