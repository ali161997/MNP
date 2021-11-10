const { StatusCodes } = require('http-status-codes')
const organizations = ["vodafone", "etisalat", "orange"]

//Mock the authentication and the authorization
const auth = (req, res, next) => {
    const organization = req.headers.organization
    organizations.includes(organization) ? next() : res.status(StatusCodes.FORBIDDEN).send('you hava to authenticate!')
}
module.exports = auth;