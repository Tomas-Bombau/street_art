defmodule Backend.Accounts do
  @moduledoc """
  The Accounts context for user management.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Accounts.User

  @doc """
  Gets a user by ID.
  """
  def get_user(id) do
    Repo.get(User, id)
  end

  @doc """
  Gets a user by email.
  """
  def get_user_by_email(email) when is_binary(email) do
    Repo.get_by(User, email: String.downcase(email))
  end

  @doc """
  Creates a new user.
  """
  def create_user(attrs \\ %{}) do
    attrs = normalize_email(attrs)

    %User{}
    |> User.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.
  """
  def update_user(%User{} = user, attrs) do
    attrs = normalize_email(attrs)

    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.
  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Authenticates a user by email and password.
  Returns {:ok, user} or {:error, :invalid_credentials}.
  """
  def authenticate_user(email, password) do
    user = get_user_by_email(email)

    cond do
      user && User.verify_password(user, password) ->
        {:ok, user}

      user ->
        {:error, :invalid_credentials}

      true ->
        # Prevent timing attacks
        Argon2.no_user_verify()
        {:error, :invalid_credentials}
    end
  end

  @doc """
  Checks if a user is an admin.
  """
  def admin?(%User{role: "admin"}), do: true
  def admin?(_), do: false

  @doc """
  Gets an admin user by ID.
  Returns nil if the user is not an admin.
  """
  def get_admin(id) do
    case get_user(id) do
      %User{role: "admin"} = user -> user
      _ -> nil
    end
  end

  defp normalize_email(attrs) do
    case attrs do
      %{email: email} when is_binary(email) ->
        Map.put(attrs, :email, String.downcase(email))

      %{"email" => email} when is_binary(email) ->
        Map.put(attrs, "email", String.downcase(email))

      _ ->
        attrs
    end
  end
end
