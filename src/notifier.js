let nodemailer = require('nodemailer');
const propertiesReader = require('properties-reader');
const properties = propertiesReader(process.cwd() + '/vaccine_notifier.properties');
const email_recipients = properties.get('EMAIL_RECIPIENTS').split(",");

let nodemailerTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: String(properties.get('EMAIL')),
        pass: String(properties.get('APPLICATION_PASSWORD'))
    }
});

function createTemplate(slotDetails, date) {
    let message = `Vaccination Slot is now available within 7 days from today: 
    <br/><br/>
    `
    for (let slot of slotDetails) {
        let slotBody = `<strong> Center Name: ${slot.name} </strong> <br/>
        Location: ${slot.block_name}, ${slot.state_name}, ${slot.pincode} <br/>
        Open From ${slot.from} to ${slot.to} <br/>
        Fee Type: ${slot.fee_type} <br/>
        Book your slots at 
        <a href="https://www.cowin.gov.in/home">https://www.cowin.gov.in/home</a><br/>`
        slotBody = `${slotBody} <br/><br/>`
        message = `${message} ${slotBody}`
    }

    return message
}


exports.sendEmail = async function (email, subjectLine, slotDetails, date, callback) {
    let message = createTemplate(slotDetails, date)

    let options = {
        from: String('Vaccine Notifier ' + properties.get('EMAIL')),
        to: email_recipients,
        subject: subjectLine,
        html: message
    };

    nodemailerTransporter.sendMail(options, (error, info) => {
        if (error) {
            return callback(error);
        }
        callback(error, info);
    });

};
