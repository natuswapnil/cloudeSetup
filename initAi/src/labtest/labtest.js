(function() {
    const formater = require('../common/formater.js');
    const praxifyApi = require('../common/api/praxifyApi.js');
    const commonFun = require('../common/common.js');
    const cernerApi = require('../common/api/cernerApi.js');
    var appendAllEntityFromMessage = commonFun.appendAllEntityFromMessage,
        getSessiondata = commonFun.getSessiondata,
        setShowMeResultState = commonFun.setShowMeResultState;

    function getLabTestNameList(client) {
        var labtestName = appendAllEntityFromMessage(client, 'labtest_name') || '';
        var labtestName1 = appendAllEntityFromMessage(client, 'labtest_name_1') || '';
        var labtestName2 = appendAllEntityFromMessage(client, 'labtest_name_2') || '';
        var labtestNameList;
        var labtestNameObj = {};
        if (labtestName) {
            labtestNameObj[labtestName] = labtestName;
        }
        if (labtestName1) {
            labtestNameObj[labtestName1] = labtestName1;
        }
        if (labtestName2) {
            labtestNameObj[labtestName2] = labtestName2;
        }
        labtestNameList = Object.keys(labtestNameObj).map(function(key) {
            return key;
        });
        return labtestNameList;
    }

    function setIsLastLabTestNotReceived(client, flag) {
        client.updateConversationState({
            isLastLabTestNotReceived: flag || false
        });
    }

    function getIsLastLabTestNotReceived(client) {
        return (client.getConversationState().isLastLabTestNotReceived || false);
    }

    function orderLabtest(client, callback) {
        var params;
        var labtests = getLabTestNameList(client);
        var rangeCount = appendAllEntityFromMessage(client, 'range_count') || '';
        var rangeUnit = appendAllEntityFromMessage(client, 'range_unit') || '';
        var countValue = rangeCount ? formater.getTextToNum(rangeCount) : 0;
        var isPrevNext = appendAllEntityFromMessage(client, 'is_next_prev') || 'after';
        var testDate = formater.getDateRangeFromWord(rangeUnit, countValue, isPrevNext),
            sessiondata = getSessiondata(client);
        var patientLabtests = (labtests || []).map(function(labtestName) {
            return { description: labtestName };
        });
        if (!labtests || !labtests.length) {
            if (typeof callback === 'function') {
                callback();
            }
            return;
        }

        params = {
            patientLabtests: patientLabtests,
            recommendedDate: formater.getDateInServerDateFormat(testDate),
            testDate: formater.getDateInServerDateFormat(testDate),
            methodName: 'addOrUpdateMultiplePatientLabtest',
            patientId: sessiondata.patientId

        };
        sessiondata = sessiondata || {};
        console.log('orderLabtest--->' + JSON.stringify(params));
        praxifyApi(params,
            '/PlanWrite',
            'post', false,
            function(body) {
                var reply;
                if (typeof callback === 'function') {
                    callback(body);
                }
            }, sessiondata);
    }


    function searchOrderLabtest(client, callback) {
        console.log('/cerner/ProcedureRequests');
        var dateData, params;
        var rangeCount = appendAllEntityFromMessage(client, 'range_count') || '';
        var rangeUnit = appendAllEntityFromMessage(client, 'range_unit') || '';
        var isPrevNext = appendAllEntityFromMessage(client, 'is_next_prev') || '';
        var sessiondata = getSessiondata(client);
        var labtestNameList = getLabTestNameList(client);

        try {
            dateData = formater.getFromAndToDate(rangeCount, rangeUnit, isPrevNext);

            sessiondata = sessiondata || {};
            console.log('data'+JSON.stringify(rangeCount));
            if ((!labtestNameList || !labtestNameList.length) && (!dateData.from || !dateData.to)) {
                if (typeof callback === 'function') {
                    callback();
                }
                return;
            }
            
            if (labtestNameList && labtestNameList.length && !dateData.from) {
                dateData.from = formater.getDateInServerDateFormat(formater.setDateToStartTime(new Date()));
            }

            params = {
                fromDate: formater.getDateInCernerDateFormat(dateData.from),
                toDate: formater.getDateInCernerDateFormat(dateData.to),
                patientId:23658263
            };
            console.log('searchForLabtest --------> ' + JSON.stringify(params));
            cernerApi(params,
            '/cerner/ProcedureRequests',
            'get', true,
            function(body) {
                var reply;
                body = body || [];
                if (typeof callback === 'function') {
                    reply = body;
                    callback(reply);
                }
            }, sessiondata);
        } catch (error) {
            console.log('searchOrderLabtest Error--->' + error);
            if (typeof callback === 'function') {
                callback('Error');
            }
        }
    }
    // function searchOrderLabtest(client, callback) {
    //     var dateData, params;
    //     var rangeCount = appendAllEntityFromMessage(client, 'range_count') || '';
    //     var rangeUnit = appendAllEntityFromMessage(client, 'range_unit') || '';
    //     var isPrevNext = appendAllEntityFromMessage(client, 'is_next_prev') || '';
    //     var sessiondata = getSessiondata(client);
    //     var labtestNameList = getLabTestNameList(client);
    //     try {
    //         dateData = formater.getFromAndToDate(rangeCount, rangeUnit, isPrevNext);
    //         sessiondata = sessiondata || {};
    //         if ((!labtestNameList || !labtestNameList.length) && (!dateData.from || !dateData.to)) {
    //             if (typeof callback === 'function') {
    //                 callback();
    //             }
    //             return;
    //         }
    //         if (labtestNameList && labtestNameList.length && !dateData.from) {
    //             dateData.from = formater.getDateInServerDateFormat(formater.setDateToStartTime(new Date()));
    //         }
    //         params = {
    //             codeDescriptions: JSON.stringify(labtestNameList),
    //             fromDate: dateData.from,
    //             toDate: dateData.to,
    //         };
    //         console.log('searchForLabtest --------> ' + JSON.stringify(params));
    //         praxifyApi(params,
    //             '/patient/' + sessiondata.patientId + '/lab_test',
    //             'get', true,
    //             function(body) {
    //                 var reply;
    //                 if (typeof callback === 'function') {
    //                     reply = (body&&body.reply) ? JSON.parse(body.reply) : '';
    //                     callback(reply);
    //                 }
    //             }, sessiondata);
    //     } catch (error) {
    //         console.log('searchOrderLabtest Error--->' + error);
    //         if (typeof callback === 'function') {
    //             callback('Error');
    //         }
    //     }
    // }



    function searchForLabtest(labtestNameList, rangeCount, rangeUnit, isPrevNext, sessiondata, callback) {
        var dateData, params;
        try {
            dateData = formater.getFromAndToDate(rangeCount, rangeUnit, isPrevNext);
            sessiondata = sessiondata || {};
            params = {
                testNames: JSON.stringify(labtestNameList),
                fromDate: dateData.from,
                toDate: dateData.to,
            };
            console.log('searchForLabtest --------> ' + JSON.stringify(params));
            praxifyApi(params,
                '/patient/' + sessiondata.patientId + '/test_results',
                'get', true,
                function(body) {
                    var reply;
                    if (typeof callback === 'function') {
                        reply = (body&&body.reply) ? JSON.parse(body.reply) : '';
                        callback(reply);
                    }
                }, sessiondata);
        } catch (error) {
            console.log('searchForLabtest Error--->' + error);
            if (typeof callback === 'function') {
                callback('Error');
            }
        }
    }


    function getNotRecievedLabtestName(labtestNameList, result) {
        var notRecievedLabtestName = '',
            labtestNameObj = {};
        labtestNameList = labtestNameList || [];
        result = result || [];
        result.forEach(function(data) {
            var name = data.testName;
            name = name || '';
            labtestNameObj[(name.toLowerCase()).trim()] = true;
        });

        labtestNameList.some(function(testName) {
            var name = testName || '';
            name = (name.toLowerCase()).trim();
            if (!labtestNameObj[name]) {
                notRecievedLabtestName = testName;
                return true;
            }
        });
        return notRecievedLabtestName;
    }

    function getLabtestDetailFromCurrentConversation(client, callback) {
        var labtestNameList = getLabTestNameList(client) || [];
        var rangeCount = appendAllEntityFromMessage(client, 'range_count') || '';
        var rangeUnit = appendAllEntityFromMessage(client, 'range_unit') || '';
        var isPrevNext = appendAllEntityFromMessage(client, 'is_next_prev') || '';
        searchForLabtest(labtestNameList, rangeCount, rangeUnit, isPrevNext, getSessiondata(client), function(result) {
            var labtest, data;
            var labtest1, labtest2;
            if (result && labtestNameList.length === 1 && result.length === 1) {
                labtest = result[0];
                data = {
                    labtest_name: labtest.testName || '',
                    value: labtest.observedValue || '',
                    unit: labtest.observedValueUnit || ''
                };
                setShowMeResultState('answer_show_labtest_result', data, client);
            } else if (result && labtestNameList.length === 2 && result.length === 2) {
                labtest1 = result[0];
                labtest2 = result[1];
                data = {
                    labtest_name_1: labtest1.testName || '',
                    value_1: labtest1.observedValue || '',
                    unit_1: labtest1.observedValueUnit || '',
                    labtest_name_2: labtest2.testName || '',
                    value_2: labtest2.observedValue || '',
                    unit_2: labtest2.observedValueUnit || ''
                };
                setShowMeResultState('answer_show_two_labtest_result', data, client);
            } else if (result && labtestNameList.length === 2 && result.length === 1) {
                notRecievedLabtestName = getNotRecievedLabtestName(labtestNameList, result);
                labtest1 = result[0];
                data = {
                    labtest_name_1: labtest1.testName || '',
                    value_1: labtest1.observedValue || '',
                    unit_1: labtest1.observedValueUnit || '',
                    labtest_name_2: notRecievedLabtestName || '',
                };
                setShowMeResultState('answer_labtest_one_show_one_not', data, client);
            } else if (labtestNameList && labtestNameList.length === 1) {
                setShowMeResultState('one_result_yet_received', {}, client);
            } else {
                setShowMeResultState('two_result_yet_to_be_received', {}, client);

            }
            if (typeof callback === 'function') {
                callback(labtestNameList, result, data);
            }

        });
    }


    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            getLabtestDetailFromCurrentConversation: getLabtestDetailFromCurrentConversation,
            searchOrderLabtest: searchOrderLabtest,
            orderLabtest: orderLabtest,
            getNotRecievedLabtestName: getNotRecievedLabtestName,
            setIsLastLabTestNotReceived:setIsLastLabTestNotReceived,
            getIsLastLabTestNotReceived:getIsLastLabTestNotReceived
        };
    }
})();
