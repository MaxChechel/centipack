---
# The home page. Copy originally from Figma uMHWj1JRHoqmY9uOQNfyL6 (`Home v1.03`,
# 1005:13599); the repo is the source of truth for it now.
route: home
title: "CentiPack — cold chain packaging for compounding pharmacies"
description: >-
  2–8°C shippers, gel packs, branded boxes and the pharmacy formats that go inside them — specified around your lanes and produced to your run.
label: Home
# Drawn to set in two lines at desktop widths. Capped at 65 characters
# (LENGTH_CAPS); keep it close to its current length.
heading: >-
  Cold chain packaging for high-volume compounding pharmacies
# Set in a 680px column. Capped at 290 characters (LENGTH_CAPS).
lede: >-
  We manufacture complete packaging solutions for temperature-sensitive medications — from insulated shippers and refrigerants to custom boxes and pharmacy formats — backed by 20+ years of combined cold-chain expertise and built for pharmacies that produce at scale.
actions:
  - label: Get a quote
    href: /contact
  - label: Explore products
    href: /products
image:
  src: ../../assets/home/centipack-home-hero.avif
  mobile: ../../assets/home/centipack-home-hero-mobile.avif
  alt: >-
    The CentiPack range laid out together: a white and a navy PuncturePack marked "Puncture here"; a navy mailer box open on two containers; a navy insulated mailer lying open to show its silver lining; an open white shipper holding a navy box and a navy mailer; a navy drawer box slid open on two glass vials; and three insulated mailers in navy, white and silver standing in a row.
# The home page is the top of llms.txt already, so it is not listed again.
listing: false
sections:
  # The cream band with the three category cards. The cards' words are in
  # src/content/categories/.
  - type: categories
    heading: >-
      Three integrated layers available individually or as a complete solution. Built to perform.
    lede: >-
      Your products deserve more than packaging — they require a cold-chain system built to maintain thermal integrity from packout through delivery. We manufacture the complete solution: insulated shippers validated for 2–8°C performance, refrigerants, custom secondary packaging, and pharmacy formats.
    action:
      label: Browse all products
      href: /products
  # Capped at 230 characters (LENGTH_CAPS).
  - type: testimonial
    quote: >-
      CentiPack has been great to work with. As our pharmacy has grown, they’ve been able to scale right along with us. They’re reliable, easy to work with, and their pricing has been some of the best we’ve seen.
    attribution: Compounding pharmacy client
  - type: closing
---
