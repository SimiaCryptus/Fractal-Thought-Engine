# Relativistic Mission Design and Adjoint Optimization with OODP

This tutorial demonstrates how to leverage the Open Orbital Dynamics Platform (OODP) to design a high-precision satellite mission. You will learn how to initialize a spacecraft in Earth orbit, apply General Relativistic (GR) force corrections, and use the platform’s built-in automated differentiation to perform adjoint-based trajectory optimization for a station-keeping maneuver.

**⏱️ Estimated Time:** 60 minutes

**🎯 Skill Level:** Intermediate

**💻 Platform:** Python

---

## What You'll Learn

✓ Configure a modular force model in OODP including Newtonian and Relativistic components.
✓ Quantify the impact of relativistic "retarded-time" corrections on long-term orbital stability.
✓ Implement an adjoint-based optimization loop to minimize Delta-V for a target orbital change.
✓ Visualize trajectory residuals and optimization convergence using OODP’s analysis tools.

---

## Prerequisites

### Required

- **Python Environment** (software): Python 3.9 or higher; oodp-py library; numpy, matplotlib, and scipy.
  - Download: https://pypi.org/project/oodp-py/
- **Technical Knowledge** (knowledge): Intermediate Python (classes, decorators); basic understanding of orbital elements (SMA, Eccentricity, Inclination); familiarity with gradient-based optimization concepts.
- **Hardware** (hardware): A standard laptop (8GB+ RAM). GPU acceleration is optional but recommended for the optimization step.

### Optional

- **OODP Account** (account): None required (OODP is open-source).

---

## Tutorial Steps

### Step 1: Environment Setup and Universe Initialization

The foundation of any high-fidelity orbital simulation is the Universe. In the Open Orbital Dynamics Platform (OODP), the Universe object acts as the central manager for time scales, reference frames, and planetary ephemerides. Before we can calculate complex trajectories or apply relativistic corrections, we must establish a consistent coordinate system and a temporal starting point (Epoch). In this step, you will prepare your Python environment and initialize the computational 'world' where your mission will exist. Key parameters include the Epoch (handling UTC/TAI/TT conversions), the J2000 Fram## Generation Complete

**Statistics:**
- Total Steps: 6
- Prerequisites: 4
- Word Count: 4258
- Code Blocks: 14
- Total Time: 266.284s

**Completed:** 2026-03-03 12:45:35
ect calculations).

Create and activate a virtual environment to manage dependencies

```bash
python -m venv oodp_env
# On Windows:
oodp_env\Scripts\activate
# On macOS/Linux:
source oodp_env/bin/activate
```

Install the OODP library and its dependencies like NumPy and SciPy

```bash
pip install oodp
```

Initialize the Universe and Define the Epoch in mission_design.py

```python
import oodp
from oodp.core import Universe
from oodp.time import Epoch

# 1. Define the starting Epoch (Time)
# We use ISO 8601 format. This represents the start of the simulation.
start_time = Epoch("2024-10-27T12:00:00Z")

# 2. Initialize the Universe
# The Universe object loads planetary constants and ephemeris data.
# 'J2000' is the standard inertial reference frame for orbital mechanics.
uni = Universe(
    epoch=start_time,
    frame="J2000",
    config={
        "high_precision": True,
        "relativity": True  # Pre-enabling the backend for relativistic corrections
    }
)

# 3. Add Celestial Bodies
# This populates the universe with the gravitational influence of Earth, Sun, and Moon.
uni.add_celestial_body("Earth")
uni.add_celestial_body("Sun")
uni.add_celestial_body("Moon")

# Print status to verify initialization
print(f"Universe Initialized successfully.")
print(f"Current Epoch: {uni.epoch}")
print(f"Reference Frame: {uni.frame}")
print(f"Active Bodies: {uni.get_active_bodies()}")
```

**Expected Outcome:** When you run the script using 'python mission_design.py', you should see a confirmation in the console: 'Universe Initialized successfully.', followed by the current epoch (2024-10-27T12:00:00Z), the reference frame (J2000), and the list of active bodies (Earth, Sun, Moon).

**Verify Success:**
1. Check Body Properties: Ensure the gravitational parameter (mu) for Earth is loaded by adding print(uni.bodies['Earth'].mu) to your script. It should return approximately 3.986004418e14 (m³/s²).
2. Check Frame Validity: Attempting to use an unsupported frame string (like 'Mars_Local') should trigger a ValueError from OODP, confirming the validation logic is active.

**⚠️ Common Issues:**
- ModuleNotFoundError: If Python cannot find oodp, ensure your virtual environment is active and you ran the pip install command in that specific environment.
- Ephemeris Data Missing: On the first run, OODP may attempt to download SPICE kernels. Ensure you have an active internet connection or manually provide the path to de440.bsp files in the Universe config.
- Version Mismatch: If you encounter errors regarding Epoch formatting, ensure you are using the latest version of OODP (pip install oodp --upgrade), as time-string parsing was standardized in version 1.2.0.

---

### Step 2: Defining the Spacecraft and Initial State

In this step, you will create a digital twin of your satellite. In orbital mechanics, a spacecraft is more than just a point mass; its physical characteristics—such as mass and cross-sectional area—directly influence how non-gravitational forces (like atmospheric drag and solar radiation pressure) affect its trajectory. 

We will define the initial orbit using Keplerian elements, which are more intuitive for mission design, and then convert them into Cartesian state vectors (position and velocity) which the OODP numerical integrator requires for high-precision propagation.

Initialize the Spacecraft object with physical properties such as mass, drag coefficient, and cross-sectional area.

```python
from oodp.core import Spacecraft
from oodp.utils import conversions
import numpy as np

# 1. Initialize the Spacecraft object
# Mass is in kg, Area in m^2
satellite = Spacecraft(
    name="OODP_Explorer_1",
    mass=500.0,
    drag_coefficient=2.2,
    reflectivity_coefficient=1.5,
    cross_sectional_area=4.5
)

print(f"Spacecraft '{satellite.name}' initialized with mass: {satellite.mass} kg")
```

Define the initial Keplerian elements for a Geostationary Transfer Orbit (GTO) and convert angles to radians.

```python
# 2. Define Keplerian Elements
# Units: km and degrees
a = 24361.0 
e = 0.7303
i = np.radians(28.5)
raan = np.radians(0.0)
arg_perigee = np.radians(0.0)
true_anomaly = np.radians(0.0)

keplerian_elements = np.array([a, e, i, raan, arg_perigee, true_anomaly])
```

Convert the Keplerian elements into Cartesian state vectors (position and velocity) and assign them to the spacecraft object.

```python
# 3. Convert Keplerian to Cartesian (Position and Velocity)
# The conversion utility requires the gravitational parameter (mu) of the central body (Earth)
mu_earth = 398600.4418 # km^3/s^2

state_vector = conversions.keplerian_to_cartesian(keplerian_elements, mu_earth)

# Assign the state vector to the spacecraft
satellite.set_state(state_vector)

print("\nInitial Cartesian State Vector (J2000):")
print(f"Position (km): {state_vector[:3]}")
print(f"Velocity (km/s): {state_vector[3:]}")
```

**Expected Outcome:** When you run the script, the console should display the confirmation of the spacecraft's physical properties followed by the calculated Cartesian coordinates. Example output shows the spacecraft name, mass, and the J2000 state vector.

**Verify Success:**
1. Check Position Magnitude: Calculate the magnitude of the position vector at perigee: r_p = a(1-e). For our values: 24361 * (1 - 0.7303) ≈ 6570.2 km. Your output x value should be very close to this.
2. Check Velocity: Ensure the velocity is higher than circular orbit velocity (~7.8 km/s), as GTO perigee velocity is typically around 10 km/s.
3. Object Type: Verify that type(satellite) returns <class 'oodp.core.Spacecraft'>.

**⚠️ Common Issues:**
- Degree/Radian Confusion: OODP conversion utilities typically expect angles in radians. If your orbit looks wildly incorrect, ensure you used np.radians() on your inclination, RAAN, and anomalies.
- Unit Mismatch: Ensure your semi-major axis is in kilometers (24361) rather than meters. Mixing km and meters will result in integration errors in later steps.
- Import Errors: If oodp.utils is not found, ensure your PYTHONPATH is set correctly to the directory where OODP is installed.

---

### Step 3: Implementing Relativistic Force Models

While Newtonian mechanics provides a robust approximation for most orbital trajectories, high-precision mission design—especially those involving deep-space navigation or precise timing—requires accounting for General Relativity (GR). In this step, you will transition from a simple point-mass gravity model to a high-fidelity force model that incorporates relativistic perturbations and the finite propagation speed of gravity.

In standard Newtonian physics, gravity is treated as an instantaneous 'action-at-a-distance.' However, according to General Relativity, gravitational influences propagate at the speed of light (c). We will implement Newtonian Gravity as the baseline force, a Relativistic Correction for the Schwarzschild metric, and a Retarded-Time Parameter to ensure the position of gravitating bodies is calculated based on where they were when the gravitational signal left them.

Initialize the Force Model, add Newtonian gravity, and configure relativistic corrections including retarded time.

*Run in: `mission_design.py`*

```python
from oodp.physics import ForceModel
from oodp.physics.gravity import NewtonianGravity
from oodp.physics.plugins import RelativisticCorrection

# 1. Initialize the Force Model for the spacecraft
force_model = ForceModel(spacecraft)

# 2. Add standard Newtonian Gravity (Primary Body: Earth)
# We use the 'earth' object initialized in Step 1
newtonian_grav = NewtonianGravity(body=earth, degree=0, order=0) 
force_model.add_force(newtonian_grav)

# 3. Add Relativistic Corrections
# This accounts for Schwarzschild, Lense-Thirring, and Geodetic effects
rel_plugin = RelativisticCorrection()

# Configure the "retarded-time" parameter
# This ensures gravity propagation speed is finite (c)
rel_plugin.set_parameter("retarded_time", True)
rel_plugin.set_parameter("use_post_newtonian", True)

# Attach the plugin to the force model
force_model.add_plugin(rel_plugin)

# Print the force model summary to verify configuration
print(force_model.summary())
```

📸 Console output showing a table of active forces. The table should list 'NewtonianGravity' and 'RelativisticCorrection' with the 'Retarded Time' status set to 'Enabled'.

**Expected Outcome:** When you run the script, the OODP engine will compile the force model. You should see a summary in the console confirming that both the classical and relativistic components are active, including the 'Retarded-Time' and 'Post-Newtonian' status.

**Verify Success:**
1. Check the Plugin Status: Ensure rel_plugin.is_active() returns True.
2. Inspect Force Magnitude: Verify the instantaneous acceleration vector via force_model.compute_acceleration(state); the relativistic component should be non-zero and typically 10^-8 to 10^-10 m/s² for LEO.
3. Verify Constants: Ensure the platform is using the correct speed of light (c) by checking oodp.constants.C.

**⚠️ Common Issues:**
- AttributeError: 'RelativisticCorrection' object has no attribute 'retarded_time': Ensure your environment is updated via pip install oodp --upgrade or use rel_plugin.enable_retardation() in older versions.
- Performance Degradation: Enabling retarded_time requires an iterative light-time solution which is computationally expensive; disable if sub-centimeter precision is not required.
- Missing Body Reference: Ensure the 'sun' object is correctly passed into the Universe context so the plugin can calculate Geodetic precession.

---

### Step 4: Baseline Propagation and Sensitivity Analysis

In this step, you will perform the first full-scale simulation of your mission. Beyond simply moving the spacecraft through space, you will utilize the Open Orbital Dynamics Platform’s (OODP) built-in automated differentiation (AD) engine. By wrapping the propagation in a gradient context, you can calculate the State Transition Matrix (STM)—specifically, how sensitive the spacecraft's final position is to its initial velocity. This sensitivity analysis is the foundation for the adjoint-based optimization you will perform in later steps.

### 1. Define the Propagation Window
First, we need to define the duration of the simulation. We are targeting a 48-hour window. In OODP, time is handled in seconds (SI units).

1. Open your Python script (`mission_design.py`).
2. Define a constant for the duration: `DURATION_SEC = 48 * 3600`.

### 2. Enable Gradient Tracking and Propagate
We will use the `oodp.grad` context manager. This tells the OODP engine to build a computational graph of the integration process, allowing us to backpropagate derivatives through the RK45 integrator and the relativistic force models.

1. Initialize the RK45 integrator within the OODP environment.
2. Use the `with oodp.grad() as g:` block to wrap the propagation call.
3. Execute the propagation using the `propagate` method.

### 3. Calculate the Jacobian (Sensitivity Matrix)
Now that the propagation is finished, we use the tracked gradient information to compute the Jacobian. This matrix represents the sensitivity of the final position to the initial velocity.

Enable Gradient Tracking and Propagate

```python
import oodp
import numpy as np

# Assuming 'sc' is your spacecraft and 'env' is your environment from Step 3
# Define the time span (0 to 48 hours in seconds)
t_span = (0, 48 * 3600)

print("Starting baseline propagation (48 hours)...")

# Enable the gradient context manager to track sensitivities
with oodp.grad() as g:
    # We mark the initial velocity as the leaf node we want to differentiate with respect to
    initial_velocity = g.track(sc.state.v)
    
    # Run the propagation using the RK45 (Runge-Kutta 4(5)) adaptive step integrator
    # This will include the relativistic forces defined in Step 3
    result = oodp.propagate(
        spacecraft=sc,
        environment=env,
        t_span=t_span,
        method='RK45',
        rtol=1e-9,
        atol=1e-12
    )

    # Extract the final position vector from the result
    final_position = result.y[-1, 0:3]

print("Propagation complete.")
```

Calculate the Jacobian (Sensitivity Matrix)

```python
# Calculate the Jacobian of the final position with respect to initial velocity
# This is a 3x3 matrix representing the sensitivity
sensitivity_matrix = g.jacobian(final_position, initial_velocity)

print("\n--- Sensitivity Analysis (Jacobian) ---")
print(f"dR_final / dV_initial:\n{sensitivity_matrix}")

# Store the baseline trajectory for visualization
baseline_trajectory = result.y
```

**Expected Outcome:** When you run the script, the OODP engine will execute the 48-hour propagation. Because gradient tracking is enabled, it may take slightly longer than a standard simulation (typically 1.5x to 2x overhead). The console should output: 1. A confirmation that propagation is starting. 2. A 3x3 NumPy array (the Jacobian). The values in this matrix will typically be large (e.g., 10^4 to 10^6), as small changes in velocity at the start of a 48-hour window result in significant position deviations at the end.

**Verify Success:**
1. Check Matrix Shape: Ensure sensitivity_matrix.shape returns (3, 3).
2. Verify Non-Zero Values: If the matrix contains only zeros, the oodp.grad context was likely not initialized correctly or the initial velocity was not marked for tracking via g.track().
3. Trajectory Continuity: Check baseline_trajectory.shape. For a 48-hour run with RK45, you should see several hundred to several thousand rows (time steps) depending on the orbital eccentricity.

**⚠️ Common Issues:**
- Memory Exhaustion: If your rtol (relative tolerance) is set too low (e.g., 1e-15), the integrator will take very small steps. Since OODP stores the computational graph in memory for the Jacobian calculation, this can lead to high RAM usage. Stick to 1e-9 for this baseline.
- Type Errors: Ensure the initial velocity passed to g.track() is a JAX-compatible OODP array, not a standard Python list.
- Vanishing Gradients: If the Jacobian values are extremely small (near zero), verify that the force models (Relativistic/Post-Newtonian) are actually influencing the trajectory; if the spacecraft is too far from the primary body, the sensitivity to relativistic effects may be negligible.

---

### Step 5: Adjoint-Based Trajectory Optimization

In the previous step, you performed a sensitivity analysis to see how initial velocity affects the final position. Now, you will use those sensitivities to solve a Targeting Problem. Instead of manually guessing burn magnitudes, you will use the Adjoint Method. This technique calculates the gradient of a "Cost Function" (what we want to minimize) relative to our "Control Variables" (our engine burns) by propagating the sensitivity equations backward in time. This is significantly faster than "Trial and Error" or finite-difference methods when dealing with complex relativistic force models.

Define the optimization objective, constraints, and initialize the Adjoint Solver in mission_optimization.py.

```python
import numpy as np
from oodp.optimize import AdjointSolver, Constraints
from oodp.core.math import norm

# 1. Define the Target State (Longitude in radians, Altitude in km)
target_lon = np.radians(-120.0) 
target_alt = 42164.0 

# 2. Define the Cost Function (Minimize total Delta-V)
# The solver expects a function that takes the control vector 'u'
def objective_function(u):
    # u is a flattened array of [dvx1, dvy1, dvz1, ... dvxn, dvyn, dvzn]
    burns = u.reshape(-1, 3)
    return np.sum([norm(b) for b in burns])

# 3. Define Constraints
# We want the final state (x_f) to match our target altitude and longitude
def mission_constraints(x_f):
    current_alt = norm(x_f[:3])
    # Calculate longitude from Cartesian coordinates
    current_lon = np.arctan2(x_f[1], x_f[0])
    
    return [
        current_alt - target_alt,  # Altitude error must be 0
        current_lon - target_lon   # Longitude error must be 0
    ]

# 4. Initialize the Adjoint Solver
# We provide the propagator from Step 4 and the objective/constraints
solver = AdjointSolver(
    propagator=relativistic_prop,
    objective=objective_function,
    constraints=mission_constraints,
    method='SLSQP-Adjoint' # Uses Sequential Least Squares Programming with Adjoint Gradients
)

# 5. Execute the Optimization
print("Starting Adjoint Optimization...")
result = solver.minimize(initial_guess=np.zeros(3)) # Start with a 0m/s burn guess

if result.success:
    print(f"Optimization Converged!")
    print(f"Optimal Delta-V: {result.fun:.4f} km/s")
    print(f"Final Burn Vector: {result.x} km/s")
else:
    print("Optimization failed to converge. Check constraint feasibility.")
```

Run the optimization script from the terminal.

```bash
python mission_optimization.py
```

📸 Console output showing the iteration log of the AdjointSolver, with 'Cost' decreasing and 'Constraint Violation' approaching zero.

**Expected Outcome:** When the execution finishes, the console should display a summary of the optimization. You should see an iteration log where the 'Objective Value' (fuel) and 'Constraint Violation' are updated, followed by a 'Optimization Converged!' message and the optimal 3-element burn vector.

**Verify Success:**
1. Check the Final Altitude: Ensure the reported final altitude is within ± 1 km of your target (42,164 km).
2. Check the Longitude: Convert the final Cartesian coordinates (x, y) to longitude using atan2(y, x) and ensure it matches -120.0°.
3. Relativistic Comparison: Note the Delta V value. If you disable the RelativisticForceModel and re-run, you will notice a small but critical difference (often in the range of several meters per second), which validates why the relativistic corrections were necessary for high-precision targeting.

**⚠️ Common Issues:**
- Singular Matrix Error: This usually happens if your initial guess is too far from a stable orbit. Ensure your initial state from Step 4 is a valid circular or elliptical orbit.
- Maximum Iterations Reached: If the solver fails to converge, increase the max_iter parameter in the AdjointSolver (e.g., solver.minimize(..., options={'max_iter': 100})).
- Memory Overhead: Adjoint optimization stores the trajectory 'tape' in memory. If you are running a very long propagation (e.g., 1 year), ensure your machine has at least 16GB of RAM or increase the step_size of the integrator.

---

### Step 6: Result Visualization and Comparison

In this final step, you will visualize the fruits of your optimization. While the numerical output from the adjoint optimizer confirms convergence, visual analysis is essential to understand the "Relativistic Drift"—the physical divergence that occurs when General Relativity (GR) is ignored. You will generate a 3D spatial plot to see the mission profile and a residual plot to quantify the necessity of GR corrections for high-precision navigation.

Create a new Python script named visualize_results.py (or append to your existing script) and use the following code to render the optimized path.

```python
import matplotlib.pyplot as plt
from oodp.visuals import TrajectoryPlotter
import numpy as np
import json

# 1. Initialize the OODP Plotter
# This automatically sets up a 3D Earth-centered inertial (ECI) frame
plotter = TrajectoryPlotter(title="Optimized Relativistic Mission Profile")

# 2. Add the optimized trajectory (from Step 5 results)
# Assuming 'opt_states' is the array of states from your optimizer
plotter.add_trajectory(opt_states, label="Relativistic Optimized", color='b', linestyle='-')

# 3. Add the initial Newtonian baseline for comparison
# Assuming 'baseline_states' is the array from Step 4
plotter.add_trajectory(baseline_states, label="Newtonian Baseline", color='r', linestyle='--')

# Render the plot
plotter.show()
```

Calculate the Euclidean distance between the two trajectories at every time step and plot the divergence.

```python
# Calculate the magnitude of the position difference (Residual)
# states are typically [x, y, z, vx, vy, vz]
diff = opt_states[:, :3] - baseline_states[:, :3]
residuals = np.linalg.norm(diff, axis=1) # Distance in kilometers

# Generate the time axis (assuming 48-hour window)
time_hours = np.linspace(0, 48, len(residuals))

plt.figure(figsize=(10, 6))
plt.plot(time_hours, residuals, color='darkorange', linewidth=2)
plt.title("Relativistic Position Divergence Over Time")
plt.xlabel("Time Elapsed (Hours)")
plt.ylabel("Position Error (Meters)")
plt.grid(True, which='both', linestyle='--', alpha=0.5)

# Highlight the final divergence
plt.annotate(f'Final Drift: {residuals[-1]:.2f}m', 
             xy=(48, residuals[-1]), 
             xytext=(35, residuals[-1] + 5),
             arrowprops=dict(facecolor='black', shrink=0.05))

plt.show()
```

Use the following snippet to save the mission metadata and the final optimized burn vector.

```python
# Prepare the data dictionary
mission_report = {
    "mission_metadata": {
        "engine": "OODP-Relativistic-v1.2",
        "optimization_method": "Adjoint-based SLSQP",
        "duration_hours": 48
    },
    "results": {
        "optimal_burn_dv": opt_burn.tolist(),  # [dvx, dvy, dvz]
        "final_position_error_m": float(residuals[-1]),
        "fuel_consumed_kg": float(final_fuel_mass)
    }
}

# Export to JSON
with open("mission_report.json", "w") as f:
    json.dump(mission_report, f, indent=4)

print("Mission report exported successfully to mission_report.json")
```

📸 3D Trajectory View: [Placeholder: A 3D plot showing a blue solid line and a red dashed line orbiting a wireframe Earth sphere.]

📸 Residual Graph: [Placeholder: A line graph starting at 0 and curving upward, showing the error increasing to several meters over 48 hours.]

**Expected Outcome:** 3D Plot: You should see two trajectories that look nearly identical at a macro scale, but the legend confirms the presence of both the Newtonian and Relativistic paths. Residual Plot: You should see a non-linear increase in position error. For a 48-hour Earth-orbit mission, you might see a divergence ranging from 5 to 50 meters depending on the orbital altitude. JSON File: A file named mission_report.json will appear in your working directory containing the precise ΔV values required for the mission.

**Verify Success:**
1. Check Divergence: Ensure the residual plot does not stay at zero. If it is zero, the relativistic corrections were not properly toggled in the OODP propagator settings.
2. Verify JSON: Open mission_report.json in a text editor. Ensure the optimal_burn_dv contains three distinct floating-point numbers.
3. Visual Inspection: In the 3D plot, use the Matplotlib toolbar to rotate the view. Ensure the orbit is closed and doesn't show 'jitter,' which would indicate an integration step size that is too large.

**⚠️ Common Issues:**
- Matplotlib Backend Error: If the plot window doesn't appear, ensure you have a GUI backend installed (e.g., pip install PyQt5) or use plt.savefig('plot.png') if working in a headless environment like a remote server.
- Array Shape Mismatch: If opt_states and baseline_states have different lengths, the residual calculation will fail. This usually happens if the integrator used an adaptive time-step. Use np.interp to resample both trajectories to a common time grid if necessary.
- Memory Usage: Plotting very high-frequency data (1-second intervals over 48 hours) can be slow. If the plotter hangs, slice your data to every 10th or 100th point (e.g., opt_states[::100]).

---

## Troubleshooting

### 1. Shared Library Loading Failure (ImportError)

**Symptoms:**
- ImportError: liboodp_core.so: cannot open shared object file: No such file or directory (Linux)
- ImportError: DLL load failed: The specified module could not be found. (Windows)

**Possible Causes:**
- The OODP C++ backend binaries are not in the system's library path
- There is a mismatch between the Python architecture (64-bit) and the compiled binaries

**Solutions:**
1. Set Environment Variables: Manually point your system to the OODP library folder (LD_LIBRARY_PATH on Linux/macOS or System PATH on Windows).
2. Reinstall via Conda: Use a clean Conda environment to handle C-dependencies more robustly.
3. Check Architecture: Ensure you are not running a 32-bit Python interpreter on a 64-bit OS.

### 2. Adjoint Gradient Instability (NaN or Inf Values)

**Symptoms:**
- RuntimeError: Gradient evaluation failed at iteration X.
- Warning: Desired error not necessarily achieved due to precision loss.

**Possible Causes:**
- Relativistic corrections (like the Schwarzschild term) involve 1/r^3 or 1/r^4 calculations which explode if the spacecraft gets too close to a massive body.

**Solutions:**
1. Implement "Soft" Constraints: Add a penalty function to the objective that increases as the spacecraft approaches the planetary radius.
2. Check Unit Consistency: Ensure all distances are in meters (SI) rather than kilometers for better numerical stability.
3. Enable Gradient Clipping: Clip the adjoint vector in custom optimization loops (e.g., np.clip(gradients, -1e5, 1e5)).

### 3. Non-Differentiable Force Model Errors

**Symptoms:**
- Optimization Error: Objective function appears to be non-smooth.
- The optimizer gets "stuck" at the initial guess despite a clear path to improvement.

**Possible Causes:**
- Using discrete logic like if/else statements or np.round() inside the custom relativistic force function, which breaks the chain rule.

**Solutions:**
1. Replace Logic with Smooth Functions: Use sigmoid or hyperbolic tangent functions to transition between force models.
2. Verify Jacobian: Use OODP’s built-in verify_gradients tool to check analytical derivatives against finite differences.

### 4. Relativistic Divergence in Long-Duration Propagations

**Symptoms:**
- The trajectory deviates significantly from standard Newtonian expectations over very short timeframes.
- Physically impossible results (e.g., spacecraft exiting the solar system).

**Possible Causes:**
- The integration time step (dt) is too large for the sensitivity of relativistic terms to local spacetime curvature.

**Solutions:**
1. Switch to Adaptive Stepping: Use an integrator like OODP.RK45 or OODP.DormandPrince with strict tolerances (atol=1e-12, rtol=1e-12).
2. Reduce Fixed Step Size: Reduce dt by at least a factor of 10 when enabling General Relativity (GR) terms.

### 5. Ephemeris Data Access Denied

**Symptoms:**
- OSError: Unable to create file (Permission denied)
- FileNotFoundError: 'de440.bsp' not found in /usr/local/share/oodp/data

**Possible Causes:**
- The script is attempting to save downloaded ephemeris data to a protected system directory.

**Solutions:**
1. Redirect Data Directory: Define a local path for OODP data using oodp.config.set_data_path('./mission_data/').
2. Manual Download: Download .bsp files manually from NASA NAIF and point OODP to them using an absolute path.

### 6. Python Version Compatibility (AttributeError)

**Symptoms:**
- AttributeError: module 'math' has no attribute 'factorial' (or similar dependency errors).
- DeprecationWarning leading to a hard crash.

**Possible Causes:**
- OODP relies on specific versions of NumPy and SciPy that may have deprecated C-API calls used by the adjoint solver in newer Python versions.

**Solutions:**
1. Use a Virtual Environment: Always use a dedicated environment for OODP.
2. Pin Versions: Ensure requirements.txt includes python>=3.9,<3.11 and numpy==1.23.5.

---

## Next Steps

🎉 Congratulations on completing this tutorial!

### Try These Next
- Implement Low-Thrust Trajectory Optimization: Transition from impulsive maneuvers to continuous low-thrust propulsion and optimize steering laws.
- Incorporate Non-Spherical Gravity (J2-J6 Harmonics): Add a spherical harmonic gravity model to observe coupling with relativistic precession.
- Perform a Sensitivity Analysis: Use adjoint gradients to determine how errors in initial velocity or ignition timing affect mission objectives.
- Design a Multi-Target "Grand Tour": Implement Lambert’s Problem solvers to design trajectories visiting multiple bodies like the Galilean moons.

### Related Resources
- NASA’s GMAT (General Mission Analysis Tool) Documentation
- "Practical Methods for Optimal Control Using Control Theory" by John T. Betts
- The Orekit Library (Tutorials) on Numerical Propagators and Orbit Determination
- ESA’s Advanced Concepts Team (ACT) Global Trajectory Optimization Competitions (GTOC)

### Advanced Topics
- CR3BP (Circular Restricted Three-Body Problem): Study Halo and Lissajous Orbits around Lagrange points.
- Uncertainty Quantification (UQ) and Navigation Filter Design: Use Extended Kalman Filters (EKF) to estimate state vectors in the presence of noise.
- Solar Radiation Pressure (SRP) Modeling: Model the effects of sunlight pressure and shadow functions on orbital stability.
- Symplectic Integrators: Research integrators that preserve Hamiltonian structure for long-duration simulations.

