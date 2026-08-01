import api from "axiosInstance";

// Fetches a protected file from the backend and triggers a browser download.
// `url` is the filename stored on the Sanity resource, `title` names the saved file.
export async function downloadResource({ url, title }) {
  try {
    const res = await api.get(`/paypal/${url}`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], {
      type: res.headers["content-type"],
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Download failed:", err);
  }
}
