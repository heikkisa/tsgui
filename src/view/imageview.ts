/// <reference path="view.ts" />

enum ImageStatus {
    None = 0,
    Loading = 1,
    Ready = 2,
    Error = 3,
    Aborted = 4
}

class ImageView extends View {
    private _url : string = "";
    private _loadCounter : number = 0;
    private _imageDrawable : ImageDrawable = null; //TODO replace with drawable, add width and height hints to base drawable
    private _imageStatus : ImageStatus = ImageStatus.None;
    private _imageFlags : ImageFlags = ImageFlags.ScaleAspectDown | ImageFlags.AlignCenter;

    constructor(parent : View) {
        super(parent);
    }
    
    imageFlags(value? : ImageFlags) : ImageFlags {
        return getOrSet(this, "imageFlags", this, "_imageFlags", value, this._requestDraw);
    }
    
    url(value? : string) : string {
        return getOrSet(this, "url", this, "_url", value, () => {
            this._loadImage(value);
        });
    }
    
    image(value? : ImageDrawable) : ImageDrawable {
        return getOrSet(this, "image", this, "_imageDrawable", value, () => {
            this._url = "";
            this._loadCounter++;
            this.requestLayout();
        });
    }
    
    status() : ImageStatus { return this._imageStatus; }
    
    onImageLoad(url : string, image : ImageDrawable) {
    
    }
    
    onImageError(url : string) {
    
    }
    
    onImageAbort(url : string) {
    
    }
    
    _isLoadCurrent(counter : number) : boolean {
        return !this.destroyed() && counter === this._loadCounter;
    }
    
    _loadImage(url : string) {
        this._imageStatus = ImageStatus.Loading;
        this._imageDrawable = null; //Might keep around until next one is loaded, no layout needed until then?
    
        this._loadCounter++;
        var counter = this._loadCounter;
    
        //Always create a new Image, drawable keeps a reference to it.
        var image = new Image();
        image.onload = () => {
            if (this._isLoadCurrent(counter)) {
                this._imageDrawable = new ImageDrawable(new RendererImage(image));
                this._imageDrawable.imageFlags = this._imageFlags;
                
                this._imageStatus = ImageStatus.Ready;
                this.onImageLoad(url, this._imageDrawable);
                
                this.requestLayout();
            }
        };
        image.onerror = () => {
            if (this._isLoadCurrent(counter)) {
                this._imageStatus = ImageStatus.Error;
                this.onImageError(url);
            }
        };
        image.onabort = () => {
            if (this._isLoadCurrent(counter)) {
                this._imageStatus = ImageStatus.Aborted;
                this.onImageAbort(url);
            }
        };
        image.src = url;
    
        this.requestLayout();
    }
    
    onGetContentSize() : Rect {
        var content = super.onGetContentSize();
        if (this._imageDrawable !== null) {
            content.width = this._imageDrawable.width;
            content.height = this._imageDrawable.height;
        }
        return content;
    }
    
    onDraw(state : ViewState) {
        super.onDraw(state);
        
        if (this._imageStatus === ImageStatus.Ready) {
            this._imageDrawable.imageFlags = this._imageFlags; //TODO does this work?
            this._imageDrawable.draw(state, this._paddingRect);
        }
    }
}
