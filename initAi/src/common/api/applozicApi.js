(function(argument) {
    // applozic configuration
    var applozicApplicationKey = '2f0c05140936c0d42b8665f2043dce88f';
    var buffer = require('buffer').Buffer;
    var request = require('request');

    function sendMessage(userId, message, authorization, callback) {

        var headers = {
            'Application-Key': applozicApplicationKey,
            'Device-Key': authorization.deviceKey,
            'Authorization': ('Basic ' + new buffer(authorization.externalId + ':' + authorization.deviceKey).toString('base64')),
            'Content-Type': 'application/json'
        };
        console.log('sendApplozicMessage1 ---->' + JSON.stringify(headers));
        var options = {
            method: 'post',
            body: {
                "to": userId,
                "message": message
            },
            json: true,
            url: 'https://apps.applozic.com/rest/ws/message/v2/send',
            headers: headers
        };
        request(options, function(error, response, body) {
            console.log('<<<<<<<------- sendApplozicMessage ----->>>>>>>>>');
            console.log('sendApplozicMessage: options--> ' + JSON.stringify(options));
            console.log('sendApplozicMessage  body: ' + JSON.stringify(body));
            console.log('sendApplozicMessage  error: ' + error);
            console.log('sendApplozicMessage  response: ' + response);
            console.log('<<<<<<<------- sendApplozicMessage End ----->>>>>>>>>');
            if (typeof callback === 'function') {
                callback(error, response, body);
            }
        });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            sendMessage: sendMessage
        };
    }
})();
