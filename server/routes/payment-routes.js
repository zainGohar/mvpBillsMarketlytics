var express = require("express");
const router = express.Router();
const { paymentController } = require("../controllers");
const authenticateToken = require("../middleware/authenticateToken");

const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.post("/payment-success", authenticateToken, async function (req, res) {
  paymentController.paymentSuccess(req, res);
});

router.post("/webhook", async function (req, res) {
  paymentController.webhook(req, res);
});

router.post(
  "/create-customer-portal-session",
  authenticateToken,
  async function (req, res) {
    paymentController.createCustomerPortalSession(req, res);
  }
);

router.post(
  "/create-checkout-session",
  authenticateToken,
  async function (req, res) {
    paymentController.createCheckoutSession(req, res);
  }
);

module.exports = router;
