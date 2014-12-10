/// <reference path="../tsgui.d.ts" />

var App = new Application();

//TODO app should manage canvas resize events?

function resizeCanvas() {
    var canvas = <HTMLCanvasElement>document.getElementById("rootCanvas");
    App.setSize(window.innerWidth, window.innerHeight);
}

function initApp() {
    var canvas = <HTMLCanvasElement>document.getElementById("rootCanvas");
    
    App.setCanvas(canvas);
    App.root.inflate(layout.createMainLayout());
    
    resizeCanvas();
}
