
enum TextStyle {
    None = 0,
    Overline = 0x01,
    LineThrough = 0x02,
    Underline = 0x04,
    Bold = 0x08,
    Italic = 0x10,
    //xx = 0x20
}

class TextAttributes implements VisualState {
    public textColor : Color = Color.Black; //rename to just color etc., matches markup
    public textSize : number = 15;
    public textFont : string = "sans-serif";
    public textAlign : TextAlign = TextAlign.Default;
    public textSpacing : number = 0;
    public background : Drawable = null;
    public style : TextStyle = TextStyle.None;
    public alignBaseline : boolean = true; //top, bottom, center instead
    public cursor : string = "text";
    public statesOn : VF = 0;
    public statesOff : VF = 0;
    public textSelectionColor = Color.TextSelection;
    
    copy() : TextAttributes {
        var attrs = new TextAttributes();
        attrs.textColor = this.textColor;
        attrs.textSize = this.textSize;
        attrs.textFont = this.textFont;
        attrs.textAlign = this.textAlign;
        attrs.textSpacing = this.textSpacing;
        attrs.background = this.background;
        attrs.style = this.style;
        attrs.alignBaseline = this.alignBaseline;
        attrs.cursor = this.cursor;
        attrs.statesOn = this.statesOn;
        attrs.statesOff = this.statesOff;
        attrs.textSelectionColor = this.textSelectionColor;
        return attrs;
    }
    
    clear() {
        this.textColor = null;
        this.textSize = null;
        this.textFont = null;
        this.textAlign = null;
        this.textSpacing = null;
        this.background = null;
        this.style = null;
        this.alignBaseline = null;
        this.cursor = null;
    }
}

interface TextNodeSplit {
    first : TextNode;
    second : TextNode;
}

//Data shared by nodes that originally were one node but were split up later.
class TextNodeSpan {
    public visualFlags : VF = 0;
}

class TextNode {
    public text : string = "";
    public startIndex : number = 0;
    public endIndex : number = 0;
    public rect : Rect = new Rect(0, 0, 0, 0);
    public margins : MarginPadding = null;
    public attributes : TextAttributes[] = null;
    public span : TextNodeSpan = new TextNodeSpan();
    public lineBreak : boolean = false;
    //public hasSplit : boolean = false
    public onClick : Function = null;
    public canvas : HTMLCanvasElement = null;
    
    copy() : TextNode {
        var node = new TextNode();
        node.text = this.text;
        node.startIndex = this.startIndex;
        node.endIndex = this.endIndex;
        node.rect = this.rect.copy();
        node.margins = (this.margins !== null) ? this.margins.copy() : null;
        node.attributes = this.attributes; //Reference
        node.span = this.span; //Reference
        node.lineBreak = this.lineBreak;
        node.onClick = this.onClick;
        node.canvas = null; //Never copy
        return node;
    }
    
    defaultAttribute() : TextAttributes {
        return this.attributes[this.attributes.length - 1];
    }
    
    activeAttribute() : TextAttributes {
        for (var i=0; i < this.attributes.length; ++i) {
            if (testVisualFlags(this.attributes[i], this.span.visualFlags)) {
                return this.attributes[i];
            }
        }
        Log("TextNode does not have a valid attribute!")
        return null; //Should never get in here
    }
    
    _font(attrs : TextAttributes) : string {
        //TODO slow, cache the result.
        var style = "normal ";
        var variant = "normal ";
        var weight = "normal ";
        if (attrs.style & TextStyle.Italic) {
            style = "italic ";
        }
        if (attrs.style & TextStyle.Bold) {
            weight = "bold ";
        }
        return style + variant + weight + attrs.textSize + "px " + attrs.textFont;
    }
    
    measure(renderer : Renderer) {
        var attrs = this.defaultAttribute();
        this.rect.width = renderer.measureText(this.text, this._font(attrs));
        this.rect.height = attrs.textSize;
    }
    
    guessRightPadding() {
        //TODO hack, can be removed if _findSeparator() no longer avoids spaces at line start...
        return this.defaultAttribute().textSize / 4;
    }
    
    drawBackground(state : ViewState, x : number, y : number, selection : TextSelection) {
        var renderer = state.renderer;
        var attrs = this.activeAttribute();
        if (attrs.background) {
            attrs.background.drawArea(state, this.rect.x + x, 
                this.rect.y + y, this.rect.width, this.rect.height);
        }
        
        if (selection) {
            var selectStart = selection.start();
            var selectEnd = selection.end();
            if (_rangesOverlap(this.startIndex, this.endIndex, selectStart, selectEnd)) {
                var bgColor = attrs.textSelectionColor;
                
                if (this.startIndex > selectStart && this.endIndex < selectEnd) {
                    //Whole node is selected.
                    renderer.fillRect(this.rect.x + x, this.rect.y + y, this.rect.width, this.rect.height, bgColor);
                }
                else {
                    //Partial selection.
                    
                    var left = this.rect.x + x;
                    var right = left + this.rect.width;
                    if (_rangeContains(this.startIndex, this.endIndex, selectStart)) {
                        //Move selection background to right from start.
                        var selectedCount = selectStart - this.startIndex;
                        var width = renderer.measureText(this.text.substring(0, selectedCount), this._font(attrs));
                        left += width;
                    }
                    if (_rangeContains(this.startIndex, this.endIndex, selectEnd)) {
                        //Move selection background to left from end.
                        var text = this.text;
                        var selectedCount = this.endIndex - selectEnd;
                        var width = renderer.measureText(text.substr(text.length - selectedCount), this._font(attrs));
                        right -= width;
                    }
                    renderer.fillRect(left, this.rect.y + y, right - left, this.rect.height, bgColor);
                }
            }
        }
    }
    
    draw(state : ViewState, x : number, y : number, selection : TextSelection, caretPosition : number) {
        var renderer = state.renderer;
        var attrs = this.activeAttribute();
        var textColor = attrs.textColor;
        var font = this._font(attrs);
        
        //TODO text compositing disabled for now.
        /*
        if (this.canvas === null) {
            this.canvas = state.renderer.compositor.compositeText(this.text, 
                font, textColor, RR(this.rect.width), RR(attrs.textSize));
        }*/
        
        if (this.canvas !== null) {
            renderer.drawCanvasAt(this.canvas, this.rect.x + x, this.rect.y + y);
        }
        else {
            renderer.drawText(this.text, this.rect.x + x, this.rect.y + y, textColor, font);
        }
    
        var underline = attrs.style & TextStyle.Underline;
        var lineThrough = attrs.style & TextStyle.LineThrough;
        var overLine = attrs.style & TextStyle.Overline;
        
        if (underline || lineThrough || overLine) {
            var lineWidth = 1;
            var halfLine = Math.floor(lineWidth / 2);
        
            if (underline) {
                var bottom = this.rect.bottom() - halfLine + 0;
                renderer.fillRect(this.rect.x + x, bottom + y, this.rect.width, lineWidth, textColor);
            }
            if (lineThrough) {
                var middle = this.rect.centerY() - halfLine + 1;
                renderer.fillRect(this.rect.x + x, middle + y, this.rect.width, lineWidth, textColor);
            }
            if (overLine) {
                var top = this.rect.y - halfLine + 1;
                renderer.fillRect(this.rect.x + x, top + y, this.rect.width, lineWidth, textColor);
            }
        }
        
        if (caretPosition !== null && caretPosition >= this.startIndex && caretPosition <= this.endIndex) {
            var extraHeight = 1;
            var missing = caretPosition - this.startIndex;
            //This can sometime be off by 1 pixel when compared to selection background...
            var caretX = renderer.measureText(this.text.substring(0, missing), font);
            renderer.fillRect(this.rect.x + x + caretX, this.rect.y + y - extraHeight, 
                1, this.rect.height + extraHeight * 2, Color.Black);
        }
    }
    
    _estimateBisectHint(maxWidth : number) : number {
        //It is very important for performace that the search hint is good.
        var countEstimate = R((maxWidth / this.defaultAttribute().textSize) * 3);
        var searchHint = Math.min(this.text.length, countEstimate);
        return searchHint;
    }
    
    _measureSubstring(renderer : Renderer, text : string, imid : number, imax : number, font : string) : number {
        return renderer.measureText(this.text.substring(0, Math.min(imid + 1, imax)), font);
    }
    
    needsSplitting(renderer : Renderer, maxWidth : number) : boolean {
        var font = this._font(this.defaultAttribute());
        var searchHint = this._estimateBisectHint(maxWidth);
        
        var imin = 0;
        var imax = this.text.length;
        var imid = 0;
        while (imax >= imin) {
            imid = Math.floor(searchHint !== null ? searchHint : (imin + imax) / 2);
            searchHint = null;
            
            var leftWidth = this._measureSubstring(renderer, this.text, imid, imax, font);
            if (leftWidth <= maxWidth) {
                //Look right
                imin = imid + 1;
            }
            else {
                //Needs wrapping.
                return true;
            }
        }
        return false;
    }
    
    _findSplitPosition(renderer : Renderer, boundingWidth : number, maxWidth : number, font : string) : number {
        var searchHint = this._estimateBisectHint(maxWidth);
        var imin = 0;
        var imax = this.text.length;
        var imid = 0;
        while (imax >= imin) {
            imid = Math.floor(searchHint !== null ? searchHint : (imin + imax) / 2);
            searchHint = null;
            
            var leftWidth = this._measureSubstring(renderer, this.text, imid, imax, font);
            if (leftWidth < maxWidth) {
                //Look right
                imin = imid + 1;
            }
            else if (leftWidth > maxWidth) {
                //Look left
                imax = imid - 1;
            }
            else {
                //Found it
                break;
            }
        }
        return imid;
    }
    
    split(renderer : Renderer, boundingWidth : number, maxWidth : number) : TextNodeSplit {
        var font = this._font(this.defaultAttribute());
        
        var firstLine : TextNode = null;
        var secondLine : TextNode = null;

        var pos = this._findSplitPosition(renderer, boundingWidth, maxWidth, font);

        if (pos >= 0) {
            //TODO if a node starts in a middle of a word this forces a linebreak
            //if the word is first in the node. Need to backtrack...
            pos = Math.max(this._findSeparator(pos), 1); //Always take at least one char, otherwise loops forever.
        
            firstLine = this.copy();
            firstLine.text = this.text.substring(0, pos);
            if (firstLine.margins !== null) {
                firstLine.margins.bottom = 0;
            }
            
            var secondLineText = this.text.substr(pos);
            if (secondLineText.length > 0) {
                secondLine = this.copy();
                secondLine.text = secondLineText;
                secondLine.lineBreak = false;
                if (secondLine.margins !== null) {
                    //Same span, no margins between these. TODO wrong in some cases?
                    secondLine.margins.top = 0;
                }
            }
        }
        
        return {first: firstLine, second: secondLine};
    }
    
    _findSeparator(index : number) : number {
        //Always leave at least one character.
        for (var i=index; i >= 1; --i) {
            if (this.text[i] === " ") {
                return i + 1; //1 for space
            }
        }
        return index;
    }
}
