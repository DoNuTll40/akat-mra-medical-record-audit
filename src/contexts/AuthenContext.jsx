import axiosApi from "@/config/axios-api";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const AuthenContext = createContext();

function AuthenContextProvider({children}) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [inputLogin, setInputLogin] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();

  useEffect(() => {
    // verify();
    setToken(localStorage.getItem("token"));
  }, [])

    const logoutCopy = async () => {
    try {
      const rs = await axiosApi.post("/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }) 

      if(rs.status === 200){
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        router.push("/")
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.log(err)
    } finally {
    }
  }

  const logout = async () => {
    try {
      const rs = await axiosApi.post("/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }) 

      if(rs.status === 200){
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        router.replace("/");   // ไป /
        router.refresh();
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.log(err)
    } finally {
    }
  }

  const value = { logout };
    
  return <AuthenContext.Provider value={value} >{children}</AuthenContext.Provider>;
}

export { AuthenContextProvider };
export default AuthenContext;
