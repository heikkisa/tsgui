
function _inflaterTargetPropertyLookup(target : View, attribute : string) {
    var callEnd = attribute.length - 2;
    if (attribute.lastIndexOf("()") === callEnd) {
        var name = attribute.substr(0, callEnd);
        return target[name]();
    }
    else {
        return target[attribute];
    }
}

function _inflaterLookupProperty(root : View, target : View, attribute : string) {
    var attributes = attribute.split(".");
    var result = target;
    for (var i=0; i < attributes.length; ++i) {
        var attribute = attributes[i];
        if (attribute[0] === "#") {
            result = root.findView(attribute.substr(1));
            if (result === null) {
                Log("No view id: " + attribute);
                break;
            }
        }
        else {
            result = _inflaterTargetPropertyLookup(result, attribute);
        }
    }
    return result;
}

class Inflater {
    inflate(view : LayoutData, root : View) : View {
        return this._buildView(view, root, root);
    }
    
    _sortProperties(properties : any) : string[] {
        var sorted = [];
        for (var prop in properties) {
            sorted.push(prop);
        }
        sorted.sort();
        return sorted;
    }
    
    _buildView(properties : LayoutData, parent : View, root : View) : View {
        var classType = properties["ref"] || View;
        var view = <View>(new (classType)(parent));
        
        var children : any[] = null;
        
        var sorted = this._sortProperties(properties);
        for (var i=0; i < sorted.length; ++i) {
            var propName = sorted[i];
            var prop = properties[propName];
            var viewProp = view[propName];
        
            if (propName === "children") {
                children = properties["children"];
            }
            else if (propName === "ref") {
                //Already checked.
            }
            else if (propName in view) {
                if (typeof(prop) === "function" && typeof(viewProp) === "function") {
                    //Set callback (check "onXX" prefix?)
                    //view[propName] = prop;
                    view.hook(propName, prop);
                }
                else {
                    var viewPropValue = view[propName]();
                    if (viewPropValue !== undefined) {
                        //Not a setter only method.
                        if (prop instanceof _ViewRef) {
                            prop = (<_ViewRef>prop).command;
                        }
                        
                        if (typeof(prop) !== typeof(viewPropValue)) {
                            prop = _inflaterLookupProperty(root, view, prop);
                            if (typeof(prop) !== typeof(viewPropValue)) {
                                Log("Type mismatch: " + propName + " = " + prop);
                            }
                        }
                    }
                    view[propName](prop);
                }
            }
            else {
                if (typeof(prop) === "function") {
                    if (propName.indexOf("on") !== 0) {
                        //TODO Shoul look up if the undecorated property name exists in the view.
                        Log("Warning, hooking an unknown function: " + propName);
                    }
                    view.hook(propName, prop);
                }
                else {
                    //This branch no longer really needed. Raise an error?
                    Log("Warning, adding unknown property: " + propName);
                    view[propName] = properties[propName];
                }
            }
        }
        
        //Create children after parent is fully inflated.
        if (children !== null) {
            for (var x=0; x < children.length; ++x) {
                this._buildView(children[x], view, root);
            }
        }
        
        view.onInflate();
        
        return view;
    }
    
}
