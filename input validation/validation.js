import { z } from "zod";

export const bookValidation = z.object({
    title: z.string().min(3).max(100),
    author: z.string().min(3).max(50),
    price: z.number().positive(),
    isbn: z.string().min(5).max(20),
    publishedDate: z.date().default(() => new Date()),
});

export const userValidation = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(20)
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/,
            "Password must have 1 uppercase, 1 number, 1 special char"),
});


export const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20)
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/,
            "Password must have 1 uppercase, 1 number, 1 special char"),
});

const passwordValidation = z.object({
    oldPassword: z.string().min(8).max(20).optional().transform(val => val === "" ? undefined : val),
    newPassword: z.string()
        .min(8)
        .max(20)
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?-]).{8,}$/, "Password must have 1 uppercase, 1 number, 1 special char")
        .optional()
        .transform(val => val === "" ? undefined : val),
    confirmPassword: z.string().optional().transform(val => val === "" ? undefined : val)
});


const nameValidation = z.object({
    name: z.string().min(3).max(30)
});

export const profileValidation = nameValidation.merge(passwordValidation);

export const emailValidation = z.object({
    email: z.string().email(),
});

export const resetValidation = z.object({
    password: z.string()
        .min(8)
        .max(20)
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?-]).{8,}$/, "Password must have 1 uppercase, 1 number, 1 special char")
    ,
    confirmPassword: z.string()
});