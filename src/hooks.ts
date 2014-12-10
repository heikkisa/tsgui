
interface ViewHook {
    ();
    _previousHook : ViewHook;
    _nextHook : ViewHook;
    _callback : Function;
}

class HookHelper {

    static _addTargetArgument(v : any, args : any) : any[] {
        var result = [v];
        for (var i=0; i < args.length; ++i) {
            result.push(args[i]);
        }
        return result;
    }

    static _methodToName(target : any, method : any) : string {
        if (typeof(method) === "string") {
            return method;
        }
        else if (typeof(method) === "function") {
            for (var prop in target) {
                if (typeof(target[prop]) === "function" && target[prop] === method) {
                    return prop;
                }
            }
        }
        else {
            Log("Invalid hook");
        }
        return null;
    }
    
    static hookMethod(target : any, method : Function, callback : Function);
    static hookMethod(target : any, method : string, callback : Function);
    static hookMethod(target : any, method : any, callback : Function) {
        var methodName = HookHelper._methodToName(target, method);
        if (methodName === null) {
            Log("Can't hook: " + method);
            return;
        }
    
        var newHook = <ViewHook>function()  {
            callback.apply(callback, HookHelper._addTargetArgument(target, arguments));
            if (newHook._nextHook) {
                newHook._nextHook.apply(target, arguments);
            }
        };
        newHook._previousHook = null;
        newHook._nextHook = null;
        newHook._callback = callback;
        
        if (methodName in target) {
            //Hook an existing method
            if (typeof(target[methodName]) !== "function") {
                Log("Attempting to hook non-function");
                return;
            }
        
            var original = <ViewHook>(target[methodName]);
            var old = original;
            if (old._nextHook === undefined) {
                old = <ViewHook>function() : any {
                    var result = original.apply(target, arguments);
                    if (old._nextHook) {
                        old._nextHook.apply(target, arguments);
                    }
                    return result;
                };
                old._previousHook = null;
                old._nextHook = null;
                old._callback = original;
                target[methodName] = old;
            }
            
            var insertHook = old;
            while (insertHook._nextHook !== null) {
                insertHook = insertHook._nextHook;
            }
            insertHook._nextHook = newHook;
            newHook._previousHook = insertHook;
        }
        else {
            //Add a new method
            target[methodName] = newHook;
        }
    }
    
    static unhookMethod(target : any, method : Function, callback : Function);
    static unhookMethod(target : any, method : string, callback : Function);
    static unhookMethod(target : any, method : any, callback : Function) {
        var methodName = HookHelper._methodToName(target, method);
        if (methodName === null) {
            Log("Can't unhook: " + method);
            return;
        }
    
        var found = false;
        var viewHook = <ViewHook>(target[methodName]);
        while (viewHook !== null) {
            if (viewHook._callback === callback) {
                var prev = viewHook._previousHook;
                var next = viewHook._nextHook;
                if (prev) {
                    prev._nextHook = next;
                }
                if (next) {
                    next._previousHook = prev;
                }
                found = true;
                break;
            }
            viewHook = viewHook._nextHook;
        }
        
        if (!found) {
            Log("Failed to unhook a view method: " + methodName);
        }
    }
    
    static unhookAll(target : any) {
        for (var prop in target) {
            if (typeof(target[prop]) === "function") {
                var func = target[prop];
            }
        }
    }
}
