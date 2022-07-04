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
    var pwd = document.getElementById('pwd').value
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