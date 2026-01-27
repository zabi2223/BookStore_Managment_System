import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import connectToDB from "./db config/db.js";
import userRoute from "./routes/userRoute.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
connectToDB();

app.use(morgan("dev"));
app.use(helmet());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(cookieParser());

app.use('/', userRoute);


app.listen(PORT, () => {
    console.log("server is running");
});