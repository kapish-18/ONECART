import express from "express";
import {
  getPrivacyPolicy,
  getTermsAndConditions,
  getCancellationAndRefund,
  getShippingAndDelivery,
  getContactUs,
} from "../utils/legalTemplates.js";

const router = express.Router();

/* ================= PUBLIC LEGAL ENDPOINTS ================= */

router.get("/privacy", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getPrivacyPolicy());
});

router.get("/terms", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getTermsAndConditions());
});

router.get("/refunds", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getCancellationAndRefund());
});

router.get("/shipping", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getShippingAndDelivery());
});

router.get("/contact", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getContactUs());
});

export default router;
