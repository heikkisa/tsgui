/// <reference path="../tsgui.d.ts" />

var IdTopBar = "topbar";
var IdMain = "main";
var IdPhotoGallery = "photoGallery";
var IdHomeRoot = "homeRoot";
var IdSlideBar = "slideBar";
var IdSlideButton = "slideButton";

var ParagraphWidth = dip(700); //Maximum width

var SlideMenuItems = ["Bookmark", "Share", "Translate", "Exit"];
var Images = ["castle.jpg", "clouds.jpg", "nature.jpg"];

function createHomeRoot() : LayoutData {
    return {
        ref: View,
        id: IdHomeRoot,
        fillParent: true,
        scrollableX: false,
        children: [
            createTopBar(),
            createMainContainer(),
            createSideSlider()
        ]
    };
}

function createTopBar() : LayoutData {
    return {
        ref: OverflowLayout,
        id: IdTopBar,
        bindLeft: $parent().anchorLeft(),
        bindTop: $parent().anchorTop(),
        bindRight: $parent().anchorRight(),
        wrapHeight: true,
        gravity: Gravity.Center,
        background: new ColorDrawable(Color.Black),
        //scrollableX: false, //TODO should not be needed
        zIndex: 1,
        children: [
            mergeLayouts(utils.createButton("\u2194", dip(50)), {
                id: IdSlideButton,
                onClick: toggleSideBar
            }),
            utils.createButton("Home", dip(120)),
            utils.createButton("Learn", dip(120)),
            utils.createButton("Develop", dip(120)),
            utils.createButton("Discuss", dip(120)),
            mergeLayouts(utils.createView(EditText, "", dip(150)), {
                marginLeft: dip(20), //TODO causes scroll overflow...
            }),
        ]
    };
}

function toggleSideBar(view : View) {
    var bar = App.$(IdHomeRoot);
    var button = App.$(IdSlideButton);
    var slider = App.$(IdSlideBar);
    var animation = new Animation();
    if (bar.translationX() > 0) {
        button.selected(false);
        animation.animate("translationX", 0);
    }
    else {
        button.selected(true);
        animation.animate("translationX", slider.width());
    }
    animation.duration(250);
    animation.restoreStartValues(false);
    animation.start(bar);
}

function createSideSlider() : LayoutData  {
    return {
        ref: ListLayout,
        id: IdSlideBar,
        wrapWidth: true,
        zIndex: 2,
        bindTop: $parent().anchorTop(),
        bindRight: $id(IdHomeRoot).anchorLeft(),
        bindBottom: $parent().anchorBottom(),
        background: new ColorDrawable(Color.Black),
        adapter: new LayoutDataAdapter(utils.createListViewItem, SlideMenuItems)
    };
}

function createMainContainer() : LayoutData {
    return {
        ref: View,
        id: IdMain,
        bindLeft: $parent().anchorLeft(),
        bindTop: $id(IdTopBar).anchorBottom(),
        bindRight: $parent().anchorRight(),
        bindBottom: $parent().anchorBottom(),
        children: [
            createMainBody()
        ]
    };
}

function createMainBody() : LayoutData {
    return {
        ref: LinearLayout,
        minWidth: dip(300),
        maxWidth: dip(900),
        wrapHeight: true,
        bindTop: $id(IdMain).anchorTop(),
        bindLeft: $parent().anchorLeft(),
        bindRight: $parent().anchorRight(),
        gravity: Gravity.CenterHorizontal | Gravity.StretchX,
        margins: dip(10),
        clipChildren: false,
        children: [
            createIntroLayout(),
            
            mergeLayouts(utils.createTextView("intro", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth
            }),
            createPagesLayout(Color.RGB8(200, 128, 128), "critic1", "critic2", "critic3", "critic4"),
            
            mergeLayouts(utils.createTextView("explain", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth
            }),
            
            createInfoBoxLayout(),
            
            mergeLayouts(utils.createTextView("relax", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth
            }),
            mergeLayouts(utils.createButton("Relax", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth / 2,
                onClick: function(view : View) {
                    throwPhotos();
                }
            }),
            createPhotoGalleryLayout(),
            
            mergeLayouts(utils.createTextView("userStories", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth
            }),
            mergeLayouts(createPagesLayout(Color.RGB8(120, 200, 128), "customer1", "customer2", "customer3", "customer4"), {
                onTransformView: utils.transformUserPage
            }),
            
            mergeLayouts(utils.createTextView("end", 1), {
                marginTop: dip(30),
                maxWidth: ParagraphWidth
            }),
        ]
    };
}

function createIntroLayout() : LayoutData {
    return {
        ref: View,
        wrapHeight: true,
        maxWidth: ParagraphWidth * 0.6,
        textElement: document.getElementById("title"),
        textAlign: TextAlign.CenterHorizontal,
        margins: dip(10),
        padding: dip(30),
        background: new RoundedDrawable(Color.RGB8(200, 200, 128))
    };
}

function createInfoBoxLayout() : LayoutData {
    return {
        ref: FlowLayout,
        wrapHeight: true,
        maxWidth: ParagraphWidth,
        margins: dip(10),
        gravity: Gravity.Center,
        rowGravity: Gravity.CenterHorizontal,
        children: [
            utils.createTextView("info1", dip(200)),
            utils.createTextView("info2", dip(200)),
            utils.createTextView("info3", dip(200)),
        ]
    };
}

function createPagesLayout(color : Color, ... textIds : string[]) : LayoutData {
    var pages : LayoutData[] = [];
    for (var i=0; i < textIds.length; ++i) {
        pages.push(utils.createPageView(textIds[i], color));
    }
    
    return {
        ref: PageLayout,
        wrapHeight: true,
        maxWidth: ParagraphWidth,
        margins: dip(10),
        childWidth: 0.9,
        snapDuration: 500,
        onTransformView: utils.transformCriticPage,
        clipChildren: false,
        zIndex: -1,
        children: pages
    };
}

function createPhotoGalleryLayout() : LayoutData {
    return {
        ref: FlowLayout,
        id: IdPhotoGallery,
        wrapHeight: true,
        maxWidth: ParagraphWidth,
        margins: dip(10),
        clipChildren: false,
        gravity: Gravity.Center,
        rowGravity: Gravity.CenterHorizontal,
        layoutAnimator: new TranslationLayoutAnimator(),
    };
}

function throwPhotos() {
    var gallery = <FlowLayout>App.$(IdPhotoGallery);
    gallery.destroyChildren();
    for (var i=0; i < 5; ++i) {
        var imageUrl = Images[MathUtils.randomValue(0, Images.length)];
        gallery.inflate(utils.createPhotoImageView(imageUrl, imageUrl));
    }
}

function showSource(name : string) {
    try {
        window.open("home/" + name + ".ts.txt");
    }
    catch (err) {
    }
}

var App = new Application();

function initApp() {
    var canvas = <HTMLCanvasElement>document.getElementById("rootCanvas");
    App.setCanvas(canvas);
    App.root.inflate(createHomeRoot());
    
    resizeCanvas();
}

function resizeCanvas() {
    var canvas = <HTMLCanvasElement>document.getElementById("rootCanvas");
    App.setSize(window.innerWidth, window.innerHeight);
}
