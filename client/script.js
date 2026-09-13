const API_URL = "http://localhost:5000/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const categoryFilter = document.getElementById("categoryFilter");

const totalSpent = document.getElementById("totalSpent");
const expenseCount = document.getElementById("expenseCount");
const topCategory = document.getElementById("topCategory");
const message = document.getElementById("message");
let expenses = [];
async function loadExpenses() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }
        expenses = await response.json();
        displayExpenses(expenses);
        updateSummary();
    } catch (error) {
        showMessage("Error loading expenses", "danger");
    }
}
function displayExpenses(data) {
    expenseList.innerHTML = "";
    data.forEach((expense) => {
        const row = document.createElement("tr")
        row.innerHTML = `
            <td>${expense.title}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>
                <button
                    class="btn btn-danger btn-sm delete-btn"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;
        expenseList.appendChild(row);
    });
}
function updateSummary() {
    let total = 0;
    let categories = {};
    expenses.forEach((expense) => {
        total += expense.amount;
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
    });
    totalSpent.textContent = `₹${total}`;
    expenseCount.textContent = expenses.length;
    let highestCategory = "-";
    let highestAmount = 0;
    for (let category in categories) {
        if (categories[category] > highestAmount) {
            highestAmount = categories[category];
            highestCategory = category;
        }
    }
    topCategory.textContent = highestCategory;
}
expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    if (title === "") {
        showMessage("Please enter title", "danger");
        return;
    }
    if (amount <= 0) {
        showMessage("Amount must be positive", "danger");
        return;
    }
    if (date === "") {
        showMessage("Please select date", "danger");
        return;
    }
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                amount: amount,
                category: category,
                date: date
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        showMessage("Expense added successfully", "success");
        expenseForm.reset();
        loadExpenses();
    } catch (error) {
        showMessage(error.message, "danger");
    }
});
async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        showMessage("Expense deleted successfully", "success");
        loadExpenses();
    } catch (error) {
        showMessage(error.message, "danger");
    }
}
categoryFilter.addEventListener("change", function () {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === "All") {
        displayExpenses(expenses);
    } else {
        const filteredExpenses = expenses.filter((expense) => expense.category === selectedCategory );
        displayExpenses(filteredExpenses);
    }
});
function showMessage(text, type) {
    message.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${text}
        </div>
    `;
    setTimeout(() => {
        message.innerHTML = "";
    }, 3000);
}
loadExpenses();