defmodule Backend.Auth.Token do
  @moduledoc """
  JWT token generation and verification using Joken.
  Supports access tokens (short-lived) and refresh tokens (long-lived).
  """

  use Joken.Config

  @impl true
  def token_config do
    default_claims(skip: [:aud, :iss])
    |> add_claim("iss", fn -> config()[:issuer] end, &(&1 == config()[:issuer]))
  end

  defp config do
    Application.get_env(:backend, __MODULE__, [])
  end

  defp secret_key do
    config()[:secret_key] || raise "JWT secret key not configured"
  end

  defp signer do
    Joken.Signer.create("HS256", secret_key())
  end

  @doc """
  Generate an access token for a user.
  """
  def generate_access_token(user_id, extra_claims \\ %{}) do
    ttl = config()[:access_token_ttl] || 15 * 60
    exp = DateTime.utc_now() |> DateTime.add(ttl, :second) |> DateTime.to_unix()

    claims =
      %{
        "sub" => user_id,
        "type" => "access",
        "exp" => exp
      }
      |> Map.merge(extra_claims)

    generate_and_sign(claims, signer())
  end

  @doc """
  Generate a refresh token for a user.
  """
  def generate_refresh_token(user_id) do
    ttl = config()[:refresh_token_ttl] || 7 * 24 * 60 * 60
    exp = DateTime.utc_now() |> DateTime.add(ttl, :second) |> DateTime.to_unix()

    claims = %{
      "sub" => user_id,
      "type" => "refresh",
      "exp" => exp,
      "jti" => Ecto.UUID.generate()
    }

    generate_and_sign(claims, signer())
  end

  @doc """
  Verify and decode a token.
  Returns {:ok, claims} or {:error, reason}.
  """
  def verify_token(token) do
    verify_and_validate(token, signer())
  end

  @doc """
  Verify an access token specifically.
  """
  def verify_access_token(token) do
    case verify_token(token) do
      {:ok, %{"type" => "access"} = claims} -> {:ok, claims}
      {:ok, _} -> {:error, :invalid_token_type}
      error -> error
    end
  end

  @doc """
  Verify a refresh token specifically.
  """
  def verify_refresh_token(token) do
    case verify_token(token) do
      {:ok, %{"type" => "refresh"} = claims} -> {:ok, claims}
      {:ok, _} -> {:error, :invalid_token_type}
      error -> error
    end
  end

  @doc """
  Generate both access and refresh tokens for a user.
  """
  def generate_tokens(user_id, extra_claims \\ %{}) do
    with {:ok, access_token, _} <- generate_access_token(user_id, extra_claims),
         {:ok, refresh_token, _} <- generate_refresh_token(user_id) do
      {:ok,
       %{
         access_token: access_token,
         refresh_token: refresh_token,
         token_type: "Bearer"
       }}
    end
  end
end
