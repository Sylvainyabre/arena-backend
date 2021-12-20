const S3 = require("aws-sdk/clients/s3");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const fs  = require('fs');

const region = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accessKey,
  secretKey,
});

//File upload handler
function uploadFile(file){
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket:bucketName,
        Body:fileStream,
        Key:file.filename
    }

    return s3.upload(uploadParams).promise();
}

//File retrieval handler
function getFileStream(fileKey){
    const downloadParams = {
      Key:fileKey,
      Bucket:bucketName
    }

    const fileStream = s3.getObject(downloadParams).createReadStream();
    return fileStream;
}

exports.uploadFile = uploadFile;
exports.getFile = getFileStream;