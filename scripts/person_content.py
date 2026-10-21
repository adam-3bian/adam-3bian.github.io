"""Resolve the primary affiliation plus additional affiliations for content validation."""
from copy import deepcopy


def normalise_person(data):
    data = deepcopy(data)
    person = data.get('person')
    if not person:
        return data
    if 'organisations' in person and ('affiliation' in person or 'other_affiliations' in person):
        raise ValueError('Use one affiliation and optional other_affiliations; do not duplicate organisations')
    if 'affiliation' in person or 'other_affiliations' in person:
        primary = person.pop('affiliation', None)
        if primary is not None and not isinstance(primary, dict):
            raise ValueError('person.affiliation must contain an organisation and optional position details')
        extra = person.pop('other_affiliations', [])
        person['organisations'] = ([primary] if primary else []) + extra
    for affiliation in person.get('organisations', []):
        affiliation.setdefault('relationship', 'other')
    return data
