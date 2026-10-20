#!/usr/bin/env python3
"""Regenerate generic UTC-offset periods used by safe Jekyll 3 Liquid filters."""
from pathlib import Path
import argparse,datetime,zoneinfo,yaml
ROOT=Path(__file__).resolve().parents[1]
def periods(name,start,end):
 tz=zoneinfo.ZoneInfo(name);rows=[];cursor=start;begin=int(start.timestamp());offset=int(start.astimezone(tz).utcoffset().total_seconds())
 while cursor<end:
  following=min(cursor+datetime.timedelta(hours=12),end);new=int(following.astimezone(tz).utcoffset().total_seconds())
  if new!=offset:
   lo=int(cursor.timestamp());hi=int(following.timestamp())
   while hi-lo>1:
    mid=(lo+hi)//2
    if int(datetime.datetime.fromtimestamp(mid,datetime.timezone.utc).astimezone(tz).utcoffset().total_seconds())==offset:lo=mid
    else:hi=mid
   rows.append({'start':begin,'end':hi,'offset':offset});begin=hi;offset=new
  cursor=following
 rows.append({'start':begin,'end':int(end.timestamp()),'offset':offset});return rows
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--start-year',type=int,default=2020);p.add_argument('--end-year',type=int,default=2051);a=p.parse_args()
 names={'Etc/UTC',yaml.safe_load((ROOT/'_config.yml').read_text())['timezone']}
 for file in (ROOT/'_events').glob('*.md'):names.add(yaml.safe_load(file.read_text().split('---',2)[1])['event'].get('timezone','Europe/London'))
 start=datetime.datetime(a.start_year,1,1,tzinfo=datetime.timezone.utc);end=datetime.datetime(a.end_year,1,1,tzinfo=datetime.timezone.utc)
 (ROOT/'_data/time_zones.yml').write_text(yaml.safe_dump({name:periods(name,start,end) for name in sorted(names)},sort_keys=False))
