import toast from "react-hot-toast";
import { authenticate } from "./helper";
/** Validate  Username */
export const usernameValidate = async (values) => {
  const errors = usernameVerify({}, values);

  if (values.username) {
    // Chechk user
    const { status } = await authenticate(values.username);

    if (status !== 200) {
      errors.exist = toast.error("User does not exist...!");
    }
  }

  return errors;
};

/** Validate  Password */
export const passwordValidate = async (values) => {
  const errors = passwordVerify({}, values);
  return errors;
};

/** Validate Reset Password */
export const resetPasswordValidate = async (values) => {
  const errors = passwordVerify({}, values);

  if (values.password !== values.confirm_pwd) {
    errors.exist = toast.error("Password not match...!");
  }

  return errors;
};

/** Validate Register */
export const registerValidate = async (values) => {
  const errors = usernameVerify({}, values);
  passwordVerify(errors, values);
  emailVerify(errors, values);

  return errors;
};

/** Validate Profile */
export const profileValidate = async (values) => {
  const errors = emailVerify({}, values);

  return errors;
};

/*********************************************************/

/** Function Validate Password */
const passwordVerify = (error = {}, values) => {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (!values.password) {
    error.password = toast.error("Password Required...!");
  } else if (values.password.includes(" ")) {
    error.password = toast.error("Wrong password...!");
  } else if (values.password.length < 4) {
    error.password = toast.error("Password must be more then 4 character...!");
  } else if (!specialChars.test(values.password)) {
    error.password = toast.error("Password must be have special character...!");
  }
  return error;
};

/** Function Validate Username */
const usernameVerify = (error = {}, values) => {
  if (!values.username) {
    error.username = toast.error("Username Required...!");
  } else if (values.username.includes(" ")) {
    error.username = toast.error("Invalid Username...!");
  }
  return error;
};

/** Function Validate Email */
const emailVerify = (error = {}, values) => {
  if (!values.email) {
    error.email = toast.error("email Required...!");
  } else if (values.email.includes(" ")) {
    error.email = toast.error("Wrong email...!");
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    error.email = toast.error("Invalid email address...!");
  }
  return error;
};
