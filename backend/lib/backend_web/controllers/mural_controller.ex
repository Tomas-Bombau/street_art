defmodule BackendWeb.MuralController do
  use BackendWeb, :controller

  alias Backend.Murals
  alias Backend.Murals.Mural

  action_fallback BackendWeb.FallbackController

  @doc """
  Lists approved murals with pagination and filters.
  """
  def index(conn, params) do
    opts = build_list_opts(params)
    result = Murals.list_approved_murals(opts)

    conn
    |> put_status(:ok)
    |> json(%{
      data: Enum.map(result.data, &mural_to_json/1),
      meta: result.meta
    })
  end

  @doc """
  Lists all approved murals for the map view (no pagination).
  """
  def map(conn, _params) do
    murals = Murals.list_all_approved_murals()

    conn
    |> put_status(:ok)
    |> json(%{
      data: Enum.map(murals, &mural_to_json/1)
    })
  end

  @doc """
  Gets a single mural by ID.
  """
  def show(conn, %{"id" => id}) do
    case Murals.get_mural(id) do
      %Mural{status: "approved"} = mural ->
        conn
        |> put_status(:ok)
        |> json(%{data: mural_to_json(mural)})

      %Mural{} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Mural not found"})

      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Mural not found"})
    end
  end

  @doc """
  Creates a new mural submission (status: pending).
  """
  def create(conn, %{"mural" => mural_params}) do
    case Murals.create_mural(mural_params) do
      {:ok, mural} ->
        conn
        |> put_status(:created)
        |> json(%{
          data: mural_to_json(mural),
          message: "Your mural submission has been received and is pending review."
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_changeset_errors(changeset)})
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Missing mural parameters"})
  end

  # Private functions

  defp build_list_opts(params) do
    [
      page: parse_page(params["page"]),
      name: params["name"],
      province: params["province"],
      municipality: params["municipality"],
      neighborhood: params["neighborhood"]
    ]
  end

  defp parse_page(nil), do: 1
  defp parse_page(page) when is_binary(page) do
    case Integer.parse(page) do
      {n, _} when n > 0 -> n
      _ -> 1
    end
  end
  defp parse_page(page) when is_integer(page) and page > 0, do: page
  defp parse_page(_), do: 1

  defp mural_to_json(%Mural{} = mural) do
    %{
      id: mural.id,
      name: mural.name,
      image_url: mural.image_url,
      latitude: mural.latitude && Decimal.to_float(mural.latitude),
      longitude: mural.longitude && Decimal.to_float(mural.longitude),
      province: mural.province,
      municipality: mural.municipality,
      neighborhood: mural.neighborhood,
      formatted_address: mural.formatted_address,
      created_at: mural.inserted_at
    }
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
