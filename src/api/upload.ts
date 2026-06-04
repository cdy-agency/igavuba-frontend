import { CreateInstitutionFormData } from "@/types";
import apiClient from "./api-client";
import { CreateInstitutionResponse } from "./institution.api";


export async function upload() {
  const response = await apiClient.post<CreateInstitutionResponse>(
    '/institutions',
  );
  return response.data;
}