
class AppConfig {
    CANVAS_MIN_WIDTH : number = 200;
    CANVAS_MIN_HEIGHT : number = 200;

    HAS_TOUCH_EVENTS : boolean = ("ontouchstart" in window);

    IS_MOBILE : boolean = this.HAS_TOUCH_EVENTS;
    IS_ANDROID : boolean =  navigator.userAgent.match(/Android/i) ? true : false;
    
    SCROLL_TOUCH_THRESHOLD : number = dip(25);
    SCROLL_SMOOTH : boolean = true;
    SCROLL_STEP : number = dip(100);
    SCROLL_WHEEL_SPEED : number = 2.0;
    SCROLL_MIN_FLING_SPEED : number = 50;
    SCROLL_AXIS_THRESHOLD : number = 50;
    
    //Used only if requestAnimationFrame() is not available
    DRAW_SPEED_MS : number = 1000 / 30; //30 FPS
    
    DOUBLE_CLICK_TIME_MS : number = 250;
}

var Config = new AppConfig();
