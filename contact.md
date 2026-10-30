---
title: Contact
permalink: /contact/
description: Contact Small Heath Park Housing Co-operative about repairs, rent, applications and general
  enquiries.
form:
  id: contact
  subject: Website contact enquiry
  submit:
    label: Send message
  sections:
  - id: message
    title: Send a message
    description: For emergencies, use the telephone arrangements on the repairs page.
    fields:
    - name: name
      label: Your name
      type: text
      required: true
      maxlength: 120
      autocomplete: name
    - name: email
      label: Email address
      type: email
      required: true
      maxlength: 254
      autocomplete: email
    - name: phone
      label: Phone number
      type: tel
      maxlength: 40
      autocomplete: tel
    - name: subject
      label: What is your enquiry about?
      type: select
      required: true
      options:
      - General enquiry
      - Repairs
      - Rent
      - Housing application
      - Other
    - name: message
      label: Your message
      type: textarea
      required: true
      rows: 4
      maxlength: 5000
      full_width: true
      minlength: 10
    - name: privacy
      label: I have read the information about how this form uses my details.
      type: checkbox
      required: true
      value: 'yes'
      full_width: true
---


## Contact details

<address>
<strong>Small Heath Park Housing Co-operative Ltd</strong><br>
15 Rochdale Walk<br>
Small Heath<br>
Birmingham<br>
B10 0DF
</address>

**Phone:** [0121 773 3251](tel:01217733251)

For emergency repairs outside office hours, use the emergency-only arrangements on the [repairs page]({{ '/repairs/' | relative_url }}).
