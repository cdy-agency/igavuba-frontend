"use client";

import { useEffect, useState } from "react";
import type { Category, Course, Institution } from "@/lib/api";

interface LandingDataState<T> {
  loading: boolean;
  error: string | null;
  data: T[];
}

function useLandingCollection<T>(endpoint: string): LandingDataState<T> {
  const [state, setState] = useState<LandingDataState<T>>({
    loading: true,
    error: null,
    data: [],
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to load data");
        }

        const payload = await response.json();
        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (active) {
          setState({ loading: false, error: null, data });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            error: error instanceof Error ? error.message : "Failed to load data",
            data: [],
          });
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [endpoint]);

  return state;
}

export function useCategories() {
  const { data, loading, error } = useLandingCollection<Category>("/api/categories");

  return {
    categories: data,
    loading,
    error,
  };
}

export function useInstitutions() {
  const { data, loading, error } =
    useLandingCollection<Institution>("/api/institutions");

  return {
    institutions: data,
    loading,
    error,
  };
}

export function useLandingData() {
  const { data, loading, error } = useLandingCollection<Course>("/api/courses");

  return {
    landingData: {
      trending: data,
      new: data,
    },
    loading,
    error,
  };
}
