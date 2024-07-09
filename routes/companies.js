const express = require("express");
const router = new express.Router();

const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT code, name FROM companies`);

    return res.json(results.rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
