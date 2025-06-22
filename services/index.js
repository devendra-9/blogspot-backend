const userSchema = require("../db/userSchema");
const bcrypt = require("bcrypt");
const saltRounds = 10;



const passwordHidden = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const addNewUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const new_password = await passwordHidden(password);
    await userSchema.create({
      username,
      password: new_password,
      email,
    });
    res.status(200).json({
      success: true,
      message: "User successfully registered 🎉",
    });
  } catch (err) {
    console.log("☠️Error occured while inserting ", err);
  }
};

const getallUser = async (req,res) =>{
    try{
        const availableUser = await userSchema.find()
        res.status(200).json({
            success:true,
            data:availableUser
        })
    }
    catch(err){
        console.log("☠️Error in fetching the data",err)
    }
}

module.exports = {addNewUser, getallUser}