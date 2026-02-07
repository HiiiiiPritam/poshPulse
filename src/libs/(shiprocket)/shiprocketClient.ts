import axios from "axios";
import { getShiprocketToken } from "./tokenManager";

export const makeShiprocketRequest = async (endpoint: string, method: "GET" | "POST", data?: any) => {
  try {
    const token = await getShiprocketToken();

    const response = await axios({
      url: `https://apiv2.shiprocket.in${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error calling Shiprocket API:", error.response?.data || error.message);
    throw error;
  }
};
