import { UserModel } from "../models/user";
import axiosInstance from "../configs/axios";

interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserModel;
  };
  duration: string;
  statusCode: number;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const getUserByToken = async (): Promise<UserModel> => {
  try {
    const response = await axiosInstance.get("/auth/user/profile");

    // Assuming the user data is part of the response
    const userData: UserModel = response?.data;
    return userData;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const refreshAuthToken = async (refreshToken: string) => {
  try {
    const response = await axiosInstance.post("/auth/user/refresh-token", {
      refresToken: refreshToken,
    });

    if (response.data && response.data.accessToken) {
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken, // Use new refresh token if provided, otherwise keep the old one
      };
    }
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};
