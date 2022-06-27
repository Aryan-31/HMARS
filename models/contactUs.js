const mongoose = require('mongoose')

const contactUsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
    }
}, { timestamps: true })

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = {
    ContactUs
}