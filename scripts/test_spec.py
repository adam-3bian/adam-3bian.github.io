#!/usr/bin/env python3
"""Adversarial schema fixtures: invalid content must fail before deployment."""
import copy,unittest,re,yaml
from check_spec import validate_schedule,validate_forms,UniqueLoader,ROOT
from event_content import normalise_event
from person_content import normalise_person
class Contracts(unittest.TestCase):
 def event(self):return {'date':'2026-11-12','end_date':'2026-11-13','event':{'format':'conference','timezone':'Europe/Berlin','schedule':[{'date':'2026-11-12','sessions':[{'id':'main','type':'session','title':'Main','track':'main','start':'13:00','end':'14:00','presentations':[{'id':'talk','title':'Talk','start':'13:10','end':'13:30'}]}]}],'speakers':[{'person':'real-person','role':'speaker','session':'talk'}]},'resources':[{'type':'slides','label':'Slides','url':'https://example.test/slides.pdf','presentation_id':'talk'}]}
 def schedule(self,event):
  errors=[];warnings=[];validate_schedule(event,'fixture',errors,warnings);return errors,warnings
 def test_programme_references_and_parallel_tracks(self):
  e=self.event();e['event']['schedule'][0]['sessions'].append({'id':'parallel','type':'session','title':'Parallel','track':'hardware','start':'13:00','end':'14:00'})
  self.assertEqual(self.schedule(e),( [],[]))
  e['event']['schedule'][0]['sessions'][1]['track']='main';self.assertTrue(any('overlap' in x for x in self.schedule(e)[0]))
 def test_programme_rejects_bad_scopes_and_ids(self):
  for mutate in [lambda e:e['event']['speakers'][0].update(session='missing'),lambda e:e['resources'][0].update(session_id='main'),lambda e:e['event']['schedule'][0]['sessions'][0]['presentations'][0].update(id='main'),lambda e:e['event']['schedule'][0].update(date='2026-11-14'),lambda e:e['event']['schedule'][0]['sessions'][0].update(end='12:00'),lambda e:e['event']['schedule'][0]['sessions'][0]['presentations'][0].update(end='15:00'),lambda e:e['event'].update(time_bounds={'start':'13:00'}),lambda e:e['event']['schedule'][0]['sessions'][0].update(statr='13:00')]:
   e=self.event();mutate(e);self.assertTrue(self.schedule(e)[0])
 def test_source_precision_is_not_fabricated(self):
  e=self.event();e['event']['schedule'][0]['sessions'][0].pop('end');errors,warnings=self.schedule(e);self.assertFalse(errors);self.assertTrue(warnings)
 def test_nested_programme_needs_no_ids_or_cross_references(self):
  raw={'event':{'schedule':[{'date':'2026-11-12','sessions':[{'title':'Keynotes','presentations':[
   {'title':'First talk','speakers':[{'person':'alice'}],'resources':[{'type':'slides','label':'Slides','url':'/slides.pdf'}]},
   {'title':'Panel','speakers':[{'person':'alice'},{'person':'bob','role':'moderator'},{'name':'Guest','affiliation':'Example'}]}]}]}]}}
  resolved=normalise_event(raw);event=resolved['event'];talks=event['schedule'][0]['sessions'][0]['presentations']
  self.assertEqual([c['person'] for c in event['speakers']],['alice','alice','bob'])
  self.assertEqual([c['session'] for c in event['speakers']],[talks[0]['id'],talks[1]['id'],talks[1]['id']])
  self.assertEqual(resolved['resources'][0]['presentation_id'],talks[0]['id'])
  self.assertNotIn('id',raw['event']['schedule'][0]['sessions'][0])
  before=talks[0]['id'];raw['event']['schedule'][0]['sessions'][0]['presentations'].reverse()
  reordered=normalise_event(raw)['event']['schedule'][0]['sessions'][0]['presentations']
  self.assertEqual(reordered[1]['id'],before)
 def test_repeated_titles_get_distinct_automatic_anchors(self):
  raw={'event':{'schedule':[{'date':'2026-11-12','sessions':[{'title':'Break'},{'title':'Break!'}]}]}}
  sessions=normalise_event(raw)['event']['schedule'][0]['sessions']
  self.assertEqual([s['id'] for s in sessions],['programme-2026-11-12-break-1','programme-2026-11-12-break-2'])
  self.assertEqual([s['type'] for s in sessions],['talk','talk'])
 def test_primary_and_additional_affiliations_keep_all_positions(self):
  primary={'organisation':'one','relationship':'employment','positions':[{'title':'Engineer','status':'current'}]}
  extra={'organisation':'two','relationship':'research','positions':[{'title':'Researcher','status':'current'},{'title':'Visitor','status':'past'}]}
  raw={'person':{'affiliation':primary,'other_affiliations':[extra]}}
  resolved=normalise_person(raw)['person']['organisations']
  self.assertEqual(resolved,[primary,extra])
  self.assertIn('affiliation',raw['person'])
  self.assertEqual(normalise_person({'person':{'affiliation':{'organisation':'one'}}})['person']['organisations'][0]['relationship'],'other')
 def test_affiliations_have_one_authoritative_home(self):
  with self.assertRaises(ValueError):normalise_person({'person':{'affiliation':{'organisation':'one'},'organisations':[{'organisation':'one'}]}})
 def test_editor_does_not_need_or_supply_scope_ids(self):
  for raw in [
   {'event':{'schedule':[{'date':'2026-11-12','sessions':[{'id':'manual','title':'Talk'}]}]}},
   {'event':{'speakers':[{'person':'alice','session':'manual'}]}},
   {'event':{'schedule':[{'date':'2026-11-12','sessions':[{'title':'Talk','speakers':[{'person':'alice','name':'Also Alice'}]}]}]}},
   {'event':{'format':'conference'},'resources':[{'url':'/slides.pdf','session_id':'manual'}]}]:
   with self.assertRaises(ValueError):normalise_event(raw)
 def test_dst_nonexistent_or_ambiguous_times_rejected(self):
  for day,time in [('2027-03-28','01:30'),('2026-10-25','01:30')]:
   e=self.event();e['date']=day;e['end_date']=day;e['event']['timezone']='Europe/London';e['event']['schedule'][0]['date']=day;e['event']['schedule'][0]['sessions'][0]['start']=time
   self.assertTrue(any('local clock' in x for x in self.schedule(e)[0]))
 def test_forms_reject_unknown_or_unsafe_configuration(self):
  good={'contact':{'id':'contact','title':'Contact','submission':{'mode':'external','url':'https://example.test/contact','label':'Contact'},'fields':[]}}
  errors=[];validate_forms(good,errors);self.assertFalse(errors)
  for mutate in [lambda f:f['contact']['submission'].update(mode='POST'),lambda f:f['contact']['submission'].update(mode='post'),lambda f:f['contact'].update(action='/ignored/'),lambda f:f['contact']['submission'].update(url='javascript:alert(1)'),lambda f:f['contact']['fields'].append({'name':'x','type':'password','label':'Unsupported'}),lambda f:f['contact']['fields'].extend([{'name':'x','type':'text','label':'One'},{'name':'x','type':'text','label':'Two'}]),lambda f:f['contact']['fields'].append({'name':'choice','type':'radio','label':'Choice','options':[]})]:
   f=copy.deepcopy(good);mutate(f);errors=[];validate_forms(f,errors);self.assertTrue(errors)
 def test_duplicate_yaml_keys_fail(self):
  with self.assertRaises(ValueError):yaml.load('title: One\ntitle: Two\n',Loader=UniqueLoader)
 def test_unconfigured_forms_cannot_gain_an_accidental_target(self):
  forms={'contact':{'id':'contact','title':'Contact','submission':{'mode':'unconfigured','label':'Send enquiry'},'fields':[]}}
  errors=[];validate_forms(forms,errors);self.assertFalse(errors)
  forms['contact']['submission']['url']='https://example.test/accidental';errors=[];validate_forms(forms,errors);self.assertTrue(errors)
 def test_specification_examples_parse(self):
  spec=(ROOT/'docs/migrations/v5.3/SPECIFICATION.txt').read_text();examples=[]
  for match in re.finditer(r'^---\n(.*?)^---\s*$',spec,re.S|re.M):
   try:data=yaml.safe_load(match[1])
   except yaml.YAMLError:continue
   if isinstance(data,dict) and str(data.get('layout','')).startswith(('lists/','details/')) and '<' not in data['layout']:examples.append(data)
  # 24 family/list configurations plus the standalone multi-affiliation example.
  self.assertEqual(len(examples),25)
  self.assertEqual(len({d['layout'] for d in examples}),20)
if __name__=='__main__':unittest.main()
