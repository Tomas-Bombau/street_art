defmodule Backend.Cache do
  @moduledoc """
  Redis cache wrapper using Redix.
  """

  @pool_size 5

  def child_spec(_opts) do
    redis_config = Application.get_env(:backend, :redis, [])
    host = Keyword.get(redis_config, :host, "localhost")
    port = Keyword.get(redis_config, :port, 6379)

    children =
      for i <- 0..(@pool_size - 1) do
        Supervisor.child_spec(
          {Redix, host: host, port: port, name: :"redix_#{i}"},
          id: {Redix, i}
        )
      end

    %{
      id: __MODULE__,
      type: :supervisor,
      start: {Supervisor, :start_link, [children, [strategy: :one_for_one]]}
    }
  end

  defp command(command) do
    Redix.command(:"redix_#{random_index()}", command)
  end

  defp random_index do
    Enum.random(0..(@pool_size - 1))
  end

  @doc """
  Ping Redis to check connection.
  """
  def ping do
    command(["PING"])
  end

  @doc """
  Get a value from cache.
  """
  def get(key) do
    case command(["GET", key]) do
      {:ok, nil} -> {:ok, nil}
      {:ok, value} -> {:ok, Jason.decode!(value)}
      error -> error
    end
  end

  @doc """
  Set a value in cache with optional TTL in seconds.
  """
  def set(key, value, ttl \\ nil) do
    encoded = Jason.encode!(value)

    case ttl do
      nil -> command(["SET", key, encoded])
      seconds -> command(["SET", key, encoded, "EX", seconds])
    end
  end

  @doc """
  Delete a key from cache.
  """
  def delete(key) do
    command(["DEL", key])
  end

  @doc """
  Check if a key exists.
  """
  def exists?(key) do
    case command(["EXISTS", key]) do
      {:ok, 1} -> true
      _ -> false
    end
  end
end
