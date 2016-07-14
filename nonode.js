if (false == "from" in Array) {
    Array.from = function(args) {
        var result = [];
        for (var n = 0; n < args.length; n++) {
            result.push(args[n]);
        }
        return result;
    }
}

if (false == "includes" in Array.prototype) {
    Array.prototype.includes = function(o) {
        return this.indexOf(o) >= 0;
    }
}

module = { _exports: [] };
Object.defineProperty(module, 'exports', {
    get: function() {
        return this._exports;
    },
    set: function(obj) {
        this._exports.push(obj);
    }
});

function require(name) { return window[name]; };

util = {
    inherits: function(dest, src) {
        $.extend(dest.prototype, src.prototype);
    }
}

function events() {}
// implement the basics of EventEmitter
events.prototype.__listeners = {};
events.prototype.emit = function() {
    var args = Array.from(arguments);
    var eventName = args.shift();

    if (false == eventName in this.__listeners) return;
    
    for (var n = 0; n < this.__listeners[eventName].length; n++) {
        this.__listeners[eventName][n].apply(this, args);
    }
};

events.prototype.on = function(eventName, callback) {
    if (false == eventName in this.__listeners) {
        this.__listeners[eventName] = [];
    }
    this.__listeners[eventName].push(callback);
};

events.prototype.off = function(eventName, callback) {
    if (false == eventName in this.__listeners) return;
    if (callback === undefined) {
        // remove all the listeners for this event
        this._[eventName] = [];
    } else {
        var idx = this.__listeners[eventName].indexOf(callback);
        if (idx >= 0) {
            this.__listeners[eventName].splice(idx, 1);
        }
    }
};

events.prototype.once = function(eventName, callback) {
    if (false == eventName in this.__listeners) {
        this.__listeners[eventName] = [];
    }
    
    var _callback = (function() {
        callback();
        this.off(eventName, _callback);
    }).bind(this);
    
    this.on(eventName, _callback);
};