/// <reference path="layout.ts" />

class ListLayout extends Layout implements AdapterListener {
    private _adapter : ViewAdapter = null;
    private _createViewsPending : boolean = false;

    constructor(parent : View) {
        super(parent);
        
        var adapter = new TestAdapter();
        this.adapter(adapter);
        adapter.createTestData();
    }
    
    onAdapterRefresh() {
        if (this._createViewsPending || this.destroyed()) {
            return;
        }
        this._createViewsPending = true;
        
        this.postEvent(() => {
            this._createViewsPending = false;
        
            this._createAdapterViews();
        });
    }
    
    _createAdapterViews() {
        //TODO if we assume list view items can't affect other views,
        //we can block layout everywhere, including close children call.
        
        //TODO 2 closeChildren() in onAdapterRefresh() so users don't accidentally rely on these?
        this.destroyChildren();
        
        //Reset scrolling too?
        
        var count = this._adapter.getCount();
        for (var i=0; i < count; ++i) {
            var child = this._adapter.getView(i, this);
            if (!child) {
                Log("Adapter did not create a view at position: " + i);
            }
        }
        this.requestLayout();
    }
    
    adapter(adapter? : ViewAdapter) : ViewAdapter {
        //TODO Optimize, no need to request layout for everything... call directly onLayout()?
        //closeChildren() layouts, hard to avoid... 
        var value = getOrSet(this, "adapter", this, "_adapter", adapter, this._requestLayout);
        if (adapter) {
            adapter._adapterListener(this);
            this.onAdapterRefresh();
        }
        return value;
    }
    
    destroy() {
        super.destroy();
        
        if (this._adapter) {
            if (this._adapter._listener !== this) {
                Log("ViewAdapter listener is incorrect");
            }
            this._adapter._adapterListener(null);
        }
    }

    onLayoutChildren() {
        //TODO this should not cause any layout, with large apps it is too slow.
        //Fix the blockLayout() to return immediately.
        
        var x = this._marginRect.x;
        var y = this._marginRect.y;
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (child._visibility === Visibility.Gone) {
                continue;
            }
            
            child.x(x + child.marginLeft());
            child.y(y + child.marginTop());
            child.width(this._marginRect.width - child.marginLeft() - child.marginRight());
            
            y += child.height() + child.marginBottom();
            
            //Measure again to get the real content rect.
            //child.onLayout(state.copy());
            //child.height(child._contentRect.height);
        }
    }
}
