const userSchema = require("../db/userSchema");
const posts = require("../db/blogSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "ASSIGNMENT";
const saltRounds = 10;

// ================================ user =========================================
const passwordHidden = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const addNewUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const isUserExist = await userSchema.findOne({ username });
    if (isUserExist)
      return res.status(401).json({
        success: false,
        message: "User already Exist. Try loging in instead",
      });
    const new_password = await passwordHidden(password);
    await userSchema.create({
      username,
      password: new_password,
      email,
    });
    const token = jwt.sign({ username: username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      success: true,
      message: "User successfully registered 🎉",
      token,
    });
  } catch (err) {
    console.log("☠️Error occured while inserting ", err);
  }
};

const getallUser = async (req, res) => {
  try {
    const availableUser = await userSchema.find();
    res.status(200).json({
      success: true,
      data: availableUser,
    });
  } catch (err) {
    console.log("☠️Error in fetching the data", err);
  }
};

const loggedIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userdata = await userSchema.findOne({ username });

    if (!userdata) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    const isMatch = await bcrypt.compare(password, userdata.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    const token = jwt.sign({ username: username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      success: true,
      data: userdata,
      token,
    });
  } catch (err) {
    console.log("☠️ Error occurred:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================================= posts =========================================

const create_posts = async (req, res) => {
  try {
    const user = await userSchema.findOne({ username: req.user.username });
    const { title, body } = req.body;
    await posts.create({
      user_id: user._id,
      title,
      body,
    });
    res.status(200).json({
      success: true,
      message: "Data Successfully added",
    });
  } catch (err) {
    console.log("Error in adding data to posts::", err);
  }
};

const all_posts = async (req, res) => {
  try {
    const allPosts = await posts.find();

    const userIds = [
      ...new Set(allPosts.map((post) => post.user_id.toString())),
    ];

    const users = await userSchema
      .find({ _id: { $in: userIds } })
      .select("username email")
      .lean();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    const result = allPosts.map((post) => ({
      ...post.toObject(),
      user: userMap[post.user_id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("❌ Error occurred:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const edit_posts = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await posts.findOne({ _id: id });
    if (!data)
      return res.status(400).json({
        success: false,
        message: "Invalid Id...",
      });
    await posts.updateOne({ _id: id }, { $set: req.body });
    res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (err) {
    console.log("Error occured while updating", err);
  }
};

const delete_post = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await posts.findOne({ _id: id });
    if (!data)
      return res.status(400).json({
        success: false,
        message: "Invalid Id...",
      });
    await posts.deleteOne({ _id: id });
    res.status(400).json({
      success: true,
      message: "deleted Successfully",
    });
  } catch (err) {
    console.log("Error occured while deleting", err);
  }
};

module.exports = {
  addNewUser,
  getallUser,
  loggedIn,
  create_posts,
  all_posts,
  edit_posts,
  delete_post,
};
