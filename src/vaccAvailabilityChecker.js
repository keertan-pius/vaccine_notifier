const propertiesReader = require('properties-reader');
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const notifier = require('./notifier');
const constants = require('./constants');

const properties = propertiesReader(process.cwd() + '/vaccine_notifier.properties');
const PINCODES = properties.get('PINCODES').split(',');
console.log('Checking following pincodes:' + PINCODES);
const EMAIL = properties.get('EMAIL');
const AGE = properties.get('AGE');
const cronTimeInMinutes = properties.get('CRON_TIME_IN_MINUTES');

exports.checkAvailability = checkAvailability;

exports.main = async function (selectedAPI) {
    try {
        await checkAvailability(selectedAPI);
        cron.schedule(`*/${cronTimeInMinutes} * * * *`, async () => {
            await checkAvailability(selectedAPI);
        });
    } catch (e) {
        console.log('an error occured: ' + JSON.stringify(e, null, 2));
        throw e;
    }
}

async function checkAvailability(selectedAPI) {
    for (let PINCODE of PINCODES) {
        await getAvailability(PINCODE, moment().format(constants.CalendarByPINDateFormat), selectedAPI);
    }
}

async function getAvailability(PINCODE, DATE, selectedAPI) {
    axios(getAPIConfig(PINCODE, DATE, selectedAPI))
        .then(function (results) {
            let centers = results.data.centers;
            for (let i = 0; i < centers.length; i++) {
                let validSessions = centers[i].sessions.filter(session => session.min_age_limit == getAgeLimit() && session.available_capacity > 0)
                centers[i].sessions = validSessions;
            }
            let validSlots = centers.filter(center => center.sessions.length > 0)

            if (validSlots.length > 0) {
                console.dir('VACCINATION SLOTS AVAILABLE!! PINCODE:' + PINCODE);
                console.dir('Sending email notification');
                notifyMe(PINCODE, validSlots, DATE);
            }
            else {
                console.log('Request to CO-Win Success but vaccination slots unavailable for ' + PINCODE);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getAPIConfig(PINCODE, DATE, selectedAPI) {
    let apiURL = '';
    if (selectedAPI == constants.GetCalendarByPinAPI) {
        apiURL = constants.GetCalendarByPinAPIURL;
    }
    else {
        apiURL = constants.GetCalendarByPinPublicAPIURL;
    }
    return {
        method: 'get',
        url: apiURL + '?pincode=' + PINCODE + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'User-Agent': constants.API_Request_UserAgent
        }
    }
}

function getAgeLimit() {
    let age = parseInt(AGE);
    if (age >= constants.LowerAgeRange && age < constants.UpperAgeRange) {
        return constants.LowerAgeRange;
    }
    else if (age >= constants.UpperAgeRange) {
        return constants.UpperAgeRange;
    }
    else {
        throw new Error('Invalid Age Range');
    }
}

async function notifyMe(PINCODE, validSlots, date) {
    await notifier.sendEmail(EMAIL, 'Vacc For ' + PINCODE + ' Available', validSlots, date, (err, result) => {
        if (err) {
            console.error({ err });
        }
    });

};
