---
id: "c10-l1-inference-and-hypothesis-tests"
moduleId: "c10-statistical-inference"
title: "Sampling, CLT, Confidence Intervals, and Hypothesis Testing"
order: 1
estimatedMinutes: 25
difficulty: "advanced"
objectives:
  - "Explain the Central Limit Theorem (CLT) and sampling variability"
  - "Interpret a 95% confidence interval accurately"
  - "Run a two-sample t-test with scipy.stats.ttest_ind and interpret p-values alongside effect size"
prerequisites: ["c9-l1-descriptive-stats-correlation"]
packages: ["numpy", "scipy"]
sources: ["openintro-stats", "scipy-docs", "think-stats"]
tags: ["inference", "clt", "confidence-interval", "p-value", "scipy"]
---

## Concept

### 1. Sampling and the Central Limit Theorem (CLT)

Different random samples from the same population yield slightly different sample means (**sampling variability**) [src:openintro-stats]. By the **Central Limit Theorem**, as sample size `n` grows, the distribution of sample means approaches a normal distribution centered on the population mean, even if the underlying population is skewed [src:openintro-stats].

```python
import numpy as np

rng = np.random.default_rng(42)
sample_means = [rng.exponential(scale=10, size=40).mean() for _ in range(100)]
print("Mean of sample means:", round(float(np.mean(sample_means)), 2))
```

### 2. Confidence Intervals

A **95% Confidence Interval** is a range constructed so that across repeated random samples, ~95% of intervals capture the true population parameter [src:openintro-stats].

```python
import numpy as np

sample = np.array([22, 24, 21, 23, 25, 26, 20, 24])
se = np.std(sample, ddof=1) / np.sqrt(len(sample))
ci_low, ci_high = np.mean(sample) - 1.96 * se, np.mean(sample) + 1.96 * se
print(f"Approx 95% CI: [{ci_low:.2f}, {ci_high:.2f}]")
```

### 3. Hypothesis Testing, p-values, and Effect Size

Under a null hypothesis (`H0`, e.g., no difference between Group A and Group B), the **p-value** is the probability of observing data at least as extreme as yours *assuming H0 is true* [src:openintro-stats]. It is **not** the probability that H0 is true!

Always report practical **effect size** (such as the difference in means) alongside p-values, because large samples can yield `p < 0.05` for tiny, unimportant differences [src:openintro-stats].

```python
from scipy import stats

a = [22, 24, 21, 23, 25]
b = [28, 30, 27, 29, 31]
t_stat, p_val = stats.ttest_ind(b, a, equal_var=False)
print(f"Diff: {sum(b)/len(b) - sum(a)/len(a):.1f}, p={p_val:.4f}")
```

Explanation: Explore the **Central Limit Theorem**, **Confidence Intervals**, and **p-value** tabs in the **Stats Simulators** page to see these ideas move in real time.

Note: Behavior may differ between versions. Check the official docs for your installed version.

## Why it matters

A/B tests for UI changes, marketing campaigns, and product features rely on confidence intervals, p-values, and effect sizes to avoid shipping random noise.

## Worked example

```python
from scipy import stats

control = [22, 24, 21, 23, 25]
variant = [28, 30, 27, 29, 31]
t_stat, p_val = stats.ttest_ind(variant, control, equal_var=False)
print(f"t={t_stat:.2f}, p={p_val:.4f}")
```

## Common mistakes

- **Claiming `p = 0.03` means "there is a 3% chance H0 is true"**: `p` is computed *assuming* H0 is true (`P(data | H0)`), not `P(H0 | data)` [src:openintro-stats].

## Check your understanding

1. What does a p-value actually measure?
2. Why can a large sample size produce `p < 0.05` even when the real-world difference is tiny?
3. Complete the A/B test exercise on the right.

## Sources

- [src:openintro-stats] OpenIntro Statistics (Diez, Cetinkaya-Rundel, Barr)
- [src:scipy-docs] SciPy Documentation (SciPy community)
- [src:think-stats] Think Stats (Allen B. Downey)
