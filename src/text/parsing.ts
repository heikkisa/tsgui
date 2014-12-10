
interface TextNodeParser {
    parse() : TextNode[];
}

class SimpleTagParser implements TextNodeParser {
    private _text : string;
    private _nodes : TextNode[] = null;
    private _attributeStack : TextAttributes[] = null;

    constructor(text : string) { 
        this._text = text;
    }
    
    _currentAttrs() : TextAttributes {
        return this._attributeStack[this._attributeStack.length - 1];
    }
    
    _newNode() : TextNode {
        var node = new TextNode();
        node.attributes = [this._currentAttrs()];
        return node;
    }
    
    _saveNode(text : string, node : TextNode, endIndex : number) {
        node.text = text.substring(node.startIndex, endIndex);
        this._nodes.push(node);
        return this._newNode();
    }

    _parseNodeProperties(text : string, startIndex : number, endIndex : number) : TextAttributes {
        var props = JSON.parse(text.substring(startIndex + 1, endIndex - 1));
        var attrs = this._currentAttrs().copy();
        if ("size" in props) {
            attrs.textSize = props.size;
        }
        if ("color" in props) {
            attrs.textColor = Color.fromString(props.color);
        }
        if ("background" in props) {
            attrs.background = new ColorDrawable(Color.fromString(props.background));
        }
        this._attributeStack.push(attrs);
        return attrs;
    }
    
    _resetNodeIndices() {
        for (var i=0; i < this._nodes.length; ++i) {
            var node = this._nodes[i];
            node.startIndex = null;
            node.endIndex = null;
        }
    }
    
    parse() : TextNode[] {
        var text = this._text;
        if (!text) {
            return [];
        }
        
        this._nodes = [];
        this._attributeStack = [new TextAttributes()];
    
        var node = this._newNode();
        var i = 0;
        while (i < text.length) {
            if (text[i] === "<") {
                node = this._saveNode(text, node, i);
                var end = text.indexOf(">", i) + 1;
                if (text[end - 2] === "/") {
                    this._attributeStack.pop();
                    node.attributes = [this._currentAttrs()];
                }
                else {
                    node.attributes = [this._parseNodeProperties(text, i, end)];
                }
                i = end;
                node.startIndex = i;
            }
            else {
                i++;  
            }
        }
        this._saveNode(text, node, i);
        
        this._resetNodeIndices();
        
        return this._nodes;
    }
}

interface ParsedElement {
    element : HTMLElement;
    texts : Text[];
    margins : MarginPadding; 
}

class ElementParser implements TextNodeParser {
    private _root : HTMLElement;
    private _nodes : TextNode[];
    private _elements : ParsedElement[];

    constructor(root : HTMLElement) { 
        this._root = root;
    }
    
    _currentElement() : ParsedElement {
        return this._elements[this._elements.length - 1];
    }
    
    _pushElement(element : HTMLElement) {
        var m = new MarginPadding();
        if (this._elements.length > 0 && !this._isSpanTag(element.tagName)) {
            var parent = this._elements[this._elements.length - 1];
            var style = window.getComputedStyle(element);
            m = this._styleToMargins(parent.margins, style);
        }

        this._elements.push({
            element: element,
            texts: [],
            margins: m
        });
    }
    
    _trimText(text : string) : string {
        text = text.replace(/^\s+/g, ""); //Leading spaces
        text = text.replace(/\s+$/g, " "); //Trailing spaces
        return text.replace(/\s+/g, " "); //Collapse middle spaces
    }
    
    _popElement() {
        this._elements.pop();
    }
    
    _isSpanTag(tagName : string) : boolean {
        return tagName === "SPAN" || tagName === "A";
    }
    
    _pushText(text : Text) {
        var current = this._currentElement();
        
        var trimmed = this._trimText(text.textContent);
        if (trimmed.trim().length > 0) {
            var first = current.texts.length === 0;
            var element = current.element;
            var spannable = this._isSpanTag(element.tagName);
            var computedStyle = window.getComputedStyle(element);
        
            var node = new TextNode();
            node.text = first ? trimmed : " " + trimmed;
            node.margins = current.margins.copy();
            node.attributes = [this._styleToNodeAttributes(element, computedStyle)];
            if (first && !spannable) {
                node.lineBreak = true;
            }
            this._handleClickListener(element, node);
            
            if (!first) {
                node.margins.top = 0; //TODO hack bottom etc. too...
            }
            
            this._nodes.push(node);
        }
        current.texts.push(text);
    }
    
    _handleClickListener(element : HTMLElement, node : TextNode) {
        var isLink = element.tagName === "A";
    
        var callback = <Function>element.onclick;
        if (callback) {
            node.onClick = function() {
                callback();
            }
        }
        else if (isLink) {
            var link = <HTMLLinkElement>element;
            if (link.href) {
                node.onClick = function() {
                    window.open(link.href, '_blank');
                }
            }
        }
        
        if (isLink) {
            var pressedAttrs = node.defaultAttribute().copy();
            pressedAttrs.style &= ~TextStyle.Underline;
            pressedAttrs.statesOn = VF.Pressed;
            pressedAttrs.textColor = Color.Red;
            node.attributes.splice(0, 0, pressedAttrs);
        }
    }
    
    _endsWith(str : string, suffix : string) : boolean {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    
    _stringToNumber(value : string, ignore : string) : number {
        if (value && this._endsWith(value, ignore)) {
            return parseInt(value.replace(ignore, ""), 10);
        }
        return null;
    }
    
    _applyStyleIf(attrs : TextAttributes, style : TextStyle, value : string, match : string) {
        if (value && value.indexOf(match) !== -1) {
            attrs.style |= style;
        }
    }
    
    _styleToNodeAttributes(element : HTMLElement, style : CSSStyleDeclaration) : TextAttributes {
        var attrs = new TextAttributes();
        
        var size = this._stringToNumber(style.fontSize, "px");
        if (size !== null) {
            attrs.textSize = (size);
        }
        var spacing = this._stringToNumber(style.lineHeight, "px");
        if (spacing !== null) {
            attrs.textSpacing = (spacing - attrs.textSize);
        }
        var color = Color.fromString(style.color);
        if (color !== null) {
            attrs.textColor = color;
        }
        var background = Color.fromString(style.backgroundColor);
        if (background) {
            attrs.background = new ColorDrawable(background);
        }
        
        if (style.fontWeight) {
            var weight = parseInt(style.fontWeight, 10);
            if (weight != NaN && weight >= 700) {
                attrs.style |= TextStyle.Bold;
            }
        }
        
        this._applyStyleIf(attrs, TextStyle.Italic, style.fontStyle, "italic");
        this._applyStyleIf(attrs, TextStyle.Bold, style.fontWeight, "bold");
        this._applyStyleIf(attrs, TextStyle.Underline, style.textDecoration, "underline");
        this._applyStyleIf(attrs, TextStyle.Overline, style.textDecoration, "overline");
        this._applyStyleIf(attrs, TextStyle.LineThrough, style.textDecoration, "line-through");
        
        if (style.cursor) {
            if (style.cursor === "auto") {
                if (element.tagName === "A") {
                    attrs.cursor = "pointer";
                }
            }
            else {
                attrs.cursor = style.cursor;
            }
        }
        
        return attrs;
    }
    
    _styleToMargins(parent : MarginPadding, style : CSSStyleDeclaration) : MarginPadding {
        var margins = new MarginPadding();

        if (style.marginLeft) {
            margins.left = this._stringToNumber(style.marginLeft, "px");
        }
        if (style.marginTop) {
            margins.top = this._stringToNumber(style.marginTop, "px");
        }
        if (style.marginRight) {
            margins.right = this._stringToNumber(style.marginRight, "px");
        }
        if (style.marginBottom) {
            margins.bottom = this._stringToNumber(style.marginBottom, "px");
        }
        margins.apply(parent);
        
        return margins;
    }
    
    _parseNode(node : Node) {
        var isElement = node instanceof HTMLElement;
        if (isElement) {
            this._pushElement(<HTMLElement>node)
        }
        else if (node instanceof Text) {
            this._pushText(<Text>node);
        }

        for (var i=0; i < node.childNodes.length; ++i) {
            this._parseNode(node.childNodes[i]);
        }
        
        if (isElement) {
            this._popElement();
        }
    }

    parse() : TextNode[] {
        this._nodes = [];
        this._elements = [];
        
        this._parseNode(this._root);
        
        return this._nodes;
    }
}
