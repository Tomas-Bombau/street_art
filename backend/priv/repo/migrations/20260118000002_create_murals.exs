defmodule Backend.Repo.Migrations.CreateMurals do
  use Ecto.Migration

  def change do
    create table(:murals, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string, null: false
      add :image_url, :string, null: false
      add :cloudinary_public_id, :string
      add :latitude, :decimal, precision: 10, scale: 8, null: false
      add :longitude, :decimal, precision: 11, scale: 8, null: false
      add :province, :string, null: false
      add :municipality, :string
      add :neighborhood, :string
      add :formatted_address, :string
      add :status, :string, null: false, default: "pending"
      add :rejection_reason, :text
      add :contributor_email, :string, null: false
      add :reviewed_at, :utc_datetime
      add :reviewed_by_id, references(:users, type: :uuid, on_delete: :nilify_all)

      timestamps(type: :utc_datetime)
    end

    create index(:murals, [:status])
    create index(:murals, [:province])
    create index(:murals, [:municipality])
    create index(:murals, [:neighborhood])
    create index(:murals, [:contributor_email])
    create index(:murals, [:reviewed_by_id])
  end
end
