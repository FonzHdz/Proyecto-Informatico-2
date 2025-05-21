export const getBackendUrl = (): string => {
  return window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://backend-hc.up.railway.app";
};

export const getAuthUrl = (): string => {
  return window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://auth-hc.up.railway.app";
};