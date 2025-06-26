const jwt = require("jsonwebtoken");
const JWT_SECRET = "ASSIGNMENT";

const authenticate = (req, res, next) => {

  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res.status(401).json({"status":false, message: "Please login to continue" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid/Expired token" });
    req.user = user;
    next();
  });
};
module.exports = authenticate;
