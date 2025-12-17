const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    registerUser,
    loginUser,
    getUserInfo
} = require("../controllers/authController");

const router = express.Router();

//Route to register a new user
router.post("/register", registerUser);
//Route to login a user
router.post("/login", loginUser);
//Route to get user info (protected route)
router.get("/getUser", protect, getUserInfo);

//Route for image upload
router.post("/upload-image", upload.single("image"), (req, res) => {
    if(!req.file){
        return res.status(400).json({ message: "No file uplodaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;