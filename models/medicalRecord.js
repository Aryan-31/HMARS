var mongoose = require('mongoose');

const validator = require('validator');

/**********Medical Records Schema**********/
var medicalRecordSchema = mongoose.Schema({
    patientName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    doctorEmail: {
        type: String,
        required: true
    },
    visitedOn: {
        type: String,
        required: true
    },
    recordType: {
        type: String,
        enum: ['Prescription'],
        default: 'Prescription',
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    medicines: [
        {
            medicineName: {
                type: String,
                required: true
            },
            dosage: {
                type: String,
                required: true
            },
            timing: {
                type: String,
                required: true
            },
            frequency: {
                type: String,
                required: true
            },
            duration: {
                type: String,
                required: true
            }
        }
    ],
    accessTo: [
        {
            name: String,
            email: String,
            message: String
        }
    ],
    dataURL:{
        type: String
    } 
});

var medicalRecords = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = {
    medicalRecords: medicalRecords
};