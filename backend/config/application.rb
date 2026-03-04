require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"

Bundler.require(*Rails.groups)

module InteliaApi
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    config.time_zone = 'America/Sao_Paulo'
    config.i18n.default_locale = :en
  end
end