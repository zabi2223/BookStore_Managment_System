import { User, Book } from "../models/userBooks.js";
import bcrypt from 'bcryptjs';
import { userValidation, loginValidation, profileValidation, emailValidation, resetValidation } from "../input validation/validation.js";
import sanitizeHtml from "sanitize-html";
import jwt from "jsonwebtoken";
import multer from "multer";
import { sendEmail } from "../middleware/sendEmail.js";
import crypto from "crypto";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

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

export const profile = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const message = req.query.message;

        res.render("profile", {
            user: {
                name: user.name,
                email: user.email,
                pic: user.pic || '/images/default-profile.png'
            },
            message
        });

    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).send("Something went wrong");
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        for (let key of ["oldPassword", "newPassword", "confirmPassword"]) {
            if (req.body[key] === "") req.body[key] = undefined;
        }


        const parseResult = profileValidation.safeParse(req.body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.status(400).render("profile", { user, message: errors });
        }

        const { name, oldPassword, newPassword, confirmPassword } = parseResult.data;

        const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
        user.name = cleanName;

        if (req.file) {
            user.pic = req.file.location;
        }
        if (!req.file) {
            console.log("No Image");
        }

        if (newPassword || oldPassword || confirmPassword) {
            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.status(400).render("profile", {
                    user: {
                        name: user.name,
                        email: user.email,
                        pic: user.pic || '/images/default-profile.png'
                    },
                    message: "Please fill all password fields to change password"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).render("profile", {
                    user: {
                        name: user.name,
                        email: user.email,
                        pic: user.pic || '/images/default-profile.png'
                    },
                    message: "New password and confirm password do not match"
                });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).render("profile", {
                    user: {
                        name: user.name,
                        email: user.email,
                        pic: user.pic || '/images/default-profile.png'
                    },
                    message: "Old password is incorrect"
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }
        await user.save();

        res.redirect("/profile?message=Profile updated successfully");

    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).render("profile", { message: "Something went wrong" });
    }
};



export const forgetpassword = async (req, res) => {
    try {
        const message = req.query.message;
        res.render("forgetPassword", { message });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const sendEmaillink = async (req, res) => {
    try {
        const result = emailValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect("/?message=" + encodeURIComponent(errorMessages));
        }

        const { email } = result.data;
        const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.redirect("/forgot-password?message=" + encodeURIComponent("Email not found!"));
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

        await sendEmail({
            to: cleanEmail,
            subject: "Password Reset Link",
            html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
        });
        res.clearCookie("token");

        return res.redirect("/?message=" + encodeURIComponent("Reset link sent to your email ✅"))

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
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
                pic: user.pic || '/images/default-profile.png',
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


export const resetPasswordPage = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.send("Invalid or Expired Reset Link ❌");
        }

        return res.render("resetPassword", { token });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const resetPasswordSubmit = async (req, res) => {
    try {
        const { token } = req.params;
        const result = resetValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect(`/reset-password/${token}?message=` + encodeURIComponent(errorMessages));
        }

        const { password, confirmPassword } = result.data;

        if (!password || !confirmPassword) {
            return res.redirect(`/reset-password/${token}?message=` + encodeURIComponent("All fields required"));
        }

        if (password !== confirmPassword) {
            return res.redirect(`/reset-password/${token}?message=` + encodeURIComponent("Passwords do not match"));
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.send("Invalid or Expired Reset Link ❌");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        return res.redirect("/?message=" + encodeURIComponent("Password reset successful ✅"));
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};