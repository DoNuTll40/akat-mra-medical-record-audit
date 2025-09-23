"use client";

import axiosApi from "@/config/axios-api";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const AuthenContext = createContext();

function AuthenContextProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [inputLogin, setInputLogin] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();

  useEffect(() => {
    if(localStorage.getItem("token") === null) return setAuthLoading(false);

    verifyToken();
    setToken(localStorage.getItem("token"));
  }, []);

  const verifyToken = async () => {
    setAuthLoading(true);
    console.log("verify token");
    const token = localStorage.getItem("token");
    try {
      const res = await axiosApi.post("auth/verify", {}, { 
        headers: 
          { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        localStorage.setItem("token", token);
        localStorage.setItem("profile", JSON.stringify(res.data.data));
        setProfile(res.data.data);
      }
    } catch (err) {
      setProfile(null);
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      addToast({
        title: "เกิดข้อผิดพลาด",
        description: err.response.data.message,
        timeout: 5000,
        color: "danger",
        shouldShowTimeoutProgress: true,
      })
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutCopy = async () => {
    try {
      const rs = await axiosApi.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (rs.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        router.push("/");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      const rs = await axiosApi.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (rs.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        router.push("/");
        router.refresh();
        setToken(null);
        setProfile(null);
        addToast({
          title: "สําเร็จ",
          description: rs.data.message,
          timeout: 2500,
          color: "success",
          shouldShowTimeoutProgress: true,
        })
      }
    } catch (err) {
      console.log(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const value = { logout, inputLogin, setInputLogin, profile, token, verifyToken, authLoading };

  return (
    <AuthenContext.Provider value={value}>{children}</AuthenContext.Provider>
  );
}

export { AuthenContextProvider };
export default AuthenContext;
