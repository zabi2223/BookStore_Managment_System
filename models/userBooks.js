import mongoose from "mongoose";

// ------------------- Book Schema -------------------
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export const Book = mongoose.model("Book", bookSchema);

// ------------------- User Schema -------------------
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    pic: {
        type: String,
        default: '/images/default-profile.png'
    },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate: fetch all books of this user
userSchema.virtual("books", {
    ref: "Book",
    localField: "_id",
    foreignField: "userId"
});

// Virtual property: total number of books
userSchema.virtual("bookCount").get(function () {
    return this.books ? this.books.length : 0;
});

export const User = mongoose.model("User", userSchema);
