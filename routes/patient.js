var express = require('express');
var router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const patientControllers = require('../controllers/patientControllers')
const userControllers = require('../controllers/userControllers')

router.use(flash());
router.use(session({ 
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));


/* GET Dashboard page. */
router.get('/dashboard', patientControllers.dashboard);

// Edit Profile
router.get('/edit-profile', patientControllers.editProfilePage);

router.post('/submit-profile-changes', patientControllers.submitProfileChanges);

// Change Password Page
router.get('/change-password', patientControllers.passwordChangePage);

router.post('/submit-change-password', patientControllers.passwordChange);

// Book Appointment
router.get('/bookAppt',  patientControllers.apptPage);

router.post('/bookAppt/getDoctor', patientControllers.searchDoc)

router.post('/submit-appt',  patientControllers.submitAppt);

// See Appointment
router.get('/seeAppt',  patientControllers.seeAppt);

router.get('/deleteAppt/:id',  patientControllers.deleteAppt);

router.get('/cancelAppointment/:id',  patientControllers.cancelAppointment);

// Edit Appointment
router.get('/edit-appointment/:id', patientControllers.editAppointmentPage)

router.post('/submit-edit-appointment', patientControllers.submitEditAppointment)

// Medical Reports
router.get('/medReports', patientControllers.medReports);

router.post('/medReports/share/getUser', userControllers.searchUser)

router.post('/share-report', patientControllers.submitShareReport);


router.get('/view-prescription/:id', patientControllers.viewPrescriptionPage);

// Shared Reports
router.get('/sharedRep', patientControllers.sharedReports);

// router.post('/remove-share-report', patientControllers.removeSharedReport);

// Logout User
router.get('/logout', userControllers.userLogOut);

module.exports = router;
