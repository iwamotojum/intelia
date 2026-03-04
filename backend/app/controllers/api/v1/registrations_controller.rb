module Api
  module V1
    class RegistrationsController < ApplicationController
      before_action :set_registration, only: %i[show update]

      # GET /api/v1/registrations/:session_token
      # Retoma sessão existente — carrega dados salvos
      def show
        render json: serialize(@registration), status: :ok
      end

      # POST /api/v1/registrations
      # Cria uma nova sessão de cadastro (step 1 vazio)
      def create
        @registration = Registration.new
        if @registration.save(validate: false)
          render json: serialize(@registration), status: :created
        else
          render json: { errors: @registration.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/registrations/:session_token
      # Salva os dados de um passo específico
      def update
        step = params[:current_step].to_i
        if @registration.advance_to_step!(step, registration_params)
          render json: serialize(@registration), status: :ok
        else
          render json: { errors: @registration.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      private

      def set_registration
        @registration = Registration.find_by!(session_token: params[:session_token])
      end

      def registration_params
        params.require(:registration).permit(
          :full_name, :birth_date, :email,
          :street, :number, :zip_code, :city, :state,
          :landline_phone, :mobile_phone
        )
      end

      def serialize(registration)
        registration.as_json(
          only: %i[
            session_token current_step completed
            full_name birth_date email
            street number zip_code city state
            landline_phone mobile_phone
            created_at updated_at
          ]
        )
      end
    end
  end
end
