class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { error: 'Registro não encontrado' }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: e.message }, status: :bad_request
  end
end
