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
        * **[.setSwitch(state)](#module_Widgets..WindowWidget+setSwitch)**
        * *[.update()](#module_Widgets..WindowWidget+update)*

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
Creates a new abstract switch widget. Extend thisclass, overriding setSwitch and getSwitch to createa functional switch.

**Example**  
```js
const util = require('util');const SwitchWidget = require('homebridge-firebase-common').Widgets.Switch;class MySwitch extends SwitchWidget {   constructor(ref) {       super(ref);       // setup GPIO       hardware_specific_setup();       // setup GPIO listener       hardware_on_change((function(value) {           this.update(value);       }).bind(this));   }    setSwitch(state) {       hardware_set_state(state);   }}
```
<a name="module_Widgets..SwitchWidget+_accessory"></a>

#### *switchWidget._accessory*
**Kind**: instance property of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Access:** protected  
<a name="module_Widgets..SwitchWidget+setSwitch"></a>

#### **switchWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Abstract function, should set the physical state.This method is called when the commanded state changes.When extending this class, override this function to set thephysical state of the switch mechanism.  
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..SwitchWidget+update"></a>

#### *switchWidget.update()*
**Kind**: instance method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Sends hardware states to the database.Use this method to update the database when a physical stateof your switch changes.  
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget"></a>

### *Widgets~WindowWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~WindowWidget](#module_Widgets..WindowWidget)*
    * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
    * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
    * **[.setSwitch(state)](#module_Widgets..WindowWidget+setSwitch)**
    * *[.update()](#module_Widgets..WindowWidget+update)*

<a name="new_module_Widgets..WindowWidget_new"></a>

#### *new WindowWidget()*
Creates a new abstract window widget. Extend thisclass, overriding setSwitch and getSwitch to createa functional switch.

**Example**  
```js
const util = require('util');const WindowWidget = require('homebridge-firebase-common').Widgets.Switch;class MyWindow extends WindowWidget {   constructor(ref) {       super(ref);       // setup GPIO       hardware_specific_setup();       // setup GPIO listener       hardware_on_change((function(value) {           this.update(value);       }).bind(this));   }    setSwitch(state) {       hardware_set_state(state);   }}
```
<a name="module_Widgets..WindowWidget+_accessory"></a>

#### *windowWidget._accessory*
**Kind**: instance property of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Access:** protected  
<a name="module_Widgets..WindowWidget+setSwitch"></a>

#### **windowWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, should set the physical state.This method is called when the commanded state changes.When extending this class, override this function to set thephysical state of the switch mechanism.  
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..WindowWidget+update"></a>

#### *windowWidget.update()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware states to the database.Use this method to update the database when a physical stateof your switch changes.  
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
        * **[.setSwitch(state)](#module_Widgets..WindowWidget+setSwitch)**
        * *[.update()](#module_Widgets..WindowWidget+update)*

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
Creates a new abstract switch widget. Extend thisclass, overriding setSwitch and getSwitch to createa functional switch.

**Example**  
```js
const util = require('util');const SwitchWidget = require('homebridge-firebase-common').Widgets.Switch;class MySwitch extends SwitchWidget {   constructor(ref) {       super(ref);       // setup GPIO       hardware_specific_setup();       // setup GPIO listener       hardware_on_change((function(value) {           this.update(value);       }).bind(this));   }    setSwitch(state) {       hardware_set_state(state);   }}
```
<a name="module_Widgets..SwitchWidget+_accessory"></a>

#### *switchWidget._accessory*
**Kind**: instance property of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Access:** protected  
<a name="module_Widgets..SwitchWidget+setSwitch"></a>

#### **switchWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Abstract function, should set the physical state.This method is called when the commanded state changes.When extending this class, override this function to set thephysical state of the switch mechanism.  
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..SwitchWidget+update"></a>

#### *switchWidget.update()*
**Kind**: instance method of <code>[SwitchWidget](#module_Widgets..SwitchWidget)</code>  
**Summary**: Sends hardware states to the database.Use this method to update the database when a physical stateof your switch changes.  
**Since**: 0.0.1  
<a name="module_Widgets..WindowWidget"></a>

### *Widgets~WindowWidget*
**Kind**: inner abstract class of <code>[Widgets](#module_Widgets)</code>  

* *[~WindowWidget](#module_Widgets..WindowWidget)*
    * *[new WindowWidget()](#new_module_Widgets..WindowWidget_new)*
    * *[._accessory](#module_Widgets..WindowWidget+_accessory)*
    * **[.setSwitch(state)](#module_Widgets..WindowWidget+setSwitch)**
    * *[.update()](#module_Widgets..WindowWidget+update)*

<a name="new_module_Widgets..WindowWidget_new"></a>

#### *new WindowWidget()*
Creates a new abstract window widget. Extend thisclass, overriding setSwitch and getSwitch to createa functional switch.

**Example**  
```js
const util = require('util');const WindowWidget = require('homebridge-firebase-common').Widgets.Switch;class MyWindow extends WindowWidget {   constructor(ref) {       super(ref);       // setup GPIO       hardware_specific_setup();       // setup GPIO listener       hardware_on_change((function(value) {           this.update(value);       }).bind(this));   }    setSwitch(state) {       hardware_set_state(state);   }}
```
<a name="module_Widgets..WindowWidget+_accessory"></a>

#### *windowWidget._accessory*
**Kind**: instance property of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Access:** protected  
<a name="module_Widgets..WindowWidget+setSwitch"></a>

#### **windowWidget.setSwitch(state)**
**Kind**: instance abstract method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Abstract function, should set the physical state.This method is called when the commanded state changes.When extending this class, override this function to set thephysical state of the switch mechanism.  
**Access:** protected  
**Since**: 0.0.1  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | true for on and false for off. |

<a name="module_Widgets..WindowWidget+update"></a>

#### *windowWidget.update()*
**Kind**: instance method of <code>[WindowWidget](#module_Widgets..WindowWidget)</code>  
**Summary**: Sends hardware states to the database.Use this method to update the database when a physical stateof your switch changes.  
**Since**: 0.0.1  
