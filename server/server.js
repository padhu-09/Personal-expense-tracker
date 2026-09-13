const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const expenses = require("./data");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Personal Expense Tracker API is running");
});

app.get("/expenses", (req, res) => {
    try {
        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get expenses"
        });
    }
});
app.get("/expenses/summary", (req, res) => {
  try {
    let total = 0;
    let categoryTotals = {};
    expenses.forEach((expense) => {
      total += expense.amount;
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    res.json({
      totalSpent: total,
      numberOfExpenses: expenses.length,
      categoryBreakdown: categoryTotals
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get summary"
    });
  }
});
app.get("/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const expense = expenses.find((item) => item.id === id);
    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get expense"
    });
  }
});
app.post("/expenses", (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number"
      });
    }
    const newId =
      expenses.length > 0
        ? Math.max(...expenses.map((expense) => expense.id)) + 1
        : 1;
    const newExpense = {
      id: newId,
      title: title,
      amount: Number(amount),
      category: category,
      date: date
    };
    expenses.push(newExpense);
    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add expense"
    });
  }
});
app.put("/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const expense = expenses.find((item) => item.id === id);
    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number"
      });
    }
    expense.title = title;
    expense.amount = Number(amount);
    expense.category = category;
    expense.date = date;
    res.json({
      message: "Expense updated successfully",
      expense: expense
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update expense"
    });
  }
});
app.delete("/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const index = expenses.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
    const deletedExpense = expenses.splice(index, 1);
    res.json({
      message: "Expense deleted successfully",
      expense: deletedExpense[0]
    });
  } catch (error) {
    res.status(500).json({message: "Failed to delete expense"});
  }
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong"
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});