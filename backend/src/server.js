import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import rateLimiter from "./middlewear/rateLimiter.js";
import noteRoutes from "./routes/note.route.js";
import path from "path";



// if we use type=commonjs in our package.json file, the import syntax will be as follows:
// const express = require("express");

//what is endpoint?
//endpoint is the combination of url and a http method which let the client to interact with specific resources on the server

const app = express();

dotenv.config();

// a middleweare which parse the json bodies
//what is middleware?
//middleware is a function that has access to the request object, response object, and the next middleware function in the application's request-response cycle.
if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:5173",
    }));
}
app.use(express.json());
app.use(rateLimiter);


// Our simple middlewear
// app.use((req, res, next) => {
//     console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//     next();
// });

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve()

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on PORT: ${PORT}`);
    });
});


app.use("/api/notes", noteRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


