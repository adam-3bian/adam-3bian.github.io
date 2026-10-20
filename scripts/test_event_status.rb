require 'jekyll'
require 'time'
require 'yaml'
root = File.expand_path('..', __dir__)
site = Jekyll::Site.new(Jekyll.configuration('source' => root, 'safe' => true, 'quiet' => true))
zones = YAML.safe_load(File.read(File.join(root, '_data/time_zones.yml')))
template = Liquid::Template.parse('{% include event-status.html event=fixture %}')
render = lambda do |event, as_of|
 template.render!({'fixture'=>event,'site'=>{'data'=>{'time_zones'=>zones},'time'=>Time.iso8601(as_of),'timezone'=>'Europe/London'}},registers:{site:site,page:{}}).strip
end
cases = [
 [{'date'=>'2027-04-21','end_date'=>'2027-04-23','event'=>{'timezone'=>'Europe/London'}}, {
 '2027-04-20T22:59:59Z'=>'Upcoming','2027-04-20T23:00:00Z'=>'Ongoing','2027-04-23T22:59:59Z'=>'Ongoing','2027-04-23T23:00:00Z'=>'Past'}],
 [{'date'=>'2026-11-12','event'=>{'timezone'=>'Europe/Berlin','time_bounds'=>{'start'=>'13:00','end'=>'17:00'}}}, {
 '2026-11-12T11:59:59Z'=>'Upcoming','2026-11-12T12:00:00Z'=>'Ongoing','2026-11-12T15:59:59Z'=>'Ongoing','2026-11-12T16:00:00Z'=>'Past'}],
 # A UK spring-clock-change day contains 23 hours, an autumn day 25.
 [{'date'=>'2027-03-28','event'=>{'timezone'=>'Europe/London'}}, {'2027-03-28T22:59:59Z'=>'Ongoing','2027-03-28T23:00:00Z'=>'Past'}],
 [{'date'=>'2026-10-25','event'=>{'timezone'=>'Europe/London'}}, {'2026-10-25T23:59:59Z'=>'Ongoing','2026-10-26T00:00:00Z'=>'Past'}]
]
cases.each{|event,times|times.each{|now,expected|actual=render.call(event,now);abort "#{now}: #{expected.inspect} != #{actual.inspect}" unless expected==actual}}
filter=Liquid::Template.parse('{% include chronological-items.html items=fixtures kind="events" status=filter %}{{ chronological_items | map: "slug" | join: "," }}')
fixtures=[{'slug'=>'past','date'=>'2026-10-18','event'=>{'timezone'=>'Europe/London'}},{'slug'=>'ongoing','date'=>'2026-10-20','event'=>{'timezone'=>'Europe/London'}},{'slug'=>'upcoming','date'=>'2026-10-22','event'=>{'timezone'=>'Europe/London'}}]
{'upcoming'=>'ongoing,upcoming','past'=>'past','all'=>'past,ongoing,upcoming'}.each do |mode,expected|
 actual=filter.render!({'fixtures'=>fixtures,'filter'=>mode,'site'=>{'data'=>{'time_zones'=>zones},'time'=>Time.iso8601('2026-10-20T12:00:00Z'),'timezone'=>'Europe/London'}},registers:{site:site,page:{}}).strip
 abort "Wrong #{mode} filter: #{actual}" unless actual==expected
end
puts 'Event status: 12 exact boundaries, IANA offsets, both DST changes, inclusive date-only spans and three listing filters passed.'
date_template=Liquid::Template.parse('{% include date.html value=fixture %}')
['2026-09-09',Time.iso8601('2026-09-09T14:00:00+01:00')].each do |fixture|
 output=date_template.render!({'fixture'=>fixture},registers:{site:site,page:{}})
 abort 'HTML time datetime must be ISO, including Jekyll Time objects' unless output.include?('datetime="2026-09-09"')&&output.include?('9 September 2026')
end
puts 'Date display: source strings and native Jekyll Time objects produce valid ISO time attributes.'
