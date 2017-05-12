const express = require('express')
const bodyParser = require('body-parser')
const runLogic = require('./src/runLogic')
const sendLogicResult = require('./src/sendLogicResult')
const BOT_TYPES = {
    COMMAND_BOT: 'COMMAND_BOT',
    CHAT_BOT: 'CHAT_BOT'
};
const applozicAuthorization = {
    [BOT_TYPES.COMMAND_BOT]: {
        externalId: 'commandBot',
        deviceKey: '772c7ab6-d454-4521-8f11-3f7c26869dbc'
    },
    [BOT_TYPES.CHAT_BOT]: {
        externalId: 'chatBot',
        deviceKey: '6d4b7af8-b00e-4f0e-b970-7361c78c0e63',
    }
};
const app = express();
var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
const {PORT = 3022} = process.env


app.use(bodyParser.json())

app.post('/init/', ({body: {event_type, data}, hostname}, res) => {
  console.log(`[${hostname}]: "${event_type}" webhook received from Init.ai`)

  if (event_type === 'LogicInvocation') {
    runLogic(data).then(sendLogicResult(data.payload))
      .catch((error) => {console.log('[ERROR]:\n', error)})
  }

  res.sendStatus(200)
});



app.post('/applozic/', ({body: {event_type, data}, hostname}, res) => {
	console.log( '******** from applozic >>>>>>>>'+ JSON.stringify(data) + ' <<<<<<<<< *********');
    var params = data.params,
        message, index, originalMeg;
    var from = (params.from || '').trim();
    try {

        if (from !== applozicAuthorization[BOT_TYPES.CHAT_BOT].externalId && from !== applozicAuthorization[BOT_TYPES.COMMAND_BOT].externalId) {
            message = params.message || '';
            index = message.indexOf(BOT_TYPES.COMMAND_BOT);
            console.log(JSON.stringify(params));
            if (index === 0) {
                originalMeg = message.substr(BOT_TYPES.COMMAND_BOT.length).trim();
                initAi.sendMessage(originalMeg, (BOT_TYPES.COMMAND_BOT + from).trim(), function() {});
            } else {
                initAi.sendMessage(params.message, from, function() {});
            }
        }
    } catch (exception) {
        console.log(exception);
    }
    res.send(200);
});

//app.listen(PORT, () => console.log(`Webhook server is running on port ${PORT}!`))

var httpsServer = https.createServer(credentials, app);


httpsServer.listen(PORT, () => console.log(`Webhook server is running on port https ${PORT}`));