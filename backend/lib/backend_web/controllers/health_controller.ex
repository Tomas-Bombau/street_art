defmodule BackendWeb.HealthController do
  use BackendWeb, :controller

  def index(conn, _params) do
    health = %{
      status: "ok",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      services: %{
        database: check_database(),
        redis: check_redis()
      }
    }

    conn
    |> put_status(:ok)
    |> json(health)
  end

  defp check_database do
    case Backend.Repo.query("SELECT 1") do
      {:ok, _} -> "ok"
      {:error, _} -> "error"
    end
  end

  defp check_redis do
    case Backend.Cache.ping() do
      {:ok, "PONG"} -> "ok"
      _ -> "error"
    end
  end
end
