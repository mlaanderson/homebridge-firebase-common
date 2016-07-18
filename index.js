// homebridge-firebase-common
var Platform = require('./lib/platform.js');
var Service = require('./lib/service.js');
var Accessory = require('./lib/accessory.js');
var HapTypes = require('hap-nodejs-types');

module.exports = {
    Platform: Platform,
    Accessory: Accessory,
    Service: Service,
    Types: HapTypes
}