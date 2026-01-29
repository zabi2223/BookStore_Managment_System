import express from "express";
import {
    createUser,
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
    homePage,
    addForm,
    addBook,
    deleteBook,
    editForm,
    editBook,
    filterBook,
    searchBook,

} from "../controllers/userController.js";
import { isUserLoggedIn } from "../middleware/user.js";
import upload from "../middleware/upload.js";

const route = express.Router();

route.get('/', loginPage);

route.post('/login', loginUser);

route.get('/signup', signUpPage);

route.post('/signup', createUser);

route.get('/logout', isUserLoggedIn, logout);

route.get('/profile', isUserLoggedIn, profile);

route.get('/forgot-password', forgetpassword);

route.post('/forgot-password', sendEmaillink);

route.get("/reset-password/:token", resetPasswordPage);
route.post("/reset-password/:token", resetPasswordSubmit);

route.post('/updateProfile', isUserLoggedIn, upload.single("pic"), updateProfile);

route.get('/home', isUserLoggedIn, homePage);

route.get('/addBook', isUserLoggedIn, addForm);
route.post('/addBook', isUserLoggedIn, addBook);

route.post('/deleteBook/:id', isUserLoggedIn, deleteBook);

route.get('/editBook/:id', isUserLoggedIn, editForm);
route.post('/editBook/:id', isUserLoggedIn, editBook);

route.post('/filter', isUserLoggedIn, filterBook);

route.post('/search', isUserLoggedIn, searchBook)

export default route;