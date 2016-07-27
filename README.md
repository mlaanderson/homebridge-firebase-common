# homebridge-firebase-common
Common library for dealing with a Homebridge (HomeKit) database implemented in Firebase

## Description

This library implements a [Homebridge/HomeKit](https://github.com/nfarina/homebridge) 
database in Firebase. The library does not manage the Firebase connection, but it does 
require a specific structure.

When used in the browser, the exported types are published under the ```homebridge``` object.

e.g. ```var accessory = new homebridge.Accessory(ref)```

## Usage

The library is designed to be used by Accessory or Platform implementations on Homebridge, 
by web based user interfaces on the browser and by widget implementations.

This library acts as a common interface connecting widgets, Homebridge and browser UIs to 
the same Firebase backend, making it easier to implement the entire structure.

![Overview](https://github.com/mlaanderson/homebridge-firebase-common/blob/master/concept_diagram.svg)

See the examples directory for both implementations.

## Database Structure
The database structures are defined below for the different object types. Valid Service
and Characteristics can be found in the [HAP-NodeJS protocol repository](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js).

### Service
```
{
  "Characteristics" : {
    "FirstCharacteristicName" : FirstCharacteristicValue,
    ...
  }
}
```

### Accessory
```
{
  "Name" : "MyAccessoryName",
  "Services" : {
    "FirstServiceName" : {
      FirstServiceDefinition
    },
    "SecondServiceName" : {
      SecondServiceDefinition
    },
    ...
  }
}
```
