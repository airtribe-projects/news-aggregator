class UserService {

	#userRepository
	#credentialService
	#tokenService

  constructor(userRepository, credsService, tokenService) {
    this.#userRepository = userRepository;
	this.#credentialService = credsService;
	this.#tokenService = tokenService
  }


	register = async (userData) => {

		console.log('userData', userData)

		const existingUser = await this.#userRepository.findByEmail(userData.email)

		// 3. if exists, then send 400 err message saying user already exists

		if(existingUser) {
		   throw new Error('user already  exists')
		}
	
		
		const hashedPassword = await this.#credentialService.createHashPwd(userData.password, 10)
		
		const newUser = await this.#userRepository.create({
			...userData,
			password: hashedPassword
		})

		return {
			newUser
		}
	}

	login = async (loginData) => {
	//   2. check if email exists or not
	 const existingUser = await this.#userRepository.findByEmail(loginData.email)

	     if(!existingUser) {
		   throw new Error('Invalid credentials')
		}

		console.log('existingUser', existingUser)

	 const isPasswordCorrect  = await this.#credentialService.verifyPassword(loginData.password, existingUser.password)

	 if(!isPasswordCorrect) {
		throw new Error('invalid credentials')
	 }

    const token =  this.#tokenService.createToken({
		sub: existingUser._id,
		email: existingUser.email
	  })

	  return {
		token,
		user: {
		id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        preferences: existingUser.preferences,
		}
	  }
	}

	getPreferences = async (userId) => {
		return await this.#userRepository.findByIdAndGetPreferences(userId)
	}

	updatePreferences = async (userId,preferences) => {
	 return	await this.#userRepository.findByIdAndUpdate(userId, preferences)
	}
}

module.exports = UserService