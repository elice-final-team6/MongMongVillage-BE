const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const imageUploadConfig = (folderName) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: "mongmongvillagebucket",
      key: function (req, file, cb) {
        cb(
          null,
          `${folderName}/${Date.now()}_${path.basename(file.originalname)}`
        );
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  });
};

module.exports = { imageUploadConfig };
