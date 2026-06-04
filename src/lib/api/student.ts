export async function getAccountOverview() {
  const response = await fetch("/api/student/account-overview");

  if (!response.ok) {
    throw new Error("Failed to fetch account overview");
  }

  return response.json();
}

export async function getStudentDashboard() {
  const response = await fetch("/api/student/dashboard");

  if (!response.ok) {
    throw new Error("Failed to fetch student dashboard");
  }

  return response.json();
}

export async function getStudentNotifications() {
  const response = await fetch("/api/student/notifications");

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

export async function getStudentCalendar() {
  const response = await fetch("/api/student/calendar");

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}
