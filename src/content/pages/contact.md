---
# The Contact page. Copy originally from Figma 788:9565 and 1005:14646; the repo
# is the source of truth for it now.
route: contact
title: "Contact — CentiPack"
description: >-
  We come back with a recommended build and pricing. There is no automated sequence behind this form — it goes straight to the team.
label: Contact
heading: Contact us now
lede: >-
  We come back with a recommended build and pricing. There is no automated sequence behind this form — it goes straight to the team, and the reply comes from whoever can answer it.
listing:
  label: Contact
  # {email} is filled in from the site entry.
  note: "Request a quote or samples, or email {email}"
  order: 3
sections:
  - type: contact-form
    emailLabel: "Email:"
    fields:
      name:
        label: Full Name
        placeholder: Your name
      email:
        label: Work email
        placeholder: you@pharmacy.com
      company:
        label: Company
        placeholder: Pharmacy or brand name
      volume:
        label: Projected shipments per week
        placeholder: Select a range — up to 10,000+
      message:
        label: What are you shipping, and where?
        placeholder: e.g. GLP-1 injectables, nationwide next-day air, 3,000 packages/week
    # Still a stand-in: the design draws only the placeholder (open question 14).
    volumeOptions:
      - Under 500 / week
      - 500 – 2,000 / week
      - 2,000 – 5,000 / week
      - 5,000 – 10,000 / week
      - 10,000+ / week
    submitLabel: Send request
    messages:
      sending: Sending…
      success: Thank you — your request is with the team. We reply from a person, not a sequence.
      failed: Could not send right now. Please email {email}.
      unreachable: Could not reach the server. Please email {email}.
---
