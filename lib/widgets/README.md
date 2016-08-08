## Modules

<dl>
<dt><a href="#module_Widgets">Widgets</a></dt>
<dd></dd>
<dt><a href="#module_Widgets">Widgets</a></dt>
<dd></dd>
</dl>

<a name="module_Widgets"></a>

## Widgets
**Author:** Michael Anderson  
**Copyright**: Michael Anderson 2016  

* [Widgets](#module_Widgets)
    * *[~SwitchWidget](#module_Widgets..SwitchWidget)*
        * *[new SwitchWidget()](#new_module_Widgets..SwitchWidget_new)*
        * *[._accessory](#module_Widgets..SwitchWidget+_accessory)*
        * **[.setSwitch(state)](#module_Widgets..SwitchWidget+setSwitch)**
        * *[.update()](#module_Widgets..SwitchWidget+update)*
    * *[~WindowWidget](#module_Widgets..WindowWidget)*
        * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
        * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
        * **[.receiveTargetPosition(position)](#module_Widgets..WindowWidget+receiveTargetPosition)**
        * **[.receiveHoldPosition(flag)](#module_Widgets..WindowWidget+receiveHoldPosition)**
        * *[.updateCurrentPosition()](#module_Widgets..WindowWidget+updateCurrentPosition)*
        * *[.updatePositionState()](#module_Widgets..WindowWidget+updatePositionState)*
        * *[.updateObstructionDetected()](#module_Widgets..WindowWidget+updateObstructionDetected)*

<a name="module_Widgets..SwitchWidget"></a>

### *Widgets~SwitchWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~SwitchWidget](#module_Widgets..SwitchWidget)*
    * *[new SwitchWidget()](#new_module_Widgets..SwitchWidget_new)*
    * *[._accessory](#module_Widgets..SwitchWidget+_accessory)*
    * **[.setSwitch(state)](#module_Widgets..SwitchWidget+setSwitch)**
    * *[.update()](#module_Widgets..SwitchWidget+update)*

<a name="new_module_Widgets..SwitchWidget_new"></a>

#### *new SwitchWidget()*
Creates a new abstract switch widget. Extend this

**Example**  
```js
const util = require('util');
```
<a name="module_Widgets..SwitchWidget+_accessory"></a>

#### *switchWidget._accessory*
**Kind**: instance property of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Access:** protected  
<a name="module_Widgets..SwitchWidget+setSwitch"></a>

#### **switchWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Abstract function, should set the physical state.
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..SwitchWidget+update"></a>

#### *switchWidget.update()*
**Kind**: instance method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Sends hardware states to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget"></a>

### *Widgets~WindowWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~WindowWidget](#module_Widgets..WindowWidget)*
    * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
    * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
    * **[.receiveTargetPosition(position)](#module_Widgets..WindowWidget+receiveTargetPosition)**
    * **[.receiveHoldPosition(flag)](#module_Widgets..WindowWidget+receiveHoldPosition)**
    * *[.updateCurrentPosition()](#module_Widgets..WindowWidget+updateCurrentPosition)*
    * *[.updatePositionState()](#module_Widgets..WindowWidget+updatePositionState)*
    * *[.updateObstructionDetected()](#module_Widgets..WindowWidget+updateObstructionDetected)*

<a name="new_module_Widgets..WindowWidget_new"></a>

#### *new WindowWidget()*
Creates a new abstract window widget. Extend this

**Example**  
```js
const util = require('util');
```
<a name="module_Widgets..WindowWidget+_accessory"></a>

#### *windowWidget._accessory*
**Kind**: instance property of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Access:** protected  
<a name="module_Widgets..WindowWidget+receiveTargetPosition"></a>

#### **windowWidget.receiveTargetPosition(position)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, receives the TargetPosition value
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| position | <code>int</code> | The target position (0-100) expressed in percent open. |

<a name="module_Widgets..WindowWidget+receiveHoldPosition"></a>

#### **windowWidget.receiveHoldPosition(flag)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, receives the HoldPosition value
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| flag | <code>bool</code> | True to hold position, false to allow movement. |

<a name="module_Widgets..WindowWidget+updateCurrentPosition"></a>

#### *windowWidget.updateCurrentPosition()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware CurrentPosition value to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget+updatePositionState"></a>

#### *windowWidget.updatePositionState()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware PositionState value to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget+updateObstructionDetected"></a>

#### *windowWidget.updateObstructionDetected()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware ObstructionDetected value to the database.
**Since**: 0.0.1  
<a name="module_Widgets"></a>

## Widgets
**Author:** Michael Anderson  
**Copyright**: Michael Anderson 2016  

* [Widgets](#module_Widgets)
    * *[~SwitchWidget](#module_Widgets..SwitchWidget)*
        * *[new SwitchWidget()](#new_module_Widgets..SwitchWidget_new)*
        * *[._accessory](#module_Widgets..SwitchWidget+_accessory)*
        * **[.setSwitch(state)](#module_Widgets..SwitchWidget+setSwitch)**
        * *[.update()](#module_Widgets..SwitchWidget+update)*
    * *[~WindowWidget](#module_Widgets..WindowWidget)*
        * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
        * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
        * **[.receiveTargetPosition(position)](#module_Widgets..WindowWidget+receiveTargetPosition)**
        * **[.receiveHoldPosition(flag)](#module_Widgets..WindowWidget+receiveHoldPosition)**
        * *[.updateCurrentPosition()](#module_Widgets..WindowWidget+updateCurrentPosition)*
        * *[.updatePositionState()](#module_Widgets..WindowWidget+updatePositionState)*
        * *[.updateObstructionDetected()](#module_Widgets..WindowWidget+updateObstructionDetected)*

<a name="module_Widgets..SwitchWidget"></a>

### *Widgets~SwitchWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~SwitchWidget](#module_Widgets..SwitchWidget)*
    * *[new SwitchWidget()](#new_module_Widgets..SwitchWidget_new)*
    * *[._accessory](#module_Widgets..SwitchWidget+_accessory)*
    * **[.setSwitch(state)](#module_Widgets..SwitchWidget+setSwitch)**
    * *[.update()](#module_Widgets..SwitchWidget+update)*

<a name="new_module_Widgets..SwitchWidget_new"></a>

#### *new SwitchWidget()*
Creates a new abstract switch widget. Extend this

**Example**  
```js
const util = require('util');
```
<a name="module_Widgets..SwitchWidget+_accessory"></a>

#### *switchWidget._accessory*
**Kind**: instance property of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Access:** protected  
<a name="module_Widgets..SwitchWidget+setSwitch"></a>

#### **switchWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Abstract function, should set the physical state.
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..SwitchWidget+update"></a>

#### *switchWidget.update()*
**Kind**: instance method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Sends hardware states to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget"></a>

### *Widgets~WindowWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~WindowWidget](#module_Widgets..WindowWidget)*
    * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
    * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
    * **[.receiveTargetPosition(position)](#module_Widgets..WindowWidget+receiveTargetPosition)**
    * **[.receiveHoldPosition(flag)](#module_Widgets..WindowWidget+receiveHoldPosition)**
    * *[.updateCurrentPosition()](#module_Widgets..WindowWidget+updateCurrentPosition)*
    * *[.updatePositionState()](#module_Widgets..WindowWidget+updatePositionState)*
    * *[.updateObstructionDetected()](#module_Widgets..WindowWidget+updateObstructionDetected)*

<a name="new_module_Widgets..WindowWidget_new"></a>

#### *new WindowWidget()*
Creates a new abstract window widget. Extend this

**Example**  
```js
const util = require('util');
```
<a name="module_Widgets..WindowWidget+_accessory"></a>

#### *windowWidget._accessory*
**Kind**: instance property of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Access:** protected  
<a name="module_Widgets..WindowWidget+receiveTargetPosition"></a>

#### **windowWidget.receiveTargetPosition(position)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, receives the TargetPosition value
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| position | <code>int</code> | The target position (0-100) expressed in percent open. |

<a name="module_Widgets..WindowWidget+receiveHoldPosition"></a>

#### **windowWidget.receiveHoldPosition(flag)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, receives the HoldPosition value
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| flag | <code>bool</code> | True to hold position, false to allow movement. |

<a name="module_Widgets..WindowWidget+updateCurrentPosition"></a>

#### *windowWidget.updateCurrentPosition()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware CurrentPosition value to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget+updatePositionState"></a>

#### *windowWidget.updatePositionState()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware PositionState value to the database.
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget+updateObstructionDetected"></a>

#### *windowWidget.updateObstructionDetected()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware ObstructionDetected value to the database.
**Since**: 0.0.1  