import User from "../models/userBooks.js";
import bcrypt from 'bcryptjs';
import { userValidation, loginValidation } from "../inputValidate/userValidate.js";
import sanitizeHtml from "sanitize-html";

export const loginPage = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};


export const loginUser = async (req, res) => {
    try {
        const result = loginValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.errors.map(err => err.message).join(", ");
            return res.redirect("/?message=" + encodeURIComponent(errorMessages));
        }

        const { email, password } = result.data;

        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        const cleanPassword = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

        const user = await findUserByEmail(cleanEmail);
        if (!user) {
            return res.redirect("/?message=" + encodeURIComponent("User not exist"));
        }

        const match = await verifyPassword(cleanPassword, user.password);
        if (!match) {
            return res.redirect("/?message=" + encodeURIComponent("Password Incorrect"));
        }

        // const token = complete it;
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 1000,
        });

        res.redirect("/home");

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
};


export const signUpPage = async (req, res) => {
    try {
        res.render("signup");

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");

    }
};


export const createUser = async (req, res) => {
    try {
        const result = userValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.errors.map(err => err.message).join(", ");
            return res.redirect(`/signup?message=${encodeURIComponent(errorMessages)}`);
        }

        const { name, email, password } = result.data;

        const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        const cleanPassword = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

        // const existUser = check;
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
        const { user, totalPages } = await getUserWithTasks(req.userId, page);

        if (!user) return res.redirect('/?message=User+not+found');

        res.render("user/homePage", {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                tasks: user.tasks
            },
            page,
            totalPages
        });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const page = parseInt(req.query.page) || 1;

        const result = await updateTaskStatus(req.userId, taskId, status);
        if (result.error) {
            return res.redirect(`/homePage?page=${page}&message=${result.error}`);
        }

        res.redirect(`/homePage?page=${page}`);

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};