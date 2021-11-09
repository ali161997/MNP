const organizations = ["vodafone", "etisalat", "orange"]
const auth = (req, res, next) => {
    const organization = req.headers.organization
    organizations.includes(organization) ? next() : res.send('you hava to authenticate!')
}

module.exports = auth;