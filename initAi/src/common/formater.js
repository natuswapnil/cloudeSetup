(function() {
    const fuzzySet = require('../static/fuzzyset.js');
    const textTonum = require('../static/texttonum.js');
    const moment = require('moment-timezone');
    const serverDateFormat = 'DD MMM, YYYY hh:mm:ss A';
    var CERNER_DATE_FORMAT = 'DD MMM YY HH:MM:SS';
    const numberList = ['hundred', 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion'];
    const dayList = [
        'years',
        'months',
        'days',
        'hours',
        'weeks',
        'minutes',
        'yesterday',
        'tomorrow',
        'today',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'

    ];

    const prevNextList = [
        'last',
        'before',
        'after',
        'next',
        'yesterday',
        'tomorrow',
        'today',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'

    ];

    var prevNextSignMap = {
        'last': -1,
        'before': -1,
        'after': 2,
        'next': 1,
        'yesterday': 0,
        'tomorrow': 0,
        'today': 0,
        'sunday': 0,
        'monday': 0,
        'tuesday': 0,
        'wednesday': 0,
        'thursday': 0,
        'friday': 0,
        'saturday': 0

    };
    var dayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 4,
        saturday: 6
    };

    moment.tz.setDefault('Asia/kolkata');
    function  getDateInCernerDateFormat(date) {
        if(date) {
            return moment(date).format( CERNER_DATE_FORMAT);
        }
    }
    function setDateToStartTime(date) {
        if (date) {
            date = new Date(date);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        }
    }

    function setDateToEndTime(date) {
        if (date) {
            date = new Date(date);
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(0);
            return date;
        }
    }

    function getDateInServerDateFormat(date) {
        if (date) {
            return moment(date).format(serverDateFormat);
        }
    }

    function getServerDateToDate(date){
        if(date && typeof date === 'string'){
         return   moment(date + ' GMT+0530').toString();
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
            if (moment(currentTime).diff(moment(date), 'year') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'year');
                dateDiff.unit = (dateDiff.count === 1) ? 'Year' : 'Years';
            } else if (moment(currentTime).diff(moment(date), 'months') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'months');
                dateDiff.unit = (dateDiff.count === 1) ? 'Month' : 'Months';
            } else if (moment(currentTime).diff(moment(date), 'weeks') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'Weeks');
                dateDiff.unit = (dateDiff.count === 1) ? 'Week' : 'Weeks';
            } else if (moment(currentTime).diff(moment(date), 'days') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'days');
                dateDiff.unit = (dateDiff.count === 1) ? 'Day' : 'Days';
            } else if (moment(currentTime).diff(moment(date), 'hours') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'hours');
                dateDiff.unit = (dateDiff.count === 1) ? 'Hour' : 'Hours';
            } else if (moment(currentTime).diff(moment(date), 'minutes') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'minutes');
                dateDiff.unit = (dateDiff.count === 1) ? 'Minute' : 'Minutes';
            } else if (moment(currentTime).diff(moment(date), 'seconds') > 0) {
                dateDiff.count = moment(currentTime).diff(moment(date), 'seconds');
                dateDiff.unit = (dateDiff.count === 1) ? 'Second' : 'Seconds';
            }
            console.log('getDateDifferanceFromCurrentDay  datediff --->'+JSON.stringify(dateDiff) + ' date:' + date.toString() + ' currentTime:'+ currentTime.toString());
        } catch (error) {
            console.log('getDateDifferanceFromCurrentDay errror--->' + error);
        }
        return dateDiff;

    }

    function getDateFromDay(dayStr, valueSign, count) {
        var day = dayMap[dayStr];

        if (!day && day !== 0) {
            return;
        }
        valueSign = valueSign || 1;
        count = count || 1;
        while (day != moment().add(count * valueSign, 'day').day() && count < 10) {
            count++;
        }
        return getDateInServerDateFormat(moment().add(count * valueSign, 'day'));
    }


    function getPrevNextSign(isPrevNextString) {
        isPrevNextString = isPrevNextString || 'last';
        var prevNextFuzzySet = fuzzySet(prevNextList);
        var data = prevNextFuzzySet.get(isPrevNextString),
            correctString = '';
        if (data.length) {
            correctString = data[0][1];
        }
        correctString = correctString || 'last';
        return prevNextSignMap[correctString];



    }


    function getCurrentTime(date) {
        try {
            return moment();
        } catch (error) {
            console.log('getCurrentTime error--->' + error);
        }
    }


    function getFromAndToDate(rangeCount, rangeUnit, isPrevNext) {
        var countValue, isPrevNextSign, dateRange, from, to;
        if (rangeCount || rangeUnit) {
            countValue = rangeCount ? getTextToNum(rangeCount) : 0;
            isPrevNextSign = getPrevNextSign(isPrevNext);
            dateRange = getDateRangeFromWord(rangeUnit, countValue, isPrevNext);
            if (isPrevNextSign < 0) {
                from = getDateInServerDateFormat(setDateToStartTime(dateRange));
                to = getDateInServerDateFormat(setDateToEndTime(getCurrentTime()));
            } else if (isPrevNextSign === 1) {
                from = getDateInServerDateFormat(setDateToStartTime(getCurrentTime()));
                to = getDateInServerDateFormat(setDateToEndTime(dateRange));
            } else if (isPrevNextSign === 2) {
                from = getDateInServerDateFormat(setDateToStartTime(dateRange));
                to = getDateInServerDateFormat(setDateToStartTime(moment(from).add(5, 'years')));

            } else {
                from = getDateInServerDateFormat(setDateToStartTime(dateRange));
                to = getDateInServerDateFormat(setDateToEndTime(dateRange));
            }
        }
        return {
            from: from,
            to: to
        };
    }

    function getDateRangeFromWord(is_years_months_days_hours_minutes, count, isPrevNext) {
        var result, str, correctString;
        var dayFuzzySet = fuzzySet(dayList);
        is_years_months_days_hours_minutes = is_years_months_days_hours_minutes || '';

        is_years_months_days_hours_minutes = is_years_months_days_hours_minutes.toLowerCase().trim();
        str = is_years_months_days_hours_minutes ? dayFuzzySet.get(is_years_months_days_hours_minutes) : [];
        if (str.length) {
            correctString = str[0][1];
        }
        count = count ? getTextToNum(count) : 0;
        var valueSign = getPrevNextSign(isPrevNext) || -1;
        switch (correctString) {
            case 'months':
            case 'years':
            case 'days':
            case 'hours':
            case 'minutes':
            case 'weeks':
                result = getDateInServerDateFormat(moment().add(count * valueSign, correctString));
                break;
            case 'yesterday':
                result = getDateInServerDateFormat(moment().subtract(1, 'days'));
                break;
            case 'tomorrow':
                result = getDateInServerDateFormat(moment().add(1, 'days'));
                break;
            case 'today':
                result = getDateInServerDateFormat(moment());
                break;
            case 'monday':
            case 'tuesday':
            case 'wednesday':
            case 'thursday':
            case 'friday':
            case 'saturday':
            case 'sunday':
                result = getDateFromDay(correctString, valueSign);
                break;
            default:
                result = '';
                break;
        }
        return result;
    }

    function getTextToNum(numberInString) {
        var numFuzzySet = fuzzySet(numberList);
        var correctString = '';
        var converter = textTonum(),
            stringArray;
        if (typeof numberInString === 'number') {
            countValue = numberInString;
        } else if (typeof numberInString === 'string' && (parseInt(numberInString)).toString() === numberInString.trim()) {
            countValue = parseInt(numberInString);
        } else {
            numberInString = numberInString || '';
            numberInString = numberInString.toLowerCase();
            numberInString = numberInString.trim();
            numberInString = numberInString.replace(/\s\s+/g, ' ');
            stringArray = numberInString.split(' ');
            stringArray.forEach(function(str) {
                str = str ? numFuzzySet.get(str) : [];
                if (str.length && str[0][0] > 0.7) {
                    correctString = correctString + ' ' + str[0][1];
                }
            });
            countValue = converter.text2num(correctString.trim());
        }
        return countValue;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            getTextToNum: getTextToNum,
            getDateRangeFromWord: getDateRangeFromWord,
            getPrevNextSign: getPrevNextSign,
            getDateInServerDateFormat: getDateInServerDateFormat,
            setDateToStartTime: setDateToStartTime,
            setDateToEndTime: setDateToEndTime,
            getDateDifferanceFromCurrentDay: getDateDifferanceFromCurrentDay,
            getFromAndToDate: getFromAndToDate,
            getServerDateToDate:getServerDateToDate,
            getDateInCernerDateFormat:getDateInCernerDateFormat
        };
    }
})();
