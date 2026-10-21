"""Resolve hand-authored event programmes for validation; native Liquid renders the same data."""
from copy import deepcopy
from collections import Counter
import re


def title_slug(title):
    return re.sub(r'[^A-Za-z0-9]+', '-', str(title)).strip('-').lower() or 'entry'


def anchors(items, prefix):
    counts = Counter(title_slug(item.get('title', '')) for item in items)
    return [prefix + '-' + title_slug(item.get('title', '')) +
            ('-' + str(index) if counts[title_slug(item.get('title', ''))] > 1 else '')
            for index, item in enumerate(items, 1)]


def normalise_event(data):
    """Generate internal scopes and inverse-query records, without persisting IDs in Markdown."""
    data = deepcopy(data)
    event = data.get('event')
    if not event:
        return data
    credits = event.setdefault('speakers', [])
    media = data.setdefault('resources', [])
    if any(r.get('session_id') or r.get('presentation_id') for r in media):
        raise ValueError('Place talk resources under their session or presentation, without scope IDs')

    def speakers(rows, scope=None):
        result = []
        for row in rows:
            if set(row) - {'person', 'name', 'role', 'affiliation'}:
                raise ValueError('Speaker: use person or name, optional role and affiliation; no session IDs')
            if bool(row.get('person')) == bool(row.get('name')):
                raise ValueError('Speaker: supply exactly one of person or name')
            if row.get('role', 'speaker') not in {'speaker', 'moderator', 'chair', 'panellist', 'host', 'presenter', 'organiser'}:
                raise ValueError('Speaker: unsupported role')
            if row.get('person'):
                credit = {'person': row['person'], 'role': row.get('role', 'speaker')}
                if scope:
                    credit['session'] = scope
                result.append(credit)
        return result

    event['speakers'] = speakers(credits)
    for day in event.get('schedule', []):
        sessions = day.get('sessions', [])
        for session, identifier in zip(sessions, anchors(sessions, 'programme-' + day['date'])):
            if 'id' in session:
                raise ValueError('Programme IDs are generated: remove id from the session')
            session['id'] = identifier
            session.setdefault('type', 'session' if session.get('presentations') else 'talk')
            session.setdefault('track', 'main')
            items = [(session, identifier, 'session_id')]
            presentations = session.get('presentations', [])
            for presentation, child_id in zip(presentations, anchors(presentations, 'presentation-' + identifier)):
                if 'id' in presentation:
                    raise ValueError('Programme IDs are generated: remove id from the presentation')
                presentation['id'] = child_id
                items.append((presentation, child_id, 'presentation_id'))
            for item, scope, scope_key in items:
                event['speakers'].extend(speakers(item.pop('speakers', []), scope))
                for resource in item.pop('resources', []):
                    if set(resource) - {'type', 'label', 'url'}:
                        raise ValueError('Talk resources use type, label and url; nesting supplies the scope')
                    media.append({**resource, scope_key: scope})
    return data
