---
title: Arduino Robot Arm
org: Personal project · Design & Build
role:
start: 04/2026
end: 05/2026
category: Electronics
skills: CAD, Electronics
tags: Arduino, SolidWorks
cover: images/cover.jpg
cover alt: SolidWorks 3D model of the robot arm
cover position: center
hover: images/hover.jpg
model:
model alt: 3D model of the robot arm
---

## Summary
An Arduino-controlled robot arm, my second personal project. I planned the mechanism with block layouts and calculated its constraints, like the 180 mm max arm length, before modeling, so it took far fewer design iterations than my airboat. Build problems were fixed in place, not restarted.

## Specs
- Max arm length: 180 mm
- Controller: Arduino Uno
- Actuators: 3 × 9 g metal-gear servos
- Degrees of freedom: 3
- Control: Joystick + potentiometer
- Servo power: 5 V, 4 A external
- Design iterations: 1

## Gallery
- images/cover.jpg | 3D model of the arm in SolidWorks.
- images/01.jpg | 3D model of the controller.
- images/hover.jpg | Final prototype of the arm.
- images/02.jpg | Inside of the controller.
- images/03.jpg | Halfway through the build, mid-tweaks.

## Problem
After finals, I wanted to design and build a working robot arm driven by an Arduino. My airboat took four hull versions because I started modeling before planning, so the goal this time was to get it right in far fewer iterations.

The project was meant to be simple and electronics-focused: the goal was a working controller and an arm that could move small objects around.

## Approach
- **Planned before modeling.** Mapped the mechanism with block layouts first to settle how the links, joints and servos connect, before committing to any geometry.
- **Calculated the constraints.** Defined limits like the 180 mm maximum arm length by calculation, then built the SolidWorks model around them.
- **Built and wired it.** 3D-printed the parts and wired three 9 g servos to an Arduino Uno.
- **Custom controller.** A potentiometer controls the arm's height, and a joystick controls the other two degrees of freedom. The joystick sets speed, not position: the servos move gradually, and the further you push the stick, the faster they move. That keeps motion smooth and avoids jerking the servos.
- **Code written with AI.** I wrote the Arduino code with Claude, focusing my own time on the mechanical design, wiring and testing.
- **Split power.** The servos draw too much current for the Arduino, so they run on an external 5 V, 4 A wall adapter while an internal battery powers the Arduino.

## Results
The arm worked on the **first design iteration**, needing only a few part tweaks, compared with four hull versions for my airboat. It met both goals: the controller works smoothly, and the arm can pick up and move small objects like knick-knacks around my room.

Planning the design up front did exactly what it was meant to: it cut out the redesigns.

## What I Learned
Time spent planning up front pays back many times over: block layouts and a few calculations replaced the trial-and-error of my first project. I also got noticeably faster in SolidWorks. And when the build didn't go to plan, working within the constraints was quicker and cheaper than starting over. The wiring fixes pushed me further into electronics than I'd been before.

## Iterations


## Before / After

## Videos
- https://youtube.com/shorts/vA9mnM2KNHo?feature=share | Final design on display.

## Downloads

## Links

## One-Pager

### Problem
Design and build an Arduino-controlled robot arm in far fewer iterations than my first project, a 3D-printed airboat that took four hull versions.

### Approach
Mapped the mechanism with block layouts, then calculated constraints like the 180 mm max arm length before modeling in SolidWorks. Built a custom controller (joystick and potentiometer for 3 degrees of freedom) and gave the servos their own 5 V, 4 A supply.

### Results
The arm worked on the first design iteration with only minor part tweaks, compared with four hull versions for my airboat. It picks up and moves small objects, and the joystick gives smooth, speed-based control.

### Figures
