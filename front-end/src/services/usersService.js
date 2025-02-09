import { fetchUsersData } from "../api/api";

export const getUsers = async () => {
  try {
    const response = await fetchUsersData();
    console.log("response", response);
    return response.accounts;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
