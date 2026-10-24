const bcrypt = require('bcryptjs')

class CredentialService {
    createHashPwd = async (userPassword) => {
      return await bcrypt.hash(userPassword, 10)
    }

    verifyPassword = async (userPassword, hashedPassword) => {
       return  await bcrypt.compare(userPassword, hashedPassword)
    }
}

module.exports = CredentialService