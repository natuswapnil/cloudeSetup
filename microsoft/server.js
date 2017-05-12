


var restify = require('restify');
var builder = require('botbuilder');
var labtestObj = require('./script/labtest.js');
var commonFun = require('./script/common/common.js');


const express = require('express')
const bodyParser = require('body-parser')
var https = require('https');
const app = express();
var fs = require('fs');
var privateKey  = fs.readFileSync('sslcert/nginx.key', 'utf8');
var certificate = fs.readFileSync('sslcert/nginx.crt', 'utf8');
var https_options = {
  key: privateKey,
  certificate: certificate
};
var credentials = {key: privateKey, cert: certificate};
const {PORT=443} = process.env


app.use(bodyParser.json())



// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);

// Setup Restify Server
//var server = restify.createServer(https_options);

// Handle Bot Framework messages



app.post('/api/messages', connector.listen());

// Serve a static web page
app.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

app.listen(process.env.port || 443, function() {
    console.log('%s listening to %s', app.name, app.url);
});

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b29c3cfc-a7f9-43b4-84c3-3050ff53b545?subscription-key=20884d2b74dd4b1d950fa4453098e79b&timezoneOffset=0.0&verbose=true&q=');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', intents);

function getSessiondata() {
    return {
        apiVersion: '3.20.3.0',
        baseURL: 'https://subhash.praxify.com:8443',
        appToken:"H4sIAAAAAAAAAF2QvUvDUBTFrwGl3aQUXCW4uNwIHRwqSKsdAkEL8Qs6vTTX9oXkvfDeS02dBf8NcbVOzuLk3j_Bya2Ti3Qy_dCC070HDr977hlNYF0rOJCqh1EgtUamkaKghl2ZpFKQMKgNM3SdxegvF58UZzG_pbCtZD4svTxOHw7fxxZYHpQ1ac2lcI8NbHsF1pljnYLpdGNe8Bz_11H3oDTgdHPCEjJQ8SI2YE7MRM_xjeKiV8_TItvuKlsBwQUE_yA7qzSj-1p1IveqFqx1wOKhAavTzNNMzeboa-t7o3T2YQHkKQBsPj2HU2q4b6_t6LNc2R8buFtcCSmN5TCZv54FmeAG7SujWkwhMWXPRaPtYjQTq5rONallqiYxgRdu6xLt3ChKsgT7xGLTx6woOOX_vZ7ssthG7_So4f0AKC497pIBAAA",
        clientType: 'praxifyweb',
        patientId: 33
    };
}

intents.matches('getTestResult', [
    function(session, args) {
        console.log('get_test_result');
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.IS_LABTEST_MEASURED, getSessiondata());
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.IS_LABTEST_MEASURED, [
    function(session, args) {
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.IS_LABTEST_MEASURED, getSessiondata());
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.IS_HAVE_LABTEST_RESULT, [
    function(session, args) {
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.IS_HAVE_LABTEST_RESULT, getSessiondata());
    }
]);
intents.matches(labtestObj.LABTEST_INTENTS.SHOW_LABTEST_RESULT, [
    function(session, args) {
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.SHOW_LABTEST_RESULT, getSessiondata());
    }
]);
intents.matches(labtestObj.LABTEST_INTENTS.IS_SHOW_LABTEST_RESULT, [
    function(session, args) {
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.IS_SHOW_LABTEST_RESULT, getSessiondata());
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.WHEN_WAS_LABTEST_DONE, [
    function(session, args) {
        labtestObj.handleLabtestEvent(session, args, labtestObj.LABTEST_INTENTS.WHEN_WAS_LABTEST_DONE, getSessiondata());
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.IS_ORDER_ANY_LABTEST, [
    function(session, args) {
        labtestObj.handleIsOrderAnyLabtest(session, args, getSessiondata(), labtestObj.LABTEST_INTENTS.WHEN_WAS_LABTEST_DONE.IS_ORDER_ANY_LABTEST);
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.ORDER_LABTES, [
    function(session, args) {
        labtestObj.handleOrderLabtestEvevnt(session, args, getSessiondata(), labtestObj.LABTEST_INTENTS.ORDER_LABTES);
    }
]);

intents.matches(labtestObj.LABTEST_INTENTS.SHOW_ME_RESULT, [
    function(session, args) {
        session.send(session.userData.showMeResult || 'No result to show');
    }
]);

intents.onDefault([
    function(session, args, next) {
        if (!session.userData.name) {
            session.send('hi');
        } else {
            next();
        }
    },
    function(session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

var httpsServer = https.createServer(credentials, app);


httpsServer.listen(PORT, () => console.log(`Webhook server is running on port https ${PORT}`));

