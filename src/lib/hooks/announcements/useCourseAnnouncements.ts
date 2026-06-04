"use client";

import { useEffect, useState } from "react";

export function useCourseAnnouncements(courseId: string) {
  const [data, setData] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      try {
        const response = await fetch(`/api/courses/${courseId}/announcements`);
        const payload = response.ok ? await response.json() : [];
        const announcements = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (active) {
          setData(announcements);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAnnouncements();

    return () => {
      active = false;
    };
  }, [courseId]);

  return { data, isLoading };
}
