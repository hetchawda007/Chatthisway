import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL + "/api",
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