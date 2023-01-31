import axios from "axios";
import { useEffect, useState } from "react";

import { getUserToken } from "../helper/helper";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**Custom HOOK */
export default function useFetch(query) {
  const [getData, setData] = useState({
    isLoading: false,
    apiData: undefined,
    status: null,
    serverError: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData((state) => ({
          ...state,
          isLoading: true,
        }));

        const { username } = !query ? await getUserToken() : "";

        const { data, status } = !query
          ? await axios.get(`/api/user/${username}`)
          : await axios.get(`/api/${query}`);

        if (status === 201) {
          setData((state) => ({
            ...state,
            isLoading: false,
            apiData: data,
            status: status,
          }));
        }

        setData((state) => ({
          ...state,
          isLoading: false,
        }));
      } catch (error) {
        setData((state) => ({
          ...state,
          isLoading: false,
          serverError: error,
        }));
      }
    };

    fetchData();
  }, [query]);

  return [getData, setData];
}
