(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.homebridge = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it don't break things.
var cachedSetTimeout = setTimeout;
var cachedClearTimeout = clearTimeout;

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(require,module,exports){
// homebridge-firebase-common
var Platform = require('./lib/platform.js');
var Service = require('./lib/service.js');
var Accessory = require('./lib/accessory.js');
var HapTypes = require('hap-nodejs-types');

module.exports = {
    Platform: Platform,
    Accessory: Accessory,
    Service: Service,
    Types: HapTypes
}
},{"./lib/accessory.js":7,"./lib/platform.js":8,"./lib/service.js":9,"hap-nodejs-types":11}],7:[function(require,module,exports){
var EventEmitter = require('events');
var util = require('util');
var Service = require('./service.js');

function defineServiceProperty(self, ref, serviceName) {
    var service = new Service(ref, serviceName);
    
    self._serviceNames.push(serviceName);
    self._services.push(service);

    Object.defineProperty(self, serviceName, {
        get: function() { return service; }
    });
}

function Accessory(ref) {
    var _shadow = {};
    var _ref = ref;
    var _ready = false;
    
    this._serviceNames = [];
    this._services = [];
    
    function _nameHandler(snapshot) {
        _shadow.Name = snapshot.val();
        this.emit('Name', _shadow.Name);
    }
    
    function _checkReady() {
        if (_ready) return;
        
        for (var n = 0; n < this._services.length; n++) {
            if (this._services[n].IsReady == false) return;
        }
        
        _ready = true;
        this.emit('ready');
    }
    
    function _scanServices(snapshot) {
        var service = snapshot.val();
        
        // add the name listener and property
        Object.defineProperty(this, 'Name', {
            get: function() { return _shadow.Name; },
            set: function(val) { 
                _shadow.Name = val;
                _ref.child('Name').set(val);
            }
        });
        _ref.child('Name').on('value', _nameHandler.bind(this));
        
        for (var k in service.Services) {
            defineServiceProperty(this, ref, k);
        }
        
        for (var n = 0; n < this._services.length; n++) {
            this._services[n].ready(_checkReady.bind(this));
        }
    }
    
    function _onAuth(authData) {
        if (authData) {
            _ref.off('value');
            
            _ref.once('value', _scanServices.bind(this));
        }
    }
    
    this.ready = function(callback) {
        if (_ready) {
            callback();
        } else {
            this.on('ready', callback);
        }
        return this;
    };
    
        
    Object.defineProperty(this, 'IsReady', {
        get: function() { return _ready; }
    });
     
    Object.defineProperty(this, 'Services', {
        get: function() {
            return this._serviceNames.slice(0);
        }
    });
    
    // Initialization
    if (_ref.onAuth) { // v 2.4.x
        _ref.onAuth(_onAuth.bind(this));
    } else if (_ref.database.app.auth) { // v 3.0.x
        _ref.database.app.auth().onAuthStateChanged(_onAuth.bind(this));
    }
}

util.inherits(Accessory, EventEmitter);


module.exports = Accessory;



},{"./service.js":9,"events":1,"util":5}],8:[function(require,module,exports){
// platform.js
var EventEmitter = require('events');
var util = require('util');

var Accessory = require('./accessory.js');

function createAccessoryProp(self, accessoryName, accessory) {
    Object.defineProperty(self, accessoryName, {
        get: function() { return accessory; }
    });
}

function Platform(ref, filter) {
    var _shadow = {};
    var _ref = ref;
    var _ready = false;
    var _accessories = [];
    var _accessoryNames = [];
    var _friendlyNames = [];
    var _filter = filter || /.*/;
    
    _filter = new RegExp(_filter); // in case it's passed as a string
    
    function _testReady() {
        if (_ready) return;
        for (var n = 0; n < _accessories.length; n++) {
            if (_accessories[n].IsReady == false) return;
            
            if ((_accessories[n].AccessoryInformation !== undefined) &&
                (_accessories[n].AccessoryInformation.Name !== undefined)
            ) {
                var name = _accessories[n].AccessoryInformation.Name;
                // add this by it's friendly name
                if (_friendlyNames.indexOf(name) < 0) {
                    createAccessoryProp(this, name, _accessories[n]);
                    _friendlyNames.push(name);
                    
                    try {
                        name = name.replace(/[ \.\[\]\{\}\(\)]/g, '');
                        createAccessoryProp(this, name, _accessories[n]);
                    } catch (error) {
                        
                    }
                }
            }
        }
        
        _ready = true;
        this.emit('ready');
    }
    
    function _scanAccessories(snapshot) {
        var data = snapshot.val();
        
        for (var k in data) {
            if (_filter.test(k) == true) {
                var accessory = new Accessory(_ref.child(k));
                _accessories.push(accessory);
                _accessoryNames.push(k);
                createAccessoryProp(this, k, accessory);
            }
        }
        
        for (var n = 0; n < _accessories.length; n++) {
            _accessories[n].ready(_testReady.bind(this));
        }
    }
    
    function _onAuth(authData) {
        if (authData) {
            _ref.off('value');
            
            _ref.once('value', _scanAccessories.bind(this));
        }
    }
    
    this.ready = function(callback) {
        if (_ready) {
            callback();
        } else {
            this.on('ready', callback);
        }
        return this;
    };
        
    Object.defineProperty(this, 'IsReady', {
        get: function() { return _ready; }
    });
    
    Object.defineProperty(this, 'Accessories', {
        get: function() { return _accessoryNames.slice(0); }
    });
    
    Object.defineProperty(this, 'Names', {
        get: function() { return _friendlyNames.slice(0); }
    });
    
    _ref.onAuth(_onAuth.bind(this));
}

util.inherits(Platform, EventEmitter);
module.exports = Platform;
},{"./accessory.js":7,"events":1,"util":5}],9:[function(require,module,exports){
// generic service

var EventEmitter = require('events');
var util = require('util');

function addCharacteristic(self, ref, characteristicName, value) {
    var _shadow = value;
    
    self._characteristics.push(characteristicName);
    
    function _changeHandler(snapshot) {
        _shadow = snapshot.val();
        self.emit(characteristicName, _shadow);
    }
    
    ref.child('Characteristics/' + characteristicName).on('value', _changeHandler.bind(self));
    Object.defineProperty(self, characteristicName, {
        get: function() { return _shadow; },
        set: function(val) {
            _shadow = val;
            ref.child('Characteristics/' + characteristicName).set(_shadow);
        }
    });
}

function Service(ref, serviceName) {
    var _ref = ref.child('Services/' + serviceName);
    var _ready = false;
    
    this._characteristics = [];

    function _scanCharacteristics(snapshot) {
        var _service = snapshot.val();
        
        for (var k in _service.Characteristics) {
            addCharacteristic(this, _ref, k,
                _service.Characteristics[k]);
        }
            
        // emit ready
        _ready = true;
        this.emit('ready');
    }
    
    function _onAuth(authData) {
        if (authData) {
            // get rid of any other listeners
            _ref.off('value');
            
            // scan the Window characteristics
            _ref.once('value', _scanCharacteristics.bind(this));
        }
    }
    
    this.ready = function(callback) {
        if (_ready) {
            callback();
        } else {
            this.on('ready', callback);
        }
        return this;
    };
    
    Object.defineProperty(this, 'Characteristics', {
        get: function() {
            return this._characteristics.slice(0);
        }
    });
    
    Object.defineProperty(this, 'IsReady', {
        get: function() { return _ready; }
    });
    
    // Initialization
    if (_ref.onAuth) { // v 2.4.x
        _ref.onAuth(_onAuth.bind(this));
    } else if (_ref.database.app.auth) { // v 3.0.x
        _ref.database.app.auth().onAuthStateChanged(_onAuth.bind(this));
    }
}

util.inherits(Service, EventEmitter);
module.exports = Service;
},{"events":1,"util":5}],10:[function(require,module,exports){
var exports = module.exports = {};

//HomeKit Types UUID's

var stPre = "000000";
var stPost = "-0000-1000-8000-0026BB765291";


//HomeKitTransportCategoryTypes
exports.OTHER_TCTYPE = 1;
exports.FAN_TCTYPE = 3;
exports.GARAGE_DOOR_OPENER_TCTYPE = 4;
exports.LIGHTBULB_TCTYPE = 5;
exports.DOOR_LOCK_TCTYPE = 6;
exports.OUTLET_TCTYPE = 7;
exports.SWITCH_TCTYPE = 8;
exports.THERMOSTAT_TCTYPE = 9;
exports.SENSOR_TCTYPE = 10;
exports.ALARM_SYSTEM_TCTYPE = 11;
exports.DOOR_TCTYPE = 12;
exports.WINDOW_TCTYPE = 13;
exports.WINDOW_COVERING_TCTYPE = 14;
exports.PROGRAMMABLE_SWITCH_TCTYPE = 15;

//HomeKitServiceTypes

exports.LIGHTBULB_STYPE = stPre + "43" + stPost;
exports.SWITCH_STYPE = stPre + "49" + stPost;
exports.THERMOSTAT_STYPE = stPre + "4A" + stPost;
exports.GARAGE_DOOR_OPENER_STYPE = stPre + "41" + stPost;
exports.ACCESSORY_INFORMATION_STYPE = stPre + "3E" + stPost;
exports.FAN_STYPE = stPre + "40" + stPost;
exports.OUTLET_STYPE = stPre + "47" + stPost;
exports.LOCK_MECHANISM_STYPE = stPre + "45" + stPost;
exports.LOCK_MANAGEMENT_STYPE = stPre + "44" + stPost;
exports.ALARM_STYPE = stPre + "7E" + stPost;
exports.WINDOW_COVERING_STYPE = stPre + "8C" + stPost;
exports.OCCUPANCY_SENSOR_STYPE = stPre + "86" + stPost;
exports.CONTACT_SENSOR_STYPE = stPre + "80" + stPost;
exports.MOTION_SENSOR_STYPE = stPre + "85" + stPost;
exports.HUMIDITY_SENSOR_STYPE = stPre + "82" + stPost;
exports.TEMPERATURE_SENSOR_STYPE = stPre + "8A" + stPost;

//HomeKitCharacteristicsTypes


exports.ALARM_CURRENT_STATE_CTYPE = stPre + "66" + stPost;
exports.ALARM_TARGET_STATE_CTYPE = stPre + "67" + stPost;
exports.ADMIN_ONLY_ACCESS_CTYPE = stPre + "01" + stPost;
exports.AUDIO_FEEDBACK_CTYPE = stPre + "05" + stPost;
exports.BRIGHTNESS_CTYPE = stPre + "08" + stPost;
exports.BATTERY_LEVEL_CTYPE = stPre + "68" + stPost;
exports.COOLING_THRESHOLD_CTYPE = stPre + "0D" + stPost;
exports.CONTACT_SENSOR_STATE_CTYPE = stPre + "6A" + stPost;
exports.CURRENT_DOOR_STATE_CTYPE = stPre + "0E" + stPost;
exports.CURRENT_LOCK_MECHANISM_STATE_CTYPE = stPre + "1D" + stPost;
exports.CURRENT_RELATIVE_HUMIDITY_CTYPE = stPre + "10" + stPost;
exports.CURRENT_TEMPERATURE_CTYPE = stPre + "11" + stPost;
exports.HEATING_THRESHOLD_CTYPE = stPre + "12" + stPost;
exports.HUE_CTYPE = stPre + "13" + stPost;
exports.IDENTIFY_CTYPE = stPre + "14" + stPost;
exports.LOCK_MANAGEMENT_AUTO_SECURE_TIMEOUT_CTYPE = stPre + "1A" + stPost;
exports.LOCK_MANAGEMENT_CONTROL_POINT_CTYPE = stPre + "19" + stPost;
exports.LOCK_MECHANISM_LAST_KNOWN_ACTION_CTYPE = stPre + "1C" + stPost;
exports.LOGS_CTYPE = stPre + "1F" + stPost;
exports.MANUFACTURER_CTYPE = stPre + "20" + stPost;
exports.MODEL_CTYPE = stPre + "21" + stPost;
exports.MOTION_DETECTED_CTYPE = stPre + "22" + stPost;
exports.NAME_CTYPE = stPre + "23" + stPost;
exports.OBSTRUCTION_DETECTED_CTYPE = stPre + "24" + stPost;
exports.OUTLET_IN_USE_CTYPE = stPre + "26" + stPost;
exports.OCCUPANCY_DETECTED_CTYPE = stPre + "71" + stPost;
exports.POWER_STATE_CTYPE = stPre + "25" + stPost;
exports.PROGRAMMABLE_SWITCH_SWITCH_EVENT_CTYPE = stPre + "73" + stPost;
exports.PROGRAMMABLE_SWITCH_OUTPUT_STATE_CTYPE = stPre + "74" + stPost;
exports.ROTATION_DIRECTION_CTYPE = stPre + "28" + stPost;
exports.ROTATION_SPEED_CTYPE = stPre + "29" + stPost;
exports.SATURATION_CTYPE = stPre + "2F" + stPost;
exports.SERIAL_NUMBER_CTYPE = stPre + "30" + stPost;
exports.STATUS_LOW_BATTERY_CTYPE = stPre + "79" + stPost;
exports.STATUS_FAULT_CTYPE = stPre + "77" + stPost;
exports.TARGET_DOORSTATE_CTYPE = stPre + "32" + stPost;
exports.TARGET_LOCK_MECHANISM_STATE_CTYPE = stPre + "1E" + stPost;
exports.TARGET_RELATIVE_HUMIDITY_CTYPE = stPre + "34" + stPost;
exports.TARGET_TEMPERATURE_CTYPE = stPre + "35" + stPost;
exports.TEMPERATURE_UNITS_CTYPE = stPre + "36" + stPost;
exports.VERSION_CTYPE = stPre + "37" + stPost;
exports.WINDOW_COVERING_TARGET_POSITION_CTYPE = stPre + "7C" + stPost;
exports.WINDOW_COVERING_CURRENT_POSITION_CTYPE = stPre + "6D" + stPost;
exports.WINDOW_COVERING_OPERATION_STATE_CTYPE = stPre + "72" + stPost;
exports.CURRENTHEATINGCOOLING_CTYPE = stPre + "0F" + stPost;
exports.TARGETHEATINGCOOLING_CTYPE = stPre + "33" + stPost;
},{}],11:[function(require,module,exports){
module.exports = {
  Service: require('./lib/gen/HomeKitTypes').Service,
  Characteristic: require('./lib/gen/HomeKitTypes').Characteristic,
  TypeUUIDs: require('./accessories/types')
}

},{"./accessories/types":10,"./lib/gen/HomeKitTypes":12}],12:[function(require,module,exports){
var Characteristic = {};
var Service = {};

// Known HomeKit formats
Characteristic.Formats = {
  BOOL: 'bool',
  INT: 'int',
  FLOAT: 'float',
  STRING: 'string',
  ARRAY: 'array', // unconfirmed
  DICTIONARY: 'dictionary', // unconfirmed
  UINT8: 'uint8',
  UINT16: 'uint16',
  UINT32: 'uint32',
  UINT64: 'uint64',
  DATA: 'data', // unconfirmed
  TLV8: 'tlv8'
}

// Known HomeKit unit types
Characteristic.Units = {
  // HomeKit only defines Celsius, for Fahrenheit, it requires iOS app to do the conversion.
  CELSIUS: 'celsius',
  PERCENTAGE: 'percentage',
  ARC_DEGREE: 'arcdegrees',
  LUX: 'lux',
  SECONDS: 'seconds'
}

// Known HomeKit permission types
Characteristic.Perms = {
  READ: 'pr',
  WRITE: 'pw',
  NOTIFY: 'ev',
  HIDDEN: 'hd'
}

/**
 * Characteristic "Accessory Identifier"
 */

Characteristic.AccessoryIdentifier = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.AccessoryIdentifier.UUID = '00000057-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Administrator Only Access"
 */

Characteristic.AdministratorOnlyAccess = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.AdministratorOnlyAccess.UUID = '00000001-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Air Particulate Density"
 */

Characteristic.AirParticulateDensity = {
    format: Characteristic.Formats.FLOAT,
    maxValue: 1000,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.AirParticulateDensity.UUID = '00000064-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Air Particulate Size"
 */

Characteristic.AirParticulateSize = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.AirParticulateSize.UUID = '00000065-0000-1000-8000-0026BB765291';

// The value property of AirParticulateSize must be one of the following:
Characteristic.AirParticulateSize._2_5_M = 0;
Characteristic.AirParticulateSize._10_M = 1;

/**
 * Characteristic "Air Quality"
 */

Characteristic.AirQuality = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.AirQuality.UUID = '00000095-0000-1000-8000-0026BB765291';

// The value property of AirQuality must be one of the following:
Characteristic.AirQuality.UNKNOWN = 0;
Characteristic.AirQuality.EXCELLENT = 1;
Characteristic.AirQuality.GOOD = 2;
Characteristic.AirQuality.FAIR = 3;
Characteristic.AirQuality.INFERIOR = 4;
Characteristic.AirQuality.POOR = 5;

/**
 * Characteristic "Audio Feedback"
 */

Characteristic.AudioFeedback = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.AudioFeedback.UUID = '00000005-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Battery Level"
 */

Characteristic.BatteryLevel = {
    format: Characteristic.Formats.UINT8,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.BatteryLevel.UUID = '00000068-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Brightness"
 */

Characteristic.Brightness = {
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.Brightness.UUID = '00000008-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Carbon Dioxide Detected"
 */

Characteristic.CarbonDioxideDetected = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonDioxideDetected.UUID = '00000092-0000-1000-8000-0026BB765291';

// The value property of CarbonDioxideDetected must be one of the following:
Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL = 0;
Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL = 1;

/**
 * Characteristic "Carbon Dioxide Level"
 */

Characteristic.CarbonDioxideLevel = {
    format: Characteristic.Formats.FLOAT,
    maxValue: 100000,
    minValue: 0,
    minStep: 100,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonDioxideLevel.UUID = '00000093-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Carbon Dioxide Peak Level"
 */

Characteristic.CarbonDioxidePeakLevel = {
    format: Characteristic.Formats.FLOAT,
    maxValue: 100000,
    minValue: 0,
    minStep: 100,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonDioxidePeakLevel.UUID = '00000094-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Carbon Monoxide Detected"
 */

Characteristic.CarbonMonoxideDetected = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonMonoxideDetected.UUID = '00000069-0000-1000-8000-0026BB765291';

// The value property of CarbonMonoxideDetected must be one of the following:
Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL = 0;
Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL = 1;

/**
 * Characteristic "Carbon Monoxide Level"
 */

Characteristic.CarbonMonoxideLevel = {
    format: Characteristic.Formats.FLOAT,
    maxValue: 100,
    minValue: 0,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonMonoxideLevel.UUID = '00000090-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Carbon Monoxide Peak Level"
 */

Characteristic.CarbonMonoxidePeakLevel = {
    format: Characteristic.Formats.FLOAT,
    maxValue: 100,
    minValue: 0,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CarbonMonoxidePeakLevel.UUID = '00000091-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Category"
 */

Characteristic.Category = {
    format: Characteristic.Formats.UINT16,
    maxValue: 16,
    minValue: 1,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.Category.UUID = '000000A3-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Charging State"
 */

Characteristic.ChargingState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.ChargingState.UUID = '0000008F-0000-1000-8000-0026BB765291';

// The value property of ChargingState must be one of the following:
Characteristic.ChargingState.NOT_CHARGING = 0;
Characteristic.ChargingState.CHARGING = 1;

/**
 * Characteristic "Configure Bridged Accessory"
 */

Characteristic.ConfigureBridgedAccessory = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.WRITE]
};

Characteristic.ConfigureBridgedAccessory.UUID = '000000A0-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Configure Bridged Accessory Status"
 */

Characteristic.ConfigureBridgedAccessoryStatus = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.ConfigureBridgedAccessoryStatus.UUID = '0000009D-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Contact Sensor State"
 */

Characteristic.ContactSensorState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.ContactSensorState.UUID = '0000006A-0000-1000-8000-0026BB765291';

// The value property of ContactSensorState must be one of the following:
Characteristic.ContactSensorState.CONTACT_DETECTED = 0;
Characteristic.ContactSensorState.CONTACT_NOT_DETECTED = 1;

/**
 * Characteristic "Cooling Threshold Temperature"
 */

Characteristic.CoolingThresholdTemperature = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.CELSIUS,
    maxValue: 35,
    minValue: 10,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.CoolingThresholdTemperature.UUID = '0000000D-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Ambient Light Level"
 */

Characteristic.CurrentAmbientLightLevel = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.LUX,
    maxValue: 100000,
    minValue: 0.0001,
    minStep: 0.0001,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentAmbientLightLevel.UUID = '0000006B-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Door State"
 */

Characteristic.CurrentDoorState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentDoorState.UUID = '0000000E-0000-1000-8000-0026BB765291';

// The value property of CurrentDoorState must be one of the following:
Characteristic.CurrentDoorState.OPEN = 0;
Characteristic.CurrentDoorState.CLOSED = 1;
Characteristic.CurrentDoorState.OPENING = 2;
Characteristic.CurrentDoorState.CLOSING = 3;
Characteristic.CurrentDoorState.STOPPED = 4;

/**
 * Characteristic "Current Heating Cooling State"
 */

Characteristic.CurrentHeatingCoolingState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentHeatingCoolingState.UUID = '0000000F-0000-1000-8000-0026BB765291';

// The value property of CurrentHeatingCoolingState must be one of the following:
Characteristic.CurrentHeatingCoolingState.OFF = 0;
Characteristic.CurrentHeatingCoolingState.HEAT = 1;
Characteristic.CurrentHeatingCoolingState.COOL = 2;

/**
 * Characteristic "Current Horizontal Tilt Angle"
 */

Characteristic.CurrentHorizontalTiltAngle = {
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.ARC_DEGREE,
    maxValue: 90,
    minValue: -90,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentHorizontalTiltAngle.UUID = '0000006C-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Position"
 */

Characteristic.CurrentPosition = {
    format: Characteristic.Formats.UINT8,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentPosition.UUID = '0000006D-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Relative Humidity"
 */

Characteristic.CurrentRelativeHumidity = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentRelativeHumidity.UUID = '00000010-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Temperature"
 */

Characteristic.CurrentTemperature = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.CELSIUS,
    maxValue: 100,
    minValue: 0,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentTemperature.UUID = '00000011-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Time"
 */

Characteristic.CurrentTime = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
};

Characteristic.CurrentTime.UUID = '0000009B-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Current Vertical Tilt Angle"
 */

Characteristic.CurrentVerticalTiltAngle = {
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.ARC_DEGREE,
    maxValue: 90,
    minValue: -90,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.CurrentVerticalTiltAngle.UUID = '0000006E-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Day of the Week"
 */

Characteristic.DayoftheWeek = {
    format: Characteristic.Formats.UINT8,
    maxValue: 7,
    minValue: 1,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
};

Characteristic.DayoftheWeek.UUID = '00000098-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Discover Bridged Accessories"
 */

Characteristic.DiscoverBridgedAccessories = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.DiscoverBridgedAccessories.UUID = '0000009E-0000-1000-8000-0026BB765291';

// The value property of DiscoverBridgedAccessories must be one of the following:
Characteristic.DiscoverBridgedAccessories.START_DISCOVERY = 0;
Characteristic.DiscoverBridgedAccessories.STOP_DISCOVERY = 1;

/**
 * Characteristic "Discovered Bridged Accessories"
 */

Characteristic.DiscoveredBridgedAccessories = {
    format: Characteristic.Formats.UINT16,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.DiscoveredBridgedAccessories.UUID = '0000009F-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Firmware Revision"
 */

Characteristic.FirmwareRevision = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.FirmwareRevision.UUID = '00000052-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Hardware Revision"
 */

Characteristic.HardwareRevision = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.HardwareRevision.UUID = '00000053-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Heating Threshold Temperature"
 */

Characteristic.HeatingThresholdTemperature = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.CELSIUS,
    maxValue: 25,
    minValue: 0,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.HeatingThresholdTemperature.UUID = '00000012-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Hold Position"
 */

Characteristic.HoldPosition = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.WRITE]
};

Characteristic.HoldPosition.UUID = '0000006F-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Hue"
 */

Characteristic.Hue = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.ARC_DEGREE,
    maxValue: 360,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.Hue.UUID = '00000013-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Identify"
 */

Characteristic.Identify = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.WRITE]
};

Characteristic.Identify.UUID = '00000014-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Leak Detected"
 */

Characteristic.LeakDetected = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.LeakDetected.UUID = '00000070-0000-1000-8000-0026BB765291';

// The value property of LeakDetected must be one of the following:
Characteristic.LeakDetected.LEAK_NOT_DETECTED = 0;
Characteristic.LeakDetected.LEAK_DETECTED = 1;

/**
 * Characteristic "Link Quality"
 */

Characteristic.LinkQuality = {
    format: Characteristic.Formats.UINT8,
    maxValue: 4,
    minValue: 1,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.LinkQuality.UUID = '0000009C-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Lock Control Point"
 */

Characteristic.LockControlPoint = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.WRITE]
};

Characteristic.LockControlPoint.UUID = '00000019-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Lock Current State"
 */

Characteristic.LockCurrentState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.LockCurrentState.UUID = '0000001D-0000-1000-8000-0026BB765291';

// The value property of LockCurrentState must be one of the following:
Characteristic.LockCurrentState.UNSECURED = 0;
Characteristic.LockCurrentState.SECURED = 1;
Characteristic.LockCurrentState.JAMMED = 2;
Characteristic.LockCurrentState.UNKNOWN = 3;

/**
 * Characteristic "Lock Last Known Action"
 */

Characteristic.LockLastKnownAction = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.LockLastKnownAction.UUID = '0000001C-0000-1000-8000-0026BB765291';

// The value property of LockLastKnownAction must be one of the following:
Characteristic.LockLastKnownAction.SECURED_PHYSICALLY_INTERIOR = 0;
Characteristic.LockLastKnownAction.UNSECURED_PHYSICALLY_INTERIOR = 1;
Characteristic.LockLastKnownAction.SECURED_PHYSICALLY_EXTERIOR = 2;
Characteristic.LockLastKnownAction.UNSECURED_PHYSICALLY_EXTERIOR = 3;
Characteristic.LockLastKnownAction.SECURED_BY_KEYPAD = 4;
Characteristic.LockLastKnownAction.UNSECURED_BY_KEYPAD = 5;
Characteristic.LockLastKnownAction.SECURED_REMOTELY = 6;
Characteristic.LockLastKnownAction.UNSECURED_REMOTELY = 7;
Characteristic.LockLastKnownAction.SECURED_BY_AUTO_SECURE_TIMEOUT = 8;

/**
 * Characteristic "Lock Management Auto Security Timeout"
 */

Characteristic.LockManagementAutoSecurityTimeout = {
    format: Characteristic.Formats.UINT32,
    unit: Characteristic.Units.SECONDS,
    maxValue: 86400,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.LockManagementAutoSecurityTimeout.UUID = '0000001A-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Lock Target State"
 */

Characteristic.LockTargetState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.LockTargetState.UUID = '0000001E-0000-1000-8000-0026BB765291';

// The value property of LockTargetState must be one of the following:
Characteristic.LockTargetState.UNSECURED = 0;
Characteristic.LockTargetState.SECURED = 1;

/**
 * Characteristic "Logs"
 */

Characteristic.Logs = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.Logs.UUID = '0000001F-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Manufacturer"
 */

Characteristic.Manufacturer = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.Manufacturer.UUID = '00000020-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Model"
 */

Characteristic.Model = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.Model.UUID = '00000021-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Motion Detected"
 */

Characteristic.MotionDetected = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.MotionDetected.UUID = '00000022-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Name"
 */

Characteristic.Name = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.Name.UUID = '00000023-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Obstruction Detected"
 */

Characteristic.ObstructionDetected = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.ObstructionDetected.UUID = '00000024-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Occupancy Detected"
 */

Characteristic.OccupancyDetected = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.OccupancyDetected.UUID = '00000071-0000-1000-8000-0026BB765291';

// The value property of OccupancyDetected must be one of the following:
Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED = 0;
Characteristic.OccupancyDetected.OCCUPANCY_DETECTED = 1;

/**
 * Characteristic "On"
 */

Characteristic.On = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.On.UUID = '00000025-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Outlet In Use"
 */

Characteristic.OutletInUse = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.OutletInUse.UUID = '00000026-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Pair Setup"
 */

Characteristic.PairSetup = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
};

Characteristic.PairSetup.UUID = '0000004C-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Pair Verify"
 */

Characteristic.PairVerify = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
};

Characteristic.PairVerify.UUID = '0000004E-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Pairing Features"
 */

Characteristic.PairingFeatures = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ]
};

Characteristic.PairingFeatures.UUID = '0000004F-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Pairing Pairings"
 */

Characteristic.PairingPairings = {
    format: Characteristic.Formats.TLV8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
};

Characteristic.PairingPairings.UUID = '00000050-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Position State"
 */

Characteristic.PositionState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.PositionState.UUID = '00000072-0000-1000-8000-0026BB765291';

// The value property of PositionState must be one of the following:
Characteristic.PositionState.DECREASING = 0;
Characteristic.PositionState.INCREASING = 1;
Characteristic.PositionState.STOPPED = 2;

/**
 * Characteristic "Programmable Switch Event"
 */

Characteristic.ProgrammableSwitchEvent = {
    format: Characteristic.Formats.UINT8,
    maxValue: 1,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.ProgrammableSwitchEvent.UUID = '00000073-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Programmable Switch Output State"
 */

Characteristic.ProgrammableSwitchOutputState = {
    format: Characteristic.Formats.UINT8,
    maxValue: 1,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.ProgrammableSwitchOutputState.UUID = '00000074-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Reachable"
 */

Characteristic.Reachable = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.Reachable.UUID = '00000063-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Rotation Direction"
 */

Characteristic.RotationDirection = {
    format: Characteristic.Formats.INT,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.RotationDirection.UUID = '00000028-0000-1000-8000-0026BB765291';

// The value property of RotationDirection must be one of the following:
Characteristic.RotationDirection.CLOCKWISE = 0;
Characteristic.RotationDirection.COUNTER_CLOCKWISE = 1;

/**
 * Characteristic "Rotation Speed"
 */

Characteristic.RotationSpeed = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.RotationSpeed.UUID = '00000029-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Saturation"
 */

Characteristic.Saturation = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.Saturation.UUID = '0000002F-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Security System Alarm Type"
 */

Characteristic.SecuritySystemAlarmType = {
    format: Characteristic.Formats.UINT8,
    maxValue: 1,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.SecuritySystemAlarmType.UUID = '0000008E-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Security System Current State"
 */

Characteristic.SecuritySystemCurrentState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.SecuritySystemCurrentState.UUID = '00000066-0000-1000-8000-0026BB765291';

// The value property of SecuritySystemCurrentState must be one of the following:
Characteristic.SecuritySystemCurrentState.STAY_ARM = 0;
Characteristic.SecuritySystemCurrentState.AWAY_ARM = 1;
Characteristic.SecuritySystemCurrentState.NIGHT_ARM = 2;
Characteristic.SecuritySystemCurrentState.DISARMED = 3;
Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED = 4;

/**
 * Characteristic "Security System Target State"
 */

Characteristic.SecuritySystemTargetState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.SecuritySystemTargetState.UUID = '00000067-0000-1000-8000-0026BB765291';

// The value property of SecuritySystemTargetState must be one of the following:
Characteristic.SecuritySystemTargetState.STAY_ARM = 0;
Characteristic.SecuritySystemTargetState.AWAY_ARM = 1;
Characteristic.SecuritySystemTargetState.NIGHT_ARM = 2;
Characteristic.SecuritySystemTargetState.DISARM = 3;

/**
 * Characteristic "Serial Number"
 */

Characteristic.SerialNumber = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.SerialNumber.UUID = '00000030-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Smoke Detected"
 */

Characteristic.SmokeDetected = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.SmokeDetected.UUID = '00000076-0000-1000-8000-0026BB765291';

// The value property of SmokeDetected must be one of the following:
Characteristic.SmokeDetected.SMOKE_NOT_DETECTED = 0;
Characteristic.SmokeDetected.SMOKE_DETECTED = 1;

/**
 * Characteristic "Software Revision"
 */

Characteristic.SoftwareRevision = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ]
};

Characteristic.SoftwareRevision.UUID = '00000054-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Status Active"
 */

Characteristic.StatusActive = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.StatusActive.UUID = '00000075-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Status Fault"
 */

Characteristic.StatusFault = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.StatusFault.UUID = '00000077-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Status Jammed"
 */

Characteristic.StatusJammed = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.StatusJammed.UUID = '00000078-0000-1000-8000-0026BB765291';

// The value property of StatusJammed must be one of the following:
Characteristic.StatusJammed.NOT_JAMMED = 0;
Characteristic.StatusJammed.JAMMED = 1;

/**
 * Characteristic "Status Low Battery"
 */

Characteristic.StatusLowBattery = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.StatusLowBattery.UUID = '00000079-0000-1000-8000-0026BB765291';

// The value property of StatusLowBattery must be one of the following:
Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL = 0;
Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW = 1;

/**
 * Characteristic "Status Tampered"
 */

Characteristic.StatusTampered = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.StatusTampered.UUID = '0000007A-0000-1000-8000-0026BB765291';

// The value property of StatusTampered must be one of the following:
Characteristic.StatusTampered.NOT_TAMPERED = 0;
Characteristic.StatusTampered.TAMPERED = 1;

/**
 * Characteristic "Target Door State"
 */

Characteristic.TargetDoorState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetDoorState.UUID = '00000032-0000-1000-8000-0026BB765291';

// The value property of TargetDoorState must be one of the following:
Characteristic.TargetDoorState.OPEN = 0;
Characteristic.TargetDoorState.CLOSED = 1;

/**
 * Characteristic "Target Heating Cooling State"
 */

Characteristic.TargetHeatingCoolingState = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetHeatingCoolingState.UUID = '00000033-0000-1000-8000-0026BB765291';

// The value property of TargetHeatingCoolingState must be one of the following:
Characteristic.TargetHeatingCoolingState.OFF = 0;
Characteristic.TargetHeatingCoolingState.HEAT = 1;
Characteristic.TargetHeatingCoolingState.COOL = 2;
Characteristic.TargetHeatingCoolingState.AUTO = 3;

/**
 * Characteristic "Target Horizontal Tilt Angle"
 */

Characteristic.TargetHorizontalTiltAngle = {
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.ARC_DEGREE,
    maxValue: 90,
    minValue: -90,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetHorizontalTiltAngle.UUID = '0000007B-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Target Position"
 */

Characteristic.TargetPosition = {
    format: Characteristic.Formats.UINT8,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetPosition.UUID = '0000007C-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Target Relative Humidity"
 */

Characteristic.TargetRelativeHumidity = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.PERCENTAGE,
    maxValue: 100,
    minValue: 0,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetRelativeHumidity.UUID = '00000034-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Target Temperature"
 */

Characteristic.TargetTemperature = {
    format: Characteristic.Formats.FLOAT,
    unit: Characteristic.Units.CELSIUS,
    maxValue: 38,
    minValue: 10,
    minStep: 0.1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetTemperature.UUID = '00000035-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Target Vertical Tilt Angle"
 */

Characteristic.TargetVerticalTiltAngle = {
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.ARC_DEGREE,
    maxValue: 90,
    minValue: -90,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TargetVerticalTiltAngle.UUID = '0000007D-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Temperature Display Units"
 */

Characteristic.TemperatureDisplayUnits = {
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
};

Characteristic.TemperatureDisplayUnits.UUID = '00000036-0000-1000-8000-0026BB765291';

// The value property of TemperatureDisplayUnits must be one of the following:
Characteristic.TemperatureDisplayUnits.CELSIUS = 0;
Characteristic.TemperatureDisplayUnits.FAHRENHEIT = 1;

/**
 * Characteristic "Time Update"
 */

Characteristic.TimeUpdate = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.TimeUpdate.UUID = '0000009A-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Tunnel Connection Timeout "
 */

Characteristic.TunnelConnectionTimeout = {
    format: Characteristic.Formats.UINT32,
    perms: [Characteristic.Perms.WRITE, Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.TunnelConnectionTimeout.UUID = '00000061-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Tunneled Accessory Advertising"
 */

Characteristic.TunneledAccessoryAdvertising = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.WRITE, Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.TunneledAccessoryAdvertising.UUID = '00000060-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Tunneled Accessory Connected"
 */

Characteristic.TunneledAccessoryConnected = {
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.WRITE, Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.TunneledAccessoryConnected.UUID = '00000059-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Tunneled Accessory State Number"
 */

Characteristic.TunneledAccessoryStateNumber = {
    format: Characteristic.Formats.FLOAT,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.TunneledAccessoryStateNumber.UUID = '00000058-0000-1000-8000-0026BB765291';

/**
 * Characteristic "Version"
 */

Characteristic.Version = {
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
};

Characteristic.Version.UUID = '00000037-0000-1000-8000-0026BB765291';

/**
 * Service "Accessory Information"
 */

Service.AccessoryInformation = {
  // Required Characteristics
  Characteristics: [
    "Identify",
    "Manufacturer",
    "Model",
    "Name",
    "SerialNumber",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "FirmwareRevision",
    "HardwareRevision",
    "SoftwareRevision",
  ]
};

Service.AccessoryInformation.UUID = '0000003E-0000-1000-8000-0026BB765291';

/**
 * Service "Air Quality Sensor"
 */

Service.AirQualitySensor = {
  // Required Characteristics
  Characteristics: [
    "AirQuality",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "AirParticulateDensity",
    "AirParticulateSize",
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.AirQualitySensor.UUID = '0000008D-0000-1000-8000-0026BB765291';

/**
 * Service "Battery Service"
 */

Service.BatteryService = {
  // Required Characteristics
  Characteristics: [
    "BatteryLevel",
    "ChargingState",
    "StatusLowBattery",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.BatteryService.UUID = '00000096-0000-1000-8000-0026BB765291';

/**
 * Service "Bridge Configuration"
 */

Service.BridgeConfiguration = {
  // Required Characteristics
  Characteristics: [
    "ConfigureBridgedAccessoryStatus",
    "DiscoverBridgedAccessories",
    "DiscoveredBridgedAccessories",
    "ConfigureBridgedAccessory",
  ],

  // Optional Characteristics
  OptionalCharacteristics: []
};

Service.BridgeConfiguration.UUID = '000000A1-0000-1000-8000-0026BB765291';

/**
 * Service "Bridging State"
 */

Service.BridgingState = {
  // Required Characteristics
  Characteristics: [
    "Reachable",
    "LinkQuality",
    "AccessoryIdentifier",
    "Category",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.BridgingState.UUID = '00000062-0000-1000-8000-0026BB765291';

/**
 * Service "Carbon Dioxide Sensor"
 */

Service.CarbonDioxideSensor = {
  // Required Characteristics
  Characteristics: [
    "CarbonDioxideDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusLowBattery",
    "StatusTampered",
    "CarbonDioxideLevel",
    "CarbonDioxidePeakLevel",
    "Name",
  ]
};

Service.CarbonDioxideSensor.UUID = '00000097-0000-1000-8000-0026BB765291';

/**
 * Service "Carbon Monoxide Sensor"
 */

Service.CarbonMonoxideSensor = {
  // Required Characteristics
  Characteristics: [
    "CarbonMonoxideDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusLowBattery",
    "StatusTampered",
    "CarbonMonoxideLevel",
    "CarbonMonoxidePeakLevel",
    "Name",
  ]
};

Service.CarbonMonoxideSensor.UUID = '0000007F-0000-1000-8000-0026BB765291';

/**
 * Service "Contact Sensor"
 */

Service.ContactSensor = {
  // Required Characteristics
  Characteristics: [
    "ContactSensorState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.ContactSensor.UUID = '00000080-0000-1000-8000-0026BB765291';

/**
 * Service "Door"
 */

Service.Door = {
  // Required Characteristics
  Characteristics: [
    "CurrentPosition",
    "PositionState",
    "TargetPosition",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "HoldPosition",
    "ObstructionDetected",
    "Name",
  ]
};

Service.Door.UUID = '00000081-0000-1000-8000-0026BB765291';

/**
 * Service "Fan"
 */

Service.Fan = {
  // Required Characteristics
  Characteristics: [
    "On",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "RotationDirection",
    "RotationSpeed",
    "Name",
  ]
};

Service.Fan.UUID = '00000040-0000-1000-8000-0026BB765291';

/**
 * Service "Garage Door Opener"
 */

Service.GarageDoorOpener = {
  // Required Characteristics
  Characteristics: [
    "CurrentDoorState",
    "TargetDoorState",
    "ObstructionDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "LockCurrentState",
    "LockTargetState",
    "Name",
  ]
};

Service.GarageDoorOpener.UUID = '00000041-0000-1000-8000-0026BB765291';

/**
 * Service "Humidity Sensor"
 */

Service.HumiditySensor = {
  // Required Characteristics
  Characteristics: [
    "CurrentRelativeHumidity",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.HumiditySensor.UUID = '00000082-0000-1000-8000-0026BB765291';

/**
 * Service "Leak Sensor"
 */

Service.LeakSensor = {
  // Required Characteristics
  Characteristics: [
    "LeakDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.LeakSensor.UUID = '00000083-0000-1000-8000-0026BB765291';

/**
 * Service "Light Sensor"
 */

Service.LightSensor = {
  // Required Characteristics
  Characteristics: [
    "CurrentAmbientLightLevel",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.LightSensor.UUID = '00000084-0000-1000-8000-0026BB765291';

/**
 * Service "Lightbulb"
 */

Service.Lightbulb = {
  // Required Characteristics
  Characteristics: [
    "On",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Brightness",
    "Hue",
    "Saturation",
    "Name",
  ]
};

Service.Lightbulb.UUID = '00000043-0000-1000-8000-0026BB765291';

/**
 * Service "Lock Management"
 */

Service.LockManagement = {
  // Required Characteristics
  Characteristics: [
    "LockControlPoint",
    "Version",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Logs",
    "AudioFeedback",
    "LockManagementAutoSecurityTimeout",
    "AdministratorOnlyAccess",
    "LockLastKnownAction",
    "CurrentDoorState",
    "MotionDetected",
    "Name",
  ]
};

Service.LockManagement.UUID = '00000044-0000-1000-8000-0026BB765291';

/**
 * Service "Lock Mechanism"
 */

Service.LockMechanism = {
  // Required Characteristics
  Characteristics: [
    "LockCurrentState",
    "LockTargetState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.LockMechanism.UUID = '00000045-0000-1000-8000-0026BB765291';

/**
 * Service "Motion Sensor"
 */

Service.MotionSensor = {
  // Required Characteristics
  Characteristics: [
    "MotionDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.MotionSensor.UUID = '00000085-0000-1000-8000-0026BB765291';

/**
 * Service "Occupancy Sensor"
 */

Service.OccupancySensor = {
  // Required Characteristics
  Characteristics: [
    "OccupancyDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.OccupancySensor.UUID = '00000086-0000-1000-8000-0026BB765291';

/**
 * Service "Outlet"
 */

Service.Outlet = {
  // Required Characteristics
  Characteristics: [
    "On",
    "OutletInUse",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.Outlet.UUID = '00000047-0000-1000-8000-0026BB765291';

/**
 * Service "Security System"
 */

Service.SecuritySystem = {
  // Required Characteristics
  Characteristics: [
    "SecuritySystemCurrentState",
    "SecuritySystemTargetState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusFault",
    "StatusTampered",
    "SecuritySystemAlarmType",
    "Name",
  ]
};

Service.SecuritySystem.UUID = '0000007E-0000-1000-8000-0026BB765291';

/**
 * Service "Smoke Sensor"
 */

Service.SmokeSensor = {
  // Required Characteristics
  Characteristics: [
    "SmokeDetected",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusTampered",
    "StatusLowBattery",
    "Name",
  ]
};

Service.SmokeSensor.UUID = '00000087-0000-1000-8000-0026BB765291';

/**
 * Service "Stateful Programmable Switch"
 */

Service.StatefulProgrammableSwitch = {
  // Required Characteristics
  Characteristics: [
    "ProgrammableSwitchEvent",
    "ProgrammableSwitchOutputState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.StatefulProgrammableSwitch.UUID = '00000088-0000-1000-8000-0026BB765291';

/**
 * Service "Stateless Programmable Switch"
 */

Service.StatelessProgrammableSwitch = {
  // Required Characteristics
  Characteristics: [
    "ProgrammableSwitchEvent",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.StatelessProgrammableSwitch.UUID = '00000089-0000-1000-8000-0026BB765291';

/**
 * Service "Switch"
 */

Service.Switch = {
  // Required Characteristics
  Characteristics: [
    "On",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "Name",
  ]
};

Service.Switch.UUID = '00000049-0000-1000-8000-0026BB765291';

/**
 * Service "Temperature Sensor"
 */

Service.TemperatureSensor = {
  // Required Characteristics
  Characteristics: [
    "CurrentTemperature",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "StatusActive",
    "StatusFault",
    "StatusLowBattery",
    "StatusTampered",
    "Name",
  ]
};

Service.TemperatureSensor.UUID = '0000008A-0000-1000-8000-0026BB765291';

/**
 * Service "Thermostat"
 */

Service.Thermostat = {
  // Required Characteristics
  Characteristics: [
    "CurrentHeatingCoolingState",
    "TargetHeatingCoolingState",
    "CurrentTemperature",
    "TargetTemperature",
    "TemperatureDisplayUnits",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "CurrentRelativeHumidity",
    "TargetRelativeHumidity",
    "CoolingThresholdTemperature",
    "HeatingThresholdTemperature",
    "Name",
  ]
};

Service.Thermostat.UUID = '0000004A-0000-1000-8000-0026BB765291';

/**
 * Service "Time Information"
 */

Service.TimeInformation = {
  // Required Characteristics
  Characteristics: [
    "CurrentTime",
    "DayoftheWeek",
    "TimeUpdate",
  ],

  // Optional Characteristics
  OptionalCharacteristics: []
};

Service.TimeInformation.UUID = '00000099-0000-1000-8000-0026BB765291';

/**
 * Service "Tunneled BTLE Accessory Service"
 */

Service.TunneledBTLEAccessoryService = {
  // Required Characteristics
  Characteristics: [
    "Name",
    "AccessoryIdentifier",
    "TunneledAccessoryStateNumber",
    "TunneledAccessoryConnected",
    "TunneledAccessoryAdvertising",
    "TunnelConnectionTimeout",
  ],

  // Optional Characteristics
  OptionalCharacteristics: []
};

Service.TunneledBTLEAccessoryService.UUID = '00000056-0000-1000-8000-0026BB765291';

/**
 * Service "Window"
 */

Service.Window = {
  // Required Characteristics
  Characteristics: [
    "CurrentPosition",
    "TargetPosition",
    "PositionState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "HoldPosition",
    "ObstructionDetected",
    "Name",
  ]
};

Service.Window.UUID = '0000008B-0000-1000-8000-0026BB765291';

/**
 * Service "Window Covering"
 */

Service.WindowCovering = {
  // Required Characteristics
  Characteristics: [
    "CurrentPosition",
    "TargetPosition",
    "PositionState",
  ],

  // Optional Characteristics
  OptionalCharacteristics: [
    "HoldPosition",
    "TargetHorizontalTiltAngle",
    "TargetVerticalTiltAngle",
    "CurrentHorizontalTiltAngle",
    "CurrentVerticalTiltAngle",
    "ObstructionDetected",
    "Name",
  ]
};

Service.WindowCovering.UUID = '0000008C-0000-1000-8000-0026BB765291';

module.exports = {
    Service: Service,
    Characteristic: Characteristic
}
},{}]},{},[6])(6)
});