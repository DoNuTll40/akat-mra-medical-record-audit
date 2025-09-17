import axios from "axios";
import { env } from "next-runtime-env";

const baseURL = env("NEXT_PUBLIC_BASE_PATH")

const axiosSystem = axios.create({ baseURL: baseURL });
export default axiosSystem;