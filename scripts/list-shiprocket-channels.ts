
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getShiprocketToken() {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error("Shiprocket credentials missing in .env.local");
    }

    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email,
      password,
    });

    console.log("Token generated successfully");
    return response.data.token;
  } catch (error: any) {
    console.error("Error generating token:", error.response?.data || error.message);
    process.exit(1);
  }
}

async function listChannels() {
  const token = await getShiprocketToken();

  try {
    const response = await axios.get("https://apiv2.shiprocket.in/v1/external/channels", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const fs = require('fs');
    if (response.data.data && Array.isArray(response.data.data)) {
        const output = response.data.data.map((channel: any) => `ID: ${channel.id}, Name: ${channel.name}`).join('\n');
        fs.writeFileSync('channel_ids.txt', output);
        console.log("Written to channel_ids.txt");
    } else {
        console.log("Structure unexpected:", JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.error("Error fetching channels:", error.response?.data || error.message);
  }
}

listChannels();
