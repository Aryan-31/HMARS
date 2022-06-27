// Show/Hide Extra Fields for different Roles
function doctorExtraInfo(userRole) {
    console.log(userRole.value)
    if (userRole.value === 'doctor') {
        return document.getElementById('doctor-extra-fields').style.display = 'flex'
    }
    document.getElementById('doctor-extra-fields').style.display = 'none'
}
