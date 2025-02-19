import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true // ✅ Important: Allows cookies in requests
});

export const createcookie = async (usermail: string) => {
    const res = await API.post("/createcookie", { usermail: usermail });
    return res.data.message;
};

export const checkcookie = async () => {
    const res = await API.get("/checkcookie");
    return res.data;
};

export const deletecookie = async () => {
    await API.post("/deletecookie");
};