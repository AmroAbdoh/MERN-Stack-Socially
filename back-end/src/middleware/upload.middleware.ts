import path from "node:path";
import { mkdirSync } from "node:fs";
import multer from "multer";

const uploadDirectory = path.resolve(process.cwd(), "uploads", "avatars");

mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const imageFileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback,
) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new Error("Only image files are allowed"));
    return;
  }

  callback(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
