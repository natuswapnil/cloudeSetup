(function() {
    function appendAllEntityFromMessage(client, entityName) {
        var entityData = client.getEntities(client.getMessagePart(), entityName) || {};
        var entityList = entityData.generic || [];
        var fullEntity = '';
        entityList.forEach(function(data) {
            fullEntity = (fullEntity + ' ' + data.value).trim();
        });
        return fullEntity;
    }

    function setShowMeResultState(classification, data, client) {
        var state = {
            classification: classification,
            data: data
        };
        var showMeResult = JSON.stringify(state);
        client.updateConversationState({
            showMeResult: showMeResult
        });
        console.log('setShowMeResultState --- > ' + showMeResult);
    }



    function getSessiondata(client) {
        var state = client.getConversationState().currentSessionObj;
        if (state) {
            state = JSON.parse(state);
        }
        return state;
    }

    function getShowMeResultState(client) {
        var state = client.getConversationState().showMeResult;
        console.log('getShowMeResultState ---> ' + state);
        if (state) {
            state = JSON.parse(state);
        }
        return state;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            getSessiondata: getSessiondata,
            setShowMeResultState: setShowMeResultState,
            getShowMeResultState: getShowMeResultState,
            appendAllEntityFromMessage: appendAllEntityFromMessage
        };
    }
})();
