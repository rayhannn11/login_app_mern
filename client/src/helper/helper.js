import axios from "axios";

import jwt_decode from "jwt-decode";

/**Make BackEnd Default Domain */
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;
/**Make API req use AXIOS */

/**Auth Function */
export const authenticate = async (username) => {
  try {
    return await axios.post("/api/authenticate", { username });
  } catch (error) {
    return { error: "username doesn't exist...!" };
  }
};

/**Get User Details From TOKEN Function */
export const getUserToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return Promise.reject("Can't find token...!");
  let decode = jwt_decode(token);

  return decode;
};

/**Get User Details Function */
export const getUser = async ({ username }) => {
  try {
    const { data } = await axios.get(`/api/user/${username}`);
    return { data };
  } catch (error) {
    return { error: "Password doesn't Match...!" };
  }
};

/**Register User Function */
export const registerUser = async (credentials) => {
  try {
    // Logik, pertama kita ngirim post untuk register ke backend
    const {
      data: { msg },
      status,
    } = await axios.post(`/api/register`, credentials);

    // Setelah register berhasil, kita ngirim post meth untuk ngirim email ke user

    let { username, email } = credentials;

    if (status === 201) {
      await axios.post(`/api/registerMail`, {
        username,
        userEmail: email,
        text: msg,
      });
    }

    return Promise.resolve(msg);
  } catch (error) {
    return Promise.reject({ error });
  }
};

/**Login Function */
export const login = async ({ username, password }) => {
  try {
    if (username) {
      const { data } = await axios.post(`/api/login`, { username, password });
      return Promise.resolve({ data });
    }
  } catch (error) {
    return Promise.reject({ error: "Password doesn't Match...!" });
  }
};

/**Update user profile Function */
export const updateUser = async (response) => {
  try {
    const token = await localStorage.getItem("token");
    const data = await axios.put("/api/updateuser", response, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return Promise.resolve({ data });
  } catch (error) {
    return Promise.reject({ error: "Couldn't Update Profile...!" });
  }
};

/**Generate OTP Function */
export const generateOTP = async (username) => {
  try {
    const {
      data: { code },
      status,
    } = await axios.get("/api/generateOTP", { params: { username } });

    // send mail with the OTP
    if (status === 201) {
      let {
        data: { email },
      } = await getUser({ username });
      let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
      await axios.post("/api/registerMail", {
        username,
        userEmail: email,
        text,
        subject: "Password Recovery OTP",
      });
    }
    return Promise.resolve(code);
  } catch (error) {
    return Promise.reject({ error });
  }
};

/**Verify OTP Function */
export const verifyOTP = async ({ username, code }) => {
  try {
    const { data, status } = await axios.get("/api/verifyOTP", {
      params: { username, code },
    });
    return { data, status };
  } catch (error) {
    return Promise.reject(error);
  }
};

/**Reset Password Function */
export const resetPassword = async ({ username, password }) => {
  try {
    const { data, status } = await axios.put("/api/resetPassword", {
      username,
      password,
    });
    return Promise.resolve({ data, status });
  } catch (error) {
    return Promise.reject({ error });
  }
};
