
(function() {
    var request = require('request');
    var callAPI = (params, url, methodType, isRestCall, callback, currentSessionObj) => {
        try {
       currentSessionObj = currentSessionObj ||{};
        var apiUrl = 'http://localhost:9090';
        var appToken = 'Basic Y242OTQ4MEBiNjI3OnByYXhpZnkzNDU=';
        var fullUrl = apiUrl + url;

        var options = {
            method: methodType,
            qs: params,
            json: true,
            url:fullUrl,
            headers: {
                'Authorization': appToken,
                'x-pr-authorization':'bearer a6cb4471aefe4b0e93c137862fc5f08c'
            }
        };


        console.log('api url: ' + options.url);
        console.log('headers: ' + JSON.stringify(options.headers));
        if (params) {
            console.log('request object: ' + JSON.stringify(params));
        }

        request(options, (error, response, body) => {
            if (typeof callback === 'function') {
                try {
                    console.log(url + ' response body: ' + JSON.stringify(body));
                } catch (err) {
                    console.log('response object: in catch statement');
                }
                console.log('error: ' + error);
                callback(body, error, response);
            }
        });
        }catch(exception){
        console.log('error'+exception);
    }
    };
    var root = this;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = callAPI;
        root.callAPI = callAPI;
    } else {
        root.callAPI = callAPI;
    }

})();
