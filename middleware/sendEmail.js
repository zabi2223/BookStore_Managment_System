import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"Apni Book" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });

    return info;
};
