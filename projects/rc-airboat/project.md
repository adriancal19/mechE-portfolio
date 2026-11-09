---
title: RC Airboat
org: Personal project · Design & Build
role:
start: 12/2025
end: 02/2026
category: CAD
skills: CAD, Electronics
tags: SolidWorks, 3D printing, Design
cover: images/cover.png
cover alt: RC airboat on the water (placeholder)
cover position: center
hover: images/hover.jpg
model: rc_airboat.glb
model alt: 3D model of the airboat hull
---

## Summary
My first personal project: an RC airboat designed in SolidWorks and 3D-printed on a Bambu Lab P1S. Two hulls sank, so I sized the third from Archimedes' principle. The final version (V4) displaces 7.0 × 10⁻⁴ m³, for 6.86 N of buoyancy against a 6.45 N boat.

## Specs
- Buoyant force: 5.39 N → 6.86 N
- Boat weight: 6.45 N (658 g)
- Hull volume: 5.5 → 7.0 × 10⁻⁴ m³
- Design iterations: 4 (V1–V4)
- Printer: Bambu Lab P1S

## Gallery
- images/cover.png | Final assembly 3d model.
- images/hover.jpg | Final build that succesfully sailed.
- images/01.jpg | How the DC motor and servo connect to the receiver.
- images/02.png | Version 1 battery pack storage.
- images/03.jpg | Version i3 first time floating.

## Problem
I got a 3D printer over winter break and wanted a project that would take me through the whole design cycle on my own: CAD, printing, assembly and testing. I chose an RC airboat.

The first two hulls didn't float. The boat weighed about 628 g (6.16 N), but the hull could only displace enough water to hold up about 5.39 N, roughly 550 g.

## Approach
- **Stopped guessing and did the math.** Instead of reshaping the hull by eye a third time, I set buoyancy equal to weight (ρ·g·V = m·g) and solved for the hull volume needed to float.
- **Redesigned the hull in SolidWorks** around that volume, growing it from 5.5 × 10⁻⁴ m³ to 7.0 × 10⁻⁴ m³.
- **Recalculated with the new weight.** The larger hull added 30 g (628 → 658 g), so I checked that buoyancy still came out ahead.
- **Designed for the printer.** Every mating part and screw hole was sized for the P1S's ±0.2 mm tolerance, so parts fit straight off the print bed without sanding or reprinting.
- **Simplified the electronics.** I used a speed controller and receiver meant for commercial RC Cars to control the boat. The speed controller and the servo both connect directly to the receiver; all powered by a 9.6V battery pack.

## Results
The V4 hull produces **6.86 N** of buoyancy, up from **5.39 N**, more than the finished boat's **6.45 N** weight, so it floats. All printed parts and screws fit as designed.

## What I Learned
A five-minute calculation would have saved two failed prints. When a design fails, it pays to step back and find the governing physics before changing anything. Designing around the machine's real tolerances from the start also made assembly easy.

## Iterations


## Before / After


## Videos
- https://youtube.com/shorts/PWT_HEOr-lU?feature=share | V4 on its first successful run


## Downloads

## Links

## One-Pager

### Problem
Design and 3D-print an RC airboat from scratch. The first two hulls sank: the 628 g boat weighed 6.16 N, but each hull could only displace enough water for 5.39 N of buoyancy.

### Approach
Set buoyancy equal to weight using Archimedes' principle to find the hull volume needed, redesigned the hull in SolidWorks around it, and rechecked with the heavier hull. Sized every mating part for the printer's ±0.2 mm tolerance.

### Results
The final V4 hull displaces 7.0 × 10⁻⁴ m³ for 6.86 N of buoyancy, above the boat's 6.45 N weight, so it floats. Parts fit straight off the printer.

### Figures
