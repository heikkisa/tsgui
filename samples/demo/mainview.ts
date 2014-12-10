/// <reference path="demo.ts" />

module layout {

interface DemoItem {
    name : string;
    source : string;
    creator : Function;
}

var selectedDemoIndex = 0;

var DEMOS : DemoItem[] = [
    {name: "Introduction", source: "mainview", creator: createIntroLayoutView},
    {name: "Anchors", source: "demoanchors", creator: createAnchorsLayoutView},
    {name: "Linear layout", source: "demolayouts", creator: createLinearLayoutDemoView},
    {name: "List layout", source: "demolistlayout", creator: createListLayoutDemoView},
    {name: "Flow layout", source: "demoflowlayout", creator: createFlowLayoutDemoView},
    {name: "Grid layout", source: "demogridlayout", creator: createGridLayoutDemoView},
    {name: "Page layout", source: "demopagelayout", creator: createPageLayoutView},
    {name: "Widgets", source: "demowidgets", creator: createWidgetsLayoutDemoView},
    {name: "Transform", source: "demotransform", creator: createTransformLayoutView},
    {name: "Animation", source: "demoanimation", creator: createAnimationLayoutView},
    {name: "Text", source: "demotext", creator: createTextLayoutView},
    {name: "View cubes", source: "democube", creator: createCubeLayoutView},
    {name: "Map", source: "demomap", creator: createMapLayoutView},
    {name: "Debug test", source: "demotest", creator: createTestLayoutView},
    {name: "Debug clipping", source: "democlip", creator: createClipLayoutView},
    {name: "Debug mess", source: "demoall", creator: createDebugTestLayout},
];

function createHeaderBar() : LayoutData {
    return {
        ref: View,
        id: "header",
        bindLeft: $parent().anchorLeft(),
        bindTop: $parent().anchorTop(),
        bindRight: $parent().anchorRight(),
        height: dip(75),
        background: new GradientDrawable([Color.Red, Color.Red.scaled(0.5)]),
        text: "tsgui",
        textSize: dip(35),
        textAlign: TextAlign.Center,
        
        children: [
        {
            ref: Button,
            text: "Show source",
            textSize: dip(15),
            width: dip(100),
            bindRight: $parent().anchorRight(),
            bindCenterVertical: $parent().anchorCenter(),
            marginRight: dip(20),
            background: App.theme().createGradientStateDrawable(Color.Yellow),
            onClick: function(view : Button) {
                var url = "demo/" + DEMOS[selectedDemoIndex].source + ".ts.txt";
                try {
                    window.open(url, '_blank');
                }
                catch (err) {
                
                }
            }
        }
        ] 
    };
}

function animateOut(view : View, listener? : AnimationListener) {
    var xTrans = view.rect().width;
    var yTrans = view.rect().height / 2;
    var anim = DemoHelper.randomAnimation(RandomOutAnimations, xTrans, yTrans * 1.2);
    anim.listener(listener);
    anim.start(view);
}

function animateIn(view : View) {
    var xTrans = view.rect().width;
    var yTrans = view.rect().height / 2;
    var anim = DemoHelper.randomAnimation(RandomInAnimations, xTrans, -yTrans * 1.2);
    anim.start(view);
}

function selectView(view : View, index : number) {
    selectedDemoIndex = index;

    var parentChilren = view.parent().children();
    for (var i=0; i < parentChilren.length; ++i) {
        parentChilren[i].selected(false);
    }
    view.selected(true);
}

function createDemoListItem(index : number, item : DemoItem, parent : View) : LayoutData {
    return {
        ref: View,
        text: (index + 1) + ". " + item.name,
        textSelectable: false,
        wrapHeight: true,
        margins: dip(3),
        padding: dip(5),
        selected: (index === selectedDemoIndex) ? true : false,
        background: parent.theme().createGradientStateDrawable(Color.Red),
        
        onClick: function(view : View) {
            selectView(view, index);
        
            var container = App.$("democontainer");
            var anim = animateOut(container, {
                onStart: null,
                onProgress: null,
                onFinish: function() {
                    container.destroyChildren();
                
                    var newView = container.inflate(item.creator());
                    animateIn(container);
                },
            });
        }
    };
}

function createDemoList() : LayoutData {
    return {
        ref: ListLayout,
        id: "demolist",
        bindLeft: $parent().anchorLeft(),
        bindTop: $id("header").anchorBottom(),
        bindRight: $parent().anchorCenter(),
        bindBottom: $parent().anchorBottom(),
        bindLeftWeight: 1,
        bindRightWeight: 0,
        maxWidth: dip(200),
        background: new GradientDrawable([Color.Blue, Color.Blue.scaled(0.5)]),
        adapter: new LayoutDataAdapter(createDemoListItem, DEMOS)
    };
}

function createDemoContainer() : LayoutData {
    return {
        ref: View,
        id: "democontainer",
        bindLeft: $id("demolist").anchorRight(),
        bindTop: $id("header").anchorBottom(),
        bindRight: $parent().anchorRight(),
        bindBottom: $parent().anchorBottom(),
        background: new GradientDrawable([Color.Yellow, Color.Yellow.scaled(0.5)], 0),
        zIndex: -1,
        
        children: [
            DEMOS[selectedDemoIndex].creator()
        ]
    };
}

export function createMainLayout() : LayoutData {
    return {
        ref: View,
        bindLeft: $parent().anchorLeft(),
        bindTop: $parent().anchorTop(),
        bindRight: $parent().anchorRight(),
        bindBottom: $parent().anchorBottom(),
        clickable: false,
        scrollable: true,
        
        children: [
            createHeaderBar(),
            createDemoList(),
            createDemoContainer()
        ]
    };
}

}
