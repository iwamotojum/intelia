Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      /\Ahttp:\/\/localhost:\d+\z/
    )

    resource '*',
      headers: :any,
      methods: %i[get post patch put delete options head],
      expose: %w[Authorization],
      max_age: 600
  end
end
