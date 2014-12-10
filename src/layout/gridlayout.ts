/// <reference path="layout.ts" />

interface GridItem {
    view : View;
    width : number;
    height: number;
    row : number;
    column : number;
}

class GridRow {
    public items : GridItem[] = [];
    public height : number = 0;
    public rowIndex : number;
    
    constructor(index : number) {
        this.rowIndex = index;
    }
    
    updateHeight() {
        for (var i=0; i < this.items.length; ++i) {
            this.height = Math.max(this.height, this.items[i].height);
        }
    }
}

class GridColumn {
    public items : GridItem[] = [];
    public width : number = 0;
    public columnIndex : number = 0;
    
    constructor(index : number) {
        this.columnIndex = index;
    }
    
    updateWidth() {
        for (var i=0; i < this.items.length; ++i) {
            this.width = Math.max(this.width, this.items[i].width);
        }
    }
}

class GridLayout extends Layout {
    private _columns : number = 2; 
    private _gravity : Gravity = 0;
    private _cellGravity: Gravity = 0;
    private _stretchColumns : boolean = true;
    
    private _tempCellRect = new Rect(0, 0, 0, 0);
    private _tempBoundsRect = new Rect(0, 0, 0, 0);

    columns(value : number) : number {
        return getOrSet(this, "columns", this, "_columns", value, this._requestLayout); 
    }
    
    gravity(value? : Gravity) : Gravity { 
        return getOrSet(this, "gravity", this, "_gravity", value, this._requestLayout); 
    }
    
    cellGravity(value? : Gravity) : Gravity { 
        return getOrSet(this, "cellGravity", this, "_cellGravity", value, this._requestLayout); 
    }
    
    stretchColumns(value? : Gravity) : Gravity { 
        return getOrSet(this, "stretchColumns", this, "_stretchColumns", value, this._requestLayout); 
    }
    
    constructor(parent : View) {
        super(parent);
    }
    
    _calculateGridRows() : GridRow[] {
        var rows = [new GridRow(0)];
    
        var x = this._marginRect.x;
        var y = this._marginRect.y;
        var row = 0;
        var column = 0;
    
        for (var i=0; i < this._children.length; ++i) {
            var child = this._children[i];
            //No visibilty check, even if a view is gone it will occupy a grid cell.
            
            var xMargins = child.marginLeft() + child.marginRight();
            var yMargins =  child.marginTop() + child.marginBottom();
            
            var width = child.width() + xMargins;
            var height = child.height() + yMargins;
            if (this._cellGravity & Gravity.StretchX) {
                width = child._clampWidth(0) + xMargins;
            }
            if (this._cellGravity & Gravity.StretchY) {
                height = child._clampHeight(0) + yMargins;
            }
            
            rows[rows.length - 1].items.push({
                view: child,
                width: width,
                height: height,
                row: row,
                column: column
            });
            
            ++column;
            if (column >= this._columns) {
                rows[rows.length - 1].updateHeight();
                column = 0;
                ++row;
                
                rows.push(new GridRow(row));
            }
        }
        rows[rows.length - 1].updateHeight();
        
        return rows;
    }
    
    _calculateGridColumns(rows : GridRow[]) : GridColumn[] {
        var cols = {};
        
        for (var i=0; i < rows.length; ++i) {
            var row = rows[i];
            for (var c=0; c < row.items.length; ++c) {
                var item = row.items[c];
                
                if (item.column in cols) {
                    cols[item.column].items.push(item);
                }
                else {
                    var column = new GridColumn(item.column);
                    column.items.push(item);
                    cols[item.column] = column;
                }
            }
        }
        
        var columns = [];
        for (var prop in cols) {
            var col = cols[prop];
            col.updateWidth();
            columns.push(col);
        }
        columns.sort(function(a : GridColumn, b: GridColumn) : number {
            return a.columnIndex - b.columnIndex;
        });
        return columns;
    }
    
    _placeViewToGrid(item : GridItem, x : number, y : number, rows : GridRow[], columns : GridColumn[]) {
        var view = item.view;
        
        var rowWidth = columns[item.column].width;
        var colHeight = rows[item.row].height;

        var viewX = x + view.marginLeft();
        var viewY = y + view.marginTop();
        this._tempCellRect.set(viewX, viewY, view.width(), view.height());
        this._tempBoundsRect.set(viewX, viewY, 
            rowWidth - view.marginRight() - view.marginLeft(), 
            colHeight - view.marginBottom() - view.marginTop());
        this._applyGravityToRect(this._tempCellRect, this._tempBoundsRect, this._cellGravity);
        
        var rect = this._tempCellRect;
        view.x(rect.x);
        view.y(rect.y);
        view.width(rect.width);
        view.height(rect.height);
    }
    
    _stretchColumnCells(columns : GridColumn[]) {
        var stretchedWidth = _Floor(this._marginRect.width / columns.length);
        
        for (var i=0; i < columns.length; ++i) {
            var column = columns[i];
            var finalWidth = _Floor(Math.max(column.width, stretchedWidth));

            column.width = finalWidth;
            
            for (var v=0; v < column.items.length; ++v) {
                column.items[v].width = finalWidth;
            }
        }
    }
    
    onLayoutChildren() {
        var x = this._marginRect.x;
        var y = this._marginRect.y;
        
        var rows = this._calculateGridRows();
        var cols = this._calculateGridColumns(rows);
        
        if (this._stretchColumns) {
            this._stretchColumnCells(cols);
        }

        for (var i=0; i < rows.length; ++i) {
            var row = rows[i];
            for (var c=0; c < row.items.length; ++c) {
                var item = row.items[c];
                this._placeViewToGrid(item, x, y, rows, cols);
                x += cols[item.column].width;
            }
            y += row.height;
            x = this._marginRect.x;
        }
        
        var gravity = this._gravity;
        if (this._stretchColumns) {
            gravity &= ~Gravity.CenterHorizontal;
        }
        this._applyGravityToChildren(this._children, this._marginRect, gravity);
    }
}
