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
        default: null
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


userSchema.virtual("picUrl").get(function () {
    if (!this.pic) {
        return "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=-mUWsTSENkugJ3qs5covpaj-bhYpxXY-v9RDpzsw504=";
    }

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${this.pic}`;
});


export const User = mongoose.model("User", userSchema);
