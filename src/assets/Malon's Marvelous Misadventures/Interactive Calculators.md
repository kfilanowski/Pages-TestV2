# Interactive Calculators

This page demonstrates interactive calculators that let you create dynamic formulas with input fields and visualizations directly in markdown files.

## How to Create a Calculator

Use the ` ```calculator ` syntax:

````
```calculator
description: Your description here
formula: y = 2*x + 3*z
inputs:
- x: { label: X Value, default: 5, min: 0, max: 100, step: 1 }
- z: { label: Z Value, default: 10, min: 0, max: 50, step: 1 }
graph: true
graphPoints: 30
```
````

### Supported Features

- **Formula**: JavaScript expressions with variables matching input names
- **Inputs**: Sliders and number inputs with labels, defaults, min/max, and step values
- **Graph**: Optional visualization showing how output changes with the first variable
- **Math Functions**: `pow()`, `sqrt()`, `abs()`, `min()`, `max()`, `round()`, `floor()`, `ceil()`, trig functions

---

## Live Examples

### Basic Linear Equation

Here's a simple linear equation: `y = 2x + 3z`

```calculator
description: A basic linear equation with two variables. Try adjusting the sliders to see how the output changes!
formula: y = 2*x + 3*z
inputs:
- x: { label: X Value, default: 5, min: 0, max: 100, step: 1 }
- z: { label: Z Value, default: 10, min: 0, max: 50, step: 1 }
graph: true
graphPoints: 30
```

## Damage Calculation Example

Calculate total damage based on base damage and multipliers:

```calculator
description: Calculate total damage with base damage, critical multiplier, and bonus damage.
formula: totalDamage = baseDamage * critMultiplier + bonusDamage
inputs:
- baseDamage: { label: Base Damage, default: 20, min: 1, max: 100, step: 1 }
- critMultiplier: { label: Critical Multiplier, default: 2, min: 1, max: 5, step: 0.1 }
- bonusDamage: { label: Bonus Damage, default: 5, min: 0, max: 50, step: 1 }
graph: true
graphPoints: 25
```

## Experience Points to Level

Calculate required experience points using an exponential formula:

```calculator
description: Experience required for a given level using the formula XP = 100 * level^2
formula: xp = 100 * pow(level, 2)
inputs:
- level: { label: Character Level, default: 5, min: 1, max: 20, step: 1 }
graph: true
graphPoints: 20
```

## Attack Roll Probability

Calculate hit chance based on attack bonus and target AC:

```calculator
description: Calculates the percentage chance to hit. Formula assumes d20 roll (5% increments).
formula: hitChance = max(5, min(95, (21 - (targetAC - attackBonus)) * 5))
inputs:
- attackBonus: { label: Attack Bonus, default: 5, min: 0, max: 20, step: 1 }
- targetAC: { label: Target AC, default: 15, min: 10, max: 25, step: 1 }
graph: true
graphPoints: 20
```

## Health Regeneration Over Time

Calculate health regenerated over multiple rounds:

```calculator
description: Total health recovered over time with regeneration rate
formula: totalHealing = regenRate * rounds + baseHealing
inputs:
- regenRate: { label: Regen per Round, default: 5, min: 1, max: 20, step: 1 }
- rounds: { label: Number of Rounds, default: 5, min: 1, max: 10, step: 1 }
- baseHealing: { label: Initial Healing, default: 10, min: 0, max: 50, step: 5 }
graph: true
graphPoints: 10
```

## Area of Effect Calculation

Calculate the area affected by a spell or ability:

```calculator
description: Calculate circular area using the formula Area = π * radius²
formula: area = 3.14159 * pow(radius, 2)
inputs:
- radius: { label: Radius (feet), default: 10, min: 5, max: 50, step: 5 }
graph: true
graphPoints: 20
```

## Movement Speed Calculation

Calculate total movement with base speed and modifiers:

```calculator
description: Calculate movement speed with base speed, bonus multiplier, and flat bonuses
formula: totalSpeed = (baseSpeed * speedMultiplier) + flatBonus
inputs:
- baseSpeed: { label: Base Speed, default: 30, min: 10, max: 50, step: 5 }
- speedMultiplier: { label: Speed Multiplier, default: 1, min: 0.5, max: 2, step: 0.1 }
- flatBonus: { label: Flat Bonus, default: 0, min: 0, max: 20, step: 5 }
graph: true
graphPoints: 25
```

## Simple Calculator (No Graph)

Sometimes you just need the calculation without a visualization:

```calculator
description: A simple addition calculator without graph visualization
formula: sum = a + b + c
inputs:
- a: { label: First Number, default: 10, min: 0, max: 100, step: 1 }
- b: { label: Second Number, default: 20, min: 0, max: 100, step: 1 }
- c: { label: Third Number, default: 30, min: 0, max: 100, step: 1 }
graph: false
```

---

## How to Use Calculators

Each calculator includes:
- **Sliders**: Drag to adjust values quickly
- **Number inputs**: Type exact values
- **Real-time results**: See calculations update instantly
- **Graphs** (when enabled): Visualize how the output changes as the first variable changes

## Supported Math Functions

The calculator supports these mathematical functions:
- Basic operators: `+`, `-`, `*`, `/`
- `pow(base, exponent)` - Exponentiation
- `sqrt(x)` - Square root
- `abs(x)` - Absolute value
- `min(a, b)` - Minimum of two values
- `max(a, b)` - Maximum of two values
- `round(x)`, `floor(x)`, `ceil(x)` - Rounding functions
- `sin(x)`, `cos(x)`, `tan(x)` - Trigonometric functions (input in radians)

