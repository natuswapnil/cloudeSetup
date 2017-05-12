(function() {
    var builder = require('botbuilder');
    var momentTimeZone = require('moment-timezone');
    var CERNER_DATE_FORMAT = 'DD MMM YY HH:MM:SS';
    var SERVER_DATE_FORMAT = 'DD MMM, YYYY hh:mm:ss A';
    momentTimeZone.tz.setDefault('Asia/kolkata');


    function getServerDateToDate(date) {
        if (date && typeof date === 'string') {
            return momentTimeZone(date + ' GMT+0530').toString();
        }
    }


    function  getDateInCernerDateFormat(date) {
        if(date) {
            return momentTimeZone(date).format( CERNER_DATE_FORMAT);
        }
    }

    function getDateInServerDateFormat(date) {
        if (date) {
            return momentTimeZone(date).format(SERVER_DATE_FORMAT);
        }
    }

    function getCurrentTime(date) {
        try {
            return momentTimeZone();
        } catch (error) {
            console.log('getCurrentTime error--->' + error);
        }
    }


    function  addDaysInDate(date,days) {
       if(date) {
         return momentTimeZone(date).add(days, 'days');
       }
    }

    function getDateDifferanceFromCurrentDay(date) {
        var dateDiff = {};
        console.log('getDateDifferanceFromCurrentDay ');
        var currentTime = getCurrentTime();
        try {
            if (!date) {
                console.log('getDateDifferanceFromCurrentDay   not provide date');
                return;
            }
            if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'year') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'year');
                dateDiff.unit = (dateDiff.count === 1) ? 'Year' : 'Years';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'months') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'months');
                dateDiff.unit = (dateDiff.count === 1) ? 'Month' : 'Months';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'weeks') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'Weeks');
                dateDiff.unit = (dateDiff.count === 1) ? 'Week' : 'Weeks';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'days') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'days');
                dateDiff.unit = (dateDiff.count === 1) ? 'Day' : 'Days';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'hours') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'hours');
                dateDiff.unit = (dateDiff.count === 1) ? 'Hour' : 'Hours';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'minutes') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'minutes');
                dateDiff.unit = (dateDiff.count === 1) ? 'Minute' : 'Minutes';
            } else if (momentTimeZone(currentTime).diff(momentTimeZone(date), 'seconds') > 0) {
                dateDiff.count = momentTimeZone(currentTime).diff(momentTimeZone(date), 'seconds');
                dateDiff.unit = (dateDiff.count === 1) ? 'Second' : 'Seconds';
            }
            console.log('getDateDifferanceFromCurrentDay  datediff --->' + JSON.stringify(dateDiff) + ' date:' + date.toString() + ' currentTime:' + currentTime.toString());
        } catch (error) {
            console.log('getDateDifferanceFromCurrentDay errror--->' + error);
        }
        return dateDiff;

    }


    function getDurationSign(duration) {
        if (!duration) {
            return;
        }
        duration = duration.toLowerCase();
        if (duration.indexOf('next') !== -1 || duration.indexOf('after') !== -1) {
            return 1;
        } else {
            return -1;
        }
    }

    function getRangeFromDatetimeEntity(dateTimeEntity) {
        var temp, date, duration, time, length, fromDate, toDate, durationObj, flag;
        if (!dateTimeEntity) {
            return;
        }
        date = dateTimeEntity.resolution.date;
        duration = dateTimeEntity.resolution.duration;
        time = dateTimeEntity.resolution.time;
        if (date) {
            length = date.split('-').length;
            console.log('date length' + length);
            if (length === 3) {
                fromDate = momentTimeZone(date);
                toDate = momentTimeZone(date);
            } else if (length === 2) {
                fromDate = momentTimeZone(date);
                toDate = (momentTimeZone(date).add(1, 'month')).add(-1, 'day');
            } else {
                fromDate = momentTimeZone(date);
                toDate = (momentTimeZone(date).add(1, 'year')).add(-1, 'day');
            }
        } else if (duration) {
            durationObj = momentTimeZone.duration(duration);
            console.log('durationObj  ' + JSON.stringify(durationObj));
            flag = getDurationSign(dateTimeEntity.entity);
            if (flag === -1) {

                fromDate = momentTimeZone().subtract(durationObj);
                toDate = momentTimeZone();
            } else {
                fromDate = momentTimeZone();
                toDate = momentTimeZone().add(durationObj);
            }
        } else if (time) {

        }
        return {
            fromDate: fromDate,
            toDate: toDate
        };
    }


    function setSessionData(key, value, type, session) {
        if (!session || !key) {
            console.log('in setSessionData session or key undefined');
            return;
        }
        session[type || SESSION_TYPE.USER_DATA][key] = value;
        console.log('setSessionData save->' + session.userData.showMeResult);
    }
    var SESSION_TYPE = {
        CONVERSATION_DATA: 'conversationData',
        USER_DATA:'userData'
    };


    function getEntityByName(entities, name) {
        return builder.EntityRecognizer.findAllEntities(entities, name);
    }

    function getBuiltInTime(allEntities) {
        var builtInTime = ((getEntityByName(allEntities, 'builtin.datetime.date') || [])[0]);
        builtInTime = builtInTime || ((getEntityByName(allEntities, 'builtin.datetime.duration') || [])[0]);
        return builtInTime;
    }


    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            setSessionData: setSessionData,
            getEntityByName: getEntityByName,
            getRangeFromDatetimeEntity: getRangeFromDatetimeEntity,
            SESSION_TYPE: SESSION_TYPE,
            getBuiltInTime: getBuiltInTime,
            getServerDateToDate: getServerDateToDate,
            getDateDifferanceFromCurrentDay: getDateDifferanceFromCurrentDay,
            getDateInServerDateFormat: getDateInServerDateFormat,
            getDateInCernerDateFormat:getDateInCernerDateFormat,
            addDaysInDate:addDaysInDate,
            getCurrentTime:getCurrentTime
        };
    }
})();
