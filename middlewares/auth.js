const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }

    const token = authHeader.split(" ")[1]; 

    if (!token) {
      return res.status(401).json({ message: "Invalid Authorization Header." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "Admin") { return res.status(403).json({ message: "Access denied, You are not Authorized" })}
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

module.exports = { Auth, isAdmin };
