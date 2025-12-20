const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    addExpense,
    getAllExpenses,
    deleteExpense,
    downloadExpenseExcel
} = require("../controllers/expenseController");

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpenses);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

module.exports = router;