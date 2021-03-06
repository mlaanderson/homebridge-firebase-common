"use strict";

var Firebase = require("firebase");
var PlatformBase = require("homebridge-firebase-common").Platform;
var FirebaseAccessory = require("./firebase-accessory");

var Accessory, Characteristic, Service, uuid;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.hap.Accessory;
    uuid = homebridge.hap.uuid;
    
    homebridge.registerPlatform("firebase-platform", "FirebasePlatform", FirebasePlatform);
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
        // we know that all the accessories are ready here
        for (var accessoryName of this._platform.Accessories) {
            var accessory = new FirebaseAccessory(this._log, this._platform[accessoryName]);
            this._accessories.push(accessory);
        }
        
        if (this._accessoryCallback != null) {
            this._accessoryCallback(this._accessories);
            this._accessoryCallback = null;
        }
    }
    
    accessories(callback) {
        // if all the accessories have been found
        // just execute the callback
        
        if (this._platform.IsReady == true) {
            callback(this._accessories);
        } else {
            this._accessoryCallback = callback;
        }
    }
}
