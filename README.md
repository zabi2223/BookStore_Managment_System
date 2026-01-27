# 📚 Book Store Management System (MVC – Node.js, Express.js, MongoDB, EJS)

This project is a **Book Store Management System** built using **Node.js**, **Express.js**, and **MongoDB**, following the **MVC (Model-View-Controller)** architecture.
It provides a user-friendly interface for managing books, including features such as **authentication, search, filtering, pagination, and profile management**.
The frontend uses **EJS templates**, with a **single CSS** and **JavaScript** file shared across all pages.

---

## 🧩 Features

### 🔐 Login Page

* Login using **email** and **password**.
* Redirects to signup if the user doesn’t have an account.
* Validation for incorrect credentials.

### 📝 Signup Page

* Create a new account with **name, email, and password**.
* Redirect to login if the user already has an account.
* Password validation for security.

### 🏠 Home Page

* Modern design featuring **Book Store logo** (“Apni Book”).
* Displays all books in a **paginated table** showing:

  * Title
  * Author
  * Published Date
  * Unique ID
* Each book includes:

  * ✏️ **Edit Button**
  * 🗑️ **Delete Button**
* **Add Book Button** at the top for new entries.
* **Search Bar** in the header to search by **title, author, or unique ID**.
* **Filter Section (Left Side)**:

  * Filter by **Price Range**
  * Filter by **Published Date**
  * **Reset Button** to clear filters
* **Profile Button** (top right) redirects to the user profile page.

### 👤 Profile Page

* Displays:

  * **Name (editable)**
  * **Email (non-editable)**
  * **Profile Picture (round shape)** — if no picture, shows default icon.
* ✏️ **Edit icon** on picture to upload/change image.
* **Change Password Section**:

  * Old, New, and Confirm password fields.
  * Real-time validation:

    * Must be at least 8 characters.
    * New and Confirm passwords must match.
* **Update Button** updates name, picture, and password simultaneously.

### ➕ Add Book Page

* Add new books with:

  * Title
  * Author
  * Published Date
  * Unique ID
* Includes validation for required fields.

### ✏️ Edit Book Page

* Edit existing books with a pre-filled form.
* Update and save changes easily.

---

## 🧩 Tech Stack

| Layer                | Technology                      |
| -------------------- | ------------------------------- |
| **Backend**          | Node.js, Express.js             |
| **Frontend (Views)** | EJS Templates, CSS, JavaScript  |
| **Database**         | MongoDB (Mongoose)              |
| **Validation**       | Zod                             |
| **Authentication**   | JSON Web Tokens (JWT), bcryptjs |
| **Security**         | Helmet, sanitize-html           |

---

## 🗃️ Folder Structure


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/BookStore_Managment_System-.git
cd BookStore_Managment_System-
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory and add the following:

```
PORT = 3000
DB_URL = paste MongoDB Compass or Atlas Databse URL Link
```

### 4️⃣ Run the application

```bash
nodemon index.js
```

### 5️⃣ Access the app

* Visit: `http://localhost:3000`

---

## 🧠 Project Highlights

* Clean **MVC structure** (Separation of concerns)
* **Authentication & Authorization** using JWT
* **Data Validation** using Zod
* **Secure Input Handling** with `helmet` and `sanitize-html`
* **Dynamic EJS views** for User interfaces

---

## 🧑‍💻 Author

**Muhammad Zohaib Tariq**
* 📧 [[zohaibtariq566@gmail.com](mailto:zohaibtariq566@gmail.com)]
* 🌐 [[www.linkedin.com/in/zohaib-tariq-meo](http://www.linkedin.com/in/zohaib-tariq-meo)]
* 🐱 [[https://github.com/zabi2223](https://github.com/zabi2223)]

