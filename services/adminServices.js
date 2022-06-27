// const mongoose = require('mongoose')
const moment = require('moment')
const { Appointment } = require('../models/appointment')
const { userInfo } = require("../models/User");
const { medicalRecords } = require("../models/medicalRecord");

const getPendingApplications = async () => {
    var pendingApplications = await userInfo.find({ role: 'doctor', adminVerification: 'pending' }).sort(['created_at', -1])
    return pendingApplications
}
// Dashboard Services
const pendingApplicationsCount = async () => {
    var countPendingApplications = await userInfo.countDocuments({ role: 'doctor', adminVerification: 'pending' })
    return countPendingApplications
}

const doctorCount = async () => {
    var countDoctors = await userInfo.countDocuments({ role: 'doctor', adminVerification: 'verified' })
    return countDoctors
}

const patientCount = async () => {
    var countPatient = await userInfo.countDocuments({ role: 'patient', email_verify_status: 'Verified' })
    return countPatient
}

const appointmentCount = async () => {
    var countAppointments = await Appointment.countDocuments({ apptStatus: 'Confirmed' })
    return countAppointments
}

// Appointments Services
const getAppointmentDetails = async (id) => {
    var apptDetails = await Appointment.findById(id)
    return apptDetails
}

const getPendingAppointments = async () => {
    var pendingAppointments = await Appointment.find({ apptStatus: 'Pending' }).sort([['created_at', -1]])
    return pendingAppointments
}

const getConfirmedAppointments = async () => {
    var confirmedAppointments = await Appointment.find({ apptStatus: 'Confirmed' }).sort([['created_at', -1]])
    return confirmedAppointments
}

const getRejectedAppointments = async () => {
    var rejectedAppointments = await Appointment.find({ apptStatus: 'Rejected' }).sort([['created_at', -1]])
    return rejectedAppointments
}

const getCancelledAppointments = async () => {
    var cancelledAppointments = await Appointment.find({ apptStatus: 'Cancelled' }).sort([['created_at', -1]])
    return cancelledAppointments
}

const appointmentAccept = async (id) => {
    await Appointment.findByIdAndUpdate(id, { apptStatus: 'Confirmed' })
}

const appointmentReject = async (id) => {
    await Appointment.findByIdAndUpdate(id, { apptStatus: 'Rejected' })
}

const appointmentDelete = async (id) => {
    await Appointment.findByIdAndDelete(id)
}

const appointmentCancel = async (id) => {
    await Appointment.findByIdAndUpdate(id, { apptStatus: 'Cancelled' })
}

// Application Services
const getRejectedApplications = async () => {
    var rejectedApplications = await userInfo.find({ role: 'doctor', adminVerification: 'rejected' }).sort([['created_at', 1]])
    return rejectedApplications
}

const doctorApplicationAccept = async (id) => {
    await userInfo.findByIdAndUpdate(id, { adminVerification: 'verified'})
}

const doctorApplicationReject = async (id) => {
    await userInfo.findByIdAndUpdate(id, { adminVerification: 'rejected'})
}


// Doctors Services
const formattedDateTime = async () => {
    var todaysDate = new Date
    return moment(todaysDate).format('DD/MM/YYYY hh:mm a') 
}

const getDoctorList = async () => {
    var verifiedDoctorsList = await userInfo.find( { role: 'doctor', adminVerification: 'verified'}).sort([['name', 1]])
    return verifiedDoctorsList
}

const getDeletedDoctorList = async () => {
    var deletedDoctorsList = await userInfo.find( { role: 'doctor', adminVerification: 'deleted'}).sort([['name', 1]])
    return deletedDoctorsList
}

// For Doctors details
const countPatient = async (email) => {
    var countPatients = await medicalRecords.countDocuments( {doctorEmail: email} )
    // .distinct('email')
    // var countPatients = distinctPatients.length
    return countPatients
}

const patienRecordsForDoctors = async (email) => {
    var records = await medicalRecords.find({ doctorEmail: email })
    return records
}

const patientLastVisit = async (patientList) => {
    var lastVisits = []
    for (let i = 0; i < patientList.length; i++) {
        var lastVisit = await medicalRecords.find( {email: patientList[i].email}, 'visitedOn' ).sort([['visitedOn', -1]]).limit(1)
        lastVisits.push(lastVisit[0])
    }
    return lastVisits
}

const deleteDoctor = async (id) => {
    var formattedDate = (await formattedDateTime()).toString()
    var updateInfo = {
        adminVerification: 'deleted',
        deleted: '1', 
        deleted_by: 'Admin',
        deleted_at: formattedDate
    }
    await userInfo.findByIdAndUpdate(id, updateInfo)
}

const allowDoctor = async (id) => {
    var formattedDate = (await formattedDateTime()).toString()
    var updateInfo = {
        adminVerification: 'verified',
        deleted: '0', 
        deleted_by: null,
        deleted_at: null,
        updated_at: formattedDate
    }
    await userInfo.findByIdAndUpdate(id, updateInfo)
}

// Patient Services
const getPatientList = async () => {
    var verifiedPatientsList = await userInfo.find( { role: 'patient', deleted: '0' }).sort([['name', 1]])
    return verifiedPatientsList
}

const getDeletedPatientList = async () => {
    var deletedPatientsList = await userInfo.find( { role: 'patient', deleted: '1'}).sort([['name', 1]])
    return deletedPatientsList
}

const deletePatient = async (id) => {
    var formattedDate = (await formattedDateTime()).toString()
    var updateInfo = {
        adminVerification: 'deleted',
        deleted: '1', 
        deleted_by: 'Admin',
        deleted_at: formattedDate
    }
    await userInfo.findByIdAndUpdate(id, updateInfo)
}

const allowPatient = async (id) => {
    var formattedDate = (await formattedDateTime()).toString()
    var updateInfo = {
        adminVerification: 'verified',
        deleted: '0', 
        deleted_by: null,
        deleted_at: null,
        updated_at: formattedDate
    }
    await userInfo.findByIdAndUpdate(id, updateInfo)
}

const countPatientVisits = async (patientEmail) => {
    var countVisits = await medicalRecords.countDocuments( {email: patientEmail} )
    return countVisits
}

const patienRecords = async (email) => {
    var records = await medicalRecords.find({ email: email })
    return records
}



module.exports = {
    getPendingApplications,
    pendingApplicationsCount,
    getRejectedApplications,
    getPendingAppointments,
    getConfirmedAppointments,
    getRejectedAppointments,
    getCancelledAppointments,
    doctorCount,
    patientCount,
    appointmentCount,
    doctorApplicationAccept,
    doctorApplicationReject,
    getAppointmentDetails,
    appointmentAccept,
    appointmentReject,
    appointmentDelete,
    appointmentCancel,
    getDoctorList,
    getDeletedDoctorList,
    deleteDoctor,
    allowDoctor,
    getPatientList,
    getDeletedPatientList,
    deletePatient,
    allowPatient,
    countPatientVisits,
    patienRecords,
    countPatient,
    patienRecordsForDoctors,
    patientLastVisit
}