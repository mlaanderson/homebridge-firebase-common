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
    
    this._characteristics = [];

    function _scanCharacteristics(snapshot) {
        var _service = snapshot.val();
        
        for (var k in _service.Characteristics) {
            addCharacteristic(this, _ref, k,
                _service.Characteristics[k]);
        }
    }
    
    function _onAuth(authData) {
        if (authData) {
            // get rid of any other listeners
            _ref.off('value');
            
            // scan the Window characteristics
            _ref.once('value', _scanCharacteristics.bind(this));
        }
    }
    
    Object.defineProperty(this, 'Characteristics', {
        get: function() {
            return this._characteristics.slice(0);
        }
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