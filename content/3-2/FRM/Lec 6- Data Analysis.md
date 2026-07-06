## 1. Foundations of Measurement & Error Analysis

### Statistical Analysis
- **Definition:** The process of collecting, organizing, interpreting, and evaluating data using mathematical techniques.
- **Purpose:** To extract meaningful insights, detect patterns, identify relationships, and determine whether results are statistically significant or simply due to random variation.

### Sources of Errors in Measurement
- **Systematic Errors:** Predictable and constant deviations from the true value.
  - Often controllable or rectifiable through calibration.
  - _Examples:_ Instrument bias, physical nonlinearity, environmental variations.
- **Random Errors:** Unpredictable, non-constant fluctuations occurring during measurement.
  - Cannot be calibrated out, but can be minimized by averaging multiple measurements.

### Performance Parameters of a Measurement System

| **Parameter** | **Definition** | **Practical Example** |
| --- | --- | --- |
| **Linearity** | The difference between the actual system response and an ideal linear relationship over a specified dynamic range. | If a sensor's input doubles, its output should ideally double. Deviation from this straight line measures nonlinearity. |
| **Resolution** | The smallest change in input that produces a detectable change in the output reading. | A digital voltmeter displaying $5.23\text{ V}$ has a resolution of $0.01\text{ V}$. Changes $< 0.01\text{ V}$ will not register. |
| **Sensitivity** | The ratio of the change in output to the corresponding change in input ($\frac{\Delta \text{Output}}{\Delta \text{Input}}$). | A temperature sensor producing $2\text{ mV}$ per $1^\circ\text{C}$ change has a sensitivity of $2\text{ mV}/^\circ\text{C}$. |
| **Accuracy** | The degree to which a measured value agrees with the true or accepted reference value. | If the true standard is $10.0\text{ V}$ and the device reads $9.9\text{ V}$, it is highly accurate. |

**Dynamic Range Constraints:**
- **Minimum Limit** ($x_{\text{min}}$): Constrained by instrument noise floor. Inputs below this produce no output.
- **Maximum Limit** ($x_{\text{max}}$): Constrained by physical limits (e.g., maximum power supply voltage). Exceeding this causes clipping (saturation) or damages the instrument.

## 2. Measures of Central Tendency

Central tendency identifies the single, typical value around which data cluster.

### A. Arithmetic Mean ($M$ or $\bar{x}$)

#### Ungrouped Data
$$M = \frac{\sum X}{N}$$
Where $\sum X$ is the sum of scores and $N$ is the total number of scores.

##### **Example (Solved)**
Find the mean of the test scores: `58, 34, 32, 47, 74, 67, 35, 34, 30, 39`

$$\sum X = 58+34+32+47+74+67+35+34+30+39 = 450$$
$$N = 10 \implies M = \frac{450}{10} = 45$$

#### Grouped Data
$$M = \frac{\sum fX}{N}$$
Where $X$ is the class midpoint, $f$ is the class frequency, and $N = \sum f$.

##### **Example (Solved)**
Calculate the mean of the following grouped frequency distribution:

| **Marks** | **Frequency (f)** | **Midpoint (X)** | **$f×X$**       |
| --------- | ----------------- | ---------------- | --------------- |
| 35–39     | 5                 | 37               | 185             |
| 30–34     | 7                 | 32               | 224             |
| 25–29     | 5                 | 27               | 135             |
| 20–24     | 6                 | 22               | 132             |
| 15–19     | 4                 | 17               | 68              |
| 10–14     | 3                 | 12               | 36              |
| **Total** | $N = 30$          |                  | $\sum fX = 780$ |

$$M = \frac{\sum fX}{N} = \frac{780}{30} = 26$$

### B. Median ($M_d$)

#### Ungrouped Data (Odd $n$)
Arrange data in ascending/descending order. The median is the middle observation.

$$M_d = \left(\frac{n+1}{2}\right)^{\text{th}}\text{ observation}$$

##### **Example (Solved)**
Find the median of: `6, 4, 3, 7, 8`

1. Sort data: `3, 4, 6, 7, 8`
2. $n = 5$ (Odd) $\implies M_d = (5+1)/2 = 3^{\text{rd}}\text{ value} = 6$

#### Ungrouped Data (Even $n$)
Arrange data. The median is the average of the two central observations.

$$M_d = \frac{\left(\frac{n}{2}\right)^{\text{th}}\text{ obs} + \left(\frac{n}{2}+1\right)^{\text{th}}\text{ obs}}{2}$$

##### **Example (Solved)**
Find the median of: `7, 8, 9, 3, 4, 10`

1. Sort data: `3, 4, 7, 8, 9, 10`
2. $n = 6$ (Even) $\implies M_d = \frac{3^{\text{rd}}\text{ value} + 4^{\text{th}}\text{ value}}{2} = \frac{7+8}{2} = 7.5$

#### Ungrouped Data with Frequencies
$$M_d = \text{Value of variable corresponding to the first cumulative frequency } \ge \frac{N}{2}$$

##### **Example (Solved)**
Find the Median of the distribution:

| **X** | **Frequency (f)** | **Cumulative Frequency (c.f.)** |
| --- | --- | --- |
| 20 | 7 | 7 |
| 40 | 5 | 12 |
| 60 | 4 | 16 |
| 80 | 3 | 19 |
| **Total** | $\sum f = 19$ | |

1. Calculate $\frac{N}{2} = \frac{19}{2} = 9.5$.
2. The cumulative frequency just greater than or equal to $9.5$ is $12$.
3. The value of $X$ corresponding to $c.f. = 12$ is $40$.
4. $\text{Median} = 40$.

#### Grouped Data (Class Interval)
$$M_d = L + \left( \frac{\frac{N}{2} - C}{f} \right) \times h$$

Where:
- $L = \text{lower class limit of the median class}$
- $N = \text{total frequency}$
- $C = \text{cumulative frequency of the pre-median class}$
- $f = \text{frequency of the median class}$
- $h = \text{width of the median class}$
- _Median Class:_ The class interval containing the $\left(\frac{N}{2}\right)^{\text{th}}$ observation

##### **Example (Solved)**
Calculate the median of the following dataset:

| **X (Class)** | **f** | **Cumulative Frequency (c.f.)** |
| --- | --- | --- |
| 0–10 | 3 | 3 |
| 10–20 | 5 | 8 |
| **20–30 (Median Class)** | **7** | **15** |
| 30–40 | 9 | 24 |
| 40–50 | 4 | 28 |
| **Total** | $N=28$ | |

1. Find the median class: $\frac{N}{2} = \frac{28}{2} = 14$. The first cumulative frequency exceeding $14$ is $15$, corresponding to class **20–30**.
2. Identify values: $L = 20$, $N = 28$, $C = 8$, $f = 7$, $h = 10$.
3. Apply formula:

$$M_d = 20 + \left( \frac{14 - 8}{7} \right) \times 10 = 20 + \left(\frac{6}{7}\right) \times 10 = 20 + 8.57 = 28.57$$

### C. Mode ($M_o$)

The value occurring with the highest frequency.

#### Ungrouped Data
Find the value with the maximum frequency.

##### **Example (Solved)**
Find the mode of: `2, 2, 3, 4, 7, 7, 7, 7, 9, 10, 12, 12`

$7$ occurs 4 times (highest frequency). $\text{Mode} = 7$.

#### Grouped Data
$$M_o = L + \left( \frac{f_1 - f_0}{2f_1 - f_0 - f_2} \right) \times h$$

Where:
- $L = \text{lower limit of the modal class}$
- $f_1 = \text{frequency of the modal class}$
- $f_0 = \text{frequency of the pre-modal class}$
- $f_2 = \text{frequency of the post-modal class}$
- $h = \text{width of the modal class}$
- _Modal Class:_ Class with the highest frequency

##### **Example (Solved)**
Find the mode of the following distribution:

| **Class Interval** | **Frequency (f)** |
| --- | --- |
| 0–10 | 3 |
| 10–20 | 5 |
| 20–30 | 7 |
| **30–40 (Modal Class)** | **9** |
| 40–50 | 4 |

1. Highest frequency is $9$, so the **modal class is 30–40**.
2. Identify values: $L=30$, $f_1 = 9$, $f_0 = 7$, $f_2 = 4$, $h = 10$.
3. Apply formula:

$$M_o = 30 + \left(\frac{9-7}{2(9) - 7 - 4}\right) \times 10 = 30 + \left(\frac{2}{18-11}\right) \times 10 = 30 + \left(\frac{2}{7}\right) \times 10 \approx 32.86$$

### Merits & Demerits of Central Tendency Measures

| **Measure** | **Merits** | **Demerits** |
| --- | --- | --- |
| **Arithmetic Mean** | Based on all observations.<br/>Rigidly defined.<br/>Easy to understand and calculate.<br/>Highly useful for algebraic operations. | Severely distorted by extreme outliers.<br/>Cannot be calculated for open-ended classes.<br/>Not suitable for highly skewed data. |
| **Median** | Rigidly defined.<br/>Unaffected by extreme values/outliers.<br/>Calculation possible for open-ended classes.<br/>Easy to interpret. | Does not utilize all observations.<br/>For even $n$, is only an estimate (mean of center two).<br/>Less suited for algebraic manipulations.<br/>Affected heavily by sampling fluctuations. |
| **Mode** | Simplest to calculate and understand.<br/>Completely unaffected by extreme values.<br/>Works with open-ended class intervals.<br/>Calculable for unequal class widths. | Not rigidly defined (can have multiple modes or no mode).<br/>Fails to utilize all individual observations.<br/>Unsuited for algebraic treatments.<br/>Heavily affected by sampling fluctuations. |

## 3. Measures of Dispersion

Dispersion measures the variation, spread, or scatter of data points around their average.

### A. Range
$$\text{Range} = \text{Highest Value} - \text{Lowest Value}$$

**Evaluation:** Quick but highly unstable as it relies entirely on the two extreme data points, making it highly sensitive to sampling fluctuations.

### B. Mean Deviation (MD)
Average of the absolute differences between each data point and a measure of central tendency (ignoring signs).

- **MD from Mean** ($\bar{x}$): $$\delta_{\bar{x}} = \frac{\sum |x_i - \bar{x}|}{n}$$
- **MD from Median** ($M$): $$\delta_m = \frac{\sum |x_i - M|}{n}$$
- **MD from Mode** ($Z$): $$\delta_z = \frac{\sum |x_i - Z|}{n}$$

### C. Standard Deviation ($\sigma$)
The square root of the arithmetic mean of squared deviations from the arithmetic mean.

#### Ungrouped Data Formula
$$\sigma = \sqrt{\frac{\sum(x_i - \bar{x})^2}{n}}$$

##### **Example (Solved)**
Calculate the SD for the weights of 10 babies (in lbs): `7.5, 4.5, 10.1, 9.6, 5.5, 6.6, 7.8, 5.9, 6.0, 5.5`

1. Compute Mean ($\bar{x}$):
$$\bar{x} = \frac{7.5+4.5+10.1+9.6+5.5+6.6+7.8+5.9+6.0+5.5}{10} = \frac{69}{10} = 6.9\text{ lbs}$$
2. Compute $(x_i - \bar{x})^2$:

| **$x_i$** | **$(x_i-\bar{x})$** | **$(x_i-\bar{x})^2$**           |
| --------- | ------------------- | ------------------------------- |
| 7.5       | 0.6                 | 0.36                            |
| 4.5       | -2.4                | 5.76                            |
| 10.1      | 3.2                 | 10.24                           |
| 9.6       | 2.7                 | 7.29                            |
| 5.5       | -1.4                | 1.96                            |
| 6.6       | -0.3                | 0.09                            |
| 7.8       | 0.9                 | 0.81                            |
| 5.9       | -1.0                | 1.00                            |
| 6.0       | -0.9                | 0.81                            |
| 5.5       | -1.4                | 1.96                            |
| **Sum**   |                     | $\sum(x_i - \bar{x})^2 = 30.28$ |

3. Calculate SD:
$$\sigma = \sqrt{\frac{30.28}{10}} = \sqrt{3.028} \approx 1.74\text{ lbs}$$

#### Grouped Data Formula
$$\sigma = \sqrt{\frac{\sum f_i(x_i - \bar{x})^2}{\sum f_i}} \quad \text{where} \quad \bar{x} = \frac{\sum f_ix_i}{\sum f_i}$$

##### **Example (Solved)**
Calculate the standard deviation of monthly income (in thousands of Taka):

| **$Income Interval$** | **$f_i$** | **$Midpoint (x_i)$** | **$f_i x_i$**         | **$(x_i-\bar{x})$** | **$f_i(x_i-\bar{x})^2$**               |
| --------------------- | --------- | -------------------- | --------------------- | ------------------- | -------------------------------------- |
| 5–30                  | 7         | 17.5                 | 122.5                 | -38.33              | 10284.32                               |
| 30–55                 | 10        | 42.5                 | 425.0                 | -13.33              | 1776.89                                |
| 55–80                 | 6         | 67.5                 | 405.0                 | 11.67               | 817.13                                 |
| 80–105                | 4         | 92.5                 | 370.0                 | 36.67               | 5378.76                                |
| 105–130               | 3         | 117.5                | 352.5                 | 61.67               | 11409.57                               |
| **Total**             | $N=30$    |                      | $\sum f_i x_i = 1675$ |                     | $\sum f_i(x_i - \bar{x})^2 = 29666.67$ |

1. Calculate mean $\bar{x}$:
$$\bar{x} = \frac{1675}{30} \approx 55.83\text{ thousand Taka}$$
2. Apply the Grouped SD formula:
$$\sigma = \sqrt{\frac{29666.67}{30}} = \sqrt{988.89} \approx 31.45\text{ thousand Taka}$$

## 4. Measures of Shape: Skewness & Kurtosis

### Skewness
Measures the directional asymmetry of data distribution around its central mean.

- **Symmetrical (Normal Distribution):** Perfect bell-shaped curve. No skewness.
  - Relationship: $$\bar{X} = M = Z$$
- **Positive Skewness (Tail stretched to the right):** Distorted toward high values.
  - Relationship: $$Z < M < \bar{X}$$
- **Negative Skewness (Tail stretched to the left):** Distorted toward low values.
  - Relationship: $$\bar{X} < M < Z$$

### Kurtosis
Measures the "humpedness" or flat-toppedness of a frequency curve, revealing the concentration of values in the middle versus the tails (presence of extreme outliers).

- **Mesokurtic:** Normal, moderately peaked distribution (classic bell curve).
- **Leptokurtic:** Highly peaked curve with thick, heavy tails. Signals higher probability of extreme outliers.
- **Platykurtic:** Flatter-topped, broad distribution with thin, light tails.

## 5. Measures of Relationship: Correlation & Regression

### A. Correlation Analysis
Analyzes the strength and direction of the linear relationship between two quantitative variables.

- **Characteristics:**
  - **Positive Correlation:** As $X$ increases, $Y$ increases (e.g., age and height of a child).
  - **Negative Correlation:** As $X$ increases, $Y$ decreases (e.g., age of a car and its resale value).
  - **Strength:** Closer to $+1$ or $-1$ means stronger linear association. Closer to $0$ means weak or no association.

#### Correlation Coefficient ($r$) Formula
$$r = \frac{\sum(x-\bar{x})(y-\bar{y})}{\sqrt{\sum(x-\bar{x})^2} \sqrt{\sum(y-\bar{y})^2}}$$

##### **Example (Solved)**
Determine the correlation coefficient $r$ between $X$ and $Y$:

| **$X$** | **$Y$** | **$x-\bar{x}$** | **$y-\bar{y}$** | **$(x-\bar{x})(y-\bar{y})$** | **$(x-\bar{x})^2$** | **$(y-\bar{y})^2$** |
| ------- | ------- | --------------- | --------------- | ---------------------------- | ------------------- | ------------------- |
| 165     | 167     | -3              | -2              | 6                            | 9                   | 4                   |
| 166     | 168     | -2              | -1              | 2                            | 4                   | 1                   |
| 167     | 165     | -1              | -4              | 4                            | 1                   | 16                  |
| 168     | 172     | 0               | 3               | 0                            | 0                   | 9                   |
| 167     | 168     | -1              | -1              | 1                            | 1                   | 1                   |
| 169     | 172     | 1               | 3               | 3                            | 1                   | 9                   |
| 170     | 169     | 2               | 0               | 0                            | 4                   | 0                   |
| 172     | 171     | 4               | 2               | 8                            | 16                  | 4                   |
| **Sum** |         |                 |                 | $\sum = 24$                  | $\sum = 36$         | $\sum = 44$         |

_(Note: $\bar{x} = 168$, $\bar{y} = 169$)_

Apply formula:
$$r = \frac{24}{\sqrt{36}\sqrt{44}} = \frac{24}{6 \times 6.633} = \frac{24}{39.798} \approx 0.603 \quad \text{(Moderate Positive Correlation)}$$

### B. Linear Regression
Fits a predictive straight line to paired observations ($x, y$) by minimizing the sum of squared errors/residuals (Ordinary Least Squares).

- **Model Equation:** $$y = a_0 + a_1x$$
  - Where $a_1$ is the slope and $a_0$ is the y-intercept.
- **Sum of Squared Errors to minimize:** $$S_r = \sum e_i^2 = \sum (y_i - a_0 - a_1x_i)^2$$
- **Formulas for Parameters:** $$a_1 = \frac{n\sum xy - \sum x\sum y}{n\sum x^2 - (\sum x)^2} \quad \text{and} \quad a_0 = \bar{y} - a_1\bar{x} = \frac{\sum y}{n} - a_1\frac{\sum x}{n}$$

##### **Example (Solved)**
Find the linear regression line for weekly sales $y$ over time $x$, and project the sales for **week 7**:

| **Week (x)** | **Sales (y)** | **x^2** | **xy** |
| --- | --- | --- | --- |
| 1 | 2.69 | 1 | 2.69 |
| 2 | 2.62 | 4 | 5.24 |
| 3 | 2.80 | 9 | 8.40 |
| 4 | 2.70 | 16 | 10.80 |
| 5 | 2.75 | 25 | 13.75 |
| 6 | 2.81 | 36 | 16.86 |
| $\sum x = 21$ | $\sum y = 16.37$ | $\sum x^2 = 91$ | $\sum xy = 57.74$ |

1. Calculate parameters ($n = 6$):
$$a_1 = \frac{6(57.74) - (21)(16.37)}{6(91) - (21)^2} = \frac{346.44 - 343.77}{546 - 441} = \frac{2.67}{105} \approx 0.0254$$
$$a_0 = \frac{16.37}{6} - 0.0254\left(\frac{21}{6}\right) = 2.7283 - 0.0889 = 2.64$$
2. **Regression Equation:** $$y = 2.64 + 0.0254x$$
3. **Prediction for Week 7** ($x=7$):
$$y = 2.64 + 0.0254(7) = 2.64 + 0.1778 = 2.8178\text{ Lakh}$$

## 6. Hypothesis Testing: Chi-Square ($\chi^2$) Test of Independence

Used to determine if there is a statistically significant association between two categorical variables by comparing actual **Observed Frequencies** ($O$) against the **Expected Frequencies** ($E$) under the null hypothesis of independence.

- **Formula:** $$\chi^2 = \sum \frac{(O - E)^2}{E}$$
- **Degrees of Freedom** ($df$): $$df = (r - 1)(c - 1)$$
  - Where $r = \text{number of rows}$ and $c = \text{number of columns}$.
- **Expected Frequency Formula** ($E_{ij}$): $$E_{ij} = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$$
- **Decision Rule:**
  - If $\chi^2_{\text{calculated}} > \chi^2_{\text{critical}(\alpha, df)}$: **Reject Null Hypothesis** ($H_0$) $\implies$ Variables are significantly related.
  - If $\chi^2_{\text{calculated}} \le \chi^2_{\text{critical}(\alpha, df)}$: **Accept Null Hypothesis** ($H_0$) $\implies$ Variables are independent.

### **Comprehensive Solved Problem 1**
Test whether opinion about TV shows is independent of gender at a $5\%$ **level of significance** ($\alpha = 0.05$).

#### 1. Formulate Hypotheses
- $H_0$: Gender and show opinion are independent (unrelated).
- $H_a$: Gender and show opinion are related.

#### 2. Observed Contingency Table ($O$)

| **Gender** | **Waste of Time** | **Educational** | **Entertaining** | **Row Totals** |
| --- | --- | --- | --- | --- |
| **Male** | 50 | 12 | 28 | **90** |
| **Female** | 30 | 28 | 52 | **110** |
| **Col Totals** | **80** | **40** | **80** | **Grand Total = 200** |

#### 3. Calculate Expected Frequencies ($E$)
- $E_{\text{Male, Waste}} = \frac{90 \times 80}{200} = 36$
- $E_{\text{Male, Edu}} = \frac{90 \times 40}{200} = 18$
- $E_{\text{Male, Entertaining}} = \frac{90 \times 80}{200} = 36$
- $E_{\text{Female, Waste}} = \frac{110 \times 80}{200} = 44$
- $E_{\text{Female, Edu}} = \frac{110 \times 40}{200} = 22$
- $E_{\text{Female, Entertaining}} = \frac{110 \times 80}{200} = 44$

##### Expected Table ($E$)

| **Gender** | **Waste of Time** | **Educational** | **Entertaining** |
| --- | --- | --- | --- |
| **Male** | 36 | 18 | 36 |
| **Female** | 44 | 22 | 44 |

#### 4. Calculate Chi-Square Components $\left[\frac{(O-E)^2}{E}\right]$
- **Male-Waste:** $\frac{(50-36)^2}{36} = \frac{196}{36} = 5.444$
- **Male-Edu:** $\frac{(12-18)^2}{18} = \frac{36}{18} = 2.000$
- **Male-Entertaining:** $\frac{(28-36)^2}{36} = \frac{64}{36} = 1.778$
- **Female-Waste:** $\frac{(30-44)^2}{44} = \frac{196}{44} = 4.455$
- **Female-Edu:** $\frac{(28-22)^2}{22} = \frac{36}{22} = 1.636$
- **Female-Entertaining:** $\frac{(52-44)^2}{44} = \frac{64}{44} = 1.455$

$$\chi^2_{\text{calculated}} = 5.444 + 2.000 + 1.778 + 4.455 + 1.636 + 1.455 = 16.768$$

#### 5. Make Decision
- $df = (2 - 1)(3 - 1) = 2$
- At $\alpha = 0.05$, $df = 2$, critical value from table is $\chi^2_{0.05, 2} = 5.991$
- **Conclusion:** Since $16.768 > 5.991$, we **Reject** $H_0$. Gender and TV show opinion are significantly related.

### **Comprehensive Solved Problem 2**
Determine if preferred chocolate flavor is independent of gender at a $5\%$ **level of significance** ($\alpha = 0.05$).

#### 1. Formulate Hypotheses
- $H_0$: Chocolate flavor preference and gender are independent.
- $H_a$: Chocolate flavor preference and gender are dependent.

#### 2. Observed Contingency Table ($O$)

| **Gender** | **Strawberry** | **Coffee** | **Orange** | **Vanilla** | **Row Totals** |
| --- | --- | --- | --- | --- | --- |
| **Male** | 23 | 18 | 8 | 8 | **57** |
| **Female** | 15 | 6 | 12 | 10 | **43** |
| **Col Totals** | **38** | **24** | **20** | **18** | **Grand Total = 100** |

#### 3. Calculate Expected Frequencies ($E$)

| **Gender** | **Strawberry** | **Coffee** | **Orange** | **Vanilla** |
| --- | --- | --- | --- | --- |
| **Male** | $\frac{57 \times 38}{100} = 21.66$ | $\frac{57 \times 24}{100} = 13.68$ | $\frac{57 \times 20}{100} = 11.40$ | $\frac{57 \times 18}{100} = 10.26$ |
| **Female** | $\frac{43 \times 38}{100} = 16.34$ | $\frac{43 \times 24}{100} = 10.32$ | $\frac{43 \times 20}{100} = 8.60$ | $\frac{43 \times 18}{100} = 7.74$ |

#### 4. Calculate Chi-Square Components $\left[\frac{(O-E)^2}{E}\right]$
- **Male-Strawberry:** $\frac{(23 - 21.66)^2}{21.66} = 0.083$
- **Male-Coffee:** $\frac{(18 - 13.68)^2}{13.68} = 1.364$
- **Male-Orange:** $\frac{(8 - 11.40)^2}{11.40} = 1.014$
- **Male-Vanilla:** $\frac{(8 - 10.26)^2}{10.26} = 0.498$
- **Female-Strawberry:** $\frac{(15 - 16.34)^2}{16.34} = 0.110$
- **Female-Coffee:** $\frac{(6 - 10.32)^2}{10.32} = 1.808$
- **Female-Orange:** $\frac{(12 - 8.60)^2}{8.60} = 1.344$
- **Female-Vanilla:** $\frac{(10 - 7.74)^2}{7.74} = 0.660$

$$\chi^2_{\text{calculated}} = 0.083 + 1.364 + 1.014 + 0.498 + 0.110 + 1.808 + 1.344 + 0.660 = 6.881$$

#### 5. Make Decision
- $df = (2-1)(4-1) = 3$
- At $\alpha = 0.05$, $df = 3$, critical value is $\chi^2_{0.05, 3} = 7.815$
- **Conclusion:** Since $6.881 < 7.815$, we **Accept** $H_0$. There is sufficient evidence to state that chocolate flavor preference is independent of gender.

## 7. Selected Critical Values of the $\chi^2$ Distribution Table

| **df** | **α=0.10** | **α=0.05** | **α=0.01** |
| --- | --- | --- | --- |
| **1** | 2.706 | 3.841 | 6.635 |
| **2** | 4.605 | **5.991** | 9.210 |
| **3** | 6.251 | **7.815** | 11.345 |
| **4** | 7.779 | 9.488 | 13.277 |
| **5** | 9.236 | 11.070 | 15.086 |