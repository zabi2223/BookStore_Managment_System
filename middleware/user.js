import jwt from "jsonwebtoken";

export const isUserLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.redirect("/");
    }
};