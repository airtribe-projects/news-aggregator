const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const SALT_ROUND = 5;

const signUpUser = async (user) => {
    user.password = await bcrypt.hashSync(user.password, SALT_ROUND);
    const data = await userModel.create(user);
    return data;
};


const loginUser = async ({ email, password }) => {
    const user = await userModel.findOne({ email });

    if (!user) {
        const error = new Error("Email not found!");
        error.status = 401;
        throw error;
    }

    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
        const error = new Error("Incorrect password !");
        error.status = 401;
        throw error;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    return token;
};

const getPreferences = async (userId) => {
    const user = await userModel.findById(userId).select("preferences");
    if (!user) {
        const error = new Error("user not found");
        error.status = 404;
        throw error;
    }

    return user.preferences;
};

const updatePreferences = async (id, preferences) => {
    console.log("==================>", id, preferences )
    const user = await userModel
        .findByIdAndUpdate(id, { preferences }, { new: true, runValidators: true })
        .select("preferences");
 
    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return user.preferences;
};

module.exports = {
    loginUser,
    signUpUser,
    getPreferences,
    updatePreferences
}
