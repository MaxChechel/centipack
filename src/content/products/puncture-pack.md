---
title: "Puncture Pack"
# The footer and the nav say "Puncture Pack"; the page is headed with the
# trademark. Figma 1179:3199 against I1179:3353;381:1549.
pageTitle: "PuncturePack™"
slug: puncture-pack
category: cold-chain-shipping
order: 2
summary: "Expands at pack-out"
descriptor: >-
  Self-expanding insulated poly mailer · Compact storage · Expanded protection
lede: >-
  PuncturePack™ combines thermal insulation and protective cushioning in an easy-to-use mailer. Delivered vacuum-compressed to save storage space, its foam expands when punctured. Simply pack, seal, and puncture to activate the expanding foam insulation.
contactLinkLabel: >-
  Request samples & pricing
images:
  hero:
    src: ../../assets/products/puncture-pack-hero.avif
    alt: >-
      Three PuncturePack mailers on a cream ground — one lying flat and vacuum-compressed, two standing fully expanded.
  main:
    src: ../../assets/products/puncture-pack.avif
    alt: >-
      A navy CentiPack Puncture Pack mailer shown front-on, printed "Peel, pack, ship" and "Temperature stability" with a puncture target marked at each of its four corners.

# EVERY `label` BELOW IS WRITTEN FOR A VISITOR, NOT FOR THE PHOTOGRAPHER.
# Figma fills each empty slot with the production brief for the shot — "IMAGE:
# short demonstration video (compressed → expanded). Show the puncture location
# clearly. Confirm sequence against the actual product before filming." — and
# `Media` prints the label inside the pending box, on the live page. Publishing
# a note to the photographer as body copy is not what that convention is for.
# So the brief stays in a comment beside the slot it belongs to, and the label
# says plainly what the missing picture is of.
sections:
  # FIGMA BRIEF: short demonstration video (compressed → expanded). Show the
  # puncture location clearly. Confirm sequence against the actual product
  # before filming.
  - type: steps
    heading: How it works
    steps:
      - title: Pack
        body: >-
          Place your product and the required refrigerants inside the mailer, following your selected packout instructions.
      - title: Seal
        body: >-
          Peel off the release liner and press the adhesive flap closed.
      - title: Puncture
        body: >-
          Puncture the outer film at the "Puncture Here" marks to release the vacuum seal and allow the foam insulation to expand.
    image:
      label: >-
        PuncturePack being packed, sealed and punctured
      picture:
        # BACK TO ITS OWN FILE, and cut for this slot rather than borrowed from
        # the card. Entry 124 pointed this at `puncture-pack.avif` on
        # instruction; that source is 4:5, so a 1.179 box cropped 31% off the
        # height and served 1037px into a 660px slot. This one is 1.333, loses
        # 12% off the sides where there is only cream, and is a 3.1x file.
        src: ../../assets/products/puncture-pack-how-it-works.avif
        alt: >-
          A single expanded PuncturePack standing upright, printed with "Peel, pack, ship", "Temperature stability", the CentiPack logo and a puncture target at each of its four corners.

  - type: features
    heading: Why choose PuncturePack
    features:
      - icon: package
        title: Compact storage
        body: >-
          Arrives flat and vacuum-compressed, using up to 3x less storage space.
      - icon: expand
        title: Expanding insulation
        body: >-
          PU foam expands when punctured to provide thermal insulation around your shipment.
      - icon: shield
        title: Protective thermal cushioning
        body: >-
          Expanded foam surrounds contents to absorb shock during handling and transit.
      - icon: lock-keyhole
        title: Peel-and-seal closure
        body: >-
          An integrated adhesive strip seals the mailer quickly, with no tape needed.
      - icon: target
        title: Easy to puncture
        body: >-
          Engineered for quick, effortless puncture and efficient production line packing
      - icon: thermometer-snowflake
        title: Thermal performance
        body: >-
          Designed to maintain 2–8°C for 24–48 hours across a range of shipping lanes.
      - icon: truck
        title: Lower shipping costs
        body: >-
          Lightweight and compact, keeping dimensional weight and carrier costs down.

  # FIGMA BRIEF: dimension drawing (full frame): envelope measurement convention
  # + usable payload space.
  - type: specs
    heading: Sizes and specifications
    intro: >-
      Three stock envelope sizes, each available in three insulation thicknesses and a range of foam densities, give you dozens of configurations out of the box. Or we build one around your product and refrigerants.
    columns: [Specification, Available options]
    rows:
      - label: Envelope sizes
        value: 9″ × 11″, 12″ × 14″, and 14″ × 18″
      - label: Expanded insulation thicknesses
        value: ½″, 1″ and 1.5″ per side
      - label: PU foam densities
        value: 19 kg/m³ - 32 kg/m³
      - label: Custom sizing and insulation specifications
        value: >-
          Custom dimensions, insulation thicknesses and foam densities available upon request
      - label: Insulation material
        value: Flexible polyurethane (PU) foam
      - label: Construction
        value: Poly outer film and inner liner
      - label: Closure
        value: Integrated self-seal strip
      - label: Printing
        value: Full color customization and custom printing
    note: >-
      Usable payload space depends on the selected configuration.
    image:
      label: >-
        PuncturePack dimension drawing — envelope measurements and usable payload space
      picture:
        src: ../../assets/products/puncture-pack-dimensions.avif
        alt: >-
          A dimension drawing of a PuncturePack mailer: 12 inches wide by 14 inches tall measured flat, a dashed outline marking the usable payload space, and a side view labelled with an expanded thickness of half an inch, 1 inch or 1.5 inches per side.

  # FIGMA BRIEF: sample packout: 12x14 PuncturePack, 1.375" insulation, two 24oz
  # gel packs, 36-48hr under 8C.
  - type: split
    heading: Tailored pack-outs
    subheading: Thermal protection built around your shipment
    body: >-
      Your product, its target temperature, and its time in transit determine the optimal packout. We work with you to select the PuncturePack™ size, insulation thickness, foam density and refrigerant configuration to help you achieve your desired shipping duration and temperature range.
    note: >-
      Actual thermal performance depends on the complete packout, including payload, refrigerant conditioning, and external shipping conditions.
    action:
      label: Talk to a packaging specialist
      href: /contact
    imageSide: end
    image:
      label: >-
        A complete PuncturePack pack-out with gel packs
      picture:
        src: ../../assets/products/puncture-pack-packout.avif
        alt: >-
          An expanded PuncturePack above a complete pack-out — two gel packs flanking a small navy CentiPack carton.

  # FIGMA BRIEF: one custom-printed PuncturePack with a "your brand here"
  # placeholder logo.
  - type: split
    heading: Brand your mailer
    subheading: Your specifications. Your brand. Your PuncturePack™.
    body: >-
      Customize PuncturePack™ to showcase your brand. We offer full color customization, custom printing and tailored mailer specifications to support your shipping needs.
    note: >-
      Want us to quote your custom program? Please fill out this form or contact us to discuss your optimal solution.
    action:
      label: Request a custom quote
      href: /contact
    imageSide: start
    image:
      label: >-
        A custom-printed PuncturePack mailer
      picture:
        src: ../../assets/products/puncture-pack-branded.avif
        alt: >-
          Two blank PuncturePack mailers on a cream ground, one expanded in front and one lying flatter behind it.

  - type: numbered
    heading: Applications
    items:
      - title: Pharmacy fulfillment
        body: >-
          Insulated mailers for shipping temperature-sensitive prescriptions directly to patients.
      - title: Healthcare products
        body: >-
          Custom pack-outs for products with specific temperature and transit requirements.
      - title: Testing kits & specimens
        body: >-
          Tailored shipping solutions for testing kits, medical samples, and specimens.

  # ALL SEVEN ANSWERED. The first pass through Figma found six of these rows
  # collapsed with no answer text in the file; the client has since written
  # them, and they are transcribed here verbatim. The adapter still drops an
  # item with an empty `answer`, which is the right behaviour to keep: it is
  # what makes a half-written FAQ render as the part that is written rather
  # than as a disclosure that opens onto nothing.
  - type: faq
    heading: Frequently asked questions
    items:
      - question: How does PuncturePack™ expand?
        answer:
          - >-
            PuncturePack™ arrives vacuum-compressed for compact storage. Puncturing the designated outer film releases the vacuum, allowing the PU foam insulation to expand around your shipment.
      - question: Where do I puncture the mailer?
        answer:
          - >-
            Puncture only at the designated “Puncture Here” marks. Follow the packing instructions and avoid piercing the inner liner or contents.
      - question: What sizes and insulation thicknesses are available?
        answer:
          - >-
            Popular envelope sizes include 9″ × 11″, 12″ × 14″, and 14″ × 18″, with custom sizes also available. Expanded PU foam insulation options range from ½″ to 1.5″ per side.
      - question: How do I choose the right size for my product and gel packs?
        answer:
          - >-
            Allow room for your product, any inner packaging, and the required gel packs while leaving enough space to close the mailer securely. Share your payload dimensions and refrigerant requirements, and we can help recommend a size.
      - question: Can you help develop a packout for my temperature and transit requirements?
        answer:
          - >-
            Yes. We work with you to select the mailer size, insulation thickness, foam density and refrigerant configuration for your target temperature range and shipping duration. Thermal performance depends on the complete packout and shipping conditions.
      - question: Are custom sizes and printed mailers available?
        answer:
          - >-
            Yes. Custom dimensions and printing are available. Share your product requirements, artwork, and estimated order volume to discuss our custom program.
      - question: How can I request samples, and what are the ordering minimums?
        answer:
          - >-
            Use the “Request a Custom Quote” button to discuss.
---
