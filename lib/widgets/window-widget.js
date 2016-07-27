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
 * Creates a new abstract window widget. Extend this
 * class, overriding setSwitch and getSwitch to create
 * a functional switch.
 * @class
 * @constructor
 * @abstract
 * @example 
 * const util = require('util');
 * const WindowWidget = require('homebridge-firebase-common').Widgets.Window;
 * 
 * class MyWindow extends WindowWidget {
 *    constructor(ref) {
 *        super(ref);
 *
 *        // setup GPIO
 *        hardware_specific_setup();
 *
 *        // setup GPIO listeners
 *        hardware_on_position_change((function(value) {
 *            this.updateCurrentPosition(value);
 *        }).bind(this));
 *        hardware_on_state_change((function(value) {
 *            this.updatePositionState(value);
 *        }).bind(this));
 *    }
 *  
 *    receiveTargetPosition(position) {
 *        hardware_start_moving_to(position);
 *    }
 *
 *    receiveHoldPosition(flag) {
 *        if (flag == true) {
 *            hardware_stop_moving();    
 *        } else {
 *            hardware_allow_movement();
 *        }
 *    }
 * }
 */
function WindowWidget(ref) {
    /** @protected */
    this._accessory = new Accessory(ref);

    this._accessory.ready((function() {
        // setup the listeners
        this._accessory.Window.on('TargetPosition', onTargetPosition.bind(this));
        this._accessory.Window.on('HoldPosition', onHoldPosition.bind(this));
    }).bind(this));
    
    /** @private */
    function onTargetPosition(val) {
        this.receiveTargetPosition(val);
        this.emit('TargetPosition', val);
    }

    /** @private */
    function onHoldPosition(val) {
        this.receiveHoldPosition(val);
        this.emit('HoldPosition', val);
    }
    
    /**
     * @summary Abstract function, receives the TargetPosition value
     * 
     * This method is called when the commanded position changes.
     * When extending this class, override this function to move
     * to the commanded location.
     *
     * An extending class can either implement this abstract function
     * or attach a listener to the 'TargetPosition' event, or both.
     * 
     * @since 0.0.1
     * @access protected
     * @abstract
     * 
     * @param {int} position The target position (0-100) expressed in percent open.
     */
    this.receiveTargetPosition = function(position) { }
    
    /**
     * @summary Abstract function, receives the HoldPosition value
     * 
     * This method is called when the commanded position changes.
     * When extending this class, override this function to move
     * to the commanded location.
     *
     * An extending class can either implement this abstract function
     * or attach a listener to the 'HoldPosition' event, or both.
     * 
     * @since 0.0.1
     * @access protected
     * @abstract
     * 
     * @param {bool} flag True to hold position, false to allow movement.
     */
    this.receiveHoldPosition = function(flag) { }
    
    /**
     * @summary Sends hardware CurrentPosition value to the database.
     *
     * Use this method to update the database when the position of the
     * window changes.
     *
     * @since 0.0.1
     * @access protected
     * 
     & @param {int} position The current position (0-100) expressed in percent open.
     */
    this.updateCurrentPosition = function(position) {
        this._accessory.Window.CurrentPosition = position;
    }
    
    /**
     * @summary Sends hardware PositionState value to the database.
     *
     * Use this method to update the database when the PositionState
     * of the window changes.
     *
     * @since 0.0.1
     * @access protected
     * 
     & @param {int} state 0 - Decreasing, 1 - Increasing, 2 - Stopped.
     */
    this.updatePositionState = function(state) {
        this._accessory.Window.PositionState = state;
    }
    
    /**
     * @summary Sends hardware ObstructionDetected value to the database.
     *
     * Use this method to update the database when ObstructionDetected
     * state changes. Do not forget to set this to false when an 
     * obstruction is cleared.
     *
     * @since 0.0.1
     * @access protected
     * 
     & @param {bool} state True when an obstruction has been detected.
     */
    this.updateObstructionDetected = function(state) {
        this._accessory.Window.ObstructionDetected = state;
    }
}

util.inherits(WindowWidget, EventEmitter);
module.exports = WindowWidget;