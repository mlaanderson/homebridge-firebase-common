var EventEmitter = require('events');
var util = require('util');
var Service = require('./service.js');

function defineServiceProperty(self, ref, serviceName) {
    var service = new Service(ref, serviceName);

    Object.defineProperty(self, serviceName, {
        get: function() { return service; }
    });
}

function Accessory(ref) {
    var _shadow = {};
    var _ref = ref;
    var _ready = false;
    
    function _nameHandler(snapshot) {
        _shadow.Name = snapshot.val();
        this.emit('Name', _shadow.Name);
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
        
        for (var n = 0; n < service.Services.Implemented.length; n++) {
            defineServiceProperty(this, ref, service.Services.Implemented[n]);
        }
        
        _ready = true;
        this.emit('ready');
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
    
    ref.onAuth(_onAuth.bind(this));
}

util.inherits(Accessory, EventEmitter);


module.exports = Accessory;


