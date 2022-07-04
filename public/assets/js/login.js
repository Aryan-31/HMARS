function validateEmail(email) {
    eml = document.getElementById('error-email')
    if (email ==="") {
        eml.innerHTML="Email cannot be empty"
        eml.style.display="block";
    }else{
        if (email.indexOf('@')<1) {
            eml.innerHTML = "Email should contain @ before domain name"
            eml.style.display="block";
        }
        if (email.lastIndexOf('.')<= email.indexOf('@')) {
            eml.innerHTML = "Email should contain dot(.) after domain name"
            eml.style.display="block";
        }
    }
}

function validatePassword(password) {
    pwd = document.getElementById('error-password')
    if (password ==="") {
        pwd.innerHTML="Password cannot be empty"
        pwd.style.display="block";
    }
}