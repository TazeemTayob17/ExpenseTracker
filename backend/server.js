require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

//Middleware to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*", //Specify allowed origins
        methods: ["GET", "POST", "PUT", "DELETE"], //Speicify allowed methods
        allowedHeaders: ["Content-Type", "Authorization"], //Specify allowed headers
    })  
);

app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));