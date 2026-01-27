import jwt from "jsonwebtoken";

export const isUserLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/");
    }
    try {
        const decoded = jwt.verify(token, "jwtSecretKey");

        req.userId = decoded.userId;
        req.userName = decoded.name;
        next();
    } catch (error) {
        return res.redirect("/");
    }
};