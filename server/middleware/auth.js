import jwt from "jsonwebtoken";
import ENV from "../config.js";
/**Auth Middleware */
export default async function Auth(req, res, next) {
  try {
    //Meminta access dengan memasukan token
    const token = req.headers.authorization.split(" ")[1];

    //retrive the user details for the loggin user
    const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).send({ error: "Auth Failed...!" });
  }
}

export function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };

  next();
}
