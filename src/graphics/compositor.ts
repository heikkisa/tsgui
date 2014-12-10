
class Compositor {

    constructor() {
    }
    
    _getContext(canvas : HTMLCanvasElement) : CanvasRenderingContext2D {
        var context = <CanvasRenderingContext2D>canvas.getContext("2d");
        context.textBaseline = "top";
        context.textAlign = "left";
        return context;
    }
    
    compositeText(text : string, font : string, color : Color, width : number, height : number) : HTMLCanvasElement {
        if (width <= 1 || height <= 1) {
            return null;
        }
        var padHeight = RR(height * 1.25);
        var canvas = <HTMLCanvasElement>document.createElement("canvas");
        var context = this._getContext(canvas);
    
        canvas.width = width;
        canvas.height = padHeight;
        
        context.clearRect(0, 0, width, padHeight);
        context.font = font;
        context.fillStyle = color.rgba();
        context.fillText(text, 0, RR(height * 0.9)); //TODO Firefox text baseline...
        //context.strokeRect(0, 0, width, padHeight);
        
        return canvas;
    }
}
