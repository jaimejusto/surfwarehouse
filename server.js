const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.enable("trust proxy");

// Routers
const apiRoute = require("./routes/api");
const loginRoute = require("./routes/loginPage");


// Routes
app.use("/", loginRoute);
app.use("/api", apiRoute);


const PORT = process.env.PORT || 8080;
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Server listening on ${PORT}`);
})