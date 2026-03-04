class CreateRegistrations < ActiveRecord::Migration[7.1]
  def change
    create_table :registrations do |t|
      # Identificador de sessão anônima para retomada de formulário
      t.string  :session_token, null: false
      t.integer :current_step,  null: false, default: 1

      # Passo 1 — Dados Pessoais
      t.string  :full_name
      t.date    :birth_date
      t.string  :email

      # Passo 2 — Endereço
      t.string  :street
      t.string  :number
      t.string  :zip_code
      t.string  :city
      t.string  :state

      # Passo 3 — Telefones
      t.string  :landline_phone
      t.string  :mobile_phone

      t.boolean :completed, null: false, default: false

      t.timestamps
    end

    add_index :registrations, :session_token, unique: true
    add_index :registrations, :email
  end
end
