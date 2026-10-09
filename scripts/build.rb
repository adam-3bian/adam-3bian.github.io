require 'jekyll'
Jekyll::Commands::Build.process({'source' => Dir.pwd, 'destination' => File.join(Dir.pwd, '_site'), 'trace' => true})
