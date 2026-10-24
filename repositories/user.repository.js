const  User  = require("../models/user.model")


class UserRepository {
    create = async (userData) => {
    return await User.create(userData);
    }

    findByEmail = async (email) => {
     return await User.findOne({ email }).select('+password')
    }

    findByIdAndGetPreferences = async (userId) => {
        return await User.findById(userId).select('preferences');
    }

    findByIdAndUpdate = async (userId, preferences) => {
      return await User.findByIdAndUpdate(
            userId,
            { $push: { preferences: { $each: preferences } } },
            { new: true } // Return the updated user object
        );
    }
}

module.exports = UserRepository