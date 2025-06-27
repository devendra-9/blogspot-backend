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
    const isUserExist = await userSchema.findOne({ email });
    if (isUserExist)
      return res.status(401).json({
        success: false,
        message: "User already Exist. Try loging in instead",
      });
    const new_password = await passwordHidden(password);
    const new_user = await userSchema.create({
      username,
      password: new_password,
      email,
    });
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const find_new_user = await userSchema.findOne({_id:new_user})
    const data={
      "username":find_new_user.username,
      "email":find_new_user.email
    }

    res.status(200).json({
      success: true,
      message: "User successfully registered 🎉",
      data:data,
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
    const { email, password } = req.body;
    const userdata = await userSchema.findOne({ email });

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
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60,
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
    const user = await userSchema.findOne({ email: req.user.email });
    const { title, body } = req.body;
    await posts.create({
      user_id: user._id,
      title,
      body,
    });

    // Emit the event
    const io = req.app.get("io"); // Access io from app
    io.emit("posts_updated"); // Notify all connected clients

    res.status(200).json({
      success: true,
      message: "Data Successfully added",
    });
  } catch (err) {
    console.log("Error in adding data to posts::", err);
    res.status(500).json({ success: false, message: "Error adding post" });
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

    // Emit update event
    const io = req.app.get("io");
    io.emit("posts_updated");

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (err) {
    console.log("Error occurred while updating", err);
    res.status(500).json({ success: false, message: "Error updating post" });
  }
};

const myposts = async (req, res) => {
  try {
    const user_id = await userSchema.findOne({ email: req.user.email });
    if (!user_id) return { success: false, message: "No email found" };
    const post_data = await posts.find({ user_id: user_id._id });
    res.status(200).json({ success: true, data: post_data });
  } catch (err) {
    console.error("Error while retrieving the information", err);
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

    // Emit update event
    const io = req.app.get("io");
    io.emit("posts_updated");

    res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.log("Error occurred while deleting", err);
    res.status(500).json({ success: false, message: "Error deleting post" });
  }
};

const checkauth = (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    console.log("error arised::", err);
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
  });

  res
    .status(200)
    .json({ success: true, message: "Logged out successfully 🚪" });
};

module.exports = {
  addNewUser,
  getallUser,
  loggedIn,
  create_posts,
  all_posts,
  edit_posts,
  delete_post,
  checkauth,
  logout,
  myposts,
};
