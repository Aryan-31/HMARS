// Show/Hide Extra Fields for different Roles
function doctorExtraInfo(userRole) {
    if (userRole.value === 'doctor') {
        return document.getElementById('doctor-extra-fields').style.display = 'flex'
    }
    document.getElementById('doctor-extra-fields').style.display = 'none'
}

function validateName(name) {
    var nm = document.getElementById('error-name')
    if (name ==="") {
        nm.innerHTML="Please Enter you Full Name"
        nm.style.display="block";
    }
}

function validateRole(role) {
    var userRole = document.getElementById('error-role')
    if (role === "") {
        userRole.innerHTML="Please Enter you Full Name"
        userRole.style.display="block";
    }
}

function alphabetsOnly() {
    var key;
    if (window.event){
        key = window.event.keyCode;
    } 
    if ((key >= 65 && key <= 90) || (key>=97 && key<=122) || key===32){
        return true;
    } else{
        return false;
    }
}

function validateEmail(email) {
    var eml = document.getElementById('error-email')
    if (email ==="") {
        eml.innerHTML="Email cannot be empty"
        eml.style.display="block";
    }else{
        if (email.indexOf('@')<1) {
            eml.innerHTML = "Email should contain @ before domain name"
            eml.style.display="block";
        }
        if (email.lastIndexOf('.')<= (email.indexOf('@')+1)) {
            eml.innerHTML = "Email should contain dot(.) after domain name"
            eml.style.display="block";
        }
    }
}

function validatePassword(password) {
    var pwd = document.getElementById('error-password')
    if (password ==="") {
        pwd.innerHTML="Password cannot be empty"
        pwd.style.display="block";
    }else{
        if (password.length<8) {
            pwd.innerHTML="Password must be atleast 8 characters"
            pwd.style.display="block";
        } 
    }
}
function validateCnfPassword(cnfPassword) {
    var pwd = document.getElementById('password').value
    var cnfpwd = document.getElementById('error-cnf-password')
    if (cnfPassword==="") {
        cnfpwd.innerHTML="Confirm Password cannot be empty"
        cnfpwd.style.display="block";
    } else {
        if (cnfPassword != pwd) {
            cnfpwd.innerHTML="Password does not match"
            cnfpwd.style.display="block";
        }
    }
}

function validateMobile(mobile) {
    var mob = document.getElementById('error-mobile')
    if (mobile === "") {
        mob.innerHTML="Enter mobile number"
        mob.style.display="block";
    } else {
        if (mobile.length<10 || mobile.length>13) {
            mob.innerHTML="Enter valid Mobile Number"
            mob.style.display="block";
        }
    }
}
function numOnly() {
    var key;
    if (window.event){
        key = window.event.keyCode;
    } 
    if ((key >= 48 && key <= 57)|| key===43){
        return true;
    } else{
        return false;
    }
}