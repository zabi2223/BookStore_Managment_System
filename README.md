# 📚 Book Store Management System (MVC – Node.js, Express.js, MongoDB, EJS)

A modern web-based platform to manage and organize books efficiently, built using **Node.js**, **Express.js**, and **MongoDB**, following the **MVC (Model-View-Controller)** architecture.
It provides a user-friendly interface for managing books, including **authentication, search, filtering, and profile management**.
The frontend uses **EJS templates**, with shared **CSS** and **JavaScript** across all pages.

---

## 🚀 Features

### 🔐 Authentication & User Management

* User **Signup** (Name, Email, Password)
* User **Login** (Email, Password)
* **Forgot Password** (Reset link sent to email)
* **Reset Password** using secure token link

### 👤 Profile Management (After Login)

* Update **Name**
* Update **Password** (requires old password)
* Upload / Update **Profile Picture**

  * Profile picture is uploaded to **AWS S3**
  * Default profile picture is set initially

### 📚 Book Management

* Add Books
* Edit Books
* Delete Books
* Search Books by:

  * Title
  * Author
  * Unique ID
* Filter Books by:

  * Price Range
  * Published Date

---

## 🧱 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Templating Engine:** EJS
* **Validation:** Zod
* **Authentication:** JWT + Cookies
* **File Upload:** Multer + AWS S3
* **Email Service:** Nodemailer
* **Security:** Helmet, sanitize-html
* **Logging:** Morgan

---

## 📁 Folder Structure

```bash
BOOKSTORE_MANAGMENT_SYSTEM/
│
├── config/
│   └── aws.js
│
├── controllers/
│   └── userController.js
│
├── db config/
│   └── db.js
│
├── input validation/
│   └── validation.js
│
├── middleware/
│   ├── sendEmail.js
│   ├── upload.js
│   └── user.js
│
├── models/
│   └── userBooks.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── profilescript.js
│       └── script.js
│
├── routes/
│   └── userRoute.js
│
├── views/
│   ├── partails/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── addForm.ejs
│   ├── Edit.ejs
│   ├── forgetPassword.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── profile.ejs
│   ├── resetPassword.ejs
│   └── signup.ejs
│
├── .env
├── app.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd BOOKSTORE_MANAGMENT_SYSTEM
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create `.env` File

Create a `.env` file in the root directory:

```env
PORT=

DB_URL=

JWT_SECRET_KEY=

EMAIL_USER=
EMAIL_PASS=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

> ⚠️ Note: Make sure AWS S3 bucket permissions allow upload & access for profile images.

---

## ▶️ Run Project

Project run hoga:

```bash
nodemon app.js
```

Or agar nodemon installed nahi hai:

```bash
npx nodemon app.js
```

---

## 📦 Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.975.0",
  "bcryptjs": "^3.0.3",
  "body-parser": "^2.2.2",
  "cookie-parser": "^1.4.7",
  "dotenv": "^17.2.3",
  "ejs": "^4.0.1",
  "express": "^5.2.1",
  "express-session": "^1.19.0",
  "helmet": "^8.1.0",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.1.5",
  "morgan": "^1.10.1",
  "multer": "^2.0.2",
  "nodemailer": "^7.0.13",
  "sanitize-html": "^2.17.0",
  "zod": "^4.3.6"
}

---

## 👨‍💻 Author

**Muhammad Zohaib Tariq**
* 📧 [[zohaibtariq566@gmail.com](mailto:zohaibtariq566@gmail.com)]
* 🌐 [[www.linkedin.com/in/zohaib-tariq-meo](http://www.linkedin.com/in/zohaib-tariq-meo)]
* 🐱 [[https://github.com/zabi2223](https://github.com/zabi2223)]


