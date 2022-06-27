const session = require('express-session');
const res = require('express/lib/response');
const request = require('request')
const apptServices = require('../services/apptServices')
const userServices = require('../services/userServices')
const doctorServices = require('../services/doctorServices');
const { Appointment } = require('../models/appointment');
// const { raw } = require('express');

const dashboard = async (req, res, next) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    var { appts, countAppointments } = await doctorServices.fetchAppts(req.session.re_usr_email)
    var countMedicalReport = await userServices.countMedicalReports(req.session.re_usr_email)
    res.render('doctor/doctor-dash',{ session: req.session, appts, countAppointments, countMedicalReport });
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
    return res.render('doctor/edit-profile',{ session: req.session, err_msg, success_msg, user });
}

const submitProfileChanges = async (req, res) => {
    try {
        if (req.body.mobile_no !== '' && req.body.mobile_no !== null){
            let checkMobNo = await userServices.validateMobileNo(req.body.mobile_no)
            if (!checkMobNo) {
                req.flash('err_msg', 'Invalid Mobile Number')
                return res.redirect('/doctor/edit-profile');
            }
        }
        if (req.body.dob != '' && req.body.dob != null){
            let checkDOB = await userServices.validateDOB(req.body.dob)
            if (!checkDOB) {
                req.flash('err_msg', 'Invalid Date of Birth format')
                return res.redirect('/doctor/edit-profile');
            }
        }
        await userServices.updateProfile(req.session.re_usr_email, req.body)
        req.flash('success_msg', 'Profile updated successfully')
        res.redirect('/doctor/edit-profile')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again later')
        res.redirect('/doctor/edit-profile')
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
    res.render('doctor/change-password', { title: 'Change Password', session: req.session, err_msg, success_msg })
}

const passwordChange = async (req, res) => {
    var currentPass = await userServices.createCipher(req.body.currentPass)
    var newPass = await userServices.createCipher(req.body.newPassword)
    var confNewPass = await userServices.createCipher(req.body.confNewPass)
    var user = await userServices.checkUser(req.session.re_usr_email)
    if (currentPass != user.password) {
        req.flash('err_msg', 'Please enter correct password')
        return res.redirect('/doctor/change-password')
    }
    if (currentPass == newPass) {
        req.flash('err_msg', 'Current password and new password cannot be same')
        return res.redirect('/doctor/change-password')
    }
    if (confNewPass != newPass) {
        req.flash('err_msg', 'New Password and Confirm Password does not match')
        return res.redirect('/doctor/change-password')
    }
    try {
        await userServices.changePassword(req.session.re_usr_email, newPass)
        req.flash('success_msg', 'Password changed successfully')
        res.redirect('/doctor/change-password')
    } catch (error) {
        req.flash('err_msg', 'something went wrong. Please try again later')
        res.redirect('/doctor/change-password')
    }
}

// Appointments
const seeAppt = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    var { appts } = await doctorServices.fetchAppts(req.session.re_usr_email)
    res.render('doctor/see-appt', { appts, err_msg, success_msg })
}

const cancelAppointment = async (req, res) => {
    try {
        await apptServices.appointmentCancel(req.params.id)
        req.flash('success_msg','Appointment is cancelled')
        res.redirect('/doctor/seeAppt')
    } catch (error) {
        req.flash('err_msg','Something went Wrong. Please try again later.')
        res.redirect('/doctor/seeAppt')
    }
}

const writePrescriptionPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    const patientDetails = await doctorServices.patientDetails(req.params.id)
    const patientAge = await userServices.DOBToAge(patientDetails.dob)
    const appt = await Appointment.findById(req.params.id)
    res.render('doctor/write-prescription', { session: req.session, err_msg, success_msg, patientDetails, patientAge, appt })
}

const submitPrescription = async (req, res) => {
    try {
        var prescriptionDetails = await doctorServices.prescriptionList(req.body)
        var user = await userServices.checkUserId(req.body.patientObjectID)
        await doctorServices.prescribe(prescriptionDetails, user, req.session.re_usr_name, req.session.re_usr_email)
        await doctorServices.appointmentDelete(req.body.apptID)
        req.flash('success_msg','You have prescribed '+req.body.noOfMedicines+' medicines to '+user.name)
        res.redirect('/doctor/seeAppt')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please try again later.')
        res.redirect('/doctor/seeAppt')
    }
}

// Patients
const patientList = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var patientList = await doctorServices.patientList(req.session.re_usr_email)
        var lastVisits = await doctorServices.patientLastVisit(patientList)
        res.render('doctor/patient-list', { session: req.session, err_msg, success_msg, patientList, lastVisits })
    } catch (error) {
        req.flash('err_msg','Cannot load patient page. Please try again later')
        res.redirect('/doctor/dashboard')
    }
}

const patientDetailsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var patientRecordDetails = await doctorServices.getRecordDetails(req.params.id)
        var patientRecordsList = await doctorServices.patienRecords(patientRecordDetails.email, patientRecordDetails.doctorEmail)
        var patientDetails = await userServices.checkUser(patientRecordDetails.email)
        var patientAge = await userServices.DOBToAge(patientDetails.dob)
        var countVisits = await doctorServices.countPatientVisits(patientDetails.email, req.session.re_usr_email)
        res.render('doctor/single-patient-view', { session: req.session, err_msg, success_msg, patientDetails, patientRecordDetails,patientRecordsList, patientAge, countVisits })
    } catch (error) {
        throw error
    }
}

// Medical Reports
const medReports = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var medicalReportList = await userServices.getMedicalReports(req.session.re_usr_email)
        res.render('doctor/medical-reports', { session: req.session, err_msg, success_msg, medicalReportList })
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
        res.redirect('/doctor/sharedRep')
    } catch (error) {
        console.log(error)
        req.flash('err_msg', 'Something went wrong. Please try again later') 
        res.redirect('/doctor/medReports')
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
        res.render('doctor/view-prescription', { session: req.session, recordInformation, patientInfo, doctorInfo, patientAge })
    } catch (error) {
        req.flash('err_msg', 'Cannot load the report. Please try again later') 
        res.redirect('/doctor/medReports')
    }
}

// Shared Reports
const sharedReports = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var sharedReportsList = await userServices.getSharedMedicalReportList(req.session.re_usr_email)
        var receivedReportsList = await userServices.getReceivedMedicalReportList(req.session.re_usr_email)
        res.render('doctor/shared-reports', { session: req.session , err_msg, success_msg, sharedReportsList, receivedReportsList })
    } catch (error) {
        throw error
    }
}

module.exports = {
    dashboard,
    editProfilePage,
    submitProfileChanges,
    passwordChangePage,
    passwordChange,
    seeAppt,
    cancelAppointment,
    writePrescriptionPage,
    submitPrescription,
    patientList,
    patientDetailsPage,
    medReports,
    submitShareReport,
    viewPrescriptionPage,
    sharedReports
}