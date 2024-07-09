const express = require("express");
const router = new express.Router();

const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT code, name, description FROM companies`
    );

    return res.json(results.rows);
  } catch (error) {
    return next(error);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description FROM companies WHERE code=$1`,
      [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    return res.json(results.rows);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = req.params.code;

    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;

    const result = await db.query(`DELETE FROM companies WHERE code=$1`, [
      code,
    ]);
    return res.json({ message: `Deleted the company ${code}` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
