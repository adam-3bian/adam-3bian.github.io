require 'liquid'

template = Liquid::Template.parse(File.read(File.expand_path('../_includes/event-status.html', __dir__)))
event = { 'start_date' => '2027-04-21', 'end_date' => '2027-04-23' }
{
  '2027-04-20' => 'Upcoming',
  '2027-04-21' => 'Happening today',
  '2027-04-22' => 'Happening today',
  '2027-04-23' => 'Happening today',
  '2027-04-24' => 'Past'
}.each do |as_of, expected|
  actual = template.render!('include' => { 'event' => event, 'as_of' => as_of }).strip
  abort "#{as_of}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
end
%w[cancelled postponed].each do |state|
  actual = template.render!('include' => { 'event' => event.merge('event_state' => state), 'as_of' => '2028-01-01' }).strip
  abort "Lost #{state} state" unless actual.downcase == state
end
puts 'Event status: date boundaries and cancellation/postponement passed.'
