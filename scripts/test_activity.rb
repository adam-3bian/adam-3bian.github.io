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
