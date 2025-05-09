import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL + "/api/v1",
    withCredentials: true
});

export const createcookie = async (usermail: string) => {
    try {
        const res = await API.post("/createcookie", { usermail: usermail, secretkey: import.meta.env.VITE_COOKIE_SECRET });
        return res.data.message;
    } catch (error) {
        console.error("Error creating cookie:", error);
        throw error;
    }
};

export const checkcookie = async () => {
    try {
        const res = await API.get("/checkcookie");
        return res.data;
    } catch (error) {
        console.error("Error checking cookie:", error);
        return null;
    }
};

export const deletecookie = async () => {
    try {
        await API.post("/deletecookie");
    } catch (error) {
        console.error("Error deleting cookie:", error);
        throw error;
    }
};