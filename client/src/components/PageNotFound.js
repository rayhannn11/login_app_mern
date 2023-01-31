import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="title text-5xl font-bold py-10">
          O'ops page not found...!
        </div>

        <div className="py-7">
          <Link
            to={"/"}
            className="border bg-indigo-500 w-3/4 py-4 px-4 rounded-lg text-gray-50 text-base shadow-lg text-center"
          >
            Return to Login...!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
