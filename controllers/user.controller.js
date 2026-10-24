
 class UserController {

	constructor(userService) {
		this.userService = userService;
	}

	signup = async (req, res, next) => {
		// 1. get the request body
		const { name, email, password } = req.body
		// 2. check if the user with same email exists or not

		try {
		// 5. create the user
			const userData = {
			name,
			email,
			preferences: [],
			password
		   }

			const { newUser } = await this.userService.register(userData)

			// 6. send the user info  response...
			res.status(200).json({ user: newUser, password: undefined })
		} catch (err) {
          next(err)
		}


	}

	login = async (req, res, next) => {
    //   1. get email and password from body

	    const {email, password} = req.body

		try {

	//   3. compare userPwd with already registered user
	 const {token, user} =  await this.userService.login({email, password})

	//   4.  create jwt token and then send the token along with user response
	  res.status(200).json({...user, password: undefined, token})
		} catch(err) {
          next(err)
		}
	}

// Get user preferences
  getUserPreferences = async (req, res, next) => {

    const userId = req.decodedToken.id
    
    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required'
        }
        );
    }

    try {
        // Find the user in the database by ID and select only the preferences field
		const user = await this.userService.getPreferences(userId)
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    // Handle any errors that occur during the retrieval of user preferences
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

// Update user preferences
 updateUserPreferences = async (req, res, next) => {
    try {
        // Find the user in the database by ID and update the preferences field
  
        const userId  = req.params.id

        const {preferences} = req.body

        const updatedUser = await this.userService.updatePreferences(userId, preferences)

        // If the user is not found, throw an error
        if (!updatedUser) {
            throw new Error("User not found");
        }
        // Return the updated user object with the new preferences
        return updatedUser;
    }
    // Handle any errors that occur during the update of user preferences
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};
}


module.exports = UserController
