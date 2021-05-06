const vaccChecker = require('./vaccAvailabilityChecker');
const constants = require('./constants');
const propertiesReader = require('properties-reader');

const properties = propertiesReader(process.cwd() + '/vaccine_notifier.properties');

exports.runScript = runScript;
/**
 * Two different API calls are made for obtaining vaccine slots info, before and after logging 
 * into cowin portal. Both seem to be important
 * one of the API calls can be removed if its not being used later. But keeping both for now.
 */
async function runScript() {
    vaccChecker.main(constants.GetSlotsByPinAPI);

    vaccChecker.main(constants.GetSlotsByPinPublicAPI).then(() => {
        console.log('Vaccine availability notifier started. Please wait for ' + properties.get('CRON_TIME_IN_MINUTES') + ' minutes for each set of requests');
    });
}