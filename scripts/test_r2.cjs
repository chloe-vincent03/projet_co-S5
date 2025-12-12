require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

async function testUpload() {
    try {
        const result = await client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: "test.txt",
            Body: "Hello from Node.js!",
            ContentType: "text/plain"
        }));

        console.log("✔️ Upload réussi !");
        console.log(result);

        const url = `${process.env.R2_PUBLIC_BASE}/test.txt`;
        console.log("URL publique :", url);

    } catch (err) {
        console.error("❌ Erreur :", err);
    }
}

testUpload();
