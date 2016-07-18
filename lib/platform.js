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
    var _filter = filter || /.*/;
    
    _filter = new RegExp(_filter); // in case it's passed as a string
    
    function _testReady() {
        if (_ready) return;
        for (var n = 0; n < _accessories.length; n++) {
            if (_accessories[n].IsReady == false) return;
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
        get: function() { return this._accessoryNames.slice(0); }
    });
}

util.inherits(Platform, EventEmitter);
module.exports = Platform;