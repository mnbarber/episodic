const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

function getClient() {
    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials are not configured on the server');
    }
    return new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
    });
}

function publicUrlFor(key) {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// extracts the S3 key from a URL previously produced by publicUrlFor, or null
// if the URL doesn't belong to our bucket (e.g. a Google avatar URL)
function keyFromUrl(url) {
    const prefix = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    return url && url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

async function uploadBuffer(key, buffer, contentType) {
    const client = getClient();
    if (!process.env.AWS_S3_BUCKET) {
        throw new Error('AWS_S3_BUCKET is not configured on the server');
    }
    await client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));
    return publicUrlFor(key);
}

async function deleteByUrl(url) {
    const key = keyFromUrl(url);
    if (!key) return;
    const client = getClient();
    await client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    }));
}

module.exports = { uploadBuffer, deleteByUrl };
