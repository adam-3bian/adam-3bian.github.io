# Editing people and affiliations

Most people have one main company or institution. Put it in the singular
`person.affiliation` object:

```yaml
person:
  affiliation:
    organisation: lowrisc
    relationship: employment
    positions:
    - title: Pro bono CEO
      status: current
  other_affiliations:
  - organisation: cheri-alliance
```

`organisation` is the organisation's Markdown filename without `.md`.
`relationship` is optional and defaults to unspecified (`other`). Set a verified
relationship such as `employment`, `research`, `consultancy` or `governance`
when known. Omit positions if no job title is supplied; do not invent one.

Cards display the person's name, their first current position at the main
organisation (when known), and that organisation's name, on separate lines.
Governance roles remain in the person's governance fields and profile details.

Use `other_affiliations` only for additional relationships. It takes the same
objects as the main affiliation, including position titles, current/past status
and optional dates. Multiple current roles and overlapping affiliations are
supported. Profiles and organisation People lists include all affiliations;
search and company filters also include the additional affiliations.

To change which company appears on a card, move the desired affiliation into
`person.affiliation`; retain the others under `other_affiliations`. This is an
explicit display choice and does not remove or end any other position.
