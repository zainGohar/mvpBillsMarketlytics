var express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
router.use(bodyParser.json());

// insert data
router.post("/", async function (req, res) {
  userController.signup(req, res);
});

// specific data
router.post("/login", async function (req, res) {
  userController.login(req, res);
});

router.post("/google", async function (req, res) {
  userController.google(req, res);
});

router.post("/logindetails", authenticateToken, async function (req, res) {
  userController.logindetails(req, res);
});

router.post("/verify", async function (req, res) {
  userController.verify(req, res);
});

router.post("/resend-verify-email", async function (req, res) {
  userController.reSendVerifyEmail(req, res);
});

router.post("/reset", async function (req, res) {
  userController.reset(req, res);
});

router.post("/resend-reset-email", async function (req, res) {
  userController.reSendResetEmail(req, res);
});

router.post("/verify-reset-password-link", async function (req, res) {
  userController.verifyResetPasswordLink(req, res);
});

router.post("/reset-password", async function (req, res) {
  userController.resetPassword(req, res);
});

router.post("/change-password", async function (req, res) {
  userController.changePassword(req, res);
});

module.exports = router;
