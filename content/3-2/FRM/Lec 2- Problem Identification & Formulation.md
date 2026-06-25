## Hypothesis

> Ordinarily, hypothesis means a simple assumption or some proposition (e.g., belief, guess, idea, possibility) to be proved or disproved. 
> **For a researcher**
> A hypothesis may be defined as a proposition or a set of proposition that tries to explain the occurrence of some specified group of phenomena. It can be provisional conjecture to guide research or investigation that is believe to be highly probable in the light of established facts.

**Characteristics of Hypothesis** 
- Clear and precise.
- Capable of being tested.
- State relationship between variables.
- Limited in scope and must be specific.
- Stated in most simple terms.
- Consistent with most know facts.
- Must explain the facts.

### Basic Concepts of Hypothesis
**Null Hypothesis ($H_{0}$)**: If method A is to be compared with method B with respect to superiority, and if it is assumed that both methods are equally good.  
**Alternate Hypothesis ($H_{a}$)**: If method A is to be compared with method B with respect to superiority, and it is assumed that method A is superior or that method B is inferior.  
**Population Mean ($\mu$)**: True average value of a variable.  
**Hypothesized Mean ($\mu_{H_{0}}$)**: A specified value of population mean assumed for the purpose of statistical testing.  

>[!note] Example
>Suppose we want to test the hypothesis that the population mean ($\mu$) is equal to the hypothesized mean $(\mu_{H_{0}})=100$ .

| **Hypothesis**       | **Expression**             | **Explanation**                                                                                                  |
| -------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Null hypothesis      | $H_0 : \mu = \mu_{H_0}$    | The null hypotheis is that the population mean is equal to the hypothesised mean 100                             |
| Alternate hypothesis | $H_a : \mu \neq \mu_{H_0}$ | The alternative hypothesis is that the population mean is not equal to 100 i.e., it may be more or less than 100 |
| Alternate hypothesis | $H_a : \mu > \mu_{H_0}$    | The alternative hypothesis is that the population mean is greater than 100                                       |
| Alternate hypothesis | $H_a : \mu < \mu_{H_0}$    | The alternative hypothesis is that the population mean is less than 100                                          |

**The level of significance**  
If the level of significance is 5%, it means that the researcher is willing to take as much as a 5% risk of rejecting the null hypothesis when it ($H_{0}$) happens to be true. 

**Two tailed & one tailed tests** 
- A two tailed test rejects the null hypothesis if, the population mean is significantly higher or lower than the hypothesized mean.
- A one tailed test would be used to test, say whether the population means is either higher or lower than some hypothesized value (only one rejection region).

**Errors in testing of hypothesis**  
Type I error means rejection of hypothesis which should have been accepted and Type II error means accepting the hypothesis which should have been rejected.

|                 |      Accept $H_0$       |     Reject $H_{0}$      |
| --------------- | :---------------------: | :---------------------: |
| $H_{0}$ (true)  |    Correct decision     | Type I error ($\alpha$) |
| $H_{0}$ (false) | Type II error ($\beta$) |     Correct decison     |
### Testing of Hypothesis
>[!question] Problem Statement
>A certain chemical process is said to have produced 15 or less pounds of waste material for every batch of 60 lbs with a corresponding standard deviation of 5 lbs. A random sample of 100 batches gives an average of 15.5 lbs of waste per batch. 
>- **Task 1:** Test at 10% level of significance whether the average quantity of waste per batch increased.
>- **Task 2:**  Test at 20% level of significance whether the average quantity of waste per batch increased.
>- **Task 3:** Find the possible type I error and type II error in each case.


**Given Data**
- Hypothesised mean ($\mu_{H_0}$) = 15 lbs
- Sample mean ($\bar{x}$) = 15.5 lbs
- Sample Standard deviation ($\sigma_p$) = 5 lbs
- Sample size ($n$) = 100 

**Objectives:**
- Test whether the mean waste has increased at different significance levels ($10\%$ & $20\%$).
- Find the possible Type I error and Type II error at different significance levels ($10\%$ & $20\%$).

### Solution

#### 1. At 10% Level of Significance ($\alpha = 10\%$)

**Hypotheses:**

$$
H_0 : \mu \le \mu_{H_0} \quad \text{and} \quad H_a : \mu > \mu_{H_0}
$$

Thus, the hypotheses become:

$$
H_0 : \mu \le 15 \quad \text{and} \quad H_a : \mu > 15
$$

This is a one-sided (right-tail) z-test. The test statistic is:

$$
Z = \frac{\bar{X} - \mu_{H_0}}{\sigma_p / \sqrt{n}}
$$

For a right-tailed test at $\alpha = 10\% = 0.1$, the critical z-value is $z_{0.1} = 1.28$ _(From z-table)_.

**Critical Value Region:**

Accept $H_0$ if:

$$
\bar{X} \le \mu_{H_0} + Z \times \left(\frac{\sigma_p}{\sqrt{n}}\right)
$$

$$
\bar{X} \le 15 + 1.28 \times \left(\frac{5}{10}\right) \implies \bar{X} \le 15.6408
$$

**Decision Rule:**
- **Accept $H_0$ if:** $\bar{x} \le 15.6408$ 
- **Reject $H_0$ if:** $\bar{x} > 15.6408$

**Decision:**
Since the sample mean $\bar{x} = 15.5$ satisfies $15.5 \le 15.6408$, **$H_0$ is accepted**.

> **Conclusion:** The evidence is not strong enough at a $10\%$ level of significance to show an increase in mean waste.

**Error Analysis at $\alpha = 10\%$:**
- **Scenario A:** Suppose $H_0$ is really true. The sample results also accept $H_0$ in this case. So, the decision is correct and there is **no Type I error**.
- **Scenario B:** Suppose $H_0$ is really false, but the sample results accept $H_0$. So, the decision is incorrect and results in a **Type II ($\beta$) error**.

$$
\text{Here, } Z = \frac{15.6408 - 15.5}{5 / \sqrt{100}} = 0.2816
$$
For $Z = 0.2816$, **Type II error ($\beta$) = 0.611** _(From z-table)_.

**Reference: Hypothesis Decision Matrix**

| **Reality**       | **Decision: Accept H0​**      | **Decision: Reject H0​**      |
| ----------------- | ----------------------------- | ----------------------------- |
| **$H_0$ (True)**  | Correct decision              | Type I error ($\alpha$ error) |
| **$H_0$ (False)** | Type II error ($\beta$ error) | Correct decision              |

#### 2. At 20% Level of Significance ($\alpha = 20\%$)

**Hypotheses:**

$$
H_0 : \mu \le 15 \quad \text{and} \quad H_a : \mu > 15
$$

This remains a one-sided (right-tail) z-test with the same test statistic layout. For a right-tailed test at $\alpha = 20\% = 0.2$, the critical z-value is $z_{0.2} = 0.8416$ _(From z-table)_.

**Critical Value Region:**

Accept $H_0$ if:

$$
\bar{X} \le \mu_{H_0} + Z \times \left(\frac{\sigma_p}{\sqrt{n}}\right)
$$

$$
\bar{X} \le 15 + 0.8416 \times \left(\frac{5}{10}\right) \implies \bar{X} \le 15.4208
$$

**Decision Rule:**
- **Accept $H_0$ if:** $\bar{x} \le 15.4208$
- **Reject $H_0$ if:** $\bar{x} > 15.4208$

**Decision:**
Since the sample mean $\bar{x} = 15.5$ satisfies $15.5 > 15.4208$, **$H_0$ is rejected**.

> **Conclusion:** There is sufficient evidence at a $20\%$ level of significance that the mean waste has increased.

**Error Analysis at $\alpha = 20\%$:**

- **Scenario A:** Suppose $H_0$ is really true. But the sample results reject $H_0$ in this case. So, the decision is not correct and there is a **Type I error of $\alpha = 0.2$**.
- **Scenario B:** Suppose $H_0$ is really false. The sample results also reject $H_0$ in this case. So, the decision is correct and there is **no error**.

---
[[Lec 4- Experimental Computational Design|Next: Lec 4 →]]
