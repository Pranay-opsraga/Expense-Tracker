// SYSTEM DATE

const now = new Date();
const CURRENT_MONTH = String(now.getMonth() + 1).padStart(2, "0");
const CURRENT_YEAR = String(now.getFullYear());
const CURRENT_KEY = `${CURRENT_YEAR}-${CURRENT_MONTH}`;

// DOM ELEMENTS

const expenseList = document.querySelector(".expense-list");
const amountInput = document.getElementById("amount-input");
const categoryInput = document.getElementById("category-input");
const addExpenseBtn = document.getElementById("add-expense-button");

const filterCategory = document.getElementById("filter-category");
const clearBtn = document.getElementById("clear-button");
const dates = document.getElementById("dates");
const AmountSearch = document.getElementById("amount-search");

const totalExpenseValue = document.getElementById("total-expense-value");
const topCategory = document.getElementById("top-category");
const topCategoryValue = document.getElementById("top-category-value");

// STATE

let editingIndex = null;

// load all data from storage
let allExpenses = JSON.parse(localStorage.getItem("expenseData")) || {};

// load current month data
let expenses = allExpenses[CURRENT_KEY] || [];

// HELPERS

function saveExpenses() {
  allExpenses[CURRENT_KEY] = expenses;
  localStorage.setItem("expenseData", JSON.stringify(allExpenses));
}

function getDotClass(category) {
  switch (category.toLowerCase()) {
    case "food":
      return "dot-food";
    case "travel":
      return "dot-travel";
    case "rent":
      return "dot-rent";
    default:
      return "dot-others";
  }
}

// RENDER EXPENSES

function renderExpenses(list = expenses) {
  expenseList.innerHTML = "";

  list.forEach((expense, index) => {
    const realIndex =
      expense.originalIndex !== undefined ? expense.originalIndex : index;

    const row = document.createElement("div");
    row.className = "expense-row";

    row.innerHTML = `
      <div class="expense-left">
        <span class="expense-dot ${getDotClass(expense.category)}"></span>
        <p>${expense.category}</p>
        <p>₹${expense.amount}</p>
      </div>
      <div class="expense-right">
        <p>${expense.date}</p>
        <div class ="expense-actions">
          <button class="edit-btn" data-index="${realIndex}">Edit</button>
          <button class="delete-btn" data-index="${realIndex}">Delete</button>
        </div>
      </div>
    `;
    expenseList.appendChild(row);
  });

  attachEditHandlers();
  attachDeleteHandlers();
}

// ADD / UPDATE

addExpenseBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!amount || amount <= 0) return;

  if (editingIndex !== null) {
    expenses[editingIndex].amount = amount;
    expenses[editingIndex].category = category;
    editingIndex = null;
    addExpenseBtn.textContent = "Add Expense";
  } else {
    expenses.push({
      category,
      amount,
      date: now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  amountInput.value = "";
  saveExpenses();
  updateUI();
});

// DELETE

function attachDeleteHandlers() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      expenses.splice(index, 1);
      saveExpenses();
      updateUI();
    });
  });
}

// EDIT

function attachEditHandlers() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      editingIndex = Number(btn.dataset.index);
      const expense = expenses[editingIndex];
      amountInput.value = expense.amount;
      categoryInput.value = expense.category;
      addExpenseBtn.textContent = "Update Expense";
    });
  });
}

// FILTERS

filterCategory.addEventListener("change", () => {
  if (filterCategory.value === "All Categories") {
    renderExpenses(expenses);
    return;
  }

  const filtered = expenses
    .map((e, i) => ({ ...e, originalIndex: i }))
    .filter((e) => e.category === filterCategory.value);

  renderExpenses(filtered);
});

dates.addEventListener("input", () => {
  if (!dates.value) {
    renderExpenses(expenses);
    return;
  }

  const filtered = expenses
    .map((e, i) => ({ ...e, originalIndex: i }))
    .filter((e) => e.date.startsWith(dates.value));

  renderExpenses(filtered);
});

AmountSearch.addEventListener("input", () => {
  if (!AmountSearch.value) {
    renderExpenses(expenses);
    return;
  }

  const filtered = expenses
    .map((e, i) => ({ ...e, originalIndex: i }))
    .filter((e) => e.amount.toString().startsWith(AmountSearch.value));

  renderExpenses(filtered);
});

clearBtn.addEventListener("click", () => {
  filterCategory.value = "All Categories";
  dates.value = "";
  AmountSearch.value = "";
  renderExpenses(expenses);
});

// TOTAL EXPENSE

function updateTotalExpense() {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  totalExpenseValue.textContent = `₹${total.toLocaleString("en-IN")}`;
}

// TOP CATEGORY

function TopCategory() {
  const totals = {};

  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });

  let max = 0;
  let name = "";

  for (let cat in totals) {
    if (totals[cat] > max) {
      max = totals[cat];
      name = cat;
    }
  }

  topCategory.textContent = name;
  topCategoryValue.textContent = `₹${max.toLocaleString("en-IN")}`;
}

// DONUT CHART

let expenseChart = null;

function getCategoryTotals() {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return totals;
}

function renderchart() {
  const canvas = document.getElementById("expense-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const totals = getCategoryTotals();

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: ["#f97316", "#3b82f6", "#22c55e", "#a855f7"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "50%",
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

// UPDATE UI

function updateUI() {
  renderExpenses();
  updateTotalExpense();
  TopCategory();
  renderchart();
}

// INIT

updateUI();
