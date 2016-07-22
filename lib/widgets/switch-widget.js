/**
 * @module Widgets
 * @author Michael Anderson
 * @copyright Michael Anderson 2016
 */
"use strict";
var util = require('util');
var EventEmitter = require('events');
var Accessory = require('../accessory.js');

/**
 * Creates a new abstract switch widget. Extend this
 * class, overriding setSwitch and getSwitch to create
 * a functional switch.
 * @class
 * @constructor
 * @abstract
 * @example 
 * const util = require('util');
 * const SwitchWidget = require('homebridge-firebase-common').Widgets.Switch;
 * 
 * class MySwitch extends SwitchWidget {
 *    constructor(ref) {
 *        super(ref);
 *
 *        // setup GPIO
 *        hardware_specific_setup();
 *
 *        // setup GPIO listener
 *        hardware_on_change((function(value) {
 *            this.update(value);
 *        }).bind(this));
 *    }
 *  
 *    setSwitch(state) {
 *        hardware_set_state(state);
 *    }
 * }
 */
function SwitchWidget(ref) {
    /** @protected */
    this._accessory = new Accessory(ref);

    this._accessory.ready((function() {
        this._accessory.Switch.on('On', (function(val) {
            this.setSwitch(val);
            this.emit('On', val);
        }).bind(this));
    }).bind(this));
    
    /**
     * @summary Abstract function, should set the physical state.
     * 
     * This method is called when the commanded state changes.
     * When extending this class, override this function to set the
     * physical state of the switch mechanism.
     * 
     * @since 0.0.1
     * @access protected
     * @abstract
     * 
     * @param {bool} state true for on and false for off.
     */
    this.setSwitch = function(state) { }
    
    /**
     * @summary Sends hardware states to the database.
     *
     * Use this method to update the database when a physical state
     * of your switch changes.
     *
     * @since 0.0.1
     * @access protected
     * 
     & @param {bool} state true when your switch is on
     */
    this.update = function(state) {
        this._accessory.Switch.On = state;
    }
}

util.inherits(SwitchWidget, EventEmitter);
module.exports = SwitchWidget;