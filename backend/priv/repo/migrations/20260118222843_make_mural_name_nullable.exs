defmodule Backend.Repo.Migrations.MakeMuralNameNullable do
  use Ecto.Migration

  def change do
    alter table(:murals) do
      modify :name, :string, null: true
    end
  end
end
