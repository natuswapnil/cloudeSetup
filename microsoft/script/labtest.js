(function() {
	var praxifyApi = require('./api/praxifyApi.js');
	var commonFun = require('./common/common.js');
	var cernerApi = require('./api/cernerApi.js');
	var SESSION_TYPE = commonFun.SESSION_TYPE;

	function searchForLabtest(params, sessiondata, callback) {
		var patientId = params.patientId;
		try {
			console.log('searchForLabtest --------> ' + JSON.stringify(params || ''));
			params.patientId = undefined;
			praxifyApi(params,
				'/patient/' + patientId + '/test_results',
				'get', true,
				function(body) {
					var reply;
					body = body || {};
					if (typeof callback === 'function') {
						reply = ( body.reply) ? JSON.parse(body.reply) : body.reply;
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

	function getResultOfShowSingleLabResult(results) {
		if (!results || !results.length) {
			console.log('in getResultOfShowSingleLabResult results  undefined or empty');
			return;
		}
		var labtest = results[0];
		var data = {
			labtest: labtest.testName || '',
			value: labtest.observedValue || '',
			unit: labtest.observedValueUnit || ''
		};
		return (data.labtest + ' is ' + data.value + ' ' + data.unit);
	}

	function getResultOfShowTwoLabResult(results) {
		if (!results ) {
			console.log('in getResultOfShowTwoLabResult results  undefined or less than 2');
			return;
		}
		var labtest1 = results[0],
			labtest2 = results[1];
		return ((labtest1.testName || '') + ' is ' + (labtest1.observedValue || '') + ' ' + (labtest1.observedValueUnit || '') + ' and ' + (labtest2.testName || '') + ' is ' + (labtest2.observedValue || '') + ' ' + (labtest2.observedValueUnit || ''));
	}

	function getNotRecievedLabtestName(labtestNameList, results) {
		var notRecievedLabtestName = '',
			labtestNameObj = {};
		labtestNameList = labtestNameList || [];
		results = results || [];
		results.forEach(function(data) {
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



	function getResultOfOneShowOneNotLabResult(results, labtestNameList) {
		if (!results || !results.length) {
			console.log('in getResultOfOneShowOneNotLabResult results  undefined or empty');
			return;
		}
		var labtest1 = results[0];
		return ((labtest1.testName || '') + ' is ' + (labtest1.observedValue || '') + ' ' + (labtest1.observedValueUnit || '') + ' but ' + getNotRecievedLabtestName(labtestNameList, results) + ' result is yet to be received');
	}


	function setShowMeResultForLab(labtestNameList, results, session) {
		var value;
		if (results && labtestNameList.length === 1 && results.length === 1) {
			value = getResultOfShowSingleLabResult(results);
		} else if (results && labtestNameList.length === 2 && results.length === 2) {
			value = getResultOfShowTwoLabResult(results);
		} else if (results && labtestNameList.length === 2 && results.length === 1) {
			value = getResultOfOneShowOneNotLabResult(results, labtestNameList);
		} else if (labtestNameList && labtestNameList.length === 1) {
			value = standardLabResult.oneResultNotReceived;
		} else {
			value = standardLabResult.twoResultNotReceived;
		}
		commonFun.setSessionData('showMeResult', value, SESSION_TYPE.USER_DATA, session);
		return value;
	}


	function getWhenWasLabtestDoneResult(labtestNameList, results, session) {
		var notPerformedLabtestName, labtest, labtest1, labtest2, data, dateDiff, dateDiff1, dateDiff2;
		var response = '';
		if (results && results.length && labtestNameList.length === 1) {
			labtest = results[0];
			dateDiff = commonFun.getDateDifferanceFromCurrentDay(commonFun.getServerDateToDate(labtest.date)) || {};
			response = 'It was done ' + dateDiff.count + ' ' + dateDiff.unit + ' ago';

		} else if (results && results.length >= 2 && labtestNameList.length >= 2) {
			labtest1 = results[0];
			labtest2 = results[1];
			dateDiff1 = commonFun.getDateDifferanceFromCurrentDay(commonFun.getServerDateToDate(labtest1.date)) || {};
			dateDiff2 = commonFun.getDateDifferanceFromCurrentDay(commonFun.getServerDateToDate(labtest2.date)) || {};
			if (dateDiff1.count === dateDiff2.count && dateDiff1.unit === dateDiff2.unit) {
				response = 'It was done ' + dateDiff1.count + ' ' + dateDiff1.unit + ' ago';
			} else {
				response = (labtest1.testName || '') + ' was done ' + (dateDiff1.count || '') + ' ' + (dateDiff1.unit || '') + ' ago, but ' + (labtest2.testName || '') + ' was done ' + (dateDiff2.count || '') + ' ' + (dateDiff2.unit || '') + ' ago';

			}
		} else if (results && results.length == 1 && labtestNameList.length >= 2) {
			labtest1 = results[0];
			dateDiff1 = commonFun.getDateDifferanceFromCurrentDay(commonFun.getServerDateToDate(labtest1.date)) || {};
			notPerformedLabtestName = getNotRecievedLabtestName(labtestNameList, results) || '';
			response = (labtest1.testName || '') + ' was done ' + (dateDiff1.count || '') + ' ' + (dateDiff1.unit || '') + ' ago, but ' + notPerformedLabtestName + ' was not done  yet';

		} else if (results && labtestNameList.length >= 2) {
			response = standardLabResult.notDoneYet;
		} else if (results) {
			response = standardLabResult.notDoneYet;
		}
		return response;
	}

	function getResponeForLabtestResult(labtestNameList, results, eventType, session) {
		var response;
		var showMeResultValue = setShowMeResultForLab(labtestNameList, results, session);
		switch (eventType) {
			case LABTEST_INTENTS.IS_LABTEST_MEASURED:

				if (results && results.length) {
					response = standardLabResult.labtestMeasuredPositive;
				} else {
					response = standardLabResult.labtestMeasuredNagative;
				}
				break;
			case LABTEST_INTENTS.IS_HAVE_LABTEST_RESULT:
				if (results && ((results.length && labtestNameList.length === 1) || (results.length >= 2 && labtestNameList.length >= 2))) {
					response = standardLabResult.yes;
				} else {
					response = showMeResultValue;
				}
				break;
			case LABTEST_INTENTS.SHOW_LABTEST_RESULT:
				response = showMeResultValue;
				break;
			case LABTEST_INTENTS.IS_SHOW_LABTEST_RESULT:
				if (results && results.length === 1 && labtestNameList && labtestNameList.length === 1) {
					response = "Yes Dr.  Patient's " + showMeResultValue;
				} else if (results && results.length >= 2 && labtestNameList && labtestNameList.length >= 2) {
					response = "Yes Dr.  Patient's " + showMeResultValue;
				} else {
					response = showMeResultValue;
				}
				break;
			case LABTEST_INTENTS.WHEN_WAS_LABTEST_DONE:
				response = getWhenWasLabtestDoneResult(labtestNameList, results, session);
				break;
		}

		return response;
	}

	function orderLabtest(params, sessiondata, callback) {
		if (!params) {
			return;
		}
		params.methodName = 'addOrUpdateMultiplePatientLabtest';
		sessiondata = sessiondata || {};
		console.log('orderLabtest--->' + JSON.stringify(params));
		praxifyApi(params,
			'/PlanWrite',
			'post', false,
			function(body) {
				if (typeof callback === 'function') {
					callback(body);
				}
			}, sessiondata);
	}

	function searchOrderLabtestFromCerner(params, sessiondata, callback) {
		
		cernerApi(params,
			'/cerner/ProcedureRequests',
			'get', true,
			function(body) {
				var reply;
				body = body || {};
				if (typeof callback === 'function') {
					reply = body || [];
					callback(reply);
				}
			}, sessiondata);
	}

	function searchOrderLabtest(params, sessiondata, callback) {
		var patientId = params.patientId;
		params.patientId = undefined;
		praxifyApi(params,
			'/patient/' + patientId + '/lab_test',
			'get', true,
			function(body) {
				var reply;
				body = body || {};
				if (typeof callback === 'function') {
					reply = ( body.reply) ? JSON.parse(body.reply) : body.reply;
					callback(reply);
				}
			}, sessiondata);
	}

	function getOrderLabtestResult(description) {
		return 'Yes. Dr. Here is the list of Lab test ordered. ' + description;
	}

	function handleLabtestEvent(session, args, eventType, sessiondata) {
		var allEntities, testEntities, allTestNameList, dateRange;
		var builtInTime, params;
		var response = '';
		try {
			console.log('\n\n **********   ' + eventType + ' ********** \n\n ');
			allEntities = args.entities || [];
			testEntities = commonFun.getEntityByName(allEntities, 'test') || [];
			builtInTime = commonFun.getBuiltInTime(allEntities);
			allTestNameList = testEntities.map(function(test) {
				return test.entity;
			});
			dateRange = commonFun.getRangeFromDatetimeEntity(builtInTime) || {};
			if (allTestNameList.length) {
				params = {
					testNames: JSON.stringify(allTestNameList),
					fromDate: dateRange.fromDate ? commonFun.getDateInServerDateFormat(dateRange.fromDate) : undefined,
					toDate: dateRange.toDate ? commonFun.getDateInServerDateFormat(dateRange.toDate) : undefined,
					patientId: sessiondata.patientId
				};
				searchForLabtest(params, sessiondata, function(results) {
					response = getResponeForLabtestResult(allTestNameList, results, eventType, session);
					console.log('handleLabtestEvent =' + response );
					session.send(response);
				});

			} else {
				console.log('test list empty');
			}
			console.log('allEntities ' + JSON.stringify(allEntities));
			console.log('\n\n ______________________________________________ \n\n ');
		} catch (error) {
			console.log('######### ' + ' eventType :' + eventType + ' Error:' + error);
		}
	}

	

	function handleIsOrderAnyLabtest(session, args, sessiondata, eventType) {
		var allEntities, testEntities, allTestNameList, dateRange;
		var builtInTime, params;
		var response = '';
		try {
			console.log('\n\n **********   ' + eventType + ' ********** \n\n ');
			allEntities = args.entities || [];
			testEntities = commonFun.getEntityByName(allEntities, 'test') || [];
			builtInTime = commonFun.getBuiltInTime(allEntities);
			allTestNameList = testEntities.map(function(test) {
				return test.entity;
			});
			dateRange = commonFun.getRangeFromDatetimeEntity(builtInTime) || {};
			if (dateRange) {
				params = {
					//codeDescriptions: JSON.stringify(allTestNameList),
					fromDate: dateRange.fromDate ? commonFun.getDateInCernerDateFormat(dateRange.fromDate) : commonFun.getDateInCernerDateFormat(commonFun.getCurrentTime()),
					toDate: dateRange.toDate ? commonFun.getDateInCernerDateFormat(dateRange.toDate) : commonFun.getDateInCernerDateFormat(commonFun.addDaysInDate(commonFun.getCurrentTime(),31)),
					patientId: 23658263
				};
				searchOrderLabtestFromCerner(params, sessiondata, function(results) {
					var descriptionObject = {},
						descriptionArray, response;
					if (results && results.length) {
						results.forEach(function(data) {
							descriptionObject[data.name] = descriptionObject[data.name] || [];
							descriptionObject[data.name].push(data.name);
						});
						descriptionArray = Object.keys(descriptionObject);
						response = getOrderLabtestResult(descriptionArray);
					} else {
						response = standardLabResult.noLabtestOrdered;
					}
					session.send(response);
				});

			} else {
				console.log('dateRange empty');
			}
			console.log('allEntities ' + JSON.stringify(allEntities));
			console.log('\n\n ______________________________________________ \n\n ');
		} catch (error) {
			console.log('######### ' + ' eventType :' + eventType + ' Error:' + error);
		}
	}


	// function handleIsOrderAnyLabtest(session, args, sessiondata, eventType) {
	// 	var allEntities, testEntities, allTestNameList, dateRange;
	// 	var builtInTime, params;
	// 	var response = '';
	// 	try {
	// 		console.log('\n\n **********   ' + eventType + ' ********** \n\n ');
	// 		allEntities = args.entities || [];
	// 		testEntities = commonFun.getEntityByName(allEntities, 'test') || [];
	// 		builtInTime = commonFun.getBuiltInTime(allEntities);
	// 		allTestNameList = testEntities.map(function(test) {
	// 			return test.entity;
	// 		});
	// 		dateRange = commonFun.getRangeFromDatetimeEntity(builtInTime) || {};
	// 		if (dateRange) {
	// 			params = {
	// 				codeDescriptions: JSON.stringify(allTestNameList),
	// 				fromDate: dateRange.fromDate ? commonFun.getDateInServerDateFormat(dateRange.fromDate) : undefined,
	// 				toDate: dateRange.toDate ? commonFun.getDateInServerDateFormat(dateRange.toDate) : undefined,
	// 				patientId: sessiondata.patientId
	// 			};
	// 			searchOrderLabtest(params, sessiondata, function(results) {
	// 				var descriptionObject = {},
	// 					descriptionArray, response;
	// 				if (results && results.length) {
	// 					results.forEach(function(data) {
	// 						descriptionObject[data.description] = descriptionObject[data.description] || [];
	// 						descriptionObject[data.description].push(data.recommendedDate);
	// 					});
	// 					descriptionArray = Object.keys(descriptionObject);
	// 					response = getOrderLabtestResult(descriptionArray);
	// 				} else {
	// 					response = standardLabResult.noLabtestOrdered;
	// 				}
	// 				session.send(response);
	// 			});

	// 		} else {
	// 			console.log('dateRange empty');
	// 		}
	// 		console.log('allEntities ' + JSON.stringify(allEntities));
	// 		console.log('\n\n ______________________________________________ \n\n ');
	// 	} catch (error) {
	// 		console.log('######### ' + ' eventType :' + eventType + ' Error:' + error);
	// 	}
	// }

	function handleOrderLabtestEvevnt(session, args, sessiondata, eventType) {
		var allEntities, testEntities, allTestNameList, dateRange;
		var builtInTime, params;
		var response = '';
		try {
			console.log('\n\n **********   ' + eventType + ' ********** \n\n ');
			allEntities = args.entities || [];
			testEntities = commonFun.getEntityByName(allEntities, 'test') || [];
			builtInTime = commonFun.getBuiltInTime(allEntities);
			allTestNameList = testEntities.map(function(test) {
				return test.entity;
			});
			dateRange = commonFun.getRangeFromDatetimeEntity(builtInTime) || {};
			if (allTestNameList.length) {
				params = {
					patientLabtests: JSON.stringify(allTestNameList),
					recommendedDate: dateRange.fromDate ? commonFun.getDateInServerDateFormat(dateRange.fromDate) : undefined,
					testDate: dateRange.fromDate ? commonFun.getDateInServerDateFormat(dateRange.fromDate) : undefined,
					patientId: sessiondata.patientId
				};
				orderLabtest(params, sessiondata, function(result) {
					if (result && result.reply) {
						session.send(standardLabResult.orderPlaced);
					}
				});
			} else {
				console.log('allTestNameList empty');
			}
		} catch (error) {
			console.log('######### ' + ' eventType : order_labest  Error:' + error);
		}
	}

	var standardLabResult = {
		labtestMeasuredPositive: 'Yes Dr It was measured.',
		labtestMeasuredNagative: 'No Dr It was not measured.',
		oneResultNotReceived: 'Result yet to be received',
		twoResultNotReceived: 'Results are yet to be received',
		yes: 'Yes',
		notDoneYet: 'Not done yet',
		orderPlaced: 'Order placed',
		noLabtestOrdered: 'No are no lab tests ordered'
	};

	var LABTEST_INTENTS = {
		IS_LABTEST_MEASURED: 'is_test_measured',
		IS_HAVE_LABTEST_RESULT: 'is_have_test_result',
		SHOW_LABTEST_RESULT: 'show_test_result',
		IS_SHOW_LABTEST_RESULT: 'is_show_test_result',
		WHEN_WAS_LABTEST_DONE: 'when_was_test_done',
		IS_ORDER_ANY_LABTEST: 'is_order_any_test',
		ORDER_LABTES: 'order_test',
		SHOW_ME_RESULT:'show_me_result'

	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = {
			LABTEST_INTENTS: LABTEST_INTENTS,
			handleLabtestEvent: handleLabtestEvent,
			handleIsOrderAnyLabtest: handleIsOrderAnyLabtest,
			handleOrderLabtestEvevnt: handleOrderLabtestEvevnt
		};
	}
})();
