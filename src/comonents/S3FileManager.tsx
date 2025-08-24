"use client";
import { useState } from "react";
import Navbar from "./Navbar";

type FileItem = {
  key: string;
  size: number;
  lastModified: string;
};

export default function S3FileManager() {
  const [bucket, setBucket] = useState("");
  const [prefix, setPrefix] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const fetchFiles = async (bucketName: string, folderPrefix = "") => {
    if (!bucketName) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/list?bucket=${bucketName}&prefix=${folderPrefix}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
      setPrefix(folderPrefix);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
    setLoading(false);
  };

  const handleConnect = () => {
    if (!bucket) return;
    setConnected(true);
    fetchFiles(bucket);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !bucket) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:4000/upload?bucket=${bucket}&prefix=${encodeURIComponent(prefix)}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchFiles(bucket, prefix);
    } catch (err) {
      console.error("❌ Upload error:", err);
    }
  };

  const handleDelete = async (key: string) => {
    if (!bucket) return;
    try {
      const res = await fetch(
        `http://localhost:4000/delete?bucket=${bucket}&key=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchFiles(bucket, prefix);
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const handleDownload = async (key: string) => {
    if (!bucket) return;
    try {
      const res = await fetch(
        `http://localhost:4000/presigned-download?bucket=${bucket}&key=${encodeURIComponent(key)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("❌ Download error:", err);
    }
  };

  const handleBack = () => {
    const parts = prefix.split("/").filter(Boolean);
    parts.pop();
    const parentPrefix = parts.length ? parts.join("/") + "/" : "";
    fetchFiles(bucket, parentPrefix);
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Bucket input */}
        {!connected && (
          <div className="mb-6 flex gap-3 items-center">
            <input
              type="text"
              placeholder="Enter S3 bucket name"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              className="px-3 py-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect
            </button>
          </div>
        )}

        {connected && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                📂 {bucket} {prefix ? `/ ${prefix}` : ""}
              </h2>

              {/* Upload */}
              <label className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600">
                Upload
                <input
                  type="file"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            {loading && <p className="text-gray-500 mb-4">Loading...</p>}

            {/* Folders */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Folders</h3>
              {folders.length === 0 ? (
                <p className="text-gray-500">No folders</p>
              ) : (
                <ul className="list-disc pl-6">
                  {folders.map((folder) => (
                    <li key={folder}>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => fetchFiles(bucket, folder)}
                      >
                        {folder.replace(prefix, "").replace(/\/$/, "")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Files */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Files</h3>
              {files.length === 0 ? (
                <p className="text-gray-500">No files</p>
              ) : (
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.key}
                      className="flex justify-between items-center gap-3 bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="truncate">{file.key.replace(prefix, "")}</span>
                      <div className="flex gap-2">
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() => handleDownload(file.key)}
                        >
                          Download
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(file.key)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Back button */}
            {prefix && (
              <button
                className="mt-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleBack}
              >
                ⬅ Back
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
