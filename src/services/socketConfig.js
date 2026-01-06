const resolveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const host =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";
  const protocol =
    typeof window !== "undefined" && window.location.protocol
      ? window.location.protocol
      : "http:";
  const port = import.meta.env.VITE_SOCKET_PORT || "3000";

  return `${protocol}//${host}:${port}`;
};

export const SOCKET_SERVER_URL = resolveSocketUrl();
