const InitClient = require('initai-node');
const labtestFun = require('./labtest/labtest.js');
const formater = require('./common/formater.js');
const commonFun = require('./common/common.js');
var appendAllEntityFromMessage = commonFun.appendAllEntityFromMessage,
    getShowMeResultState = commonFun.getShowMeResultState;

module.exports = function runLogic(eventData) {
  return new Promise((resolve) => {
    const client = InitClient.create(eventData, {succeed: resolve})

     const isLabtestMeasuredWithRange = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            labtestFun.getLabtestDetailFromCurrentConversation(client, function(labtestNameList, result, retrivedData) {
                if (result && result.length) {
                    client.addResponse('answer_yes_labtest_measured');
                } else if (result && !result.length) {
                    client.addTextResponse('No Dr It was not measured.');
                }
                client.done();
                //callback();
                console.log('isLabtestMeasuredWithRange ---> ' + JSON.stringify(result));
            });
        }
    });

    const showLabtestResult = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt() {
            var state;
            var isLastLabTestNotReceived;
            isLastLabTestNotReceived = labtestFun.getIsLastLabTestNotReceived(client);
            labtestFun.getLabtestDetailFromCurrentConversation(client, function(labtestNameList, result, retrivedData) {
                if (result && result.length && labtestNameList.length === 1) {
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                    client.addResponse('answer_show_labtest_result', retrivedData);
                } else if (result && result.length >= 2 && labtestNameList.length >= 2) {
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                    client.addResponse('answer_show_two_labtest_result', retrivedData);
                } else if (result && result.length && ((result.length < labtestNameList.length && labtestNameList.length >= 2))) {
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                    client.addResponse('answer_labtest_one_show_one_not', retrivedData);
                } else if (!labtestNameList || !labtestNameList.length) {
                    state = getShowMeResultState(client);
                    if (state && state.classification) {
                        client.addResponse(state.classification, state.data);
                    } else {
                        client.addTextResponse('No results');
                    }
                } else if (result && labtestNameList.length >= 2) {
                    client.addResponse('two_result_yet_to_be_received');
                    labtestFun.setIsLastLabTestNotReceived(client, true);
                } else if (result) {

                    if (!isLastLabTestNotReceived) {
                        labtestFun.setIsLastLabTestNotReceived(client, true);
                        client.addResponse('one_result_yet_received');
                    } else {
                        client.addResponse('result_yet_to_received_too');

                    }
                } else {
                	client.addTextResponse('No Resoponse');
                }
                client.done();
                //callback();
                console.log('showLabtestResult ---> ' + JSON.stringify(result));
            });
        }
    });

    const whenWasLabtestDone = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            try {
                labtestFun.getLabtestDetailFromCurrentConversation(client, function(labtestNameList, result, retrivedData) {
                    var notPerformedLabtestName, labtest, labtest1, labtest2, data, dateDiff, dateDiff1, dateDiff2;
                    if (result && result.length && labtestNameList.length === 1) {
                        labtest = result[0];
                        dateDiff = formater.getDateDifferanceFromCurrentDay(formater.getServerDateToDate(labtest.date)) || {};
                        console.log('whenWasLabtestDone date diff-->' + JSON.stringify(dateDiff) + '  labtest.date:' + labtest.date);
                        client.addResponse('answer_when_was_labtest_done', {
                            range_unit: dateDiff.unit,
                            range_count: dateDiff.count,
                        });

                    } else if (result && result.length >= 2 && labtestNameList.length >= 2) {
                        console.log('whenWasLabtestDone 2');
                        labtest1 = result[0];
                        labtest2 = result[1];
                        dateDiff1 = formater.getDateDifferanceFromCurrentDay(formater.getServerDateToDate(labtest1.date)) || {};
                        dateDiff2 = formater.getDateDifferanceFromCurrentDay(formater.getServerDateToDate(labtest2.date)) || {};
                        if (dateDiff1.count === dateDiff2.count && dateDiff1.unit === dateDiff2.unit) {
                            client.addResponse('answer_when_was_labtest_done', {
                                range_unit: dateDiff1.unit || '',
                                range_count: dateDiff1.count || '',
                            });
                        } else {
                            client.addResponse('answer_when_was_two_labtest_done', {
                                labtest_name_1: labtest1.testName || '',
                                range_unit_1: dateDiff1.unit || '',
                                range_count_1: dateDiff1.count || '',
                                labtest_name_2: labtest2.testName || '',
                                range_unit_2: dateDiff2.unit || '',
                                range_count_2: dateDiff2.count || ''
                            });
                        }
                    } else if (result && result.length == 1 && labtestNameList.length >= 2) {

                        labtest1 = result[0];
                        dateDiff1 = formater.getDateDifferanceFromCurrentDay(formater.getServerDateToDate(labtest1.date)) || {};
                        notPerformedLabtestName = labtestFun.getNotRecievedLabtestName(labtestNameList, result);
                        client.addResponse('answer_one_labtest_done_one_not', {
                            labtest_name_1: labtest1.testName || '',
                            range_unit_1: dateDiff1.unit || '',
                            range_count_1: dateDiff1.count || '',
                            labtest_name_2: notPerformedLabtestName || '',
                        });

                    } else if (result && labtestNameList.length >= 2) {
                        client.addTextResponse('Not done yet');
                    } else if (result) {
                        client.addTextResponse('Not done yet');
                    }
                    client.done();
                    //callback();
                    console.log('whenWasLabtestDone ---> ' + JSON.stringify(result));
                });
            } catch (error) {
                console.log('***** whenWasLabtestDone error   -----> ' + error + '<-------------******');
            }
        }
    });


    const isHaveLabtestResult = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            labtestFun.getLabtestDetailFromCurrentConversation(client, function(labtestNameList, result, retrivedData) {
                if (result && ((result.length && labtestNameList.length === 1) || (result.length >= 2 && labtestNameList.length >= 2))) {
                    client.addResponse('answer_yes');
                } else if (result && result.length && ((result.length < labtestNameList.length && labtestNameList.length >= 2))) {
                    client.addResponse('answer_labtest_one_show_one_not', retrivedData);
                } else if (result && labtestNameList.length >= 2) {
                    client.addResponse('two_result_yet_to_be_received');
                } else if (result) {
                    client.addResponse('no_result_yet_to_received');
                }
                client.done();
                //callback();
                console.log('isHaveLabtestResult ---> ' + JSON.stringify(result));
            });
        }

    });



    const isShowLabtestResult = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            labtestFun.getLabtestDetailFromCurrentConversation(client, function(labtestNameList, result, retrivedData) {
                var isLastLabTestNotReceived;
                isLastLabTestNotReceived = labtestFun.getIsLastLabTestNotReceived(client);
                if (result && result.length === 1 && labtestNameList.length === 1) {
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                    client.addResponse('answer_yes_show_labtest_result', retrivedData);
                } else if (result && result.length >= 2 && labtestNameList.length >= 2) {
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                    client.addResponse('answer_yes_show_two_labtest_result', retrivedData);
                } else if (result && result.length && ((result.length < labtestNameList.length && labtestNameList.length >= 2))) {
                    client.addResponse('answer_labtest_one_show_one_not', retrivedData);
                    labtestFun.setIsLastLabTestNotReceived(client, false);
                } else if (result && labtestNameList.length >= 2) {
                    labtestFun.setIsLastLabTestNotReceived(client, true);
                    client.addResponse('two_result_yet_to_be_received');
                } else if (result) {

                    if (!isLastLabTestNotReceived) {
                        labtestFun.setIsLastLabTestNotReceived(client, true);
                        client.addResponse('one_result_yet_received');
                    } else {
                        client.addResponse('result_yet_to_received_too');

                    }
                }
                client.done();
               // callback();
                console.log('isShowLabtestResult ---> ' + JSON.stringify(result));
            });
        }
    });

    const showMeResult = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt() {
            var state = getShowMeResultState(client);
            if (state && state.classification) {
                client.addResponse(state.classification, state.data);
            } else {
                client.addTextResponse('No results');
            }

            client.done();
        }
    });

    const handleSessiondata = function(eventType, payload) {
        payload = payload || {};
        var currentSessionObj = {
            appToken: payload.appToken,
            clientType: payload.clientType,
            baseURL: payload.baseURL,
            patientId: payload.patientId,
        };
        client.updateConversationState({
            currentSessionObj: JSON.stringify(currentSessionObj)
        });
        console.log(JSON.stringify(currentSessionObj));
        client.done()
    };

    const isOrderAnyLabtestWithRange = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            console.log('isOrderAnyLabtestWithRange');
            labtestFun.searchOrderLabtest(client, function(result) {
                var descriptionObject = {},
                    descriptionArray;
                if (result && result.length) {
                    result.forEach(function(data) {
                        descriptionObject[data.name] = descriptionObject[data.name] || [];
                       
                    });

                    descriptionArray = Object.keys(descriptionObject);
                    console.log(descriptionArray.toString());
                    client.addResponse('answer_is_order_any_labtest', { lablist: descriptionArray.toString() });
                } else {
                    client.addTextResponse('No are no lab tests ordered');
                }
                client.done();
              //  callback();
                console.log('isOrderAnyLabtestWithRange ---> ' + JSON.stringify(result));
            });
        }

    });

    const orderLabestWithRange = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt() {
            console.log('orderLabestWithRange');
            labtestFun.orderLabtest(client, function(body) {
                if (body && body.reply) {
                    client.addTextResponse('Order placed');
                }
                client.done();
            });
        }
    });


    const isShowReport = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            console.log('isShowReport');
            var report = appendAllEntityFromMessage(client, 'report') || '';
            client.addResponse('answer_yes_is_show_report');
            client.addTextResponse(report || 'No Report');
            client.done();
        }
    });

    const showMeReport = client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            console.log('showMeReport');
            var report = appendAllEntityFromMessage(client, 'report') || '';
            client.addResponse('answer_positive_show_me_report',{report:(report||'')});
            client.addTextResponse(report || 'No Report');
            client.done();
        }
    });

    const showMeLatestReport= client.createStep({
        extractInfo() {},
        satisfied() {
            return false;
        },
        prompt(callback) {
            console.log('showMeLatestReport');
            var report = appendAllEntityFromMessage(client, 'report') || '';
            client.addResponse('positive_answer_show_me_latest_report');
            client.addTextResponse(report || 'No Report');
            client.done();
        }
    });

    client.runFlow({
        eventHandlers: {
            'sessiondata': handleSessiondata
        },
        classifications: {
            'is_labtest_measured_with_range': 'isLabtestMeasuredWithRange',
            'order_two_labest_with_range': 'orderLabestWithRange',
            'order_labest_with_range': 'orderLabestWithRange',
            'show_labtest_result': 'showLabtestResult',
            'is_have_two_labtest_result': 'isHaveLabtestResult',
            'is_have_labtest_result': 'isHaveLabtestResult',
            'is_show_two_labtest_result': 'isShowLabtestResult',
            'is_show_labtest_result': 'isShowLabtestResult',
            'when_was_labtest_done': 'whenWasLabtestDone',
            'when_was_two_labtest_done': 'whenWasLabtestDone',
            'is_have_labtest_result_with_range': 'isHaveLabtestResult',
            'is_have_two_labtest_result_with_range': 'isHaveLabtestResult',
            'is_order_any_labtest_with_range': 'isOrderAnyLabtestWithRange',
            'show_two_labtest_result': 'showLabtestResult',
            'show_me_result': 'showMeResult',
            'is_show_report': 'isShowReport',
            'show_me_report': 'showMeReport',
            'show_me_latest_report':'showMeLatestReport'
        },
        streams: {
            isLabtestMeasuredWithRange: [isLabtestMeasuredWithRange],
            orderLabestWithRange: [orderLabestWithRange],
            showLabtestResult: [showLabtestResult],
            isHaveLabtestResult: [isHaveLabtestResult],
            isShowLabtestResult: [isShowLabtestResult],
            whenWasLabtestDone: [whenWasLabtestDone],
            isOrderAnyLabtestWithRange: [isOrderAnyLabtestWithRange],
            showMeResult: [showMeResult],
            isShowReport: [isShowReport],
            showMeReport: [showMeReport],
            showMeLatestReport:[showMeLatestReport],
        },
    });
  })
}
