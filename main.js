const expenseList = document.querySelector(".expense-list");
const amountInput = document.getElementById("amount-input");
const categoryInput = document.getElementById("category-input");
const addExpenseBtn = document.getElementById("add-expense-button");
let editingIndex = null;

// STEP 1: DATA

let expenses = [
  { category: "Food", amount: 700, date: "26 Jan" },
  { category: "Travel", amount: 1200, date: "25 Jan" },
  { category: "Rent", amount: 5000, date: "24 Jan" },
];

// STEP 2: RENDER EXPENSE LIST

// category → dot class
function getDotClass(category) {
  switch (category.toLowerCase()) {
    case "food":
      return "dot-food";
    case "rent":
      return "dot-rent";
    case "travel":
      return "dot-travel";
    default:
      return "dot-others";
  }
}

function renderExpenses() {
  expenseList.innerHTML = "";

  expenses.forEach((expense, index) => {
    const row = document.createElement("div");
    row.classList.add("expense-row");

    row.innerHTML = `
      <div class="expense-left">
        <span class="expense-dot ${getDotClass(expense.category)}"></span>
        <p class="expense-category">${expense.category}</p>
        <p class="expense-amount">₹${expense.amount}</p>
      </div>

      <div class="expense-right">
        <p class="expense-date">${expense.date}</p>

        <div class="expense-actions">
           <button class="edit-btn" data-index="${index}">Edit</button>
           <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
      </div>
    `;

    expenseList.appendChild(row);
  });
  HandleDelete();
  HandleEdit();
}

addExpenseBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!amount || amount <= 0) return;

  if (editingIndex !== null) {
    // UPDATE
    expenses[editingIndex].amount = amount;
    expenses[editingIndex].category = category;

    editingIndex = null;
    addExpenseBtn.textContent = "Add Expense";
  } else {
    // ADD
    expenses.push({
      category,
      amount,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    });
  }

  amountInput.value = "";
  renderExpenses();
});

// Delete logic
const HandleDelete = () => {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.dataset.index;
      expenses.splice(index, 1);
      renderExpenses();
    });
  });
};

// Edit logic

const HandleEdit = () => {
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      editingIndex = button.dataset.index;

      const expense = expenses[editingIndex];

      amountInput.value = expense.amount;
      categoryInput.value = expense.category;

      addExpenseBtn.textContent = "Update Expense";
    });
  });
};

renderExpenses();
