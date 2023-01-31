import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";

/**Middleware Verify User */
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    //Chechk user exist
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "User doesn't exist" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Auth Error" });
  }
}

/** REGISTER */

/** POST: http://localhost:5000/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/

/** POST: http://localhost:5000/api/register  */
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    // check the existing user
    const existUsername = new Promise((resolve, reject) => {
      UserModel.findOne({ username }, function (err, user) {
        if (err) reject(new Error(err));
        if (user) reject({ error: "Please use unique username" });

        resolve();
      });
    });

    // check for existing email
    const existEmail = new Promise((resolve, reject) => {
      UserModel.findOne({ email }, function (err, email) {
        if (err) reject(new Error(err));
        if (email) reject({ error: "Please use unique Email" });

        resolve();
      });
    });

    Promise.all([existUsername, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
              });

              // return save result as a response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: "User Register Successfully" })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error });
      });
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** LOGIN */

/** POST: http://localhost:5000/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}

*/
/** POST: http://localhost:5000/api/login  */
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Don't have Password" });

            //create jwt token
            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful...!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET ALL USER */

//GET ALL USER INFORMATION
/** GET: http://localhost:5000/api/user/rayhan123  */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username)
      return res.status(501).send({ error: "Invalid Username...!" });

    UserModel.findOne({ username }, function (err, user) {
      if (err) return res.status(500).send({ error });
      if (!user)
        return res.status(501).send({ error: "Couldn't find a User...!" });

      //Remove Password from User
      //Moongose return unscery data and convert into json
      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: "Can't find user Data...!" });
  }
}

/** PUT: http://localhost:5000/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
/** PUT: http://localhost:5000/api/updateuser  */
export async function updateUser(req, res) {
  try {
    // const id = req.query.id;

    const { userId } = req.user;

    if (userId) {
      //Ambil data yang mao di update
      const body = req.body;
      //Then Update ID
      UserModel.updateOne({ _id: userId }, body, function (err, data) {
        if (err) throw err;

        return res.status(201).send({ msg: "Record Updated...!" });
      });
    } else {
      return res.status(401).send({ error: "User not Found...!" });
    }
  } catch (error) {
    res.status(401).send({ error });
  }
}

/** GET: http://localhost:5000/api/generateOTP  */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:5000/api/verifyOTP  */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //Kita membuat nilai OTP null seperti semula
    req.app.locals.resetSession = true; //Nilai reset seassion true syarat bisa reset PWD

    return res.status(201).send({ msg: "Verify sucessfuly...!" });
  }
  return res.status(400).send({ msg: "Invalid OTP...!" });
}

//Succes redirect user to reset password when OTP valid
/** GET: http://localhost:5000/api/createResetSession  */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ msg: "Session Expired...!" });
}

/** PUT: http://localhost:5000/api/resetPassword  */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ msg: "Session Expired...!" });
    }

    const { username, password } = req.body;

    try {
      UserModel.findOne({ username })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              UserModel.updateOne(
                { username: user.username },
                { password: hashedPassword },
                function (err, data) {
                  if (err) throw err;
                  req.app.locals.resetSession = false; // reset session
                  return res.status(201).send({ msg: "Record Updated...!" });
                }
              );
            })
            .catch((e) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "Username not Found" });
        });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
