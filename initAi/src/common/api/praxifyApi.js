(function() {
    var request = require('request');

    var callAPI = (params, url, methodType, isRestCall, callback, currentSessionObj) => {


        var apiVersion = (currentSessionObj.apiVersion || '3.20.3.0').trim();
        var apiUrl = (currentSessionObj.baseURL || 'https://subhash.praxify.com:8443').trim();
        var appToken = (currentSessionObj.appToken || '').trim();
        var clientType = (currentSessionObj.clientType || 'praxifyweb').trim();
        var RESTBaseURL = apiUrl + '/XtrWS/services/' + apiVersion;
        var baseURL = apiUrl + '/XtrWS/';

        var options = {
            method: methodType,
            body: params,
            json: true,
            url: isRestCall ? (RESTBaseURL + url) : (baseURL + url),
            headers: {
                'Authorization': appToken,
                'ClientType': clientType,
                'User-Agent': clientType,
                'Accept': 'application/json'
            }
        };

        if (methodType == 'get') {
            if (isRestCall)
                options.qs = params;
            else
                options.url += '?token=' + appToken + '&' + params.methodName + '=' + encodeURIComponent(JSON.stringify(params));
        } else {
            if (isRestCall){
            options.body = params;
            }else {
                options.url += '?token=' + appToken + '&' + params.methodName + '=' + encodeURIComponent(JSON.stringify(params));
                 options.body = params; 
            }
        }

        console.log('api url: ' + options.url);
        console.log('headers: ' + JSON.stringify(options.headers));
        if (params)
            console.log('request object: ' + JSON.stringify(params));

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
    };
    var root = this;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = callAPI;
        root.callAPI = callAPI;
    } else {
        root.callAPI = callAPI;
    }
})();
