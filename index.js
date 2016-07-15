// homebridge-firebase-common

var Service = require('./lib/service.js');
var Accessory = require('./lib/accessory.js');
var HapTypes = require('hap-nodejs-types');

module.exports = {
    Accessory: Accessory,
    Service: Service,
    Types: HapTypes
}