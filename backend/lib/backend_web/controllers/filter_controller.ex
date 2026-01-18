defmodule BackendWeb.FilterController do
  use BackendWeb, :controller

  alias Backend.Murals

  @doc """
  Lists available provinces.
  """
  def provinces(conn, _params) do
    provinces = Murals.list_provinces()

    conn
    |> put_status(:ok)
    |> json(%{data: provinces})
  end

  @doc """
  Lists municipalities for a given province.
  """
  def municipalities(conn, %{"province" => province}) do
    municipalities = Murals.list_municipalities(province)

    conn
    |> put_status(:ok)
    |> json(%{data: municipalities})
  end

  def municipalities(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Province parameter is required"})
  end

  @doc """
  Lists neighborhoods for a given province and optional municipality.
  """
  def neighborhoods(conn, %{"province" => province} = params) do
    municipality = params["municipality"]
    neighborhoods = Murals.list_neighborhoods(province, municipality)

    conn
    |> put_status(:ok)
    |> json(%{data: neighborhoods})
  end

  def neighborhoods(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Province parameter is required"})
  end
end
