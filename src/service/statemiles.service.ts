import axios from "axios";

const API_URL = "https://api.senioramerica.us/api";

// Types
export interface StateMilesRecord {
  _id: string;
  stateId: {
    _id: string;
    name: string;
    code: string;
  };
  miles: number;
  createdAt: string;
  updatedAt: string;
}

export interface StateMiles {
  stateId: string;
  name: string;
  code: string;
  miles: number;
  milesRecord: StateMilesRecord | null;
}

export interface StateMilesResponse {
  success: boolean;
  message: string;
  total: number;
  configured: number;
  data: StateMiles[];
}

// Get token
const getHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// GET all states with miles
export const getStateMiles = async (): Promise<StateMilesResponse> => {
  const response = await axios.get(
    `${API_URL}/state-miles`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ADD / UPDATE state miles
export const setStateMiles = async (
  stateId: string,
  miles: number
) => {
  const response = await axios.post(
    `${API_URL}/state-miles/set`,
    {
      stateId,
      miles,
    },
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};