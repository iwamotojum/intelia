Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :registrations, param: :session_token, only: %i[show create update]
    end
  end

  get '/health', to: proc { [200, {}, ['OK']] }
end
