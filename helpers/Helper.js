const nodemailer = require("nodemailer");
const userServices = require("../services/userServices");

const sendEmailVerification = async (req, res) => {
    var otp = await userServices.updateOTP(req.session.re_usr_email);
    let OTPOutput = `
        <p>Dear ${req.session.re_usr_name},</p><br>
        <p>Welcome to HMARS, Please verify your email to access your account, with the following OTP:</p>
        <h4>${otp}</h4>
        <p>Thanks & Regards,</p>
        <p>Team HMARS</p>
    `;
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
            user: "infohmars@gmail.com",
            pass: "eobibzcjxvgpuojz"
        }
    });
    let info = await transporter.sendMail({
        from: "infohmars@gmail.com",
        to: req.session.re_usr_email,
        subject: "[HMARS] Please verify your device",
        // text: text,
        html: OTPOutput,
    });
    if (info) {
        console.log("Message sent: %s", info.messageId);
        req.flash('err_msg', undefined)
        req.flash('success_msg', 'OTP has been sent to your registered Email id')
        return res.redirect('/email-authentication')
    }
};

const forgotPasswordVerificationEmail = async (req, res) => {
    var otp = await userServices.updateOTP(req.session.re_usr_email);
    let OTPOutput = `
        <p>Dear ${req.session.re_usr_name},</p><br>
        <p>A request has been made to reset the password of ${req.session.re_usr_email}, Please verify with the following OTP to proceed: </p>
        <h4>${otp}</h4>
        <p>Thanks & Regards,</p>
        <p>Team HMARS</p>
    `;
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
            user: "infohmars@gmail.com",
            pass: "eobibzcjxvgpuojz"
        }
    });
    let info = await transporter.sendMail({
        from: "infohmars@gmail.com",
        to: req.session.re_usr_email,
        subject: "[HMARS] Reset password",
        html: OTPOutput,
    });
    if (info) {
        console.log("Message sent: %s", info.messageId);
        req.flash('err_msg', undefined)
        req.flash('success_msg', 'OTP has been sent to your registered Email id')
        return res.redirect('/forgot-password-verification-page')
    }
}

module.exports = {
    sendEmailVerification,
    forgotPasswordVerificationEmail
};
