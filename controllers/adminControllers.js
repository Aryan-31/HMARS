const session = require('express-session');
const res = require('express/lib/response');
const request = require('request');
const { userInfo } = require('../models/User');
const adminServices = require('../services/adminServices')
const userServices = require('../services/userServices')

const dashboard = async (req, res, next) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var pendingApplications = await adminServices.getPendingApplications()
    pendingApplications = pendingApplications.slice(0,7)
    var countDoctor = await adminServices.doctorCount()
    var countAppointments = await adminServices.appointmentCount()
    var countPatient = await adminServices.patientCount()
    var countPendingApplications = await adminServices.pendingApplicationsCount()
    res.render('admin/dashboard', { title: 'Dashboard', session: req.session, pendingApplications, countDoctor, countAppointments, countPatient, countPendingApplications, err_msg, success_msg})
}

const editProfile = async(req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var user = await userServices.checkUser(req.session.re_usr_email)
    res.render('admin/edit-profile', { title: 'Edit Profile', session: req.session, err_msg, success_msg, user })
}

const submitProfileChanges = async (req, res) => {
    try {
        if (req.body.mobile_no !== '' && req.body.mobile_no !== null){
            let checkMobNo = await userServices.validateMobileNo(req.body.mobile_no)
            if (!checkMobNo) {
                req.flash('err_msg', 'Invalid Mobile Number')
                return res.redirect('/admin/edit-profile');
            }
        }
        if (req.body.dob != '' && req.body.dob != null){
            let checkDOB = await userServices.validateDOB(req.body.dob)
            if (!checkDOB) {
                req.flash('err_msg', 'Invalid Date of Birth format')
                return res.redirect('/admin/edit-profile');
            }
        }
        await userServices.updateProfile(req.session.re_usr_email, req.body)
        req.flash('success_msg', 'Profile updated successfully')
        res.redirect('/admin/edit-profile')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again later')
        res.redirect('/admin/edit-profile')
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
    res.render('admin/change-password', { title: 'Change Password', session: req.session, err_msg, success_msg })
}

const passwordChange = async (req, res) => {
    var currentPass = await userServices.createCipher(req.body.currentPass)
    var newPass = await userServices.createCipher(req.body.newPassword)
    var confNewPass = await userServices.createCipher(req.body.confNewPass)
    var user = await userServices.checkUser(req.session.re_usr_email)
    if (currentPass != user.password) {
        req.flash('err_msg', 'Please enter correct password')
        return res.redirect('/admin/change-password')
    }
    if (currentPass == newPass) {
        req.flash('err_msg', 'Current password and new password cannot be same')
        return res.redirect('/admin/change-password')
    }
    if (confNewPass != newPass) {
        req.flash('err_msg', 'New Password and Confirm Password does not match')
        return res.redirect('/admin/change-password')
    }
    try {
        await userServices.changePassword(req.session.re_usr_email, newPass)
        req.flash('success_msg', 'Password changed successfully')
        res.redirect('/admin/change-password')
    } catch (error) {
        req.flash('err_msg', 'something went wrong. Please try again later')
        res.redirect('/admin/change-password')
    }
}

// Application Page
const applicationPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var pendingApplications = await adminServices.getPendingApplications()
    var rejectedApplications = await adminServices.getRejectedApplications()
    res.render('admin/doctor-application', { title: 'Applications', session: req.session, pendingApplications, rejectedApplications, err_msg, success_msg})
}

const singleApplicationPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    try {
        let doctorDetails = await userServices.checkUserId(req.params.id)
        res.render('/admin/single-application-view', { err_msg, success_msg, doctorDetails })
    } catch (error) {
        req.flash('err_msg', 'Error loading application information. Please try again later')
        res.redirect('/admin/doctor-verification-applications')
    }
}

const acceptApplication = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.doctorApplicationAccept(req.params.id)
        req.flash('success_msg', 'Doctor is verified and added to the Doctors List')
        res.redirect('/admin/dashboard')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/dashboard')
    }
}

const rejectApplication = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.doctorApplicationReject(req.params.id)
        req.flash('success_msg', 'Doctor is rejected.')
        res.redirect('/admin/dashboard')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/dashboard')
    }
}

// Appointments Page
const appointmentsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var pendingAppointments = await adminServices.getPendingAppointments()
    var confirmedAppointments = await adminServices.getConfirmedAppointments()
    var rejectedAppointments = await adminServices.getRejectedAppointments()
    var cancelledAppointments = await adminServices.getCancelledAppointments()
    res.render('admin/appointments', { title: 'Appointments', session: req.session, pendingAppointments, confirmedAppointments, rejectedAppointments, cancelledAppointments, err_msg, success_msg})
}

const appointmentDetailsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var apptDetails = await adminServices.getAppointmentDetails(req.params.id)
    var patientDetails = await userServices.checkUser(apptDetails.patientEmail)
    var doctorDetails = await userServices.checkUser(apptDetails.doctorEmail)
    var patientAge = await userServices.DOBToAge(patientDetails.dob)
    res.render('admin/single-appointment-view', { title: 'Appointments', session: req.session, err_msg, success_msg, apptDetails, patientDetails, patientAge, doctorDetails })
}


const acceptAppointment = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.appointmentAccept(req.params.id)
        req.flash('success_msg', 'Appointment is Confirmed')
        res.redirect('/admin/appointments')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/appointments')
    }
}

const rejectAppointment = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.appointmentReject(req.params.id)
        req.flash('success_msg', 'Appointment is Rejected')
        res.redirect('/admin/appointments')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/appointments')
    }
}

const deleteAppointment = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.appointmentDelete(req.params.id)
        req.flash('success_msg', 'Appointment is Deleted')
        res.redirect('/admin/appointments')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/appointments')
    }
}

const cancelAppointment = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.appointmentCancel(req.params.id)
        req.flash('success_msg', 'Appointment is Cancelled')
        res.redirect('/admin/appointments')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/appointments')
    }
}

// Doctors Page
const doctorsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var doctorsList = await adminServices.getDoctorList()
    var deletedDoctorList = await adminServices.getDeletedDoctorList()
    res.render('admin/doctor-list', { title: 'Doctors', session: req.session, err_msg, success_msg, doctorsList, deletedDoctorList })
}

const doctorDetailsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var doctorDetails = await userServices.checkUserId(req.params.id)
        var patientRecordsList = await adminServices.patienRecordsForDoctors(doctorDetails.email)
        var lastVisits = await adminServices.patientLastVisit(patientRecordsList)
        var countPatients = await adminServices.countPatient(doctorDetails.email)
        if (doctorDetails.dob == '' || doctorDetails.dob == null) {
            doctorDetails.dob = 'Not Provided'
        }
        res.render('admin/single-doctor-view', { title: 'Doctor', session: req.session, err_msg, success_msg, doctorDetails, patientRecordsList, countPatients, lastVisits })
    } catch (error) {
        throw error
    }
}

const deleteDoctor = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.deleteDoctor(req.params.id)
        req.flash('success_msg', 'Doctor is deleted and cannot login now')
        res.redirect('/admin/doctors-list')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/doctors-list')
    }
}

const acceptDoctor = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.allowDoctor(req.params.id)
        req.flash('success_msg', 'Doctor is allowed and can login now')
        res.redirect('/admin/doctors-list')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/doctors-list')
    }
}

// Patient Page
const patientPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    var patientList = await adminServices.getPatientList()
    var deletedPatientList = await adminServices.getDeletedPatientList()
    res.render('admin/patient-list', { title: 'Patients', session: req.session, err_msg, success_msg, patientList, deletedPatientList })
}

const patientDetailsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    let err_msg = req.flash('err_msg')
    let success_msg = req.flash('success_msg')
    if (!test) {
        return res.redirect('/login')
    }
    try {
        var patientDetails = await userServices.checkUserId(req.params.id)
        // var patientRecordDetails = await adminServices.getRecordDetails(req.params.id)
        var patientRecordsList = await adminServices.patienRecords(patientDetails.email)
        var patientAge = await userServices.DOBToAge(patientDetails.dob)
        var countVisits = await adminServices.countPatientVisits(patientDetails.email)
        res.render('admin/single-patient-view', { title: 'Patients', session: req.session, err_msg, success_msg, patientDetails, patientRecordsList, patientAge, countVisits })
    } catch (error) {
        throw error
    }
}

const deletePatient = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.deletePatient(req.params.id)
        req.flash('success_msg', 'Patient is deleted and cannot login now')
        res.redirect('/admin/patient-list')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/patient-list')
    }
}

const acceptPatient = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    try {
        await adminServices.allowPatient(req.params.id)
        req.flash('success_msg', 'Patient is allowed and can login now')
        res.redirect('/admin/patient-list')
    } catch (error) {
        req.flash('err_msg', 'Something went wrong. Please Try again Later')
        res.redirect('/admin/patient-list')
    }
}

// Medical Reports
const medicalReportsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    try {
        var medicalReportList = await userServices.getMedicalReports(req.session.re_usr_email)
        res.render('admin/medical-reports', { title: 'Medical Reports', session: req.session, err_msg, success_msg, medicalReportList })
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
        res.redirect('/admin/shared-reports')
    } catch (error) {
        console.log(error)
        req.flash('err_msg', 'Something went wrong. Please try again later') 
        res.redirect('/patient/medical-reports')
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
        res.render('admin/view-prescription', { title: 'Prescription', session: req.session, recordInformation, patientInfo, doctorInfo, patientAge })
    } catch (error) {
        req.flash('err_msg', 'Cannot load the report. Please try again later') 
        res.redirect('/admin/medical-reports')
    }
}

// Shared Reports
const sharedReportsPage = async (req, res) => {
    let test = req.session.is_user_logged_in;
    if (!test) {
        return res.redirect('/login')
    }
    let err_msg = req.flash('err_msg');
    let success_msg = req.flash('success_msg');
    try {
        var sharedReportsList = await userServices.getSharedMedicalReportList(req.session.re_usr_email)
        var receivedReportsList = await userServices.getReceivedMedicalReportList(req.session.re_usr_email)
        res.render('admin/shared-reports', { title: 'Shared Reports', session: req.session, err_msg, success_msg, sharedReportsList, receivedReportsList })
    } catch (error) {
        throw error
    }
}

// Exporting Modules
module.exports = {
    dashboard,
    applicationPage,
    appointmentsPage,
    singleApplicationPage,
    acceptApplication,
    rejectApplication,
    acceptAppointment,
    rejectAppointment,
    deleteAppointment,
    cancelAppointment,
    doctorsPage,
    doctorDetailsPage,
    deleteDoctor,
    acceptDoctor,
    patientPage,
    editProfile,
    deletePatient,
    acceptPatient,
    medicalReportsPage,
    submitShareReport,
    viewPrescriptionPage,
    sharedReportsPage,
    submitProfileChanges,
    passwordChangePage,
    passwordChange,
    patientDetailsPage,
    appointmentDetailsPage
}