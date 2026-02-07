import { ShiprocketAuthResponse } from "@/types/shiprocket";
import axios from "axios";

let cachedToken: string | null = null;

export const getShiprocketToken = async (): Promise<string|null> => {
  const currentTime = Date.now();

  // If token exists, return it
  if (cachedToken ) {
    return cachedToken;
  }

  // Re-authenticate and update the cache
  const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
    email: "owlliee88@gmail.com",
    password: "8z1ulEH1D3gJ#6B%fYozwF4Jzk2w5M9!",
  });

  //  // Re-authenticate and update the cache
  //  const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
  //   email: "abhidev200513@gmail.com",
  //   password: "13@Abhinav13",
  // });

  const { token } = response.data as ShiprocketAuthResponse;
   console.log("Token created:", token);

  // Cache the token and calculate its expiry
  cachedToken = token;

  return cachedToken;
};
