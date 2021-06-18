const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
//load .env variables
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`
    }
});


//date related
const date = new Date();
const formattedDate = new Intl.DateTimeFormat('de-DE').format(date);






//send an email using nodemailer


const sendEmail = async (feedbackArray, candidateInformation) => {
    const {name, jobTitle, currentCompany, linkedInProfile} = candidateInformation;

    try {

        const mailOptions = {
            from: `${process.env.EMAIL}`,
            to: 'lukas.ste01@gmail.com',
            cc: 'lukas.ste01@gmail.com, fabio_senti@hotmail.com',
            subject: `New feedback received! 🚀`,
            text: `


            
            `,
            html: `
                Hi Yeng,
                <br>
                Someone has left you a feedback!
                <br>
                <h4>User details</h4>
                <div style="padding-bottom: 5px;padding-top: 5px;">
                Name:<span style="font-weight:bold;">${name}</span>
                Job Title:<span style="font-weight:bold;">${jobTitle}</span>
                Current company:<span style="font-weight:bold;">${currentCompany}</span>
                LinkedIn:<span style="font-weight:bold;">${linkedInProfile}</span>
                </div>


                ${feedbackArray.map((feedbackObject, index) => {
                        const {question, userSentiment, answer} = feedbackObject;
                    `
                    <div style="padding-bottom: 5px;">
                    <h4 style="padding-bottom: 5px;">${index + 1}. ${question}</h4><br>
                    sentiment:<span style="font-weight:bold;">${userSentiment}</span><br>
                    answer:<span style="font-weight:bold;">${answer}</span>
                    </div>

                    `
                })}
            `
            ,
    
        };
        await transporter.sendMail(mailOptions)
   

   

    }

    catch (err) {
        console.log({err: err})
    }

}

module.exports.sendEmail = sendEmail;