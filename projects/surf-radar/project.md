---
title: Surf Radar
org: Personal project · Web app
role:
start: 11/2026
end: 11/2026
category: Software
skills: Software
tags: JavaScript,    GitHub Actions, AI-assisted development
cover: images/home.png
cover alt: Surf Radar home screen showing the best time to go and spots ranked by rating
cover position: top
hover: images/map.png
model:
model alt:
---

## Summary
A free surf forecast for 17 spots from South Beach to Cocoa Beach that answers one question: is it worth the drive? It blends three wave models, scores confidence by how closely they agree, and corrects the near-term forecast with live NOAA buoys.

## Specs
- Coverage: 17 spots, Cocoa–South Beach
- Forecast: Median of 3 wave models
- Stack: HTML, CSS, JavaScript
- Built with: Claude Opus 5.5
- Hosting cost: $0 (free tiers)

## Gallery
- images/home.png | Home screen: the best time to go and every spot ranked by rating.
- images/map.png | Illustrated map of the coast with a rating at each spot.
- images/spot.png | Spot page with cam links, the current forecast and the nearest buoy reading.

## Problem
My dad and I love to surf, but we rarely get to go. Every surf report says something different, most are inaccurate or charge a monthly fee, and driving 1–2 hours to find flat water isn't worth it.

I wanted a free forecast that tells us when a trip is actually worth it, based on our own preferences.

## Approach
- **Tested the data before trusting it.** Compared the models live across all 17 spots. ECMWF returns no swell period, and GWAM read 3.5–4.2 ft in South Florida where the others read about 2 ft, so I dropped GWAM and kept ECMWF for wave height only.
- **Used the middle value.** With three models, a median ignores one bad outlier where an average wouldn't.
- **Scored confidence by agreement.** Each day is labeled by how closely the models agree and how far ahead it is, so a shaky forecast looks shaky.
- **Compared like with like.** The buoy correction compares each buoy with the models at the buoy's own location, then applies the difference to nearby spots.
- **Limited how far a correction reaches.** It fades to nothing over 48 hours, weakens with distance and is capped at 30%.
- **No server:** the browser pulls forecasts from Open-Meteo, and scheduled GitHub Actions save NOAA buoy and hurricane data as small files.
- **Built with AI.** I'm a mechanical engineering student, not a programmer. I wrote the code with Claude Opus 5.5, while I made the engineering decisions: which data to trust, how to blend it and how to rate a session.

## Results
A working site that names the best time to go, rates each spot for morning, midday and evening, labels its confidence, warns about wind and tropical systems, and sends a daily email when a spot is forecast at 4 or higher three days out.

**The real test:** a couple of days after launch, my dad and I went surfing on its call, and the forecast was spot on.

## What I Learned
I never expected to build a whole website, let alone in a few hours. The engineering habits carried over: define the problem, test the inputs before trusting them, and check the output against reality. AI tools are changing how engineers work, and I'd rather learn to use them well than avoid them.

## Iterations

## Before / After

## Videos

## Downloads

## Links
- Live site | https://adriancal19.github.io/surf-radar/
- GitHub | https://github.com/adriancal19/surf-radar

## One-Pager

### Problem
My dad and I rarely get to surf, and every surf report says something different: most are inaccurate or paid, and a 1–2 hour drive to flat water is a wasted day. I wanted a free forecast that says when a trip is worth it.

### Approach
Tested three wave models against each other before trusting any, blended them with a median to ignore outliers, and corrected the blend with live NOAA buoys, compared at the buoy's own location, capped at 30% and fading over 48 hours.

### Results
A free site covering 17 spots that rates each one 1–5 for morning, midday and evening, labels its confidence and emails an alert three days ahead of a good session. On its first real trip, the forecast was accurate. Built in a few hours with Claude Opus 5.5.

### Figures
- images/home.png
- images/map.png
- images/spot.png
