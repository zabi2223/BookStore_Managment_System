import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/aws.js";

s3.listBuckets((err, data) => {
    if (err) {
        console.log("❌ S3 connect error:", err);
    } else {
        console.log("✅ S3 connected successfully");
        console.log(data.Buckets);
    }
});

export const profileUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'apni-book-profile-pics',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = file.originalname.split(".").pop();
            const filename = `profile/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
            cb(null, filename);
        },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only JPG/PNG/WEBP images allowed!"), false);
    },
});

// Optional helper to wrap Multer errors
export const handleProfileUpload = (req, res, next) => {
    profileUpload.single("pic")(req, res, (err) => {
        if (err) {
            return res.status(400).render("profile", {
                user: {
                    name: req.body.name || "",
                    email: req.body.email || "",
                    pic: '/images/default-profile.png'
                },
                message: err.message
            });
        }
        next();
    });
};