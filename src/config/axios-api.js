import axios from "axios";
import { env } from "next-runtime-env";

const baseURL = env("NEXT_PUBLIC_API_URL")

const axiosApi = axios.create({ baseURL: baseURL });
export default axiosApi;