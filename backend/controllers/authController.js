const User = require("../models/User");
const jwt = require("jsonwebtoken");

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h"});
};

//Register user
const registerUser = async (req, res) => {
    //Github copilot fix:
    // Defensive: ensure req.body exists (prevents destructure error)
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: "Request body is empty. Ensure the client sends a JSON body with Content-Type: application/json."
        });
    }

    const { fullName, email, password, profileImageURL } = req.body || {};

    //Validation: Check for missing fields
    if(!fullName || !email || !password){
        return res.status(400).json({ message: "All fields are required." });
    }

    try{
        //Check if email already exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "Email already in use." });
        }

        //Create the new user
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageURL
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    }catch(err){
        res.status(500).json({ message: "Error registering user.", error: err.message });
    }
};

//Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    //Validation: Check for missing fields
    if(!email || !password){
        return res.status(400).json({ message: "All fields are required." });
    }

    try{
        const user = await User.findOne({ email });
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({ message: "Invalid email or password." });
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    }catch(err){
        res.statu(500).json({ message: "Error logging in user.", error: err.message });
    }
};

//Get user info
const getUserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    }catch(err){
        res.status(500).json({ message: "Could not find user", error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
}