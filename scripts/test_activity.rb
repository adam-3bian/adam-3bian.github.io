# Exercise the shared build-time activity fragment without rebuilding every page.
require 'jekyll'
require 'date'
site = Jekyll::Site.new(Jekyll.configuration('source' => File.expand_path('..', __dir__), 'quiet' => true))
site.reset
site.read
site.instance_variable_set(:@time, Time.utc(2026, 10, 14))
source = File.read(File.join(site.source, '_includes/featured-activity.html'))
render = lambda do
  site.liquid_renderer.file('_includes/featured-activity.html').parse(source).render!({'site' => site.site_payload['site']}, registers: {site: site, page: {}})
end
html = render.call
raise 'No source-dated news' unless html.include?('data-featured="news"')
raise 'No upcoming source event' unless html.include?('data-featured="events"')
site.instance_variable_set(:@time, Time.utc(2100, 1, 1))
empty = render.call
raise 'Expired events remain featured' if empty.include?('data-featured="events"')
raise 'Missing event empty state' unless empty.include?('No upcoming events are listed at the moment.')
raise 'Missing archive route' unless empty.include?('/news-and-events/events-and-archive/past-events/')
puts 'Activity: source-dated records, expiry and empty-event fallback passed.'

status_template = '{% include event-status.html item=test_event %}'
status = lambda do |event, now|
  site.instance_variable_set(:@time, now)
  site.liquid_renderer.file('event-status-test').parse(status_template).render!({'site' => site.site_payload['site'], 'test_event' => event}, registers: {site: site, page: {}}).strip
end
raise 'Expired timestamp still upcoming' unless status.call({'start_datetime' => '2026-10-14T09:00:00+00:00', 'end_datetime' => '2026-10-14T11:00:00+00:00'}, Time.utc(2026, 10, 14, 12)) == 'past'
raise 'Lost date-only precision' unless status.call({'start_date' => '2026-10-14'}, Time.utc(2026, 10, 14, 23)) == 'upcoming'
raise 'Expired final day still upcoming' unless status.call({'start_date' => '2026-10-14'}, Time.utc(2026, 10, 15, 1)) == 'past'
raise 'Event ignored its final day' unless status.call({'start_date' => '2026-10-13', 'end_date' => '2026-10-15'}, Time.utc(2026, 10, 14, 12)) == 'upcoming'
raise 'Timezone offset ignored' unless status.call({'start_datetime' => '2026-10-14T09:00:00-04:00'}, Time.utc(2026, 10, 14, 12)) == 'upcoming'
puts 'Event precision: final timestamps, calendar days, multi-day events and offsets passed.'
