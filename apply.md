---
title: Housing application
permalink: /apply/
description: Apply for housing with Small Heath Park Housing Co-operative.
form:
  id: application
  submit:
    label: Submit housing application
  subject: Housing application
  stepped: true
  sections:
  - id: personal
    title: A · Personal details
    fields:
    - name: applicant_title
      label: Title
      type: select
      options:
      - Mr
      - Mrs
      - Miss
      - Ms
      - Mx
      - Other
    - name: applicant_surname
      label: Surname
      type: text
      required: true
      maxlength: 120
      autocomplete: family-name
    - name: applicant_first_names
      label: First name(s)
      type: text
      required: true
      maxlength: 120
      autocomplete: given-name
    - name: applicant_dob
      label: Date of birth
      type: date
      required: true
      date_past: true
    - name: applicant_address
      label: Current address
      type: textarea
      required: true
      rows: 4
      maxlength: 4000
      full_width: true
      help: Include the postcode. If you have no fixed address, describe your current situation.
    - name: applicant_phone
      label: Telephone number
      type: tel
      required: true
      maxlength: 40
      autocomplete: tel
    - name: applicant_ni
      label: National Insurance number
      type: text
      maxlength: 30
      help: Optional at this stage. You can discuss this with the office.
    - name: applicant_email
      label: Email address
      type: email
      maxlength: 254
      autocomplete: email
      help: Optional. The office can use this address to contact you.
    - name: joint_application
      label: Is this a joint application?
      type: radio
      required: true
      options:
      - 'Yes'
      - 'No'
      full_width: true
    - name: joint_title
      label: Joint applicant — title
      type: select
      options:
      - Mr
      - Mrs
      - Miss
      - Ms
      - Mx
      - Other
      when:
        name: joint_application
        value: 'Yes'
    - name: joint_surname
      label: Joint applicant — surname
      type: text
      maxlength: 120
      autocomplete: 'off'
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_first_names
      label: Joint applicant — first name(s)
      type: text
      maxlength: 120
      autocomplete: 'off'
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_dob
      label: Joint applicant — date of birth
      type: date
      date_past: true
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_address
      label: Joint applicant — current address
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: Include the postcode. If you have no fixed address, describe your current situation.
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_phone
      label: Joint applicant — telephone number
      type: tel
      maxlength: 40
      autocomplete: 'off'
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_ni
      label: Joint applicant — National Insurance number
      type: text
      maxlength: 30
      help: Optional at this stage. You can discuss this with the office.
      when:
        name: joint_application
        value: 'Yes'
    - name: relationship_status
      label: A1(a). Marital / relationship status
      type: select
      options:
      - Married
      - Divorced
      - Separated
      - Single
      - Other
    - name: correspondence_address
      label: A2. Alternative address for correspondence
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: Leave blank if correspondence should go to your current address.
    - name: worked_birmingham
      label: A3. How long have you worked in Birmingham?
      type: text
      maxlength: 120
    - name: lived_birmingham
      label: A3. How long have you lived in Birmingham?
      type: text
      maxlength: 120
    - name: ethnic_origin
      label: A4. Equal opportunities monitoring
      type: select
      options:
      - Asian
      - Caribbean
      - African
      - South-East Asian
      - British
      - European
      - Irish
      - Other
      - Question refused / prefer not to say
      help: Optional. The choices follow the paper form. The co-operative aims to treat all applicants
        fairly regardless of nationality, sex, colour or religious belief.
      full_width: true
    description: Complete the form as clearly and fully as you can. Contact the office if you need help.
  - id: household
    title: A · Household and housing needs
    fields:
    - name: moving_people
      label: A5. Other people who will live with you
      type: repeat
      item_label: Person
      help: List everyone moving with you, excluding the main and joint applicants. Leave unused rows
        blank.
      max_rows: 20
      nojs_rows: 8
      fields:
      - name: surname
        label: Surname
        type: text
        maxlength: 120
        row_required: true
      - name: first_names
        label: First name(s)
        type: text
        maxlength: 120
        row_required: true
      - name: sex
        label: Sex
        type: text
        maxlength: 60
      - name: age
        label: Age
        type: number
        min: 0
        max: 120
      - name: relationship
        label: Relationship to applicant
        type: text
        maxlength: 120
    - name: pets
      label: A6. Details of any pets
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
    - name: health
      label: A7. Disabilities, illness or health difficulties relevant to your application
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: Optional. Include only information relevant to your housing needs.
    - name: special_facilities
      label: A8. Does anyone require special facilities?
      type: radio
      required: true
      options:
      - 'Yes'
      - 'No'
    - name: special_facilities_details
      label: A8. Please describe the special facilities needed
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      when:
        name: special_facilities
        value: 'Yes'
      required_when:
        name: special_facilities
        value: 'Yes'
    - name: staying_people
      label: A9. People at your current address who will not move with you
      type: repeat
      item_label: Person
      max_rows: 20
      nojs_rows: 8
      fields:
      - name: surname
        label: Surname
        type: text
        maxlength: 120
        row_required: true
      - name: first_names
        label: First name(s)
        type: text
        maxlength: 120
        row_required: true
      - name: sex
        label: Sex
        type: text
        maxlength: 60
      - name: relationship
        label: Relationship to applicant
        type: text
        maxlength: 120
    - name: previous_addresses
      label: A10. Previous addresses in the last five years
      type: repeat
      item_label: Previous address
      help: Include the address, length of stay and whether you were an owner, tenant, lodger or had another
        arrangement. Leave unused rows blank.
      max_rows: 20
      nojs_rows: 8
      fields:
      - name: address
        label: Address
        type: textarea
        rows: 4
        maxlength: 4000
        full_width: true
        row_required: true
      - name: length_of_stay
        label: Length of stay / dates
        type: text
        maxlength: 160
        row_required: true
      - name: tenure
        label: Owner, tenant, lodger or other
        type: text
        maxlength: 120
        row_required: true
    - name: property_type
      label: A11. Type of accommodation required
      type: select
      required: true
      options:
      - One-bedroom flat
      - Two-bedroom bungalow
      - Two-bedroom house
      - Three-bedroom house
      help: Two-bedroom bungalows are only allocated to elderly applicants or people with specialist needs.
      full_width: true
  - id: circumstances
    title: B · Employment and present housing
    fields:
    - name: occupation
      label: B1. Occupation
      type: text
      maxlength: 160
    - name: employer
      label: B1. Employer’s name and address
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
    - name: discuss_income
      label: B1. Would you be prepared to discuss your income at an interview?
      type: radio
      required: true
      options:
      - 'Yes'
      - 'No'
      full_width: true
    - name: employment_status
      label: B2. Employment status
      type: select
      required: true
      options:
      - Employed
      - Retired
      - Unemployed
      - Student
      - Other
    - name: employment_other
      label: B2. Other employment status — please specify
      type: text
      maxlength: 200
      when:
        name: employment_status
        value: Other
      required_when:
        name: employment_status
        value: Other
    - name: current_tenure
      label: B3. What is your current housing situation?
      type: select
      required: true
      options:
      - Tenant of private landlord
      - Council tenant
      - Tenant of housing association
      - Staying with friends
      - Homeless
      - Staying with relatives
      - Living with parents
      - Living in a hostel
      - Owner occupier
      - Living in lodgings
      - Other
      full_width: true
    - name: tenure_other
      label: B3. Other housing situation — please specify
      type: text
      maxlength: 240
      when:
        name: current_tenure
        value: Other
      required_when:
        name: current_tenure
        value: Other
    - name: landlord
      label: B4. Current landlord or agent’s name and address
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: If you are a tenant.
    - name: rent_weekly
      label: B5. Current weekly rent / mortgage payment (£)
      type: number
      min: 0
      max: 100000
      step: '0.01'
    - name: rent_monthly
      label: B5. Current monthly rent / mortgage payment (£)
      type: number
      min: 0
      max: 100000
      step: '0.01'
    - name: waiting_lists
      label: B6. Council housing waiting lists
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: Give the council name and date of registration for each waiting list, or state “None”.
    - name: reason_leaving
      label: B7. Why do you wish to leave your current accommodation?
      type: textarea
      required: true
      rows: 4
      maxlength: 4000
      full_width: true
    - name: housing_condition
      label: B8. Condition of your current accommodation
      type: textarea
      required: true
      rows: 4
      maxlength: 4000
      full_width: true
      help: For example, dampness, heating and state of repair.
    description: You will be asked for evidence of household income and rent or mortgage payments. Arrange
      this with the office; do not send documents through the contact form.
  - id: facilities
    title: B · Facilities in your present home
    fields:
    - name: facility_kitchen
      label: B9. Kitchen
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: facility_bath
      label: B9. Shower or bath with hot and cold water
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: facility_washbasin
      label: B9. Wash basin with hot and cold water
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: facility_toilet
      label: B9. Toilet
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: facility_bedroom
      label: B9. Bedroom
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: facility_living_room
      label: B9. Living room
      type: select
      required: true
      options:
      - Have sole use
      - Shared with others
      - Do not have
    - name: bedrooms
      label: B10. Number of bedrooms in your present accommodation
      type: number
      required: true
      min: 0
      max: 50
      step: 1
  - id: community
    title: B · Membership and local connections
    fields:
    - name: related_members
      label: B11. Are you related to a member of this co-operative?
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: If so, give their name and address. Otherwise state “No”.
    - name: membership_reasons
      label: B12. Why would you like to become a member of this co-operative?
      type: textarea
      required: true
      rows: 4
      maxlength: 4000
      full_width: true
    - name: clubs
      label: B13. Membership of clubs, societies or community groups
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      help: Include any positions or responsibilities you hold or have held.
    - name: supporting_information
      label: B14. Anything else in support of your application
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
    - name: hobbies
      label: B14(a). Hobbies and pastimes
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
    - name: skills
      label: B15. Skills you could contribute
      type: checkboxes
      options:
      - Booking
      - Chairing meetings
      - Taking minutes
      - Property repairs
      - Clerical / filing
      - Interviewing
      - Landscaping
      - Other
      full_width: true
    - name: skills_other
      label: B15. Other skills
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
      when:
        name: skills
        value: Other
    - name: local_connections
      label: B16. Connections to the local area
      type: checkboxes
      options:
      - Community links in the area
      - Employment or training in the locality
      - Receiving support from family, friends or agencies
      - A family member attends a local school
      - Providing support to family in the locality
      - Already living in the area
      - Other local connection
      full_width: true
    - name: connection_details
      label: B16. Details of your local connections
      type: textarea
      rows: 4
      maxlength: 4000
      full_width: true
  - id: declaration
    title: Declaration
    fields:
    - name: declaration
      label: I confirm the statements above.
      type: checkbox
      required: true
      value: 'yes'
      full_width: true
    - name: privacy
      label: I have read the information about how this application uses my details.
      type: checkbox
      required: true
      value: 'yes'
      full_width: true
    - name: applicant_signature
      label: Main applicant — full name
      type: text
      required: true
      maxlength: 240
    - name: applicant_signed_date
      label: Main applicant — date
      type: date
      required: true
      date_past: true
    - name: joint_signature
      label: Joint applicant — full name
      type: text
      maxlength: 240
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_signed_date
      label: Joint applicant — date
      type: date
      date_past: true
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    - name: joint_declaration
      label: The joint applicant also confirms the declarations above.
      type: checkbox
      value: 'yes'
      full_width: true
      when:
        name: joint_application
        value: 'Yes'
      required_when:
        name: joint_application
        value: 'Yes'
    description: Read the declaration above before signing. Type your full name below; the office may
      ask you to sign the paper form.
---


This online application follows the five-page 2025 housing application form. You can also [download the paper form (PDF)]({{ "/assets/documents/housing-application-form-2025.pdf" | relative_url }}) and return it to **15 Rochdale Walk, Small Heath, Birmingham, B10 0DF**.

There is high demand and properties rarely become available. Please read [how homes are allocated]({{ "/allocations/" | relative_url }}) before applying. For help completing the form, call [0121 773 3251](tel:01217733251).

## Your declaration
{: #declaration-terms}

1. I/we understand that completing and signing this form does not mean that I/we will be offered housing.
2. I/we agree to be interviewed by a sub-committee of the co-operative.
3. I/we understand that I/we do not have to accept housing which is offered.
4. As far as I/we know, the information on this form is true, and I/we will inform the co-operative of any changes.
5. I/we understand that the co-operative has the right to regain possession of housing obtained if I/we have given false information.

Your information will be used to consider your application. Read the information about our online forms before you submit. The paper form says that receipt of applications will not be acknowledged; successful submission does not mean an offer of housing.

Type your full name below to record your declaration. The office may ask you to sign the paper form.
