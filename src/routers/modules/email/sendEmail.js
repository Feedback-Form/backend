const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`
    }
});








//send an email using nodemailer


const sendEmail = async (feedbackArray, candidateInformation) => {
    const {name, jobTitle, currentCompany, linkedIn} = candidateInformation;

    try {
        const mailOptions = {
            from: `${process.env.EMAIL}`,
            to: 'yeng.chow@swisspuls.ch',
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
                Name:<span style="font-weight:bold;">${name}</span><br>
                Job Title:<span style="font-weight:bold;">${jobTitle}</span><br>
                Current company:<span style="font-weight:bold;">${currentCompany}</span><br>
                LinkedIn:<span style="font-weight:bold;">${linkedIn}</span><br>
                </div>


                ${feedbackArray.map((feedbackObject, index) => {
                        const {question, selectedRating, answer} = feedbackObject;
                   return  `
                    <div style="padding-bottom: 5px;">
                    <h4 style="padding-bottom: 5px;">${index + 1}. ${question}</h4><br>
                    selected rating:<span style="font-weight:bold;">${selectedRating}</span><br>
                    answer:<span style="font-weight:bold;">${answer}</span>
                    </div>
                    `
                })}
            `
    
        };
        await transporter.sendMail(mailOptions)
   

   

    }

    catch (err) {
        console.log({err: err})
    }

}

module.exports.sendEmail = sendEmail;