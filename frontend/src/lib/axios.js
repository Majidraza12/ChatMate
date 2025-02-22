import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : "http://localhost:5001/api", //our port that we are using in the backend
    withCredentials : true //This is how we can send the cookies in every single request
})