import { User, Book } from "../models/userBooks.js";
import bcrypt from 'bcryptjs';
import { userValidation, loginValidation, profileValidation, emailValidation, resetValidation, bookValidation } from "../input validation/validation.js";
import sanitizeHtml from "sanitize-html";
import jwt from "jsonwebtoken";
import { sendEmail } from "../middleware/sendEmail.js";
import crypto from "crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/aws.js";


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
            user,
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
            const fileExt = req.file.originalname.split(".").pop();

            const key = `users/${user._id}/${Date.now()}.${fileExt}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            });

            await s3.send(command);

            user.pic = key;
        }

        if (!req.file) {
            return res.status(404).send("No Image save");
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

export const homePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=' + encodeURIComponent('User not found'));

        // Count total books for this user
        const totalBooks = await Book.countDocuments({ userId: user._id });
        const totalPages = Math.ceil(totalBooks / limit);

        // Fetch paginated books separately
        const books = await Book.find({ userId: user._id })
            .sort({ publishedDate: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const message = req.query.message;

        const minPrice = null;
        const maxPrice = null;

        res.render("home", {
            user,
            books,
            currentPage: page,
            totalPages,
            message,
            minPrice,
            maxPrice
        });

    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const addForm = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');

        const message = req.query.message;
        res.render("addForm", { user, message });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const addBook = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');

        const result = bookValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect(`/addBook?message=` + encodeURIComponent(errorMessages));
        }

        const { title, author, price, isbn, publishedDate } = result.data;

        const cleantitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
        const cleanauthor = sanitizeHtml(author, { allowedTags: [], allowedAttributes: {} });
        const cleanprice = sanitizeHtml(price, { allowedTags: [], allowedAttributes: {} });
        const cleanisbn = sanitizeHtml(isbn, { allowedTags: [], allowedAttributes: {} });

        const existingBook = await Book.findOne({ isbn: cleanisbn });
        if (existingBook) {
            return res.redirect(`/addBook?message=` + encodeURIComponent("Book with this ID already exists"));
        }

        const newBook = new Book({
            title: cleantitle,
            author: cleanauthor,
            price: cleanprice,
            isbn: cleanisbn,
            publishedDate,
            userId: user._id
        });

        await newBook.save();

        res.redirect("/home?message=" + encodeURIComponent("Book added successfully!"));
    } catch (error) {
        console.error(error);
        res.send("Something went wrong in add book");
    }
};

export const deleteBook = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');
        const page = req.query.page;
        const { id } = req.params;
        const deletedBook = await Book.findOneAndDelete({ _id: id, userId: user._id });

        if (!deletedBook) {
            return res.redirect("/home?page=" + page + "&message=" + encodeURIComponent("Book not found."));
        }

        res.redirect("/home?page=" + page + "&message=" + encodeURIComponent("Book delete successfully!"));
    } catch (error) {
        console.error(error);
        res.send("Something went wrong in add book");
    }
};

export const editForm = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');

        const page = req.query.page;
        const { id } = req.params;
        const existBook = await Book.findOne({ _id: id, userId: user._id });

        if (!existBook) {
            return res.redirect("/home?page=" + page + "&message=" + encodeURIComponent("Book not found."));
        }

        const message = req.query.message;
        res.render("editForm", { page, existBook, user, message });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const editBook = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');
        const page = req.query.page;
        const { id } = req.params;

        const existBook = await Book.findOne({ _id: id, userId: user._id });

        if (!existBook) {
            return res.redirect("/home?page=" + page + "&message=" + encodeURIComponent("Book not found."));
        }
        const result = bookValidation.safeParse(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(err => `${err.path[0]}: ${err.message}`).join(", ");
            return res.redirect("/editBook/${id}?page=" + page + "&message=" + encodeURIComponent(errorMessages));
        }

        const { title, author, price, isbn, publishedDate } = result.data;

        const cleantitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
        const cleanauthor = sanitizeHtml(author, { allowedTags: [], allowedAttributes: {} });
        const cleanprice = sanitizeHtml(price, { allowedTags: [], allowedAttributes: {} });
        const cleanisbn = sanitizeHtml(isbn, { allowedTags: [], allowedAttributes: {} });

        const existingBook = await Book.findOne({ isbn: cleanisbn, _id: { $ne: id } });
        if (existingBook) {
            return res.redirect(`/editBook/${id}?page=${page}&message=${encodeURIComponent("Book with this ID already exists")}`);
        }

        existBook.title = cleantitle;
        existBook.author = cleanauthor;
        existBook.price = cleanprice;
        existBook.isbn = cleanisbn;
        existBook.publishedDate = publishedDate;
        await existBook.save();

        res.redirect(`/editBook/${id}?page=${page}&message=${encodeURIComponent("Book Update successfully!")}`);
    } catch (error) {
        console.error(error);
        res.send("Something went wrong in add book");
    }
};

export const filterBook = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');

        const { minPrice, maxPrice } = req.body;

        let query = { userId: user._id };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const books = await Book.find(query);

        const message = req.query.message;
        res.render("home", {
            user,
            books,
            currentPage: 1,
            totalPages: null,
            message,
            minPrice,
            maxPrice
        });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};

export const searchBook = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.redirect('/?message=User+not+found');

        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res.redirect("/home?message=" + encodeURIComponent("Empty searching"));
        }

        const books = await Book.find({
            userId: user._id,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { author: { $regex: query, $options: "i" } },
                { isbn: { $regex: query, $options: "i" } }
            ]
        });

        const message = req.query.message;
        res.render("home", {
            user,
            books,
            currentPage: 1,
            totalPages: null,
            message,
            minPrice: 0,
            maxPrice: 0
        });
    } catch (error) {
        console.error(error);
        res.send("Something went wrong");
    }
};