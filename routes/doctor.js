var express = require('express');
var router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const doctorControllers = require('../controllers/doctorControllers')
const userControllers = require('../controllers/userControllers')

router.use(flash());
router.use(session({ 
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));


// Route for dashboard
router.get('/dashboard', doctorControllers.dashboard);

// Edit Profile
router.get('/edit-profile', doctorControllers.editProfilePage);

router.post('/submit-profile-changes', doctorControllers.submitProfileChanges);

// Change Password Page
router.get('/change-password', doctorControllers.passwordChangePage);

router.post('/submit-change-password', doctorControllers.passwordChange);

// Routes for Appointments
router.get('/seeAppt',  doctorControllers.seeAppt);

router.get('/cancel-appointment/:id',  doctorControllers.cancelAppointment);

router.get('/write-prescription/:id',  doctorControllers.writePrescriptionPage);

router.post('/submit-prescription',  doctorControllers.submitPrescription);

// Routes for Patient List
router.get('/patientList', doctorControllers.patientList);

router.get('/patient-details/:id', doctorControllers.patientDetailsPage)

// Routes for Medical Reports
router.get('/medReports', doctorControllers.medReports);

router.post('/medReports/share/getUser', userControllers.searchUser)

router.post('/share-report', doctorControllers.submitShareReport);

router.get('/view-prescription/:id', doctorControllers.viewPrescriptionPage);

// Routes for Shared Reports 
router.get('/sharedRep', doctorControllers.sharedReports);

// Route for Logout 
router.get('/logout', userControllers.userLogOut);

module.exports = router;
