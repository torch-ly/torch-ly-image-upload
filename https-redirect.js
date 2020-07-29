import express from "express";

export function startRedirectServer() {
    let http = express();

    http.get('*', (req, res) => res.redirect('https://server.erichier.tech' + req.headers.host + req.url));

    http.listen(process.env.PORT);
}

