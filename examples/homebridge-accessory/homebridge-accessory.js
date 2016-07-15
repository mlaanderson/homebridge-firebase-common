"use strict";
var Firebase = require('firebase');
var AccessoryBase = require('homebridge-firebase-common').Accessory;
var Types = require('hap-nodejs-types');

var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-accessory", "FirebaseAccessory", FirebaseAccessory);
}

class FirebaseAccessory {
    constructor(log, config) {
        this.log = log;
        this._config = config;
        
        this._db = new Firebase(this._config.firebase_host);
        this._accessory = new AccessoryBase(this._db.child(this._config.firebase_path));
        this._accessory.ready(this._accessoryReady.bind(this));
        
        this._db.authWithPassword({
            email: this._config.username,
            password: this._config.password
        });
        
        this._serviceMap = {};
        this._characteristicMap = {};
        
        for (var serviceName in this._config.services) {
            this._serviceMap[serviceName] = new Service[serviceName]();
        }
    }
    
    /**
     * _accessoryReady processes the exposed services and 
     * characteristics from the AccessoryBase mapping of the
     * Firebase database.
     * Characteristics that are read enabled get an onGet handler.
     * Characteristics that are write enabled get an onSet handler.
     * Characteristics that are notify enabled get a listener on 
     * the AccessoryBase event and relay the notification to Homebridge.
     */
    _accessoryReady() {
        for (var serviceName of this._accessory.Services) {
            var service = this._serviceMap[serviceName];
            
            this.log("Populating Service:", serviceName);
            
            for (var characteristicName of this._accessory[serviceName].Characteristics) {
                this.log("Populating Characteristic:", serviceName, characteristicName);
                
                var characteristic = service.getCharacteristic(Characteristic[characteristicName]);
                var charType = Types.Characteristic[characteristicName];
                
                this._characteristicMap[serviceName][characteristicName] = characteristic;
                
                // attach the firebase specific information to the characteristic
                var bindData = {
                    Accessory: this,
                    Service: serviceName,
                    Characteristic: characteristicName
                };
                
                if (charType.perms.indexOf(Types.Characteristic.Perms.READ) >= 0) {
                    // attach an onGet handler
                    characteristic.on('get', this._getHandler.bind(bindData));
                }
                
                if (charType.perms.indexOf(Types.Characteristic.Perms.WRITE) >= 0) {
                    // attach on onSet handler
                    characteristic.on('set', this._setHandler.bind(bindData));
                }
                
                if (charType.perms.indexOf(Types.Characteristic.Perms.NOTIFY) >= 0) {
                    // attach a value listener AccessoryBase
                    this._accessory[serviceName].on(characteristicName, this._notifyHandler.bind(bindData));
                }
            }
        }
    }
    
    /**
     * _getHandler is the generic get handler for characteristic onGets.
     * The "this" object is:
     *   {
           Accessory: a reference to the FirebaseAccessory object,
           Service: the service name of this characteristic,
           Characteristic: the characteristic name
     *   }
     * The AccessoryBase object maintains a shadow of
     * the Firebase database values as properties, so
     * just callback with that shadow value.
     */
    _getHandler(callback) {
        this.Accessory.log("_getHandler", this.Service, this.Characteristic);
        callback(null, this.Accessory._accessory[this.Service][this.Characteristic]);
    }
    
    /**
     * _setHandler is the generic set handler for characteristic onSets.
     * The "this" object is:
     *   {
           Accessory: a reference to the FirebaseAccessory object,
           Service: the service name of this characteristic,
           Characteristic: the characteristic name
     *   }
     */
    _setHandler(value, callback) {
        // The AccessoryBase object maintains a shadow of
        // the Firebase database values as properties, so
        // just set the property and the AccessoryBase
        // will update the Firebase database.
        this.Accessory.log("_setHandler", this.Service, this.Characteristic, value);
        this.Accessory._accessory[this.Service][this.Characteristic] = value;
        callback(null, this.Accessory._accessory[this.Service][this.Characteristic]);
    }
    
    /**
     * _notifyHandler is the generic notification handler for the AccessoryBase events
     * The "this" object is:
     *   {
           Accessory: a reference to the FirebaseAccessory object,
           Service: the service name of this characteristic,
           Characteristic: the characteristic name
     *   }
     */
    _notifyHandler(value) {
        this.Accessory.log("_notifyHandler", this.Service, this.Characteristic, value);
        this.Accessory._characteristicMap[this.Service][this.Characteristic].setValue(value);
    }
    
    /**
     * getName is called by Homebridge to request the name of this
     * device. This characteristic is optional.
     */
    getName(callback) {
        callback(null, this._config.name);
    }

    /**
     * getServices returns an array of services that this accessory
     * implements. An accessory can implement multiple services.
     * This one implements both the Window and AccessoryInformation
     * services.
     */
    getServices() {
        var services = [];
        for (var k in this._serviceMap) {
            services.push(this._serviceMap[k]);
        }
        return services;
    }
}