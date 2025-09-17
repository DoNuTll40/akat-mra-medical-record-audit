import AuthenContext from "@/contexts/AuthenContext";
import { useContext } from "react";

export default function AuthenHook() {
  return useContext(AuthenContext);
}