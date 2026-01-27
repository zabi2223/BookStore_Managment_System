import express from "express";
import {
    createUser,
    homePage,
    loginPage,
    loginUser,
    logout,
    signUpPage,
} from "../controllers/userControllers.js";
import { isUserLoggedIn } from "../middleware/user.js";

const route = express.Router();

route.get('/', loginPage);

route.post('/login', loginUser);

route.get('/signup', signUpPage);

route.post('/signup', createUser);

route.post('/logout', isUserLoggedIn, logout);

route.get('/homePage', isUserLoggedIn, homePage);

export default route;