const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");

let currentExpression = "";
let justEvaluated = false;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === "clear") {
      clearCalculator();
      return;
    }

    if (action === "clear-entry") {
      clearEntry();
      return;
    }

    if (action === "delete") {
      deleteLastCharacter();
      return;
    }

    if (action === "calculate") {
      calculateResult();
      return;
    }

    if (action === "toggle-sign") {
      toggleSign();
      return;
    }

    if (action === "square") {
      applySingleNumberFunction("square");
      return;
    }

    if (action === "sqrt") {
      applySingleNumberFunction("sqrt");
      return;
    }

    if (action === "reciprocal") {
      applySingleNumberFunction("reciprocal");
      return;
    }

    if (value) {
      addToExpression(value);
    }
  });
});

function addToExpression(value) {
  if (resultDisplay.textContent === "Error") {
    clearCalculator();
  }

  if (justEvaluated) {
    if (isOperator(value)) {
      currentExpression = resultDisplay.textContent;
    } else {
      currentExpression = "";
      expressionDisplay.textContent = "";
      resultDisplay.textContent = "0";
    }

    justEvaluated = false;
  }

  const lastChar = currentExpression.slice(-1);

  if (value === ".") {
    const lastNumber = getLastNumber();
    if (lastNumber.includes(".")) {
      return;
    }

    if (currentExpression === "" || isOperator(lastChar) || lastChar === "(") {
      currentExpression += "0";
    }
  }

  if (value === "(") {
    if (isNumber(lastChar) || lastChar === ")" || lastChar === "%") {
      currentExpression += "*";
    }

    currentExpression += value;
    updateDisplay();
    return;
  }

  if (value === ")") {
    if (!canAddClosingParenthesis()) {
      return;
    }
  }

  if (isOperator(value)) {
    handleOperatorInput(value);
    return;
  }

  currentExpression += value;
  updateDisplay();
}

function handleOperatorInput(value) {
  const lastChar = currentExpression.slice(-1);

  if (currentExpression === "") {
    if (value === "-") {
      currentExpression = "-";
      updateDisplay();
    }
    return;
  }

  if (lastChar === "(") {
    if (value === "-") {
      currentExpression += value;
      updateDisplay();
    }
    return;
  }

  if (isOperator(lastChar)) {
    currentExpression = currentExpression.slice(0, -1) + value;
  } else {
    currentExpression += value;
  }

  updateDisplay();
}

function calculateResult() {
  const exp = currentExpression.trim();

  if (exp === "") {
    return;
  }

  try {
    if (!isValidExpression(exp)) {
      throw new Error("Invalid expression");
    }

    const convertedExpression = convertPercent(exp);
    const result = Function(`"use strict"; return (${convertedExpression})`)();

    if (!Number.isFinite(result)) {
      throw new Error("Invalid calculation");
    }

    expressionDisplay.textContent = formatExpressionForDisplay(exp) + " =";
    resultDisplay.textContent = formatResult(result);
    currentExpression = String(formatResult(result));
    justEvaluated = true;
  } catch (error) {
    expressionDisplay.textContent = formatExpressionForDisplay(exp);
    resultDisplay.textContent = "Error";
    justEvaluated = false;
  }
}

function clearCalculator() {
  currentExpression = "";
  expressionDisplay.textContent = "";
  resultDisplay.textContent = "0";
  justEvaluated = false;
}

function clearEntry() {
  if (resultDisplay.textContent === "Error" || justEvaluated) {
    clearCalculator();
    return;
  }

  currentExpression = currentExpression.replace(/(\d+\.?\d*|\.\d+)$/, "");
  updateDisplay();
}

function deleteLastCharacter() {
  if (resultDisplay.textContent === "Error") {
    clearCalculator();
    return;
  }

  if (justEvaluated) {
    clearCalculator();
    return;
  }

  currentExpression = currentExpression.slice(0, -1);
  updateDisplay();
}

function toggleSign() {
  if (resultDisplay.textContent === "Error") {
    clearCalculator();
    return;
  }

  if (currentExpression === "") {
    currentExpression = "-";
    updateDisplay();
    return;
  }

  const match = currentExpression.match(/(-?\d+\.?\d*|-?\.\d+)$/);

  if (!match) {
    return;
  }

  const number = match[0];
  const startIndex = currentExpression.length - number.length;

  let changedNumber;

  if (number.startsWith("-")) {
    changedNumber = number.slice(1);
  } else {
    changedNumber = "-" + number;
  }

  currentExpression =
    currentExpression.slice(0, startIndex) +
    changedNumber;

  updateDisplay();
}

function applySingleNumberFunction(type) {
  try {
    if (currentExpression.trim() === "") {
      return;
    }

    if (!isValidExpression(currentExpression)) {
      throw new Error("Invalid expression");
    }

    const convertedExpression = convertPercent(currentExpression);
    const value = Function(`"use strict"; return (${convertedExpression})`)();

    if (!Number.isFinite(value)) {
      throw new Error("Invalid calculation");
    }

    let result;
    let shownExpression;

    if (type === "square") {
      result = value * value;
      shownExpression = `(${formatExpressionForDisplay(currentExpression)})²`;
    }

    if (type === "sqrt") {
      if (value < 0) {
        throw new Error("Invalid calculation");
      }

      result = Math.sqrt(value);
      shownExpression = `√(${formatExpressionForDisplay(currentExpression)})`;
    }

    if (type === "reciprocal") {
      if (value === 0) {
        throw new Error("Invalid calculation");
      }

      result = 1 / value;
      shownExpression = `1 / (${formatExpressionForDisplay(currentExpression)})`;
    }

    expressionDisplay.textContent = shownExpression + " =";
    resultDisplay.textContent = formatResult(result);
    currentExpression = String(formatResult(result));
    justEvaluated = true;
  } catch (error) {
    expressionDisplay.textContent = formatExpressionForDisplay(currentExpression);
    resultDisplay.textContent = "Error";
    justEvaluated = false;
  }
}

function updateDisplay() {
  expressionDisplay.textContent = "";
  resultDisplay.textContent = formatExpressionForDisplay(currentExpression) || "0";
}

function isOperator(char) {
  return ["+", "-", "*", "/", "%"].includes(char);
}

function isNumber(char) {
  return /[0-9]/.test(char);
}

function getLastNumber() {
  const match = currentExpression.match(/(\d+\.?\d*|\.\d+)$/);
  return match ? match[0] : "";
}

function canAddClosingParenthesis() {
  const openCount = (currentExpression.match(/\(/g) || []).length;
  const closeCount = (currentExpression.match(/\)/g) || []).length;
  const lastChar = currentExpression.slice(-1);

  return openCount > closeCount && !isOperator(lastChar) && lastChar !== "(";
}

function isValidExpression(expression) {
  const validCharacters = /^[0-9+\-*/%.() ]+$/;

  if (!validCharacters.test(expression)) {
    return false;
  }

  const trimmed = expression.trim();
  const lastChar = trimmed.slice(-1);

  if (["+", "-", "*", "/", "."].includes(lastChar)) {
    return false;
  }

  return areParenthesesBalanced(trimmed);
}

function areParenthesesBalanced(expression) {
  let balance = 0;

  for (const char of expression) {
    if (char === "(") {
      balance++;
    }

    if (char === ")") {
      balance--;
    }

    if (balance < 0) {
      return false;
    }
  }

  return balance === 0;
}

function convertPercent(expression) {
  return expression.replace(/(\d+\.?\d*|\.\d+)%/g, "($1/100)");
}

function formatExpressionForDisplay(expression) {
  return expression
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−");
}

function formatResult(number) {
  if (Number.isInteger(number)) {
    return number;
  }

  return parseFloat(number.toFixed(10));
}

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (!isNaN(key) && key !== " ") {
    addToExpression(key);
    return;
  }

  if (["+", "-", "*", "/", "%", ".", "(", ")"].includes(key)) {
    addToExpression(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    deleteLastCharacter();
    return;
  }

  if (key === "Escape") {
    clearCalculator();
    return;
  }
});
