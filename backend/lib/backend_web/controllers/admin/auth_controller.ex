defmodule BackendWeb.Admin.AuthController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Auth.Token

  @doc """
  Admin login endpoint.
  """
  def login(conn, %{"email" => email, "password" => password}) do
    with {:ok, user} <- Accounts.authenticate_user(email, password),
         true <- Accounts.admin?(user),
         {:ok, tokens} <- Token.generate_tokens(user.id, %{"role" => user.role}) do
      conn
      |> put_status(:ok)
      |> json(%{
        data: %{
          user: %{
            id: user.id,
            email: user.email,
            role: user.role
          },
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type
        }
      })
    else
      {:error, :invalid_credentials} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})

      false ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Authentication failed: #{inspect(reason)}"})
    end
  end

  def login(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Email and password are required"})
  end

  @doc """
  Token refresh endpoint.
  """
  def refresh(conn, %{"refresh_token" => refresh_token}) do
    with {:ok, claims} <- Token.verify_refresh_token(refresh_token),
         user when not is_nil(user) <- Accounts.get_admin(claims["sub"]),
         {:ok, tokens} <- Token.generate_tokens(user.id, %{"role" => user.role}) do
      conn
      |> put_status(:ok)
      |> json(%{
        data: %{
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type
        }
      })
    else
      {:error, _reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid or expired refresh token"})

      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "User not found or not an admin"})
    end
  end

  def refresh(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Refresh token is required"})
  end
end
