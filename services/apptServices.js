const mongoose = require('mongoose')
const moment = require('moment')
const { Appointment } = require('../models/appointment')
const { userInfo } = require("../models/User");


const bookAppt = async (apptDetails) => {
    var dateTime = moment(apptDetails.apptDateTime).format('DD/MM/YYYY hh:mm a')
    const apptDetailsObj = {
        patientName: apptDetails.pName,
        patientEmail: apptDetails.pEmail,
        doctorName: apptDetails.dName,
        doctorEmail: apptDetails.dEmail,
        apptDateTime: dateTime,
        reason: apptDetails.reason,
        description: apptDetails.desc
    }
    try {
        const apptDetails = new Appointment(apptDetailsObj)
        apptDetails.save()
        return apptDetailsObj
    } catch (error) {
        throw error
    }
}

const getAppointment = async (id) => {
    var appt = await Appointment.findById(id)
    var doctor = await userInfo.findOne({ email: appt.doctorEmail })
    return { appt, doctor }
}

const updatedAppointment = async (apptDetails) => {
    var dateTime = moment(apptDetails.apptDateTime).format('DD/MM/YYYY hh:mm a')
    const apptDetailsObj = {
        patientName: apptDetails.pName,
        apptDateTime: dateTime,
        reason: apptDetails.reason,
        description: apptDetails.desc,
        apptStatus: 'Pending'
    }
    await Appointment.findByIdAndUpdate(apptDetails.appointmentID, apptDetailsObj)
}

const searchDoctor = async (payload) => {
    var searchRes = await userInfo.find({
        name: {$regex: new RegExp('^'+payload+'.*','i')}, 
        role: 'doctor',
        adminVerification: 'verified'
    }).exec()
    // limit results
    if (searchRes.length >= 5) {
        searchRes = searchRes.slice(0,5)
        return searchRes
    }
    searchRes = searchRes.slice(0,searchRes.length)
    return searchRes
}

const checkAppt = async (patientName, doctorName, apptDate, apptTime) => {
    await Appointment.findOne({ patientName: patientName, doctorName: doctorName, apptDate:apptDate, apptTime: apptTime}).then((result) => {
        return result
    }).catch((error) => {
        return error
    })
}

const fetchAppts = async (userEmail) => {
    var appts = await Appointment.find({ patientEmail: userEmail }).sort([['apptDateTime', 1]])
    var countAppointments = await Appointment.countDocuments({ patientEmail: userEmail })
    return { appts, countAppointments }
}

const appointmentCancel = async (id) => {
    await Appointment.findByIdAndUpdate(id, { apptStatus: 'Cancelled' })
}

module.exports = {
    bookAppt,
    getAppointment,
    searchDoctor,
    checkAppt,
    fetchAppts,
    appointmentCancel,
    updatedAppointment
}