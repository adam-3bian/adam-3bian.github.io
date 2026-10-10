require 'jekyll'
options = {'source' => Dir.pwd, 'destination' => ENV.fetch('CHERI_SITE_DESTINATION', File.join(Dir.pwd, '_site')), 'trace' => true}
options['baseurl'] = ENV['CHERI_SITE_BASEURL'] if ENV.key?('CHERI_SITE_BASEURL')
options['url'] = ENV['CHERI_SITE_URL'] if ENV.key?('CHERI_SITE_URL')
Jekyll::Commands::Build.process(options)
