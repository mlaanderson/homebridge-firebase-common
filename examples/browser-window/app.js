// app.js

var db = new Firebase("https://atskylights.firebaseio.com");
var myAccessory;

function Initialize() {
    db.onAuth(db_onAuth);
}

function db_onAuth(authData) {
    if (authData) {
        // initialize the window
        $('body').empty().append($('<div>').text('Loading...'));
        myAccessory = new homebridge.Accessory(db.child(db.getAuth().uid).child('00:a0:50:0b:18:29'));
        myAccessory.ready(displayInterface);
    } else {
        myAccessory == null;
        // show the login
        $('body').empty().append(
            $('<div>').append(
                $('<label for="username">Username:</label>'),
                $('<input type="email" id="username">')
            ),
            $('<div>').append(
                $('<label for="password">Password:</label>'),
                $('<input type="password" id="password">')
            ),
            $('<div>').append(
                $('<button>').text('Login').on('click', login_Click)
            ),
            $('<div id="status">')
        );        
    }
}

function login_Click(e) {
    db.authWithPassword({
        email: $('#username').val(),
        password: $('#password').val()
    })
    .then(function() {
    })
    .catch(function(err) {
        $('#status').text(err.message);
    });
}

function open_Click(e) {
    if (myAccessory && myAccessory.Window) {
        if (myAccessory.Window.PositionState != homebridge.Types.Characteristic.PositionState.STOPPED) {
            myAccessory.Window.HoldPosition = true;
            myAccessory.Window.TargetPosition = 50;
            setTimeout(open_Click, 1000);
            return;
        }
        
        myAccessory.Window.HoldPosition = false;
        myAccessory.Window.TargetPosition = 100;
    }
}

function stop_Click(e) {
    if (myAccessory && myAccessory.Window) {
        myAccessory.Window.TargetPosition = 50;
        myAccessory.Window.HoldPosition = true;
    }
}

function close_Click(e) {
    if (myAccessory && myAccessory.Window) {
        if (myAccessory.Window.PositionState != homebridge.Types.Characteristic.PositionState.STOPPED) {
            myAccessory.Window.HoldPosition = true;
            myAccessory.Window.TargetPosition = 50;
            setTimeout(close_Click, 1000);
            return;
        }
        
        myAccessory.Window.HoldPosition = false;
        myAccessory.Window.TargetPosition = 0;
    }
}

function updateTree(value) {
    this.element.text(value);
}


function displayInterface() {
    $('body').empty();
    $('body').append(
        $('<div id="ui">').append(
            $('<div>').append(
                $('<button>', { type: 'button', 'id': 'open' })
                    .text('Open').on('click', open_Click),
                $('<button>', { type: 'button', 'id': 'stop' })
                    .text('Stop').on('click', stop_Click),
                $('<button>', { type: 'button', 'id': 'close' })
                    .text('Close').on('click', close_Click)
            )
        ),
        $('<div>').append(
            $('<ul id="tree">')
        )
    );    

    for (var n = 0; n < myAccessory.Services.length; n++) {
        var serviceName = myAccessory.Services[n];
        var service = myAccessory[serviceName];
        $('#tree').append(
            $('<li>').text(serviceName).append(
                $('<ul>', { 'id': serviceName })
            )
        );
        
        for (var m = 0; m < service.Characteristics.length; m++) {
            var characteristicName = service.Characteristics[m];
            $('#' + serviceName).append(
                $('<li>').text(characteristicName + ": ").append(
                    $('<span>', { 'id': characteristicName })
                        .text(service[characteristicName])
                )
            );
            
            service.on(characteristicName, updateTree.bind({
                element: $('#' + characteristicName)
            }));
        }
    }
}


$().ready(Initialize);