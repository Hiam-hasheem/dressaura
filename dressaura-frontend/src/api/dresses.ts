const API_URL = "http://127.0.0.1:8000";

export async function fetchDresses() {
  const res = await fetch(`${API_URL}/dresses`);
  if (!res.ok) {
    throw new Error("Failed to fetch dresses");
  }
  return res.json();
}
