const userModal = require('../Modals/userModals');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 5;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
 

const registerUser = async(user)=>{
    user.password = bcrypt.hashSync(user.password,SALT_ROUNDS);

    const dbUser = await userModal.create(user);
    return dbUser;
}

const loginUser = async(email,password)=>{
    if(!email || !password){
        throw new Error('email and password are required');
    }
    const body = {
        email:email
    }

    const dbUser = await userModal.findOne(body);

    if(!dbUser){
        throw new Error('Users not found');
    }

    const isSamePassword = bcrypt.compareSync(password,dbUser.password);

    if(!isSamePassword){
        throw new Error('Invalid Password')
    }

    const payload = {
        id:dbUser._id,
        role:dbUser.role
    }
    const token = jwt.sign(payload,JWT_SECRET,{expiresIn:'1h'});

    return {status:"ok",token};


}

module.exports = {registerUser,loginUser}