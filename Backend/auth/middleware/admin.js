const {JWT_SECRET} = require("../config");
const jwt = require("jsonwebtoken");
const {User, Movies, embeddedMovies } = require("../db");
async function adminMiddleware(req, res, next) {
    if (req.role !== 'admin') {
        return res.status(403).json({msg:'Access denied. Only Admin can access this route.' });
    }
    next();
}

module.exports = adminMiddleware;