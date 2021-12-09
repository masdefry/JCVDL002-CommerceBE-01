const nodemailer = require('nodemailer');

// var mail = nodemailer.createTransport({
//     service: 'gmail',
//     // port: 465,
//     secure: true,
//     auth: {
//         user: 'hsbwarehouse29@gmail.com', // Your email id
//         pass: 'wucdohrqncunyojy' // Your password
//     },
// });

var mail = nodemailer.createTransport({
    service: 'gmail',
    // port: 465,
    // secure: true,
    auth: {
        user: 'muhammaddefryan@gmail.com', // Email Sender
        pass: 'bactiexyjdqowhwm' // Password Windows Computer
    },

    tls: {
        rejectUnauthorized: false
    }
});

var mailOptions = {
    from: 'hsbwarehouse29@gmail.com',
    to: 'budiwahyuherlenadita@gmai.com',
    subject: 'Email verification - warehouse.com',
    html: '<p>You requested for email verification, kindly use this <a href="http://localhost:5000/verify-email?token=">link</a> to verify your email address</p>'

};

mail.verify((err, success) => {
    if (err) console.error(err);
});

mail.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log("BEWE sendEmail error : " + error)
        return 1
    } else {
        return 0
    }
});