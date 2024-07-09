const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError");

const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT id, comp_code FROM invoices order by id`
    );

    return res.json({ invoices: results.rows });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const results = await db.query(
      `select i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description from invoices AS i inner join companies as c ON (i.comp_code = c.code) where id=$1`,
      [id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} not found`, 404);
    }

    const data = results.rows[0];

    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amount: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({ invoice: invoice });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amt, paid } = req.body;

    const id = req.params.id;

    let paidDate = null;

    const currentResult = await db.query(
      `select paid from invoices where id=$1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} not found`, 404);
    }

    currentPaidDate = currentResult.rows[0].paid_date;

    if (!currentPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currentPaidDate;
    }

    const result = await db.query(
      `update invoices set amt=$1, paid=$2, paid_date=$3 where id=$4 returning id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const result = await db.query(
      `delete from invoices where id =$1 returning id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} not found`, 404);
    } else {
      return res.json({ message: `Deleted the invoice ${id}` });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
