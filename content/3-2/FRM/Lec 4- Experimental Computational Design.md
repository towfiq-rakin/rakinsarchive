### Variables in Experimental Research

**Variable:** A characteristic or attribute of an individual or organization that can be measured or observed and varies among the studied population.  
**Independent Variable (IV):** A stimulus or input variable that is measured, manipulated, or selected to determine its relationship to an observed phenomenon (e.g., variable $X$ that affects $Y$).  
**Dependent Variable (DV):** A response or output variable observed and measured to determine the effect of the independent variable (e.g., variable $Y$ that depends on $X$).

### Basic Principles of Experimental Design (R.A. Fisher)

- **The Principle of Replication:** The experiment should be repeated more than once, applying each treatment to multiple experimental units to increase statistical accuracy and reliability. 
- **The Principle of Randomization:** Design layout where variations caused by extraneous factors are combined under "chance" via random sampling/assignment, providing protection against bias and improving error estimation.  
- **The Principle of Local Control:** Intentionally varying an extraneous factor over a wide range through **blocking** (dividing the field into homogeneous groups) so its variability can be measured and eliminated from the experimental error.

> [!info] **Test Area vs. Control Area**
> 
> - **Test Area (Experimental Group):** The group, region, or population where the intervention/treatment (e.g., new method, campaign, product) is introduced to observe its effects.
>     
> - **Control Area (Control Group):** The group, region, or population where no intervention is applied, maintaining standard conditions to serve as a baseline for comparison.
>     

### Informal Experimental Designs

These designs rely on less sophisticated analysis based primarily on differences in magnitudes.

**Before-and-after without control**  
Measures a single test group before ($X$) and after ($Y$) the treatment.
$$
\text{Treatment Effect} = Y - X
$$
_Drawback:_ Vulnerable to extraneous variations arising from the passage of time.  
**After-only with control**  
Uses two separate groups (Test area $Y$ and Control area $Z$), but introduces treatment to the test area only.

$$
\text{Treatment Effect} = Y - Z
$$

_Drawback:_ Assumes both areas are completely identical in behavior prior to the experiment.

**Before-and-after with control**  
Measures both test ($X \rightarrow Y$) and control ($A \rightarrow Z$) groups over identical time periods, applying treatment only to the test group.
$$
\text{Treatment Effect} = (Y - X) - (Z - A)
$$
_Advantage:_ Highly superior as it eliminates extraneous variation caused by time passage across both groups.

### Formal Experimental Designs

These designs offer advanced control and rely on precise statistical procedures for data analysis.

| **Formal Design Type**                         | **Core Characteristics**                                                                                                              | **Core Use Case / Example**                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Completely Randomized Design (C.R. Design)** | Utilizes only _replication_ and _randomization_. Subjects are randomly selected and randomly assigned to experimental groups.         | Best used when the experimental areas/subjects happen to be **homogeneous**.                                                                               |
| **Randomized Block Design (R.B. Design)**      | Subjects are first divided into homogeneous groups called **blocks**. Each treatment appears the same number of times in each block.  | Used to isolate a specific extraneous factor (e.g., grouping students by _I.Q. levels_ as blocks while evaluating different _test forms_ as treatments).   |
| **Latin Square Design (L.S. Design)**          | Matrix layout where each treatment is allocated to plots such that it occurs exactly once in each row and each column.                | Frequently used in agricultural research to eliminate **two major extraneous factors** simultaneously (e.g., varying soil fertility and seed differences). |
| **Factorial Design**                           | Used in experiments where the simultaneous effects of varying **more than one factor** on the dependent variable need to be measured. | Can be _Simple_ (2 factors evaluated together, e.g., a $2 \times 2$ matrix combining Intelligence Levels and Training Types) or _Complex_ ($>2$ factors).  |

**Completely Randomized Design**  
In a C.R. Design, the population is defined, a sample is selected randomly, and members are then randomly assigned to either the experimental or control group.

![[CR-design.png]]

>[!warning]+
>I would highly recommend to go through the examples of *Formal Experimental Design* from lecture slides for better understanding, as Sir might ask for it in question paper. I'm not including it here to keep this note concise.

---
[[Lec 5- Data Collection Presentation|Next: Lec 5 →]]
