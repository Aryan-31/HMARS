const mongoose = require('mongoose')
const moment = require('moment')
const { Appointment } = require('../models/appointment')
const { userInfo } = require('../models/User')
const { medicalRecords } = require('../models/medicalRecord');
const userServices = require('../services/userServices')
// const { userInfo } = require("../models/User");

const fetchAppts = async (userEmail) => {
    var appts = await Appointment.find({ doctorEmail: userEmail, apptStatus: 'Confirmed' }).sort([['apptDateTime', 1]])
    var countAppointments = await Appointment.countDocuments({ doctorEmail: userEmail, apptStatus: 'Confirmed' })
    return { appts, countAppointments }
}

const patientDetails = async (id) => {
    var apptDetails = await Appointment.findById(id)
    var userDetails = await userInfo.findOne({ email: apptDetails.patientEmail }) 
    return userDetails
}


const prescriptionList = async (prescriptionDetails) => {
    var RxDetails = []
    for (let i = 0; i < prescriptionDetails.medicineName.length; i++) {
        var medicineObj = {
            medicineName: prescriptionDetails.medicineName[i],
            dosage: prescriptionDetails.dosage[i],
            timing: prescriptionDetails.timing[i],
            frequency: prescriptionDetails.frequency[i],
            duration: prescriptionDetails.duration[i]
        }
        RxDetails.push(medicineObj)
    }
    var diagnosis =  prescriptionDetails.diagnosis
    return { diagnosis, RxDetails}
}

const prescribe = async (prescriptionDetails, user, doctorName, doctorEmail) => {
    var dateVisited = await userServices.getDate()
    var RxObj = {
        patientName: user.name,
        email: user.email,
        doctorName: doctorName,
        doctorEmail: doctorEmail,
        visitedOn: dateVisited,
        diagnosis: prescriptionDetails.diagnosis,
        medicines: prescriptionDetails.RxDetails
    }
    try {
        const medRecord = new medicalRecords(RxObj)
        medRecord.save()
        return medRecord
    } catch (error) {
        throw error
    }
}

const appointmentDelete = async (id) => {
    await Appointment.findByIdAndDelete(id)
}

const patientList = async (email) => {
    var yourPatients = await medicalRecords.find({ doctorEmail: email }, 'patientName email')
    return yourPatients
}

const patientLastVisit = async (patientList) => {
    var lastVisits = []
    for (let i = 0; i < patientList.length; i++) {
        var lastVisit = await medicalRecords.find( {email: patientList[i].email}, 'visitedOn' ).sort([['visitedOn', -1]]).limit(1)
        lastVisits.push(lastVisit[0])
    }
    return lastVisits
}

const countPatientVisits = async (patientEmail, doctorEmail) => {
    var countVisits = await medicalRecords.countDocuments( {email: patientEmail, doctorEmail: doctorEmail} )
    return countVisits
}

const getRecordDetails = async (id) => {
    var details = await medicalRecords.findById(id)
    return details
}

const patienRecords = async (patientEmail, doctorEmail) => {
    var records = await medicalRecords.find({ email: patientEmail, doctorEmail: doctorEmail})
    return records
}

module.exports = {
    fetchAppts,
    patientDetails,
    prescriptionList,
    prescribe,
    appointmentDelete,
    patientList,
    patientLastVisit,
    countPatientVisits,
    getRecordDetails,
    patienRecords
}