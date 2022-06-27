const { Router } = require('express');
var express = require('express');
var router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const adminControllers = require('../controllers/adminControllers')
const userControllers = require('../controllers/userControllers')

router.use(flash());
router.use(session({ 
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));

router.get('/dashboard', adminControllers.dashboard)

// Routes for Edit Profile Page
router.get('/edit-profile', adminControllers.editProfile)

router.post('/submit-profile-changes', adminControllers.submitProfileChanges)

// Routes for Change Password Page
router.get('/change-password', adminControllers.passwordChangePage)

router.post('/submit-change-password', adminControllers.passwordChange);

// Routes for Application Page
router.get('/doctor-verification-applications', adminControllers.applicationPage)

router.get('/accept-application/:id', adminControllers.acceptApplication)

router.get('/reject-application/:id', adminControllers.rejectApplication)

// Routes for Appointment Page
router.get('/appointments', adminControllers.appointmentsPage)

router.get('/appointment-details/:id', adminControllers.appointmentDetailsPage)

router.get('/accept-appointment/:id', adminControllers.acceptAppointment)

router.get('/reject-appointment/:id', adminControllers.rejectAppointment)

router.get('/delete-appointment/:id', adminControllers.deleteAppointment)

router.get('/cancel-appointment/:id', adminControllers.cancelAppointment)

// Routes for Doctors Page
router.get('/doctors-list', adminControllers.doctorsPage)

router.get('/doctor-details/:id', adminControllers.doctorDetailsPage)

router.get('/accept-doctor/:id', adminControllers.acceptDoctor)

router.get('/delete-doctor/:id', adminControllers.deleteDoctor)

// routes for Patient Page 
router.get('/patient-list', adminControllers.patientPage)

router.get('/patient-details/:id', adminControllers.patientDetailsPage)

router.get('/accept-patient/:id', adminControllers.acceptPatient)

router.get('/delete-patient/:id', adminControllers.deletePatient)

// Route for Medical Records
router.get('/medical-reports', adminControllers.medicalReportsPage)

router.post('/medReports/share/getUser', userControllers.searchUser)

router.post('/share-report', adminControllers.submitShareReport);

router.get('/view-prescription/:id', adminControllers.viewPrescriptionPage);

// Route for Shared Records
router.get('/shared-reports', adminControllers.sharedReportsPage)

// Route for logout page
router.get('/logout', userControllers.userLogOut);

module.exports = router