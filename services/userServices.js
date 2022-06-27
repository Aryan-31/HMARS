const crypto = require('crypto')
const moment = require('moment')
const { userInfo } = require("../models/User");
const { ContactUs } = require("../models/contactUs");
const { medicalRecords } = require('../models/medicalRecord')

const addContactUs = async (details) => {
  const detailsObj = {
    name: details.name,
    email: details.email,
    subject: details.subject,
    message: details.message
  };
  try {
    const contactUsInfo = new ContactUs(detailsObj);
    await contactUsInfo.save();
    return detailsObj;
  } catch (error) {
    throw error;
  }
}

const checkUserId = async (user_id) => {
  let user = await userInfo.findById(user_id);
  return user
};

const checkUser = async (email) => {
  let regex = new RegExp(email, "i");
  let user = await userInfo.findOne({ email: regex });
  if (user) {
    return user;
  }
};

const createCipher = async (text) => {
  try {
    let mykey1 = crypto.createCipher("aes-128-cbc", "mypass");
    let mystr1 = mykey1.update(text, "utf8", "hex");
    mystr1 += mykey1.final("hex");
    return mystr1;
  } catch (error) {
    throw error;
  }
};

const createAtTimer = async () => {
  try {
    let indiaTime1 = new Date().toLocaleString("en-US");
    let indiaTime = new Date(indiaTime1);
    let created_at = indiaTime.toLocaleString();
    return created_at;
  } catch (error) {
    throw error;
  }
};

const generateOTP = async () => {
  let otp = Math.floor(Math.random() * 900000) + 100000;
  return otp
}

const getOTP = async (userEmail) => {
  try {
    otp = await userInfo.findOne({ email: userEmail}, 'otp')
    return otp
  } catch (error) {
    throw error
  }
}

const updateOTP = async (userEmail) => {
  let newOTP = await generateOTP()
  try {
    await userInfo.findOneAndUpdate({ email: userEmail }, { otp: newOTP })
    return newOTP
  } catch (error) {
    throw error
  }
}

const addUser = async (userDetails, pass, created) => {
  const userObject = {
    name: userDetails.name,
    email: userDetails.email,
    mobile_no: userDetails.mobNo,
    role: userDetails.userRole,
    password: pass,
    status: 'active',
    created_at: created,
    licenseNumber: userDetails.lN,
    specialisation: userDetails.specialisation
  };
  try {
    const user = new userInfo(userObject);
    await user.save();
    return userObject;
  } catch (error) {
    throw error;
  }
};

const checkUserPass = async (email, password) => {
  try {
    let regex = new RegExp(email, "i");
    let user = await userInfo.findOne({ email: regex, password: password });
    if (user) {
      return user;
    }
  } catch (error) {
    throw error;
  }
};

const searchUserList = async (payload) => {
  var searchRes = await userInfo.find({
    $or: [
      {
        'name': {$regex: new RegExp('^'+payload+'.*','i')}
      },
      {
        'email': {$regex: new RegExp('^'+payload+'.*','i')}
      }
  ]}).exec()
  // limit results
  if (searchRes.length >= 5) {
      searchRes = searchRes.slice(0,5)
      return searchRes
  }
  if (searchRes.length < 1) {
      return "No User Found"
  }
  searchRes = searchRes.slice(0,searchRes.length)
  return searchRes
}

// Edit Profile Page
const updateProfile = async (email, userDetails) => {
  var profileChangeObj = {
      name: userDetails.name,
      mobile_no: userDetails.mobile_no,
      gender: userDetails.gender,
      dob: userDetails.dob,
      address: userDetails.address,
      city: userDetails.city,
      state: userDetails.state,
      country: userDetails.country,
      pincode: userDetails.pincode
  }
  await userInfo.findOneAndUpdate({ email: email }, profileChangeObj)
}

const validateDOB = async (dob) => {
  const DOBRegex = new RegExp('^[0-9]{2}[\/]{1}[0-9]{2}[\/]{1}[0-9]{4}')
  return DOBRegex.test(dob)
}

const validateMobileNo = async (mobile_no) => {
  const MobNoRegex = new RegExp('^[1-9]{1}[0-9]{9}')
  return MobNoRegex.test(mobile_no)
}

const getDate = async () => {
  var date = new Date()
  return moment(date).format('DD/MM/YYYY hh:mm a')
}

// Medical reports
const getMedicalReports = async (email) => {
  var reportsList = await medicalRecords.find( {email: email} ).sort([['visitedOn', -1]])
  return reportsList
}

const countMedicalReports = async (email) => {
  var countMedicalReport = await medicalRecords.countDocuments( {email: email} )
  return countMedicalReport
}

const DOBToAge = async (dob) => {
  if (dob == '' || dob == null) {
      var age = 'Not Provided'
      return age
  }
  var todaysDate = new Date()
  var year = todaysDate.getFullYear()
  var dobYear = moment(dob, 'DD/MM/YYYY hh:mm a').year()
  var dobMonth = moment(dob, 'DD/MM/YYYY hh:mm a').month()
  var dobDate = moment(dob, 'DD/MM/YYYY hh:mm a').date()
  age = year - dobYear
  var m = todaysDate.getMonth() - dobMonth;
  if (m < 0 || (m === 0 && todaysDate.getDate() < dobDate)) {
      age--;
  }
  return age;
}

// Change Password
const changePassword = async (email, newPass) => {
  await userInfo.findOneAndUpdate({ email: email }, { password: newPass })
}

// View Prescription
const getRecordInformation = async (id) => {
  var recordInformation = await medicalRecords.findById(id)
  return recordInformation
}

// Share Reports
const getReceivedMedicalReportList = async (userEmail) => {
  var receivedReports = await medicalRecords.find({ accessTo: { $elemMatch: {email: userEmail} } })
  return receivedReports
}

const getSharedMedicalReportList = async (userEmail) => {
  var sharedReports = await medicalRecords.find({ email: userEmail, "accessTo.0": {"$exists": true } })
  return sharedReports
}

const updateShareReport = async (details) => {
  var sharedUser = await checkUser(details.sharedTo)
  var shareUserDetailsObj = {
    email: details.sharedTo,
    name: sharedUser.name,
    message: details.message
  }
  await medicalRecords.findByIdAndUpdate(details.reportID, { $push: {accessTo: shareUserDetailsObj} })
}

// const shareReportRemove = async (id) => {
//   await medicalRecords.findByIdAndRemove(id)
// }

module.exports = {
  addContactUs,
  checkUserId,
  checkUser,
  createCipher,
  createAtTimer,
  addUser,
  checkUserPass,
  searchUserList,
  getOTP,
  updateOTP,
  updateProfile,
  validateDOB,
  validateMobileNo,
  getDate,
  getMedicalReports,
  countMedicalReports,
  DOBToAge,
  changePassword,
  getRecordInformation,
  getReceivedMedicalReportList,
  getSharedMedicalReportList,
  updateShareReport,
  // shareReportRemove
};
