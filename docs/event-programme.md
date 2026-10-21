# Editing event programmes

Edit `_events/<event-name>.md`. Add talks, speakers and downloads together,
where they appear in the programme. **Do not add IDs or cross-reference fields.**

This is a programme excerpt from CHERITech'26:

```yaml
event:
  format: conference
  timezone: Europe/Berlin
  schedule:
  - date: '2026-11-12'
    sessions:
    - title: Keynotes
      type: keynote
      start: '13:05'
      end: '14:20'
      presentations:
      - title: Progress of the Alliance
        start: '14:00'
        affiliation: CHERI Alliance
        speakers:
        - person: mike-eftimakis
```

- Use `person: <people-filename-without-extension>` to link a speaker's profile.
  For guests without a profile, use `name: Full Name`. Either can have a plain
  `affiliation`. A shared affiliation may instead sit alongside the talk title.
- List multiple speakers under the same talk. Repeat a person under each talk
  they give. The event roster, profile Events list and profile talk cards are
  derived from these entries; do not maintain another speaker list elsewhere.
- Event-wide hosts or speakers without an individual talk can still go under
  `event.speakers`. A role is optional and defaults to `speaker`; set `role`
  only when needed, for example `moderator` or `panellist`.
- Put `resources` beside a talk's `speakers`. Each resource has `type`, `label`
  and `url`, exactly like event-wide resources. Nesting determines which talk
  owns the slides, video or other media. Event-wide resources remain at the top
  level. Never add `session`, `session_id` or `presentation_id` references.
- Each day needs a quoted ISO date. Sessions and presentations follow YAML
  order. Use quoted `start` / `end` values (`HH:MM`) only when known.
  An explicit presentation start always wins. If the first presentation has no
  start, the timeline uses its session's known start; later missing times stay
  blank. Times are never estimated from the number or duration of talks.
- A standalone entry defaults to `talk`; a session containing presentations
  defaults to `session`. Set `type: keynote`, `break`, `networking`, `tutorial`
  or another supported type when appropriate. Breaks and networking use the
  green band and, without an explicit end, run until the next session starts.
- Tracks default to `main`. Set `track` and `room` only when needed. Keep the
  event's timezone explicit; it is displayed once above the programme.

The native Jekyll templates generate HTML anchors from the date and talk titles,
with automatic suffixes for repeated titles. Profile links use the same helper.
No custom plugin or content-generation step is required. Historical anchors
remain in `_data/anchor_aliases.yml` as migration metadata; new talks need no
entries there. Renaming a title updates its generated profile links automatically.

Multi-day programmes have keyboard-accessible day tabs (arrow keys, Home and
End). Direct links reveal the appropriate day. Without JavaScript, all days are
visible and day links jump through the full programme. Printing includes every
day. Controls wrap and titles expand on small screens. Two, three, four and
longer programmes use the same schema and controls, with no day-count limit.

The programme spans the full content canvas below the overview and facts.
Each day owns one continuous timeline rail. Session headings use blue bands;
breaks and networking use green bands. Speaker names, profile links, affiliations,
descriptions and downloads stay beside their session or presentation. Event
pages do not repeat these speakers in a separate card list. Event-wide credits
not attached to a programme entry remain compact facts in the aside; person
profiles still derive their Events and CHERI talks from the same source data.

For example, exhibition-only days use the existing fields:

```yaml
- date: '2026-11-10'
  label: Exhibition only
  sessions:
  - title: CHERI area
    description: Exhibits and demonstrations in Hall B0.
```

Add further days as siblings in `event.schedule`, in date order, and keep the
top-level `date` / `end_date` wide enough to include them. A descriptive `label`
appears beneath the date on its tab; a label identical to the weekday is omitted
to avoid repeating it. An empty `sessions: []` day remains selectable and shows
“No sessions listed for this day.” Existing IDs, fields and Markdown do not need
to be migrated.

`scripts/test_programme.rb` and `scripts/test_programme.py` verify one-, two-,
three-, four- and seven-day fixtures, grouped and flat entries, empty days,
explicit/inherited/missing times, keyboard navigation, deep links, print,
200% text and no-JavaScript use. CI runs these at both deployment paths.

## Design review

The CHERITech screenshots use the unchanged event record. The four-day examples
are synthetic test fixtures demonstrating labels and responsive tab wrapping.

| View | CHERITech | Four-day fixture |
| --- | --- | --- |
| Desktop | [Timeline](screenshots/event-timeline/desktop-cheritech26.png) | [Four days](screenshots/event-timeline/desktop-four-days.png) |
| Mobile | [Timeline](screenshots/event-timeline/mobile-cheritech26.png) | [Four days](screenshots/event-timeline/mobile-four-days.png) |

[Verification results](screenshots/event-timeline/verification.json) cover
both root and `/preview` deployments. The rendered-content comparison permits
only the requested speaker-list removal, retained aside credits and first-talk
start times taken from their sessions; other content, links and anchors remain
protected.
