const express = require("express");
const router = express.Router();
const {addNewUser, getallUser} = require('../services/index')


// ======================================for uer registration====================================

router.post("/add_user", addNewUser);

router.get('/all_user',getallUser)

router.get("/all_posts", (req, res) => {
  console.log("reached here");
});

module.exports = router;
