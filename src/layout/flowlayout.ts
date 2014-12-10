/// <reference path="layout.ts" />

class FlowLayout extends Layout {
    private _maxColumns : number = 10000; 
    private _gravity : Gravity = 0;
    private _rowGravity : Gravity = 0;
    private _fitChildren : boolean = false;

    constructor(parent : View) {
        super(parent);
    }
    
    maxColumns(value? : number) : number {
        return getOrSet(this, "maxColumns", this, "_maxColumns", value, this._requestLayout); 
    }
    
    gravity(value? : Gravity) : Gravity { 
        return getOrSet(this, "gravity", this, "_gravity", value, this._requestLayout); 
    }
    
    rowGravity(value? : Gravity) : Gravity { 
        return getOrSet(this, "rowGravity", this, "_rowGravity", value, this._requestLayout); 
    }
    
    fitChildren(value? : boolean) : boolean {
        return getOrSet(this, "fitChildren", this, "_fitChildren", value, this._requestLayout); 
    }
    
    _tryFitChild(view : View, previousRow : View[]) {
        if (previousRow.length === 0) {
            return;
        }
    
        var r = view._rect.copy();
        r.x -= view.marginLeft();
        r.width += view.marginLeft() + view.marginRight();
        
        var minY = previousRow[0]._rect.bottom() + view.marginTop();
        
        for (var i=0; i < previousRow.length ; ++i) {
            r.y = previousRow[i]._rect.bottom() + 1;
        
            var hit = false;
            for (var x=previousRow.length - 1; x >= 0; --x) {
                var overlaps = previousRow[x]._rect.overlaps(r);
                if (overlaps) {
                    hit = true;
                    minY = Math.max(previousRow[x]._rect.bottom(), minY);
                    break;
                }
            }
        
            if (hit) {
                //Keep going.
            }
            else {
                minY += view.marginTop();
                break;
            }
        }
        view.y(minY);
    }
    
    _adjustRows(rows : View[][]) {
        var bounds = this._computeChildrenBounds(this._children);
    
        for (var y=0; y < rows.length; ++y) {
            var row = rows[y];
            if (row.length > 0) {
                var rect = this._computeChildrenBounds(row);
                rect.x = bounds.x;
                rect.width = bounds.width;
                this._applyGravityToChildren(row, rect, this._rowGravity, Orientation.X);
                
                if (this._fitChildren && y > 0) {
                    for (var x=0; x < row.length; ++x) {
                        this._tryFitChild(row[x], rows[y-1]);
                    }
                }
            }
        }
    }
    
    onLayoutChildren() {
        var x = this._marginRect.x;
        var y = this._marginRect.y;
        var column = -1;
        var maxColumns = this._maxColumns - 1;
        var rows : View[][] = [[]];
        
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            if (child._visibility === Visibility.Gone) {
                continue;
            }
            var previousRow = rows[rows.length - 1];
            
            var childWidth = child.width() + child.marginLeft();
            if (x + childWidth + child.marginRight() > this._marginRect.right() || column >= maxColumns) {
                //Overflow
                previousRow.sort(function(a : View, b : View) { return a._marginRect.bottom() - b._marginRect.bottom(); });
                rows.push([]);
                
                x = this._marginRect.x;
                
                if (previousRow.length > 0) {
                    var tallest = previousRow[previousRow.length - 1];
                    y = tallest._rect.bottom();
                }
                column = 0;
            }
            else {
                column++;
            }
            
            child.x(x + child.marginLeft());
            child.y(y + child.marginTop());
            
            rows[rows.length - 1].push(child);
            
            x += childWidth;
        }
        
        this._applyGravityToChildren(this._children, this._marginRect, this._gravity, null);
        
        this._adjustRows(rows);
    }
}
