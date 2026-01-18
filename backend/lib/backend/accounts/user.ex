defmodule Backend.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @roles ["user", "admin"]

  schema "users" do
    field :email, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :role, :string, default: "user"

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new user.
  """
  def create_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :password, :role])
    |> validate_required([:email, :password])
    |> validate_email()
    |> validate_password()
    |> validate_inclusion(:role, @roles)
    |> unique_constraint(:email)
    |> hash_password()
  end

  @doc """
  Changeset for updating a user (without password change).
  """
  def update_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :role])
    |> validate_email()
    |> validate_inclusion(:role, @roles)
    |> unique_constraint(:email)
  end

  defp validate_email(changeset) do
    changeset
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email address")
    |> validate_length(:email, max: 160)
  end

  defp validate_password(changeset) do
    changeset
    |> validate_required([:password])
    |> validate_length(:password, min: 6, max: 72)
  end

  defp hash_password(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Argon2.hash_pwd_salt(password))

      _ ->
        changeset
    end
  end

  @doc """
  Verifies a password against the stored hash.
  """
  def verify_password(%__MODULE__{password_hash: hash}, password) when is_binary(password) do
    Argon2.verify_pass(password, hash)
  end

  def verify_password(_, _), do: false
end
