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
    password: z.string().min(8).max(20),
});


export const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
});
