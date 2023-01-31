import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatar from "../assets/profile.png";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { profileValidate } from "../helper/validate";
import convertToBase64 from "../helper/convert";
import useFetch from "../hooks/fetch.hook";
import { updateUser } from "../helper/helper";

import styles from "../styles/Username.module.css";
import extend from "../styles/Profile.module.css";

const Profile = () => {
  const [file, setFile] = useState();

  const [{ isLoading, apiData, serverError }] = useFetch();

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: apiData?.firstName || "",
      lastName: apiData?.lastName || "",
      email: apiData?.email || "",
      mobile: apiData?.mobile || "",
      address: apiData?.address || "",
    },
    enableReinitialize: true,
    validate: profileValidate,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      values = await Object.assign(values, {
        profile: file || apiData.profile || "",
      });
      let updatePromise = updateUser(values);

      toast.promise(updatePromise, {
        loading: "Updating...",
        success: <b>Update Successfuly...!</b>,
        error: <b>Update failed...!</b>,
      });
    },
  });

  /**Logout Function */

  const userLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /**Formik Doesnt support file upload create handleConverter Image */
  const onUpload = async (e) => {
    const base64 = await convertToBase64(e.target.files[0]);

    setFile(base64);
  };

  if (isLoading) return <h1 className="text-2xl font-bold">Loading ....</h1>;
  if (serverError)
    return <h1 className="text-xl bg-red-500">{serverError.message}</h1>;

  return (
    <div className="container mx-auto">
      <Toaster position="top-center" reverseOrder={false}></Toaster>

      <div className="flex justify-center items-center h-screen">
        <div
          className={`${styles.glass} ${extend.glass}`}
          style={{ width: "45%" }}
        >
          <div className="title flex flex-col justify-center items-center">
            <h4 className="text-5xl font-bold">Profile</h4>
            <span className="pt-4 text-xl w-2/3 text-center text-gray-500">
              You can update the details.
            </span>
          </div>

          <form className="py-1" onSubmit={formik.handleSubmit}>
            <div className="profile flex justify-center py-4">
              <label htmlFor="profile">
                <img
                  src={apiData?.profile || file || avatar}
                  className={`${styles.profile_img} ${extend.profile_img}`}
                  alt="avatar"
                />
              </label>
              <input
                type="file"
                id="profile"
                name="profile"
                onChange={onUpload}
              />
            </div>

            <div className="textbox flex flex-col items-center gap-6">
              <div className="name flex w-3/4 gap-10">
                <input
                  className={`${styles.textbox} ${extend.textbox}`}
                  type="text"
                  placeholder="Firstname"
                  {...formik.getFieldProps("firstName")}
                />
                <input
                  className={`${styles.textbox} ${extend.textbox}`}
                  type="text"
                  placeholder="Lastname"
                  {...formik.getFieldProps("lastName")}
                />
              </div>
              <div className="name flex w-3/4 gap-10">
                <input
                  className={`${styles.textbox} ${extend.textbox}`}
                  type="text"
                  placeholder="Mobile No.."
                  {...formik.getFieldProps("mobile")}
                />
                <input
                  className={`${styles.textbox} ${extend.textbox}`}
                  type="text"
                  placeholder="Email"
                  {...formik.getFieldProps("email")}
                />
              </div>

              <input
                className={`${styles.textbox} ${extend.textbox}`}
                type="text"
                placeholder="Address"
                {...formik.getFieldProps("address")}
              />
              <button className={styles.btn} type="submit">
                Update
              </button>
            </div>

            <div className="text-center py-4">
              <span className="text-gray-500">
                come back later?{" "}
                <button onClick={userLogout} className="text-red-500">
                  Logout
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
