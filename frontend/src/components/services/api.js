const BASE_URL = "http://127.0.0.1:8000";

async function request(url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);

    if (!res.ok) {
      throw new Error("API error");
    }

    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

export const api = {
  submit: (data) =>
    request("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getClusters: () => request("/clusters"),

  getCases: () => request("/get-data"),

  getStats: () => request("/stats"),

  vote: (data) =>
    request("/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  feedback: (data) =>
    request("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};