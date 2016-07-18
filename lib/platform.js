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