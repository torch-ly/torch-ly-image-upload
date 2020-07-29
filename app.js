import express from "express";
import fileUpload from "express-fileupload";
import randomString from "random-base64-string";
import https from "https";
import fs from "fs";
import dotenv from "dotenv";
import {startRedirectServer} from "./https-redirect";

dotenv.config();

startRedirectServer();

let app = express();

const storagePath = process.env.STORAGE_PATH;
const stringLength = parseInt(process.env.STRING_LENGTH);
const cacheTtl = process.env.CACHT_TTL;

app.use("/u", express.static(storagePath, {maxAge: cacheTtl}));
app.use(fileUpload());

app.post("/upload", async (req, res) => {
    try {
        if (!req.files) {
            res.status(400).send("Error: No file provided");
            return;
        }

        if (!req.files.image.mimetype.match(/image.*/)) {
            res.status(400).send("Error: File not of type image");
            return;
        }

        if (req.files.image.size > 50 * 1000 * 1000) {
            res.status(400).send("Error: File too large, max. 50 MB allowed");
            return;
        }

        let image = req.files.image;
        let fileType = image.name.split(".").slice(-1)[0];

        let randomName = randomString(stringLength);
        let path = randomName + "." + fileType;

        while (fs.existsSync(storagePath + path)) {
            randomName = randomString(stringLength);
            path = randomName + "." + fileType;
        }

        image.mv(storagePath + path);

        res.send("/u/" + path);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

https.createServer({
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH)
}, app).listen(process.env.HTTPS_PORT, () => console.log("Image Server now listening on port " + process.env.PORT));