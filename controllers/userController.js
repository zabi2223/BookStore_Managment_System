import { User, Book } from "../models/userBooks.js";
import bcrypt from 'bcryptjs';
import { userValidation, loginValidation } from "../input validation/validation.js";
import sanitizeHtml from "sanitize-html";
import jwt from "jsonwebtoken";

export const loginPage = async (req, res) => {
    try {
        const message = req.query.message;
        res.render("login", { message });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};


export const loginUser = async (req, res) => {
    try {
        const result = loginValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect("/?message=" + encodeURIComponent(errorMessages));
        }

        const { email, password } = result.data;

        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        const cleanPassword = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.redirect("/?message=" + encodeURIComponent("User not exist"));
        }

        const match = await bcrypt.compare(cleanPassword, user.password);
        if (!match) {
            return res.redirect("/?message=" + encodeURIComponent("Password Incorrect"));
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 1000,
        });

        res.redirect("/home?message=" + encodeURIComponent("Welcome"));

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};


export const signUpPage = async (req, res) => {
    try {
        const message = req.query.message;
        res.render("signup", { message });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");

    }
};


export const createUser = async (req, res) => {
    try {
        const result = userValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect(`/signup?message=${encodeURIComponent(errorMessages)}`);
        }

        const { name, email, password } = result.data;

        const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        const cleanPassword = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

        const existUser = await User.findOne({ email: cleanEmail });

        if (existUser) {
            return res.redirect('/signup?message=' + encodeURIComponent('Email already registered'));
        }

        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        const newUser = new User({ name: cleanName, email: cleanEmail, password: hashedPassword });
        await newUser.save();

        res.redirect('/?message=' + encodeURIComponent('User Registered Successfully'));
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};


export const logout = async (req, res) => {
    res.clearCookie("token");
    res.redirect('/');
};

export const homePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.userId)
            .populate({
                path: "books",
                options: { skip, limit, sort: { publishedDate: -1 } }
            })
            .exec();

        if (!user) return res.redirect('/?message=User+not+found');

        const totalBooks = user.books.length;
        const totalPages = Math.ceil(totalBooks / limit);

        const message = req.query.message;

        res.render("home", {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                books: user.books
            },
            books: user.books,
            currentPage: page,
            totalPages,
            message
        });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};