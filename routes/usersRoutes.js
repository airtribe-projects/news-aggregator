const express = require('express');
const router = express.Router();
const {registerUser,loginUser} = require("../Controllers/usersController");
router.use(express.json());



router.post('/register',async(req,res)=>{
    try{
        const user = req.body;
        const dbUser = await registerUser(user);
        res.status(200).send(dbUser);
    }catch(err){
            return res.status(400).send({error:err.message});
        }
})

router.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const result = await loginUser(email,password);
        return res.status(200).send(result);
    }catch(err){
        return res.status(400).send({error:err.message});
    }
})

module.exports = router;