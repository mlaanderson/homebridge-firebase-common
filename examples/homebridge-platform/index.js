"use strict";

var Firebase = require("firebase");
var PlatformBase = require("homebridge-firebase-common").Platform;
var Types = require("hap-nodejs-types");

var Accessory, Characteristic, Service, uuid;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.hap.Accessory;
    uuid = homebridge.hap.uuid;
    
    homebridge.registerPlatform("homebridge-platform", "FirebasePlatform", FirebasePlatform);
}

class FirebasePlatform {
    constructor(log, config) {
        this._log = log;
        this._config = config;
        this._accessoryCallback = null;
        this._accessories = [];
        
        this._config.firebase_filter = this._config.firebase_filter || /.*/;
        this._config.firebase_filter = new RegExp(this._config.firebase_filter);
        
        this._db = new Firebase(this._config.firebase_host);
        this._platform = new PlatformBase(this._db.child(this._config.firebase_path), 
            this._config.firebase_filter);
            
        this._platform.ready(this._mapAccessories.bind(this));
        this._db.authWithPassword({
            email: this._config.username,
            password: this._config.password
        });
        
        this._log('Starting loading accessories');
    }
    
    _mapAccessories() {
        this._log('Mapping accessories');
        // we know that all the accessories are ready here
        for (var accessoryName of this._platform.Accessories) {
            var accessory = new AccessoryBase(this._log, this._platform[accessoryName]);
            this._accessories.push(accessory);
        }
        
        if (this._accessoryCallback != null) {
            this._log('Calling the accessories callback for Homebridge');
            this._accessoryCallback(this._accessories);
            this._accessoryCallback = null;
        }
    }
    
    accessories(callback) {
        // if all the accessories have been found
        // just execute the callback
        
        this._log("accessories called by Homebridge");
        if (this._platform.IsReady == true) {
            this._log('Running the accessories callback for Homebridge');
            callback(this._accessories);
        } else {
            this._accessoryCallback = callback;
        }
    }
}

class FirebaseAccessory {
    constructor(log, accessory) {
        // this Accessory is being constructed as a member of a platform
        this.log = log;
        this._accessory = accessory;
        this._config = { Name: 'Unknown' };
        this._ready = false;
        
        // create the service and characteristic map structures
        this._serviceMap = {};
        this._characteristicMap = {};
        
        // Generally the accessory should be ready
        // and this will not be an event driven callback
        this._accessory.ready((function() {
            for (var serviceName of this._accessory.Services) {
                this._serviceMap[serviceName] = new Service[serviceName]();
                this._characteristicMap[serviceName] = {};
            }
            this._accessoryReady();
            
            if ((this._accessory.AccessoryInformation !== undefined) &&
                (this._accessory.AccessoryInformation.Name !== undefined)
            ) {
                this._config.Name = this._accessory.AccessoryInformation.Name;
            }
            
            this._ready = true;
        }).bind(this));
        
        Object.createProperty(this, "IsReady", { get: function() { return this._ready; } });
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
