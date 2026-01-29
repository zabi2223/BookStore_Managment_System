import express from "express";
import {
    createUser,
    homePage,
    loginPage,
    loginUser,
    logout,
    signUpPage,
    profile,
    updateProfile,
    forgetpassword,
    sendEmaillink,
    resetPasswordPage,
    resetPasswordSubmit,
} from "../controllers/userController.js";
import { isUserLoggedIn } from "../middleware/user.js";
import { handleProfileUpload } from "../middleware/upload.js";

const route = express.Router();

route.get('/', loginPage);

route.post('/login', loginUser);

route.get('/signup', signUpPage);

route.post('/signup', createUser);

route.get('/logout', isUserLoggedIn, logout);

route.get('/home', isUserLoggedIn, homePage);

route.get('/profile', isUserLoggedIn, profile);

route.get('/forgot-password', forgetpassword);

route.post('/forgot-password', sendEmaillink);

route.get("/reset-password/:token", resetPasswordPage);
route.post("/reset-password/:token", resetPasswordSubmit);

route.post('/updateProfile', isUserLoggedIn, handleProfileUpload, updateProfile);


export default route;