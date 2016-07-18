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
    var _ref = ref;
    var _ready = false;
    
    this._serviceNames = [];
    this._services = [];
    
    function _checkReady() {
        if (_ready) return;
        
        for (var n = 0; n < this._services.length; n++) {
            if (this._services[n].IsReady === false) return;
        }
        
        if ((this.AccessoryInformation !== undefined) && (this.AccessoryInformation.Name !== undefined)) {
            Object.defineProperty(this, 'Name', {
                get: function() {
                    return this.AccessoryInformation.Name;
                },
                set: function(value) {
                    this.AccessoryInformation.Name = value;
                }
            });
        } else if (this._services[this.serviceNames[0]].Name !== undefined) {
            Object.defineProperty(this, 'Name', {
                get: function() {
                    return this._services[this.serviceNames[0]].Name;
                },
                set: function(value) {
                    this._services[this.serviceNames[0]].Name = value;
                }
            });
        }
        
        _ready = true;
        this.emit('ready');
    }
    
    function _scanServices(snapshot) {
        var service = snapshot.val();
        
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


