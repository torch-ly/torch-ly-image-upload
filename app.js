import express from "express";
import fileUpload from "express-fileupload";
import randomString from "random-base64-string";
import fs from "fs";

let app = express();

const storagePath = "./uploads/";
const stringLength = 8;
const cacheTtl = 1000 * 60 * 60 * 24 * 365;

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
        res.status(500).send(err);
    }
});

app.listen(3000, () => console.log("Image Server now listening on port 3000"));