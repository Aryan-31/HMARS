const session = require('express-session');
const res = require('express/lib/response');
const request = require('request')
const { Appointment } = require('../models/appointment')
const apptServices = require('../services/apptServices')
const userServices = require('../services/userServices')

// Dashboard
const dashboard = async (req, res, next) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    var { appts, countAppointments } = await apptServices.fetchAppts(req.session.re_usr_email)
    appts = appts.slice(0,5)
    var countMedicalReport = await userServices.countMedicalReports(req.session.re_usr_email)
    return res.render('patient/patient-dash',{ session: req.session, err_msg, success_msg, appts, countAppointments, countMedicalReport });
}

// Edit Profile
const editProfilePage = async (req, res, next) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    var user = await userServices.checkUser(req.session.re_usr_email)
    return res.render('patient/edit-profile',{ session: req.session, err_msg, success_msg, user });
}

const submitProfileChanges = async (req, res) => {
    try {
        if (req.body.mobile_no !== '' && req.body.mobile_no !== null){
            let checkMobNo = await userServices.validateMobileNo(req.body.mobile_no)
            if (!checkMobNo) {
                req.flash('err_msg', 'Invalid Mobile Number')
                return res.redirect('/patient/edit-profile');
            }
        }
        if (req.body.dob != '' && req.body.dob != null){
            let checkDOB = await userServices.validateDOB(req.body.dob)
            if (!checkDOB) {
                req.flash('err_msg', 'Invalid Date of Birth format')
                return res.redirect('/patient/edit-profile');
            }
        }
        await userServices.updateProfile(req.session.re_usr_email, req.body)
        req.flash('success_msg', 'Profile updated successfully')
        res.redirect('/patient/edit-profile')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again later')
        res.redirect('/patient/edit-profile')
    }
}

// Change Password
const passwordChangePage = async(req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    res.render('patient/change-password', { session: req.session, err_msg, success_msg })
}

const passwordChange = async (req, res) => {
    var currentPass = await userServices.createCipher(req.body.currentPass)
    var newPass = await userServices.createCipher(req.body.newPassword)
    var confNewPass = await userServices.createCipher(req.body.confNewPass)
    var user = await userServices.checkUser(req.session.re_usr_email)
    if (currentPass != user.password) {
        req.flash('err_msg', 'Please enter correct password')
        return res.redirect('/patient/change-password')
    }
    if (currentPass == newPass) {
        req.flash('err_msg', 'Current password and new password cannot be same')
        return res.redirect('/patient/change-password')
    }
    if (confNewPass != newPass) {
        req.flash('err_msg', 'New Password and Confirm Password does not match')
        return res.redirect('/patient/change-password')
    }
    try {
        await userServices.changePassword(req.session.re_usr_email, newPass)
        req.flash('success_msg', 'Password changed successfully')
        res.redirect('/patient/change-password')
    } catch (error) {
        req.flash('err_msg', 'something went wrong. Please try again later')
        res.redirect('/patient/change-password')
    }
}

// Book Appointment
const apptPage = async (req, res) => {
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    let test = req.session.is_user_logged_in;
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    return res.render('patient/book-appt', { err_msg, success_msg, session: req.session });
}

const searchDoc = async (req, res) => {
    const search = await apptServices.searchDoctor(req.body.payload.trim())
    res.send({payload: search});
}

const submitAppt = async (req, res) => {
    let appt = apptServices.checkAppt(req.body.pName,req.body.dName, req.body.apptDateTime)
    if (appt.length > 0) {
        req.flash('err_msg', 'You have already booked an appointment with this doctor at that particular time')
        return res.redirect('/patient/bookAppt')
    }
    var bookAppointment = apptServices.bookAppt(req.body)
    if (bookAppointment) {
        res.redirect('/patient/seeAppt')
    }
}

// See Appointment
const seeAppt = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    var userEmail = req.session.re_usr_email
    var { appts }  = await apptServices.fetchAppts(userEmail)
    res.render('patient/see-appt', { session: req.session, err_msg, success_msg, appts })
}

const deleteAppt = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id)
        res.redirect('/patient/seeAppt')
    } catch (error) {
        throw error
    }
}

const cancelAppointment = async (req, res) => {
    try {
        await apptServices.appointmentCancel(req.params.id)
        req.flash('success_msg','Appointment is cancelled')
        res.redirect('/patient/seeAppt')
    } catch (error) {
        req.flash('err_msg','Something went Wrong. Please try again later.')
        res.redirect('/patient/seeAppt')
    }
}

// Edit Appointment
const editAppointmentPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    try {
        var { appt, doctor }  = await apptServices.getAppointment(req.params.id)
        res.render('patient/edit-appointment', { err_msg, success_msg, appt, doctor })
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please try again later')
        res.redirect('/patient/seeAppt')
    }
}

const submitEditAppointment = async (req, res) => {
    try {
        await apptServices.updatedAppointment(req.body)
        req.flash('success_msg', 'Appointment information updated.')
        res.redirect('/patient/seeAppt')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please try again later')
        res.redirect('/patient/seeAppt')
    }
}

// Medical report
const medReports = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    try {
        var medicalReportList = await userServices.getMedicalReports(req.session.re_usr_email)
        res.render('patient/medical-reports', { err_msg, success_msg, session: req.session, medicalReportList })
    } catch (error) {
        throw error
    }
}

const submitShareReport = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    try {
        await userServices.updateShareReport(req.body)
        req.flash('success_msg', 'Report Shared to: '+ req.body.sharedTo) 
        res.redirect('/patient/sharedRep')
    } catch (error) {
        console.log(error)
        req.flash('err_msg', 'Something went wrong. Please try again later') 
        res.redirect('/patient/medReports')
    }
}

const viewPrescriptionPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    try {
        var recordInformation = await userServices.getRecordInformation(req.params.id)
        var patientInfo = await userServices.checkUser(recordInformation.email)
        var doctorInfo = await userServices.checkUser(recordInformation.doctorEmail)
        var patientAge = await userServices.DOBToAge(patientInfo.dob)
        res.render('patient/view-prescription', { session: req.session, recordInformation, patientInfo, doctorInfo, patientAge })
    } catch (error) {
        req.flash('err_msg', 'Cannot load the report. Please try again later') 
        res.redirect('/patient/medReports')
    }
}

// Shared Report
const sharedReports = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    if (!test) {
        req.flash('err_msg','Please login to your account to continue.')
        return res.redirect('/login')
    }
    try {
        var sharedReportsList = await userServices.getSharedMedicalReportList(req.session.re_usr_email)
        var receivedReportsList = await userServices.getReceivedMedicalReportList(req.session.re_usr_email)
        res.render('patient/shared-reports', { session: req.session , err_msg, success_msg, sharedReportsList, receivedReportsList })
    } catch (error) {
        throw error
    }
}

// const removeSharedReport = async (req, res) => {
//     let test = req.session.is_user_logged_in;
//     if (!test) {
//         req.flash('err_msg','Please login to your account to continue.')
//         return res.redirect('/login')
//     }
//     try {
//         await userServices.shareReportRemove(req.body.accessToID)
//         req.flash('success_msg', 'Report Shared to: '+ req.body.sharedTo) 
//         res.redirect('/patient/sharedRep')
//     } catch (error) {
//         console.log(error)
//         req.flash('err_msg', 'Something went wrong. Please try again later') 
//         res.redirect('/patient/medReports')
//     }
// }

module.exports = {
    dashboard,
    editProfilePage,
    submitProfileChanges,
    passwordChangePage,
    passwordChange,
    apptPage,
    searchDoc,
    submitAppt,
    seeAppt,
    medReports,
    sharedReports,
    submitShareReport,
    viewPrescriptionPage,
    deleteAppt,
    cancelAppointment,
    editAppointmentPage,
    submitEditAppointment,
    // removeSharedReport
}