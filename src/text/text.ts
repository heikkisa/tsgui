
function _rangesOverlap(x1 : number, x2 : number, y1 : number, y2 : number) : boolean {
    return x1 < y2 && y1 < x2;
}

function _rangeContains(x1 : number, x2 : number, value : number) {
    return value > x1 && value < x2;
}

function _updateRect(rect : Rect, items : any[]) {
    if (items.length === 0) {
        rect.set(0, 0, 0, 0);
        return;
    }

    var left = null;
    var top = null;
    var right = null;
    var bottom = null;
    for (var i=0; i < items.length; ++i) {
        var r = items[i].rect;
        left = (left !== null) ? Math.min(left, r.x) : r.x;
        top = (top !== null) ? Math.min(top, r.y) : r.y;
        right = (right !== null) ? Math.max(right, r.right()) : r.right();
        bottom = (bottom !== null) ? Math.max(bottom, r.bottom()) : r.bottom();
    }
    rect.set(left, top, right - left, bottom - top);
}

class TextHitResult {
    public lineIndex : number;
    public charIndex : number;
    public char : string;
    public node : TextNode;
    
    constructor(lineIndex : number, charIndex : number, char : string, node : TextNode) {
        this.lineIndex = lineIndex;
        this.charIndex = charIndex;
        this.char = char;
        this.node = node;
    }
}

class TextSelection {
    public startIndex : number;
    public endIndex : number;
    public active : boolean;
    
    constructor() {
        this.startIndex = null;
        this.endIndex = null;
        this.active = false;
    }
    
    start() : number {
        if (this.startIndex <= this.endIndex) {
            return this.startIndex;
        }
        return this.endIndex;
    }
    
    end() : number {
        if (this.endIndex >= this.startIndex) {
            return this.endIndex;
        }
        return this.startIndex;
    }
    
    isSet() : boolean {
        return this.startIndex !== null && this.endIndex !== null;
    }
}

class TextLine {
    public nodes : TextNode[] = [];
    public rect : Rect = new Rect(0, 0, 0, 0);
    public lineIndex : number = null;
    public margins: MarginPadding = null;
    public textSpacing = 0;
    
    update() {
        _updateRect(this.rect, this.nodes);
        
        this.margins = new MarginPadding();
        for (var i=0; i < this.nodes.length; ++i) {
            var node = this.nodes[i];
            if (node.margins !== null) {
                this.margins.left = Math.max(this.margins.left, node.margins.left);
                this.margins.top = Math.max(this.margins.top, node.margins.top);
                this.margins.right = Math.max(this.margins.right, node.margins.right);
                this.margins.bottom = Math.max(this.margins.bottom, node.margins.bottom);
            }
            this.textSpacing = Math.max(this.textSpacing, node.defaultAttribute().textSpacing);
        }
    }
}

interface NodeWalkCallback {
    (node : TextNode);
}

//TODO add singleline

enum TextAlign {
    Default = 0,
    Left = 0,
    Top = 0,
    Right = 0x01,
    Bottom = 0x02,
    CenterHorizontal = 0x04,
    CenterVertical = 0x08,
    Center = CenterHorizontal | CenterVertical,
}

class TextValue {
    private _renderer : Renderer = null;
    private _boundsRect : Rect = new Rect(0, 0, 0, 0);
    private _textRect : Rect = new Rect(0, 0, 0, 0);
    private _nodes : TextNode[] = null;
    private _lines : TextLine[] = null;
    private _caretPosition : number = 0;
    private _overrides : TextAttributes = new TextAttributes();
    private _clickedNode : TextNode = null;
   
    public selectable : boolean = true;
    public interactive : boolean = false;
    public selection : TextSelection = new TextSelection();

    constructor(renderer : Renderer) {
        this._renderer = renderer;
        this._overrides.clear();
        
        this.text("");
    }
    
    text(value? : string) : string {
        if (value !== undefined) {
            this._setNodesFromParser(new SimpleTagParser(value));
        }
        else {
            //No need to do this always...
            return this._joinNodeText();
        }
    }
    
    textElement(value : HTMLElement) {
        this._setNodesFromParser(new ElementParser(value));
    }
    
    _setNodesFromParser(parser : TextNodeParser) {
        this._clearLines();
        this.clearSelection();
        
        this._nodes = this._createNodesFromParser(parser)
    }
    
    _createNodesFromParser(parser : TextNodeParser) : TextNode[] {
        var nodes = parser.parse();
        
        if (nodes.length === 0) {
            var empty = new TextNode();
            empty.attributes = [new TextAttributes()];
            nodes.push(empty);
        }
        this._updateNodeIndices(nodes, 0);
        
        return nodes;
    }
    
    _joinNodeText() : string {
        if (this._nodes == null) {
            return "";
        }
        var parts = [];
        for (var i=0; i < this._nodes.length; ++i) {
            parts.push(this._nodes[i].text);
        }
        return parts.join("");
    }
    
    length() : number {
        if (this._nodes != null && this._nodes.length > 0) {
            return this._nodes[this._nodes.length - 1].endIndex;
        }
        return 0;
    } 
    
    caret(position? : number) : number {
        if (position !== undefined) {
            this._caretPosition = this._clampCaret(position);
        }
        else {
            return this._caretPosition;
        }
    }
    
    _clampCaret(value : number) : number {
        var min = 0;
        var max = this.length();
        return Math.min(Math.max(value, min), max);
    }
    
    textSize(size : number) {
        this._overrides.textSize = size;
        this._clearLines();
    }
    
    textAlign(align : TextAlign) {
        this._overrides.textAlign = align;
        this._clearLines();
    }
    
    textColor(color : Color) {
        this._overrides.textColor = color;
        this._clearLines();
    }
    
    width() : number { return this._textRect.width; }
    height() : number { return this._textRect.height; }
    
    hasCaret() : boolean { return this.interactive && this._caretPosition !== null; }
    
    clearSelection() {
        this.selection = new TextSelection();
    }
    
    selectedText() : string {
        var result = "";
        if (this.selection.isSet()) {
            var start = this.selection.start();
            var end = this.selection.end();
            result = this.text().substring(start, end);
        }
        return result;
    }
    
    selectWordAt(position : number) {
        var node = this._getTextNodeAtPosition(position);
        if (node !== null) {
            var start = this._findSeparator(node, position, -1) + 1;
            var end = this._findSeparator(node, position, 1);
            this.selectText(start, end);
            this.caret(end);
        } 
    }
    
    selectText(start : number, end : number) {
        this.selection = new TextSelection();
        this.selection.startIndex = start;
        this.selection.endIndex = end;
    }
    
    _findSeparator(node : TextNode, position : number, direction : number) {
        var nodeIndex = this._nodes.indexOf(node);
        
        while (nodeIndex >= 0 && nodeIndex < this._nodes.length) {
            var node = this._nodes[nodeIndex];
            while (position >= node.startIndex && position <= node.endIndex) {
                if (node.text[position - node.startIndex] === " ") {
                    return position;
                }
                position += direction;
            }
            nodeIndex += direction;
        }
        return position;
    }
    
    addText(value : string) {
        this.deleteSelection();
    
        if (this.hasCaret()) {
            var node = this._getTextNodeAtPosition(this._caretPosition);
            if (node !== null) {
                var charIndex = this._caretPosition - node.startIndex;
                node.text = node.text.substring(0, charIndex) + value + node.text.substr(charIndex);
                node.measure(this._renderer);
                this._updateNodeIndices(this._nodes, 0);
                this._caretPosition += value.length;
                
                this._clearLines();
            }
        }
    }
    
    deleteChar() {
        if (this.deleteSelection()) {
            return;
        }
    
        if (this.hasCaret()) {
            if (this.deleteRange(this._caretPosition - 1, this._caretPosition)) {
                this._caretPosition = Math.max(this._caretPosition - 1, 0);
            }
        }
    }
    
    deleteSelection() : boolean {
        var changed = false;
        if (this.selection.isSet()) {
            changed = this.deleteRange(this.selection.start(), this.selection.end());
            
            this._caretPosition = this.selection.start();
            
            this.clearSelection();
        }
        
        if (changed) {
            this._clearLines();
        }
        return changed;
    }
    
    deleteRange(start : number, end : number) : boolean {
        var changed = false;
        var i = this._nodes.length; 
        while (i--) {
            var node = this._nodes[i];
            if (_rangesOverlap(node.startIndex, node.endIndex, start, end)) {
                changed = true;
            
                if (node.startIndex >= start && node.endIndex <= end && this._nodes.length > 1) {
                    //Whole node is selected, remove it. But don't destroy the last node,
                    //there should be always one even if it empty.
                    this._nodes.splice(i, 1);
                }
                else {
                    //Partial selection.
                    var subStart = 0;
                    var subEnd = node.text.length;
                    
                    if (_rangeContains(node.startIndex, node.endIndex, start)) {
                        //Delete starting from start
                        var selectedCount = start - node.startIndex;
                        subStart = selectedCount - 0;
                    }
                    if (_rangeContains(node.startIndex, node.endIndex, end)) {
                        //Delete starting from end
                        var selectedCount = node.endIndex - end;
                        subEnd = node.text.length - selectedCount;
                    }
                    node.text = node.text.substring(0, subStart) + node.text.substr(subEnd);
                    node.measure(this._renderer);
                }
            }
        }
        
        if (changed) {
            this._clearLines();
            this._updateNodeIndices(this._nodes, 0);
        }
        return changed;
    }
    
    _walkNodes(callback : NodeWalkCallback) {
        if (this._lines === null) {
            return;
        }
    
        for (var i=0; i < this._lines.length; ++i) {
            var line = this._lines[i];
            for (var x=0; x < line.nodes.length; ++x) {
                callback(line.nodes[x]);
            }
        }
    }

    _clearLines() {
        //Don't touch _boundsRect in here.
        this._walkNodes((node : TextNode) => {
            node.canvas = null;
        });
        this._lines = null;
        this._clickedNode = null;
    }
    
    _getCaretNode() : TextNode {
        if (this.interactive && this._caretPosition !== null) {
            return this._getTextNodeAtPosition(this._caretPosition);
        }
        return null;
    }
    
    _getTextNodeAtPosition(charIndex : number) : TextNode {
        for (var i=0; i < this._nodes.length; ++i) {
            var node = this._nodes[i];
            if (charIndex >= node.startIndex && charIndex <= node.endIndex) {
                return node;
            }
        }
        return null;
    }
    
    _getCharAt(x : number, y : number, line : TextLine, node : TextNode) : number {
        var bounds = this._boundsRect; 
        var font = node._font(node.defaultAttribute());
    
        var adjustX = node.defaultAttribute().textSize / 3; //Useful estimation
        var lineStartY = line.rect.y + bounds.y;
        var lineCenterY = lineStartY + line.rect.height / 2;
    
        //Need to do a binary search to find the right place efficiently and accurately.
        var imin = 0;
        var imax = node.text.length;
        while (imax >= imin) {
            var imid = Math.floor((imin + imax) / 2);
            var leftWidth = this._renderer.measureText(node.text.substring(0, imid), font);
            
            if (this._renderer.hitTestRect(x + adjustX, y, node.rect.x + bounds.x, lineStartY, leftWidth, line.rect.height)) {
                //Search left
                imax = imid - 1;
            }
            else {
                //Search right
                imin = imid + 1;
            }
        }
        
        if (imax >= 0 && imax <= node.text.length) {
            return imax;
        }
        return null;
    }

    _getLineNodeAt(x : number, y : number, line : TextLine) : TextNode {
        var bounds = this._boundsRect;
        var result = null;
        for (var i=0; i < line.nodes.length; ++i) {
            var node = line.nodes[i];
            if (this._renderer.hitTestRect(x, y, node.rect.x + bounds.x, node.rect.y + bounds.y, node.rect.width, node.rect.height)) {
                result = node;
                break;
            }
        }
        return result;
    }
    
    _getLineAt(x : number, y : number) : TextLine {
        var bounds = this._boundsRect;
        var result = null;
        for (var i=0; i < this._lines.length; ++i) {
            var line = this._lines[i];
            if (this._renderer.hitTestRect(x, y, line.rect.x + bounds.x, line.rect.y + bounds.y, line.rect.width, line.rect.height)) {
                result = line;
                break;
            }
        }
        return result;
    }
    
    getTextAt(x : number, y : number) : TextHitResult {
        if (this._lines === null) {
            return null;
        }
        
        var result = null;
        var line = this._getLineAt(x, y);
        if (line) {
            var node = this._getLineNodeAt(x, y, line);
            if (node) {
                var index = this._getCharAt(x, y, line, node);
                if (index !== null) {
                    var charIndex = node.startIndex + index;
                    result = new TextHitResult(line.lineIndex, charIndex, node.text[index], node);
                }
            }
        }
        return result;
    }

    _applyOverrides(node : TextNode) {
        for (var i=0; i < node.attributes.length; ++i) {
            var attrs = node.attributes[i];
            if (this._overrides.textColor !== null) {
                attrs.textColor = this._overrides.textColor;
            }
            if (this._overrides.textSize !== null) {
                attrs.textSize = this._overrides.textSize;
            }
            if (this._overrides.textAlign !== null) {
                attrs.textAlign = this._overrides.textAlign;
            }
        }
    }
    
    _copyNodes() : TextNode[] {
        var nodes = [];
        for (var i=0; i < this._nodes.length; ++i) {
            var node = this._nodes[i].copy();
            this._applyOverrides(node);
            nodes.push(node);
        }
        return nodes;
    }
    
    _layoutLinesAndNodes() {
        this._lines = [];
    
        var y = 0;
        var nodes = this._copyNodes();
        nodes.reverse();
        
        while (nodes.length > 0) {
            var line = this._layoutLine(nodes, y);
            //TODO what if line is empty, for example image jumped to next line?
            this._lines.push(line);
            
            y += line.rect.height;
        }
    }
    
    _layoutLine(nodes : TextNode[], y : number) : TextLine {
        var line = new TextLine();
        var first = nodes[nodes.length - 1];
        
        var x = 0;
        var lineWidth = this._boundsRect.width;
        if (first.margins !== null) {
            lineWidth -= (first.margins.left + first.margins.right);
        }
        
        while (nodes.length > 0) {
            var node = nodes.pop();
            if (node.lineBreak && line.nodes.length > 0) {
                //Force line break, for example block tags.
                nodes.push(node);
                break;
            }
            
            node.rect.x = x;
            node.rect.y = y;
            
            var boundsWidth = Math.floor(lineWidth - node.guessRightPadding());
            var maxWidth = Math.floor(boundsWidth - x);
            if (node.needsSplitting(this._renderer, maxWidth)) {
                //Overflow
                this._splitLine(line, nodes, node, boundsWidth, maxWidth);
                break;
            }
            else {
                node.measure(this._renderer);
                x += node.rect.width;
                
                line.nodes.push(node);
            }
        }
        line.update();
        return line;
    }
    
    _splitLine(line : TextLine, nodes : TextNode[], node : TextNode, boundsWidth : number, maxWidth : number) {
        var result = node.split(this._renderer, boundsWidth, maxWidth);
        if (result.first) {
            result.first.measure(this._renderer);
            line.nodes.push(result.first);
        }
        if (result.second) {
            //No need to measure this yet.
            nodes.push(result.second);
        }
    }
    
    _adjustLinesAndNodes() {
        var charCounter = 0;
        for (var i=0; i < this._lines.length; ++i) {
            var line = this._lines[i];
            line.lineIndex = i;
            
            charCounter = this._updateNodeIndices(line.nodes, charCounter);
            
            for (var x=0; x < line.nodes.length; ++x) {
                var node = line.nodes[x];
                if (node.defaultAttribute().alignBaseline) {
                    node.rect.y += line.rect.height - node.rect.height;
                }
            }
        }
    }
    
    _updateNodeIndices(nodes : TextNode[], index : number) : number {
        var charCounter = index;
        for (var i=0; i < nodes.length; ++i) {
            var node = nodes[i];
            node.startIndex = charCounter;
            node.endIndex = charCounter + node.text.length;
            
            charCounter = node.endIndex;
        }
        return charCounter;
    }
    
    _alignLinesAndNodes() {
        _updateRect(this._textRect, this._lines);
    
        var bounds = this._boundsRect;
        var textRect = this._textRect;
        var marginTopSum = 0;
        var marginBottomSum = 0;

        for (var i=0; i < this._lines.length; ++i) {
            var line = this._lines[i];
            
            var textAlign = TextAlign.Default;
            if (line.nodes.length > 0) {
                //Use the first node of the line.
                textAlign = line.nodes[0].defaultAttribute().textAlign;
            }
            marginTopSum += line.margins.top;

            var shiftX = 0;
            var shiftY = 0;
            
            if (textAlign & TextAlign.Right) {
                shiftX = bounds.width - line.rect.width;
            }
            else if (textAlign & TextAlign.CenterHorizontal) {
                shiftX = bounds.width / 2 - line.rect.centerX();
            }
            else {
                shiftX += line.margins.left;
            }
            
            if (textAlign & TextAlign.Bottom) {
                shiftY = bounds.height - (textRect.height - line.rect.y) - line.rect.y;
            }
            else if (textAlign & TextAlign.CenterVertical) {
                shiftY = (bounds.height / 2) - (textRect.height / 2);
            }
            else {
                shiftY = marginTopSum + marginBottomSum;
            }
            
            marginBottomSum += line.margins.bottom;
            
            line.rect.x += shiftX;
            line.rect.y += shiftY;
            
            for (var x=0; x < line.nodes.length; ++x) {
                var node = line.nodes[x];
                node.rect.x += shiftX;
                node.rect.y += shiftY;
            }
            marginTopSum += line.textSpacing;
        }

        _updateRect(this._textRect, this._lines);
    }
    
    onLayout(bounds : Rect) {
        var sizeChanged = (R(this._boundsRect.width) != R(bounds.width)) || 
            (R(this._boundsRect.height) != R(bounds.height)) 
        
        this._boundsRect.set(bounds.x, bounds.y, bounds.width, bounds.height);

        if (sizeChanged || this._lines === null) {
            this._clearLines();
            this._layoutLinesAndNodes();
            this._adjustLinesAndNodes();
            this._alignLinesAndNodes();
        }
    }
    
    _drawLineNodes(method : string, state : ViewState, drawCaret : boolean, scrollY : number,  clipFast : boolean) {
        var selection = this.selection.isSet() ? this.selection : null;
        var caretPos = (this.interactive && drawCaret) ? this._caretPosition : null;
        var bounds = this._boundsRect;
        for (var i=0; i < this._lines.length; ++i) {
            var line = this._lines[i];
            
            if (clipFast) {
                if (line.rect.bottom() + bounds.y + line.rect.height < bounds.y - scrollY) {
                    //Too far up
                    continue;
                }
                if (line.rect.bottom() + bounds.y - line.rect.height > bounds.bottom() - scrollY) {
                    //Too far down, break out. We should never see another line.
                    break;
                }
            }
            
            for (var x=0; x < line.nodes.length; ++x) {
                line.nodes[x][method](state, bounds.x, bounds.y, selection, caretPos);
            }
        }
    }    
    
    drawText(state : ViewState, drawCaret : boolean, scrollY : number, clipFast : boolean) {
        if (this._nodes === null || this._lines === null) {
            //This can happen if the text is modified and the owner view
            //is drawn before it's been layout to match the changed text
            //size. We can't do layout in this class because it might need
            //several passes.
            Log("Text has not been laid out properly!");
            return;
        }
        this._drawLineNodes("drawBackground", state, drawCaret, scrollY, clipFast);
    
        var disabled = !state.enabled;
        if (disabled) {
            state.renderer.pushAlpha(0.5);
        }
        this._drawLineNodes("draw", state, drawCaret, scrollY, clipFast);
        
        if (disabled) {
            state.renderer.popAlpha();
        }
    }
    
    //Methods below this are related to View interaction.
    
    _getTextHitAt(view : View, x : number, y : number) : TextHitResult {
        //Because text is not automatically hit tested and transformed
        //like views we need to do manual translation in here.
        var renderer = view._app.renderer;
        renderer.saveTransform();
        renderer.translate(view._scrollArea.translationX(), view._scrollArea.translationY());
        var hit = view._text.getTextAt(x, y);
        renderer.popTransform();
        return hit;
    }
    
    onInputDown(event : InputEvent, view : View, isDoubleEvent : boolean) : boolean {
        var handled = false;
        if (this.selectable) {
            var hit = this._getTextHitAt(view, event.x, event.y);
            if (hit !== null) {
                if (hit.node.onClick === null) {
                    this.selection = new TextSelection();
                    this.selection.startIndex = hit.charIndex;
                    this.selection.active = true;
                    this.caret(hit.charIndex);
                }
                
                this._clickedNode = hit.node;
                this._clickedNode.span.visualFlags |= VF.Pressed;
                this._invalidateTextNode(this._clickedNode);
                
                if (isDoubleEvent) {
                    this.selectWordAt(hit.charIndex);
                    this._setSelectedTextToDom(view);
                }
                view.requestDraw();
                
                handled = true;
            }
        }
        return handled;
    }
    
    _setSelectedTextToDom(view : View) {
        if (this.selectable) {
            var text = this.selectedText();
            if (text.length > 0) {
                view.app().inputElementText(text);
            }
        }
    }
    
    _invalidateTextNode(dirtyNode : TextNode) {
        this._walkNodes((node : TextNode) => {
            if (node.span === dirtyNode.span) {
                //Nodes share a span, invalidate.
                node.canvas = null;
            }
        });
    }
    
    _stopClicking() : boolean {
        var stopped = false;
        if (this._clickedNode !== null) {
            this._clickedNode.span.visualFlags &= ~VF.Pressed;
            this._invalidateTextNode(this._clickedNode);
            this._clickedNode = null;
            stopped = true;
        }
        return stopped;
    }
    
    onInputUp(event : InputEvent, view : View) : boolean {
        var handled = false;
        if (this.selection.active) {
            this.selection.active = false;
            
            this._setSelectedTextToDom(view);
            
            view.requestDraw();
            handled = true;
        }
        
        var hit = this._getTextHitAt(view, event.x, event.y);
        if (hit !== null) {
            if (hit.node === this._clickedNode) {
                if (hit.node.onClick !== null) {
                    hit.node.onClick();
                }
            }
        }
        else {
            //TODO Annoying when released over an empty space
            //this.clearSelection();
            //view.requestDraw();
        }
        
        if (this._stopClicking()) {
            view.requestDraw();
        }
        return handled;
    }
    
    onInputMove(event : InputEvent, view : View) : boolean {
        var handled = false;
    
        if (this.selectable) {
            var hit = this._getTextHitAt(view, event.x, event.y);
            if (hit !== null) {
                view._app.setCursor(hit.node.activeAttribute().cursor);

                var selection = this.selection;
                if (selection.startIndex !== null && selection.active) {
                    var hitIndex = hit.charIndex + 0;
                    selection.endIndex = hitIndex;
                    this.caret(hitIndex);
                    
                    view.requestDraw();
                    handled = true;
                }
            }
        }
        return handled;
    }
    
}
