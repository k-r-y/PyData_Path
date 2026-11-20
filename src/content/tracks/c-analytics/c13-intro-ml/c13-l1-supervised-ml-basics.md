---
id: "c13-l1-supervised-ml-basics"
moduleId: "c13-intro-ml"
title: "Train/Test Split, Regression, Classification, and Overfitting"
order: 1
estimatedMinutes: 24
difficulty: "advanced"
objectives:
  - "Split data into training and test sets using train_test_split"
  - "Fit and evaluate a LinearRegression and LogisticRegression model in scikit-learn"
  - "Explain overfitting and why test-set metrics matter"
prerequisites: ["c12-l1-memos-and-insights"]
packages: ["numpy", "scikit-learn"]
sources: ["sklearn-docs", "python-ds-handbook"]
tags: ["machine-learning", "scikit-learn", "regression", "classification", "overfitting"]
---

## Concept

Supervised machine learning learns a mapping from input features `X` (2D) to a target `y` (1D) [src:sklearn-docs]:
- **Regression** (predicting a continuous number, e.g., sales) using `LinearRegression` evaluated with RMSE or `R^2` [src:sklearn-docs].
- **Classification** (predicting a category, e.g., churn yes/no) using `LogisticRegression` evaluated with accuracy, precision, and recall [src:sklearn-docs].

Always split data with `train_test_split(X, y, test_size=0.2, random_state=42)` **before** fitting [src:sklearn-docs]. A model that memorizes training noise scores high on training data but fails on unseen test data: this is **overfitting** [src:sklearn-docs].

Explanation: Testing a model on the exact same data it trained on is like grading a student with the exact practice questions they memorized. Holding out a test set measures true generalization.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

Predicting demand, customer churn, or student risk extends descriptive analytics into forward-looking decision support, provided you evaluate limits honestly.

## Worked example

```python
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([2, 4, 6, 8, 10, 12, 14, 16])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
model = LinearRegression().fit(X_train, y_train)
print("Test R^2:", model.score(X_test, y_test))
```

## Common mistakes

- **Data leakage**: Fitting a scaler or imputer on the full dataset *before* `train_test_split` leaks test-set statistics into training [src:sklearn-docs].

## Check your understanding

1. Why do we hold out a test set with `train_test_split`?
2. What is overfitting?
3. Complete the exercises on the right and try the **Regression Fitting** simulator!

## Sources

- [src:sklearn-docs] scikit-learn User Guide (scikit-learn developers)
- [src:python-ds-handbook] Python Data Science Handbook (Jake VanderPlas)
