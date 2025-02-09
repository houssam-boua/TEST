// src/services/reglementService.js
import {
  fetchReglementsData,
  fetchReglementTypes,
  fetchDomainByThemes,
  createReglement,
  fetchReglementByAdminstratifId,
} from "../api/api";

export const getReglements = async () => {
  try {
    const reglementsData = await fetchReglementsData();
    return reglementsData;
  } catch (error) {
    console.error("Error fetching reglements data:", error);
    throw error;
  }
};

export const getReglementTypes = async () => {
  try {
    const reglementTypes = await fetchReglementTypes();
    return reglementTypes;
  } catch (error) {
    console.error("Error fetching reglement types:", error);
    throw error;
  }
};

export const getReglementDomainByTheme = async (theme) => {
  try {
    const reglementDomainData = await fetchDomainByThemes(theme);
    return reglementDomainData;
  } catch (error) {
    console.error("Error fetching reglement domain data:", error);
    throw error;
  }
};

export const creeateReglement = async (reglementData) => {
  try {
    const response = await createReglement(reglementData);
    return response;
  } catch (error) {
    console.error("Error creating reglement:", error);
    throw error;
  }
};

export const getReglementsByAdministatif = async (adminstratif) => {
  try {
    const reglementsData = await fetchReglementByAdminstratifId(adminstratif);
    return reglementsData;
  } catch (error) {
    console.error("Error fetching reglements data:", error);
    throw error;
  }
};
