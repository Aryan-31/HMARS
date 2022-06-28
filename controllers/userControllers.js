const { log } = require('debug/src/browser');
const { userInfo } = require('../models/User');
const request = require('request');
const userServices = require('../services/userServices')
const helper = require('../helpers/Helper')

// Home Page or Index Page
const indexPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    res.render('index', { err_msg, success_msg });
}

// Contact Us
const submitContactUs = async (req, res) => {
    try {
        await userServices.addContactUs(req.body)
        req.flash('success_msg', 'Thank you for reaching out to us. We will contact you as soon as possible')
        res.redirect('/#contactUs')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please try again later')
        res.redirect('/')
    }
}

const loginPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    res.render('login', { err_msg, success_msg, session: req.session });
    
}

const signupPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    res.render('signup', { err_msg, success_msg, session: req.session });

}

const submitUser = async (req, res) => {
    // console.log('submit',req.body)
    try {
        let user = await userServices.checkUser(req.body.email);
        if (user) {
            req.flash('err_msg', 'Email already exists. Please enter another email.');
            res.redirect('/Signup');
        }
        else {
            if (req.body.password === req.body.conf_pass) {
                let mystr = await userServices.createCipher(req.body.password);
                let created = await userServices.createAtTimer();
                await userServices.addUser(req.body, mystr, created);
                let user = await userServices.checkUser(req.body.email);
                
                
                req.session.success = true;
                req.session.re_usr_id = user._id;
                req.session.re_usr_name = user.name;
                req.session.re_usr_email = user.email;
                req.session.re_usr_role = user.role;
                req.session.is_user_logged_in = true;
                
                res.redirect('/send-email');
            }
            else {
                req.flash('err_msg', 'Password does not match.');
                res.redirect('/Signup');
            }
        }
    } catch (error) {
        console.log(error);
        req.flash('err_msg', 'Something went wrong. Please Try Again.');
        res.redirect('/Signup');
    }

}

const authPage = async (req, res) => {
    res.render("otp-verification");
};

const submitAuthPage = async (req, res) => {
    let getOTP = await userServices.getOTP(req.session.re_usr_email)
    console.log(getOTP.otp)
    let otp = await req.body.otp
    console.log(otp)
    if (getOTP.otp == otp) {
        try {
            await userInfo.findOneAndUpdate({ email: req.session.re_usr_email }, { email_verify_status: 'Verified', otp: '' })
            switch (req.session.re_usr_role) {
                case 'patient':
                    res.redirect("/patient/dashboard");
                    break;
                case 'doctor':
                    await userInfo.findOneAndUpdate({ email: req.session.re_usr_email }, { adminVerification: 'pending' })
                    req.flash('success_msg','You have successfully signed up. Please wait for the admin to verify your details')
                    res.redirect('/login')
                    break;
                case 'admin':
                    return res.redirect("/admin/dashboard");
                    break;
                default:
                    req.flash('err_msg', 'Your role is not defined. Please write to us at support@hmars.com to update your role.')
                    res.redirect('/login')
                    break;
            }
        } catch (error) {
            req.flash('err_msg','Invalid OTP.')
            res.redirect('/email-authentication')
        }
    }
}

const userLogin = async (req, res) => {
    let user = await userServices.checkUser(req.body.email);
    if (user) {
        let password = req.body.password;
        let mystr = await userServices.createCipher(password);
        let userRole = await user.role
        let userLogin = await userServices.checkUserPass(req.body.email, mystr);
        if (userLogin) {
            let status = userLogin.status;
            let email_status = userLogin.email_verify_status;
            
            req.session.success = true;
            req.session.re_us_id = userLogin._id;
            req.session.re_usr_name = userLogin.name;
            req.session.re_usr_email = userLogin.email;
            req.session.re_usr_role = userRole;
            req.session.is_user_logged_in = true;
            if (status == 'active' && email_status == 'Verified') {
                switch (userRole) {
                    case 'patient':
                        if (userLogin.deleted == '1') {
                            req.flash('err_msg', 'User is deleted by ' + userLogin.deleted_by + ' at ' + userLogin.deleted_at + '. Please contact hospital for further assisstance.')
                            return res.redirect('/login')
                        }
                        res.redirect("/patient/dashboard");
                        break;
                    case 'doctor':
                        if (userLogin.deleted == '1') {
                            req.flash('err_msg', 'User is deleted by ' + userLogin.deleted_by + ' at ' + userLogin.deleted_at + '. Please contact hospital for further assisstance.')
                            res.redirect('/login')
                        }else if (userLogin.adminVerification == 'verified') {
                            res.redirect("/doctor/dashboard");
                        } else {
                            req.flash('err_msg','Hospital Admin has not verified your details. Please wait for them to verify or contact the hospital.')
                            res.redirect('/login')
                        }
                        break;
                    case 'admin':
                        res.redirect("/admin/dashboard")
                        break;
                    default:
                        req.flash('err_msg', 'Your role is not defined. Please write to us at infohmars@gmail.com to update your role.')
                        res.redirect('/login')
                        break;
                }
            } else {
                req.flash('err_msg', 'Your account is not verified.');
                res.redirect('/send-email')
            }
        }
        else {
            req.flash('err_msg', 'The username or password is incorrect.');
            res.redirect('/login')
        }
    }
    else {
        req.flash('err_msg', 'User does not exist.');
        res.redirect('/login');
    }
}

const userLogOut = async (req, res) => {
    await req.session.destroy((err) => {
        if (err) {
            return req.flash('err_msg', 'Unable to logout of this session')
        }
        res.redirect('/login')
    })
}

const forgotPassPage = async (req, res) => {
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    res.render('forgot-pass', { success_msg, err_msg })
}

const submitForgotPassword = async (req, res) => {
    try {
        let user = await userServices.checkUser(req.body.email);
        if (!user) {
            req.flash('err_msg', 'User doesn\'t exist.');
            res.redirect('/forgot-pass');
        }
        else {  
            req.session.success = true;
            req.session.re_usr_id = user._id;
            req.session.re_usr_name = user.name;
            req.session.re_usr_email = user.email;
            
            res.redirect('/forgot-password-verification-email');
        }
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try Again.');
        res.redirect('/forgot-pass');
    }
}

const forgotPasswordVerification = (req, res) => {
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    res.render("forgot-password-verification", { err_msg, success_msg });
}

const submitForgotPasswordVerification = async (req, res) => {
    let getOTP = await userServices.getOTP(req.session.re_usr_email)
    let otp = await req.body.otp
    if (getOTP.otp == otp) {
        req.session.is_otp_verified = true
        return res.redirect('/set-new-password')
    }
    req.flash('err_msg','Invalid OTP.')
    return res.redirect('/forgot-password-verification-page')
}

const setNewPasswordPage = async (req, res) => {
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (req.session.is_otp_verified) {
        return res.render('set-new-password', { err_msg, success_msg })
    }
    res.redirect('/forgot-pass')
}

const submitSetNewPassword = async (req, res) => {
    var user = await userServices.checkUser(req.session.re_usr_email)
    var newPassword = await userServices.createCipher(req.body.password)
    var confirmPassword = await userServices.createCipher(req.body.confirmPassword)
    if (user.password == newPassword) {
        req.flash('err_msg', 'Seems like you remember the password!! Please login using the same password you used now.')
        return res.redirect('/set-new-password')
    }
    if (newPassword != confirmPassword) {
        req.flash('err_msg', 'New Password and Confirm Password does not match')
        return res.redirect('/set-new-password')
    }
    try {
        await userServices.changePassword(req.session.re_usr_email, newPassword)
        req.flash('success_msg', 'Password changed successfully!')
        req.session.is_otp_verified = false
        res.redirect('/login')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please try again later')
        res.redirect('/set-new-password')
    }
}

const searchUser = async (req, res) => {
    const search = await userServices.searchUserList(req.body.payload.trim())
    res.send({payload: search});
}

module.exports = {
    indexPage,
    submitContactUs,
    loginPage,
    signupPage,
    submitUser,
    authPage,
    submitAuthPage,
    userLogin,
    userLogOut,
    searchUser,
    forgotPassPage,
    submitForgotPassword,
    forgotPasswordVerification,
    submitForgotPasswordVerification,
    setNewPasswordPage,
    submitSetNewPassword
};