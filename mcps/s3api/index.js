import express from "express";
import multer from "multer";
import fs from "fs";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import cors from "cors";

const app = express();
const port = 4000;
app.use(cors());
const client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const upload = multer({ dest: "uploads/" });

// 🔹 List objects
app.get("/list", async (req, res) => {
  try {
    const bucket = req.query.bucket;
    if (!bucket) return res.status(400).json({ error: "Missing bucket" });

    const prefix = req.query.prefix || "";
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/",
    });

    const result = await client.send(command);

    const files =
      result.Contents?.map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      })) || [];

    const folders = result.CommonPrefixes?.map((item) => item.Prefix) || [];

    res.json({ files, folders });
  } catch (err) {
    console.error("❌ Error listing objects:", err);
    res.status(500).json({ error: "Failed to list objects" });
  }
});

// 🔹 Upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const bucket = req.query.bucket ;
    if (!bucket) return res.status(400).json({ error: "Missing bucket" });

    const file = req.file;
    const prefix = req.query.prefix || "";

    const fileStream = fs.createReadStream(file.path);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `${prefix}${file.originalname}`,
      Body: fileStream,
    });

    await client.send(command);
    fs.unlinkSync(file.path);

    res.json({ success: true, key: `${prefix}${file.originalname}` });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 🔹 Delete
app.delete("/delete", async (req, res) => {
  try {
    const bucket = req.query.bucket  ;
    const key = req.query.key ;
    if (!bucket || !key) return res.status(400).json({ error: "Missing bucket or key" });

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
    res.json({ success: true, key });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(port, () =>
  console.log(`🚀 S3 File Manager API running at http://localhost:${port}`)
);
