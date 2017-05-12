(function() {
    //init ai configuration
    var initAiAuthorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiJjY2E4NmUxMS02ZjhmLTRkZGMtNWYwMS0wNTY4NzNlN2U3MWYiLCJpYXQiOjE0ODk3MzY0MTMsImlzcyI6InBsYXRmb3JtIiwidHlwZSI6InJlbW90ZSJ9.WhcQw8rdjnQZ4-EzYyMi5TiJHDlzOjOsAxIZxY8mn9I';
    var request = require('request');
     var restify = require('restify');
    var callInitPostAPI = (url, body, callback) => {
        var options = {
            method: 'post',
            body: body,
            json: true,
            url: url,
            headers: {
                "Authorization": "Bearer " + initAiAuthorization,
                "Content-Type": "application/json"
            }
        };

        console.log('callInitPostAPI url: ' + options.url);
        request(options, (error, response, body) => {
            //console.log('callInitPostAPI ai api Error: ' + error);
            //console.log('callInitPostAPI ai api response: ' + response);
            //console.log('callInitPostAPI ai api body: ' + JSON.stringify(body));
            if (typeof callback === 'function') {
                callback(error, response, body);
            }
        });
    };
    var sendMessage = (message, externalId, callback) => {
        callInitPostAPI('https://api.init.ai/v1/users/' + externalId + '/conversations/current/messages', {
            content_type: 'text',
            content: message,
            sender_role: 'end-user'
        }, function(error, response, body) {
            if (body.message === 'User is not found.' && externalId) {
                createUser(externalId, function() {
                    sendMessage(message, externalId, callback);
                });
            } else if (typeof callback === 'function') {
                callback(error, response, body);
            }
        });
    };

    var createUser = (externalId, callback) => {
        callInitPostAPI('https://api.init.ai/v1/users', {
            first_name: externalId,
            last_name: externalId,
            remote_id: externalId
        }, function(error, response, body) {
            if (typeof callback === 'function') {
                callback(error, response, body);
            }
        });
    };

    function sendLogicResult(invocationPayload, result) {
    var invocationData = invocationPayload.invocation_data
    var client = restify.createClient({ url: invocationData.api.base_url })

    var requestConfig = {
        headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${invocationData.auth_token}`,
            'content-type': 'application/json',
        },
        method: 'POST',
        path: `/api/v1/remote/logic/invocations/${invocationData.invocation_id}/result`,
    };

    var resultPayload = {
        invocation: {
            invocation_id: invocationData.invocation_id,
            app_id: invocationPayload.current_application.id,
            app_user_id: Object.keys(invocationPayload.users)[0],
        },
        result: result,
    };

    client.post(requestConfig, (err, req) => {
        if (err) {
            console.error(err)
        }

        req.on('result', (err, res) => {
            res.body = ''
            res.setEncoding('utf8')

            res.on('data', (chunk) => {
                res.body += chunk
            });

            res.on('end', () => {
                // console.log(`Result sent successfully`, res.body)
            });
        });

        req.write(JSON.stringify(resultPayload));
        req.end();
    });
}


    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            sendMessage: sendMessage,
            createUser: createUser,
            sendLogicResult:sendLogicResult
        };
    }

})();
