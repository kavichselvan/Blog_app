/* eslint-disable react/prop-types */

import axios from "axios";
import { createContext, useEffect, useState } from "react";

// Get the base URL from the environment variable
const URL = process.env.REACT_APP_URL;

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      // Use the environment variable for the base URL
      const res = await axios.get(`${URL}/api/auth/refetch`, { withCredentials: true });
      // console.log(res.data)
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
