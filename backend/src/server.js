import express from "express";
import noteRouter from "./routes/note.route.js"
import connectDB from "./config/db.js";
import dotenv from "dotenv";
// if we use type=commonjs in our package.json file, the import syntax will be as follows:
// const express = require("express");

//what is endpoint?
//endpoint is the combination of url and a http method which let the client to interact with specific resources on the server

const app = express();

dotenv.config();
connectDB();

// a middleweare which parse the json bodies
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
});

//what is middleware?
//middleware is a function that has access to the request object, response object, and the next middleware function in the application's request-response cycle.

app.use("/api/notes", noteRouter);

