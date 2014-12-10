
interface AdapterListener {
    onAdapterRefresh();
}

//TODO ViewAdapter<T>, any by default etc.?

class ViewAdapter { //TODO all Layots should support this?
    public _listener : AdapterListener = null;

    constructor() { }
    
    _adapterListener(view : AdapterListener) {
        this._listener = view;
    }
    
    refresh() {
        if (this._listener) {
            this._listener.onAdapterRefresh();
        }
    }
    
    getCount() : number { // onGetCount() or onCount()
        return 0;
    }
    
    getItem(index : number) : any {
        return null;
    }
    
    getView(index : number, parent : View) : View {
        return null;
    }
}

class ArrayAdapter extends ViewAdapter {
    private _data : any[] = [];
    
    constructor() {
        super();
    }
    
    model(model? : any[]) : any[] {
        if (model !== undefined) {
            this._data = model;
            this.refresh();
        }
        else {
            return this._data;
        }
    }
    
    getCount() : number { //TODO onGetCount()?
        return this._data.length;
    }
    
    getItem(index : number) : any {
        return this._data[index];
    }
    
    getView(index : number, parent : View) : View {
        return null;
    }
}

interface LayoutCreator {
    (index : number, item : any, parent : View) : LayoutData;
}

class LayoutDataAdapter extends ArrayAdapter {
    private _layout : LayoutCreator = null;

    constructor(creator? : LayoutCreator, data? : any[]) {
        super();
        
        this.layout(creator);
        this.model(data);
    }

    layout(layout? : LayoutCreator) : LayoutCreator {
        if (layout !== undefined) {
            this._layout = layout;
            this.refresh();
        }
        else {
            return this._layout;
        }
    }
    
    _getLayoutData(index : number, parent : View) : LayoutData {
        var item = this.getItem(index);
        return this._layout(index, item, parent);
    }
    
    getView(index : number, parent : View) : View {
        return parent.inflate(this._getLayoutData(index, parent));
    }
}


class TestAdapter extends ArrayAdapter {
    constructor() {
        super();
    }
    
    createTestData() {
        var items = [];
        for (var i=0; i < 15; ++i) {
            items.push("Item #" + (i + 1));
        }
        this.model(items);
    }
    
    getView(index : number, parent : View) : View {
        var item = this.getItem(index);
    
        var view = new View(parent);
        //view.modelItem = view; //TODO to access in the creation JSON callbacks?
        //view.modelIndex = index;
        view.text(item);
        //view.width(100);
        //view.height(50);
        view.wrapHeight(true);
        view.margins(3);
        view.padding(5);
        //view.widthWrap(true);

        var maxWidth = 100;
        var minHeight = 0;
        var scale = 0.5;
        var color = Color.Red;
        if (index % 2 === 0) {
            color = Color.Green;
            maxWidth = 9999;
            minHeight = 50;
        }

        view.maxWidth(maxWidth);
        view.minHeight(minHeight);
        //view.background(new ColorDrawable(color));
        view.background(parent._theme.createGradientStateDrawable(color));
        view.onClick = function() {
            if (index % 2 === 0) {
                view.visibility(Visibility.Gone);
            }
            else {
                view.visibility(Visibility.Invisible);
            }
        };
        
        return view;
    }
}
