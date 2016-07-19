var platform;
var db;


function Initialize() {
    if ((typeof(Storage) !== "undefined") && (localStorage.getItem('firebase_host') != null)) {
        db = new Firebase(localStorage.getItem('firebase_host'));
        db.onAuth(db_onAuth);
    } else {
        $('body').empty().append(
            $('<h3>').text('Connect to Firebase'),
            $('<p>').text('Enter the Firebase URL below. After connecting to Firebase and ' + 
                'authenticating with an email and password, the Platform will scan the ' +
                'Firebase reference including the authenticated user\'s UID for entries. ' +
                'Entries should show up at https://[YOUR_FIREBASE_URL].firebaseio.com/[UID]/'),
            $('<div>').append(
                $('<label for="firebase_host">').text('Firebase URL: '),
                $('<input type="url" id="firebase_host" size="40" placeholder="https://<YOUR_FIREBASE_URL>.firebaseio.com">')
            ),
            $('<div>').append(
                $('<button type="button">').text('Connect...').on('click', setDatabase)
            ),
            $('<div id="status">')
        );
    }
}

function setDatabase() {
    try {
        db = new Firebase($('#firebase_host').val());
        
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('firebase_host', $('#firebase_host').val());
        }
        
        db.onAuth(db_onAuth);
    } catch (error) {
        $('#status').text(error);
    }
}

function db_onAuth(authData) {
    if (authData) {
        // initialize the window
        $('body').empty().append($('<div>').text('Loading...'));
        platform = new homebridge.Platform(db.child(db.getAuth().uid));
        platform.ready(displayInterface);
    } else {
        platform == null;
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

function updateValue(e) {
    var target = $(e.target);
    var accessory = platform[target.attr('target-accessory')];
    var service = accessory[target.attr('target-service')];
    var characteristicName = target.attr('target-characteristic');
    var input = $('#' + target.attr('target-input'));
    
    switch (target.attr('data-type')) {
        case homebridge.Types.Characteristic.Formats.BOOL:
            service[characteristicName] = (input.val().toLowerCase() === 'true') || 
                (input.val() === '1');
            break;
        case homebridge.Types.Characteristic.Formats.INT:
        case homebridge.Types.Characteristic.Formats.UINT8:
        case homebridge.Types.Characteristic.Formats.UINT16:
        case homebridge.Types.Characteristic.Formats.UINT32:
        case homebridge.Types.Characteristic.Formats.UINT64:
            service[characteristicName] = parseInt(input.val());
            break;
        case homebridge.Types.Characteristic.Formats.FLOAT:
            service[characteristicName] = parseFloat(input.val());
            break;
        default:
            service[characteristicName] = input.val();
            break;
    }
}

function assignListener(service, charName, charId) {
    service.on(charName, function(val) {
        $('#' + charId).val(val);
        $('#' + charId).addClass('highlight');
        setTimeout(function() {
            $('#' + charId).removeClass('highlight');
        }, 500);
    });
}

function displayInterface() {
    $('body').empty().append($('<ul>', { 'id':'tree' }));
    
    for (var n = 0; n < platform.Accessories.length; n++) {
        var accessoryKey = platform.Accessories[n];
        var accessory = platform[accessoryKey];
        var accId = accessoryKey.replace(/:/g, '');
        
        $('#tree').append($('<li>').text(accessory.Name).append(
                $('<ul>', { 'id': accId })
            )
        );

        for (var m = 0; m < accessory.Services.length; m++) {
            var serviceName = accessory.Services[m];
            var service = accessory[serviceName];
            var servId = accId + '_' + serviceName;
            $('#' + accId).append($('<li>').text(serviceName).append(
                    $('<ul>', { 'id': servId })
                )
            );
            
            for (var i = 0; i < service.Characteristics.length; i++) {
                var characteristicName = service.Characteristics[i];
                var characteristic = service[characteristicName];
                var charId = servId + '_' + characteristicName;
                $('#' + servId).append($('<li>').append(
                        $('<span>', { 'id': charId + '_name' }).text(characteristicName),
                        ':',
                        $('<input>', { 'id': charId, 'type': 'text' }).val(characteristic),
                        $('<button>', {
                            'id': charId + '_button', 
                            'type': 'button', 
                            'target-accessory': accessoryKey,
                            'target-service': serviceName,
                            'target-characteristic': characteristicName,
                            'target-input': charId
                        }).text('OK')
                    )
                );
                
                $('#' + charId + '_button').attr('data-type', homebridge.Types.Characteristic[characteristicName].format)
                    .on('click', updateValue);
                assignListener(service, characteristicName, charId);
            }
        }
    }
}

// EOF
$().ready(function() {
    Initialize();
});