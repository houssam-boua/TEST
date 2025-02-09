// src/services/exigencesService.js

import {
  fetchExigenceById,
  fetchExigences,
  updateExigence,
  createExigence,
} from "../api/api";

//DONE
export const getExigences = async () => {
  try {
    const exigencesData = await fetchExigences();
    return exigencesData;
  } catch (error) {
    console.error("Error fetching exigences data:", error);
    throw error;
  }
};


//DONE
export const getExigenceById = async (exigenceId) => {
  try {
    const response = await fetchExigenceById(exigenceId);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching exigence data:", error);
    throw error;
  }
};
//DONE
export const editExigence = async (exigenceData, exigenceId) => {
  try {
    const response = await updateExigence(exigenceData, exigenceId);
    return response;
  } catch (error) {
    console.error("Error updating exigence:", error);
    throw error;
  }
};
//DONE
export const CreateExigence = async (exigenceData, reglementid) => {
  try {
    const response = await createExigence(exigenceData, reglementid);
    return response;
  } catch (error) {
    console.error("Error creating exigence:", error);
    throw error;
  }
};
