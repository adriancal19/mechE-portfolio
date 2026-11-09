---
title: Brake Rotor Redesign
org: Panther Motorsports · FIU Formula SAE
role: Vehicle Dynamics Engineer
start: 01/2026
end: 10/2026
category: FEA
skills: FEA, CAD, Manufacturing
tags: Ansys Mechanical, SolidWorks
cover: images/cover.png
cover alt: Redesigned slotted brake rotor (placeholder)
cover position: center
hover: images/hover.jpg
model:
model alt: 3D model of the redesigned brake rotor
---

## Summary
Our FSAE car's stainless steel rotors had a factor of safety of about 8, so a teammate and I resized them around their thermal limit instead. We moved to waterjet-cut AISI 4130 and designed slotted rotors checked with structural and thermal FEA in Ansys.

## Specs
- Original FoS: ≈ 8 at max braking
- Final mass (F - R): 575 g - 500 g
- Original mass (F - R): 800 g - 700 g 
- Material: SS316 → AISI 4130
- Material cost: $200 for 4 rotors

## Gallery
- images/cover.png | Ansys transient thermal simulation displaying endurance conditions. 
- images/hover.jpg | Rear rotor on the car.
- images/01.jpg | Front rotor on the car.

## Problem
The car ran 5 mm thick, 205 mm stainless steel 316 rotors weighing 800 g each in front and 700 g in the rear, with Wilwood GP200 calipers. FEA in Ansys showed a **factor of safety of about 8** under maximum braking, so the rotors were far heavier than they needed to be. Rotating, unsprung mass costs acceleration and handling.

The goal: find out whether the rotors could safely be made smaller, estimate the time that would save, and design the new rotors. Brakes are safety-critical, so every assumption was kept conservative. 

## Approach
### Loads
- Vehicle: 311 kg with driver, 1545 mm wheelbase, 51 / 49% static weight split, 85 mph (38 m/s) top speed.
- Designed for **1.3 g** braking, more than the 1.09 g measured on the previous car. That moves 73% of the weight to the front and sets the max brake torque at **659 N·m front axle** and **242 N·m rear**.

### Sizing by heat, not strength
- Calculated the kinetic energy of a stop, turned it into a temperature rise, and solved for the minimum rotor mass that keeps the rotor in a safe temperature range.
- Allowed a 505 °F rise to a 575 °F peak, slightly past the pads' peak-friction temperature: a 0.02 loss in friction coefficient in exchange for about 550 g saved.

### Material selection
- Compared gray cast iron, 2024-T351 aluminum, 1045 steel, stainless 316 and 4130 on yield strength, thermal conductivity, thermal expansion, density, machinability and cost.
- A weighted decision matrix picked G2 Dura-Bar cast iron (24 points) over 2024 aluminum (23) and 1045 steel (21). Aluminum lost on thermal expansion.
- Cast iron turned out to be hard to source and machine: it is sold as thick bar, so about 1.75 in would have had to be faced off, at around $620 for four rotors. We switched to **normalized AISI 4130**, the closest match (97 ksi yield, slightly denser, slightly lower conductivity). It can be bought as thin plate and waterjet cut for about $200.

### Geometry and analysis
- Chose slots over drilled holes (stronger, and they wipe the pad clean) and over vented rotors (more than FSAE needs).
- Reduced the outer diameter to 7.75 in while keeping full pad contact, maximized the inner diameter to the pad, and removed material from the mounts.
- Ran structural FEA in Ansys with braking torque applied at the bolt pattern, then transient thermal simulations of repeated stops.

## Results
- **Thermal minimum mass** in 4130: **583 g front, 255 g rear**
- **Final mass** in 4130: 575 g front, 500 g rear
- Both rotors are far stronger than they need to be, so heat, not stress, is the real limit.
- A single 60–0 mph stop peaks at about **250 °F**. Repeated 55–20 mph stops every 4 seconds bring the pads to their optimal temperature by the 3rd cycle (front) and 4th cycle (rear), a harsher pattern than an autocross course.
- A full-circuit simulation, peaks near **750 °F**. That's above the pads' optimal range, but the rotors will finish endurance.
- 0.16 in thickness is confirmed safe by Wilwood's own GP200 kit, which ships with a 0.16 in rotor.
- The rotors were installed and ran smoothly and efficiently

## What I Learned
For thin rotors, the thermal limit sets the minimum size long before stress does. And manufacturability belongs in the design from day one: our best material on paper couldn't realistically be bought and machined, and stepping back to 4130 made us check how every design would actually be made.

## Iterations


## Before / After
- images/before.png | images/after.png | SS 316 Original | AISI 4130 Redesign

## Videos

## Downloads
<!-- A PDF of your design report would fit well here, e.g.
- Design report | files/brake-rotor-report.pdf | 2.1 MB -->

## Links

## One-Pager

### Problem
The car's 5 mm stainless steel rotors (800 g front, 700 g rear) had a factor of safety of about 8 under max braking. Extra rotating mass costs acceleration, so the goal was to make them as light as safely possible.

### Approach
Set the minimum mass from braking heat at a conservative 1.3 g. Chose waterjet-cut AISI 4130 after a material decision matrix, then designed slotted rotors in SolidWorks and checked them with structural and thermal FEA in Ansys.

### Results
Thermal minimum mass is 583 g front and 255 g rear. Stress is no longer the limit, heat is: a 60–0 mph stop peaks near 250 °F, and repeated 55–20 mph stops bring the pads to optimal temperature within 3–4 cycles. Material for all four rotors costs about $200.

### Figures
