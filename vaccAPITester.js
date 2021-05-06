const vaccAvailabillityChecker = require('./src/vaccAvailabilityChecker');
const constants = require('./src/constants');

async function main() {
    try {
        //Just to check if the public apis are working.
        await vaccAvailabillityChecker.checkAvailability(constants.GetCalendarByPinPublicAPI);
        //await vaccAvailabillityChecker.checkAvailability(constants.GetCalendarByPinAPI);
    } catch (e) {
        console.log('an error occured: ');
        throw e;
    }
}

main().then(() => {
    console.log('Vaccine API tester completed.');
})