const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index");
const {
  addNewUser,
  getallUser,
  loggedIn,
  create_posts,
  all_posts,
  edit_posts,
  delete_post,
  checkauth,
  logout,
  myposts
} = require("../services/index");

// ======================================for user registration====================================

router.post("/add_user", addNewUser);

router.get("/all_user", getallUser);

router.post("/existing_user", loggedIn);

// ===================================== for post routes =========================================

router.post("/create_post", middleware ,create_posts);

router.get("/all_posts", all_posts);

router.get("/my_posts", middleware ,myposts);

router.put("/edit_post/:id", middleware, edit_posts);

router.delete("/delete_post/:id", middleware, delete_post);

// ===================================== for login and logout ====================================

router.get('/auth/check', middleware, checkauth)

router.post('/logout',logout)

module.exports = router;
