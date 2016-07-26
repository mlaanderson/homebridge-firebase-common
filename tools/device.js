"use strict";
var Types = require('hap-nodejs-types');
var util = require('util');

function addProp(self, o, sn, cn) {
    Object.defineProperty(o, cn, {
        get: function() {
            return self._data.Services[sn].Characteristics[cn];
        },
        set: function(val) {
            self._data.Services[sn].Characteristics[cn] = val;
        }
    });
}

function Device(deviceRoot) {
   
    this.addService = function(serviceName, optionalCharacteristics, defaultData) {
        if (false === (serviceName in Types.Service)) {
            throw "ERROR: Invalid Service Name (" + serviceName + ")";
        }
        
        var service = Types.Service[serviceName];
        var characteristics = service.Characteristics;
        var result = { Characteristics: {} };
        
        if ((optionalCharacteristics === undefined) || (optionalCharacteristics == null)) {
            optionalCharacteristics = [];
        } else if (util.isBoolean(optionalCharacteristics) === true) {
            if (optionalCharacteristics) {
                optionalCharacteristics = service.OptionalCharacteristics;
            } else {
                optionalCharacteristics = [];
            }
        } else if (util.isArray(optionalCharacteristics) === false) {
            if ((util.isObject(optionalCharacteristics) === true) && (typeof defaultData == "undefined")) {
                defaultData = optionalCharacteristics;
                optionalCharacteristics = [];
            } else {
                throw "ERROR: Invalid Argument, optionalCharacteristics must be boolean or array of strings";
            }
        }
        
        defaultData = defaultData || {};
        
        characteristics = characteristics.concat(optionalCharacteristics);
        
        
        for (var n = 0; n < characteristics.length; n++) {
            var characteristicName = characteristics[n];
            var characteristic = Types.Characteristic[characteristicName];

            if (true === characteristicName in defaultData) {
                result.Characteristics[characteristicName] = defaultData[characteristicName];
            } else {
                switch (characteristic.format) {
                    case Types.Characteristic.Formats.BOOL:
                        result.Characteristics[characteristicName] = false;
                        break;
                    case Types.Characteristic.Formats.INT:
                    case Types.Characteristic.Formats.FLOAT:
                    case Types.Characteristic.Formats.UINT8:
                    case Types.Characteristic.Formats.UINT16:
                    case Types.Characteristic.Formats.UINT32:
                    case Types.Characteristic.Formats.UINT64:
                    case Types.Characteristic.Formats.TLV8:
                        result.Characteristics[characteristicName] = 0;
                        break;
                    case Types.Characteristic.Formats.DATA:
                    case Types.Characteristic.Formats.STRING:
                        result.Characteristics[characteristicName] = "";
                        break;
                    case Types.Characteristic.Formats.ARRAY:
                        result.Characteristics[characteristicName] = [];
                        break;
                    case Types.Characteristic.Formats.DICTIONARY:
                        result.Characteristics[characteristicName] = {};
                        break;
                }
            }
        }
        
        this._data.Services[serviceName] = result;
    }
    
    this.removeService = function(serviceName) {
        delete this._data.Services[serviceName];
    }
    
    this.pushToFirebase = function(ref) {
        ref.child(deviceRoot).once('value', (function(snapshot) {
            var data = snapshot.val();
            var val = this._data;
            
            if ((data !== null) && ('Services' in data)) {
                val = this._data.Services;
                snapshot.ref().child('Services').update(val);
            } else {
                snapshot.ref().update(this._data);
            }
        }).bind(this));
    }
    
    Object.defineProperty(this, 'Services', {
        get: function() {
            var obj = {};
            
            for (var sn in this._data.Services) {
                var sobj = {};
                Object.defineProperty(obj, sn, { value: sobj });
                
                for (var cn in this._data.Services[sn].Characteristics) {
                    addProp(this, sobj, sn, cn);
                }
            }
            
            return obj;
        }
    });
    
    this.toJSON = function() {
        return this._data;
    }

    this._root = deviceRoot;
    this._data = {
        "Services": {}
    }
}

module.exports = Device;