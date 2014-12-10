/// <reference path="fragment.ts" />

class RootView extends Fragment {
    constructor() {
        super(null);
    }
    
    _bootstrap(app : Application) {
        this._app = app;
        this._text = new TextValue(app.renderer);
        this._theme = new Theme();
    
        this.scrollable(false);
        this.clickable(false);
    }
    
    onLayout(state : LayoutState) {
        this._rect = this._app.rect.copy();
        super.onLayout(state);
    }
}
