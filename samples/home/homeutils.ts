
module utils {

var DefaultMargins = dip(10);
var BaseDrawable = new RoundedDrawable(Color.Gray.scaled(1.5));

export function createView(view : Object, text : string, width : number) : LayoutData {
    return {
        ref: view,
        text: text,
        width: width,
        wrapHeight: true,
        marginLeft: DefaultMargins,
        marginTop: DefaultMargins,     
        marginRight: DefaultMargins,
        marginBottom: DefaultMargins,
    };
}

export function createButton(text : string, width : number) : LayoutData {
    return {
        ref: Button,
        text: text,
        width: width,
        wrapHeight: true,
        marginLeft: DefaultMargins,
        marginTop: DefaultMargins,     
        marginRight: DefaultMargins,
        marginBottom: DefaultMargins,
    };
}

export function createTextView(id : string, width : number) : LayoutData {
    return {
        ref: View,
        textElement: document.getElementById(id),
        width: width,
        wrapHeight: true,
        padding: dip(10),
        marginLeft: DefaultMargins,
        marginTop: DefaultMargins,     
        marginRight: DefaultMargins,
        marginBottom: DefaultMargins,
        background: BaseDrawable
    };
}

export function createPageView(id : string, color : Color) : LayoutData {
    return {
        ref: View,
        wrapHeight: true,
        textElement: document.getElementById(id),
        padding: dip(10),
        marginLeft: DefaultMargins,
        marginTop: DefaultMargins,     
        marginRight: DefaultMargins,
        marginBottom: DefaultMargins,
        background: new RoundedDrawable(color)
    };
}

export function createPhotoImageView(text : string, imageUrl : string) : LayoutData {
    return {
        ref: LayerLayout,
        wrapWidth: true,
        wrapHeight: true,
        margins: DefaultMargins * 2,
        rotation: MathUtils.randomValue(-20, 20),
        zIndex: MathUtils.randomValue(0, 10),
        background: new ColorDrawable(Color.White.scaled(0.8)),
        
        children: [
        {
            ref: LinearLayout,
            wrapWidth: true,
            wrapHeight: true,
            gravity: Gravity.Center,
            marginLeft: DefaultMargins,
            marginTop: DefaultMargins,     
            marginRight: DefaultMargins,
            marginBottom: DefaultMargins,
            children: [
            {
                ref: ImageView,
                margins: DefaultMargins * 2,
                url: "images/" + imageUrl,
                wrapWidth: true,
                wrapHeight: true,
            }
            ]
        },
        {
            ref: View,
            wrapHeight: true,
            text: text,
            textAlign: TextAlign.Center,
            textSize: dip(18),
            padding: dip(5),
            bindLeft: $parent().anchorLeft(),
            bindRight: $parent().anchorRight(),
            bindBottom: $parent().anchorBottom(),
            bindCenterHorizontal: $parent().anchorCenterHorizontal(),
            background: new ColorDrawable(Color.Gray),
        },
        {
            ref: Button,
            width: dip(20),
            height: dip(20),
            text: "x",
            textSize: dip(15),
            margins: dip(5),
            bindTop: $parent().anchorTop(),
            bindRight: $parent().anchorRight(),
            onClick: function(view : View) {
                view.parent().destroy();
            },
        }
        ]
    };
}

//Called by our ListLayout adapter
export function createListViewItem(index : number, item : string, parent : View) : LayoutData {
    return {
        ref: Button,
        text: item,
        minWidth: dip(200),
        marginLeft: DefaultMargins,
        marginTop: DefaultMargins,     
        marginRight: DefaultMargins,
        marginBottom: DefaultMargins,
    };
}

export function transformCriticPage(layout : PageLayout, view : View, position : number) {
    //Make transforms little more subtle
    var scaling = position / 2;
    var alpha = position;
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
    view.skewX(position * 45);
    view.skewY(position * 45);
    view.translationY(position * dip(200));
}

export function transformUserPage(layout : PageLayout, view : View, position : number) {
    if (position >= 0) {
        view.alpha(1 - position);
        view.scaleX(1 - position);
        view.scaleY(1 - position);
        view.translationY(position * -dip(100));
        view.translationX(position * -layout.width());
    }
    else {
        view.alpha(1 + position);
        view.scaleX(1 + position);
        view.scaleY(1 + position);
        view.translationY(0);
        view.translationX(0);
    }
}

}
