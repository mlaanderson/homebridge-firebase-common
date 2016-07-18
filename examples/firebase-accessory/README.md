# homebridge-accessory
An accessory implemented with homebridge-firebase-common

## Notes
Since homebridge registers Services synchronously the config
has to know the Services implemented in the Firebase database.
A platform implementation would probably elminate that issue.

## Usage
* Place the contents of this folder into ```/var/lib/node_modules/homebridge-accessory```
* In that directory run ```npm install``` to install the dependancies
    * Firebase @ 2.4.1,
    * homebridge-firebase-common
* Setup your ```~/.homebridge/config.json```

```
{
    ...
    "accessories": [
        ...,
        {
            "accessory": "FirebaseAccessory",
            "name": "My Firebase Widget",
            "firebase_host": "https://[MY_HOSTNAME].firebaseio.com",
            "firebase_path": "PATH_TO_MY_WIDGET_DEFINITION",
            "username": "firebase_user@example.com",
            "password": "MyVerySecretPassword",
            "services": ["ServiceName1", "ServiceName2", ...]
        }
    ]
    ...
}
```