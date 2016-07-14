// generic service

var EventEmitter = require('events');
var util = require('util');

function addCharacteristic(self, ref, characteristicName, value) {
    var _shadow = value;
    
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

    function _scanCharacteristics(snapshot) {
        var _service = snapshot.val();
        
        for (var n = 0; n < _service.Characteristics.Implemented.length; n++) {
            addCharacteristic(this, _ref, _service.Characteristics.Implemented[n],
                _service.Characteristics[_service.Characteristics.Implemented[n]]);
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
    
    // Initialization
    _ref.onAuth(_onAuth.bind(this));
}

util.inherits(Service, EventEmitter);
module.exports = Service;