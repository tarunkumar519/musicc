import axios from "axios";

export const createParty = async (name, host, hostName) => {
  try {
    const res = await axios.post("/api/party/create", { name, host, hostName });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const getParty = async (code) => {
  try {
    const res = await axios.get(`/api/party/${code}`);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const joinParty = async (code, userId, userName) => {
  try {
    const res = await axios.post(`/api/party/${code}`, { userId, userName });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateParty = async (code, action, data) => {
  try {
    const res = await axios.post(`/api/party/${code}/update`, { action, ...data });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const addToPartyQueue = async (code, song) => {
  try {
    const res = await axios.post(`/api/party/${code}/queue`, { song });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

