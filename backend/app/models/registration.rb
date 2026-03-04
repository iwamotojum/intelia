class Registration < ApplicationRecord
  # ── Constantes ────────────────────────────────────────────────────────────
  STEPS    = (1..3).freeze
  BR_STATES = %w[AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN
                  RS RO RR SC SP SE TO].freeze

  # ── Callbacks ─────────────────────────────────────────────────────────────
  before_create :generate_session_token

  # ── Validações base ───────────────────────────────────────────────
  validates :session_token, presence: true, uniqueness: { case_sensitive: false }
  validates :current_step,  inclusion: { in: STEPS }

  # ── Validações do Passo 1 (aplicadas a partir do step 1) ──────────────────
  with_options if: :validate_step_1? do
    validates :full_name,
              presence: true,
              length: { minimum: 3, maximum: 150 },
              format: { with: /\A[a-zA-ZÀ-ÿ\s'-]+\z/, message: 'deve conter apenas letras' }

    validates :birth_date,
              presence: true

    validates :email,
              presence: true,
              length: { maximum: 255 },
              format: { with: URI::MailTo::EMAIL_REGEXP, message: 'inválido' },
              uniqueness: { case_sensitive: false, message: 'já cadastrado' }
  end

  validate :birth_date_must_be_valid, if: -> { birth_date.present? }

  # ── Validações do Passo 2 (aplicadas a partir do step 2) ──────────────────
  with_options if: :validate_step_2? do
    validates :street,   presence: true, length: { maximum: 255 }
    validates :number,   presence: true, length: { maximum: 20 }
    validates :zip_code, presence: true,
              format: { with: /\A\d{5}-\d{3}\z/, message: 'deve estar no formato 00000-000' }
    validates :city,     presence: true, length: { maximum: 100 }
    validates :state,    presence: true, inclusion: { in: BR_STATES, message: 'sigla inválida' }
  end

  # ── Validações do Passo 3 (aplicadas a partir do step 3) ──────────────────
  with_options if: :validate_step_3? do
    validates :mobile_phone,
              presence: true,
              format: { with: /\A\(\d{2}\) \d{5}-\d{4}\z/, message: 'deve estar no formato (00) 00000-0000' }
  end

  validates :landline_phone,
            format: { with: /\A\(\d{2}\) \d{4}-\d{4}\z/, message: 'deve estar no formato (00) 0000-0000' },
            allow_blank: true

  # ── Scopes ────────────────────────────────────────────────────────────────
  scope :completed,   -> { where(completed: true) }
  scope :incomplete,  -> { where(completed: false) }

  # ── Métodos públicos ──────────────────────────────────────────────────────
  def advance_to_step!(step, attributes)
    assign_attributes(attributes)
    self.current_step = [step.to_i, current_step].max
    self.completed    = true if current_step == 3 && step.to_i == 3
    save
  end

  private

  def validate_step_1?
    current_step >= 1 && completed_or_current_step_is?(1)
  end

  def validate_step_2?
    current_step >= 2
  end

  def validate_step_3?
    current_step >= 3
  end

  def completed_or_current_step_is?(step)
    completed? || current_step >= step
  end

  def birth_date_must_be_valid
    return if birth_date.blank?
    errors.add('Data de Nascimento', 'não pode ser no futuro') if birth_date > Date.today
    errors.add('Data de Nascimento', 'inválida (muito antiga)') if birth_date.year < 1900
    age = ((Date.today - birth_date) / 365.25).floor
    errors.add('Data de Nascimento', 'inválida. É necessário ter pelo menos 16 anos') if age < 16
  end

  def generate_session_token
    self.session_token ||= SecureRandom.urlsafe_base64(24)
  end
end
