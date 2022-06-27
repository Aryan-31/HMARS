var mongoose = require('mongoose');

const validator = require('validator');

/**********RegistrationSchema**********/
var RegistrationSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} Entered Invalid Email'
        }
    },
    mobile_no: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'patient'],
        required: true
    },
    email_verify_status: {
        type: String,
        default: 'Pending'
    },
    address: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    pincode: {
        type: String,
        default: null
    },
    dob: {
        type: String,
        default: null
    },
    password: {
        type: String,
    },
    created_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    },
    deleted_by: {
        type: String,
        default: null
    },
    updated_at: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    deleted: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    profile_image: {
        type: String,
    },
    otp: {
        type: String,
        default: null
    },
    auth: {
        type: String,
        enum: ['email', '2fa'],
        default: 'email'
    },
    licenseNumber: {
        type: String
    },
    specialisation: {
        type: String
    },
    adminVerification: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'deleted'],
        default: 'pending'
    }
});

var userInfo = mongoose.model('User', RegistrationSchema);

module.exports = {
    userInfo: userInfo
};