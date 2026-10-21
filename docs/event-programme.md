# Event programmes

Edit the `event.schedule` in each `_events/<event-name>.md` file. Each day has
a quoted ISO `date` and ordered `sessions`. Keep session and presentation IDs
stable: speaker profiles and resource links use them as fragment targets.

- A session's `title`, `start` and optional `end` form its coloured heading.
  `type: break` and `type: networking` use the green band. When no end is
  supplied, these intervals run until the next session's published start.
- Add talks under `presentations`, with a title, stable ID and optional quoted
  `start` / `end` (`HH:MM`). The timeline only shows individual times supplied
  in the data. CHERITech'26's four keynote starts follow the supplied design
  reference (13:05, 13:20, 13:40, 14:00); other talk times are not estimated.
- Keep linked speakers in `event.speakers`, with their `session` pointing to
  the session or presentation ID. Existing imported organisation credits are
  displayed beside speakers; full descriptions and media remain available.
- The timezone appears once above the programme. Non-main tracks and room
  names appear beneath their session heading.

Multi-day programmes have keyboard-accessible day tabs (arrow keys, Home and
End). Direct links to a day, session or talk reveal the correct day. Without
JavaScript, day links jump to the full programme; printing includes every day.
Controls wrap and talk titles expand on small screens.
