defmodule BackendWeb.Plugs.AdminAuth do
  @moduledoc """
  Plug for authenticating admin users via JWT.
  """

  import Plug.Conn
  alias Backend.Auth.Token
  alias Backend.Accounts

  def init(opts), do: opts

  def call(conn, _opts) do
    with {:ok, token} <- extract_token(conn),
         {:ok, claims} <- Token.verify_access_token(token),
         {:ok, user} <- get_admin_user(claims["sub"]) do
      assign(conn, :current_user, user)
    else
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{error: error_message(reason)})
        |> halt()
    end
  end

  defp extract_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> {:ok, token}
      _ -> {:error, :missing_token}
    end
  end

  defp get_admin_user(user_id) do
    case Accounts.get_admin(user_id) do
      nil -> {:error, :not_admin}
      user -> {:ok, user}
    end
  end

  defp error_message(:missing_token), do: "Missing authorization token"
  defp error_message(:not_admin), do: "Admin access required"
  defp error_message(:invalid_token_type), do: "Invalid token type"
  defp error_message(:signature_error), do: "Invalid token signature"
  defp error_message({:error, reason}), do: "Authentication failed: #{inspect(reason)}"
  defp error_message(_), do: "Authentication failed"
end
