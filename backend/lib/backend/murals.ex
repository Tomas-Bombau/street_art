defmodule Backend.Murals do
  @moduledoc """
  The Murals context for managing mural submissions.
  """

  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Murals.Mural

  @per_page 10

  @doc """
  Gets a mural by ID.
  """
  def get_mural(id) do
    Repo.get(Mural, id)
  end

  @doc """
  Gets a mural by ID, raises if not found.
  """
  def get_mural!(id) do
    Repo.get!(Mural, id)
  end

  @doc """
  Creates a new mural submission (status: pending).
  """
  def create_mural(attrs \\ %{}) do
    %Mural{}
    |> Mural.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Lists approved murals with pagination and filters.

  Options:
    - :page - page number (default: 1)
    - :name - filter by name (partial match)
    - :province - filter by province
    - :municipality - filter by municipality
    - :neighborhood - filter by neighborhood
  """
  def list_approved_murals(opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    filters = Keyword.take(opts, [:name, :province, :municipality, :neighborhood])

    query =
      Mural
      |> where([m], m.status == "approved")
      |> apply_filters(filters)
      |> order_by([m], desc: m.inserted_at)

    total_count = Repo.aggregate(query, :count)
    total_pages = ceil(total_count / @per_page)

    murals =
      query
      |> limit(^@per_page)
      |> offset(^((page - 1) * @per_page))
      |> Repo.all()

    %{
      data: murals,
      meta: %{
        page: page,
        per_page: @per_page,
        total_pages: max(total_pages, 1),
        total_count: total_count
      }
    }
  end

  @doc """
  Lists all approved murals (for map view, no pagination).
  """
  def list_all_approved_murals do
    Mural
    |> where([m], m.status == "approved")
    |> order_by([m], desc: m.inserted_at)
    |> Repo.all()
  end

  @doc """
  Lists murals by status (for admin).

  Options:
    - :page - page number (default: 1)
  """
  def list_murals_by_status(status, opts \\ []) when status in ["pending", "approved", "rejected"] do
    page = Keyword.get(opts, :page, 1)

    query =
      Mural
      |> where([m], m.status == ^status)
      |> order_by([m], desc: m.inserted_at)

    total_count = Repo.aggregate(query, :count)
    total_pages = ceil(total_count / @per_page)

    murals =
      query
      |> limit(^@per_page)
      |> offset(^((page - 1) * @per_page))
      |> Repo.all()

    %{
      data: murals,
      meta: %{
        page: page,
        per_page: @per_page,
        total_pages: max(total_pages, 1),
        total_count: total_count
      }
    }
  end

  @doc """
  Approves a mural with an optional name.
  """
  def approve_mural(%Mural{} = mural, admin_id, name \\ nil) do
    mural
    |> Mural.approve_changeset(admin_id, name)
    |> Repo.update()
  end

  @doc """
  Rejects a mural with a reason.
  """
  def reject_mural(%Mural{} = mural, admin_id, reason) do
    mural
    |> Mural.reject_changeset(admin_id, reason)
    |> Repo.update()
  end

  @doc """
  Gets distinct provinces from approved murals.
  """
  def list_provinces do
    Mural
    |> where([m], m.status == "approved")
    |> where([m], not is_nil(m.province))
    |> distinct([m], m.province)
    |> select([m], m.province)
    |> order_by([m], m.province)
    |> Repo.all()
  end

  @doc """
  Gets distinct municipalities for a province from approved murals.
  """
  def list_municipalities(province) do
    Mural
    |> where([m], m.status == "approved")
    |> where([m], m.province == ^province)
    |> where([m], not is_nil(m.municipality))
    |> distinct([m], m.municipality)
    |> select([m], m.municipality)
    |> order_by([m], m.municipality)
    |> Repo.all()
  end

  @doc """
  Gets distinct neighborhoods for a province (and optionally municipality) from approved murals.
  """
  def list_neighborhoods(province, municipality \\ nil) do
    query =
      Mural
      |> where([m], m.status == "approved")
      |> where([m], m.province == ^province)
      |> where([m], not is_nil(m.neighborhood))

    query =
      if municipality do
        where(query, [m], m.municipality == ^municipality)
      else
        query
      end

    query
    |> distinct([m], m.neighborhood)
    |> select([m], m.neighborhood)
    |> order_by([m], m.neighborhood)
    |> Repo.all()
  end

  @doc """
  Counts murals by status.
  """
  def count_by_status do
    Mural
    |> group_by([m], m.status)
    |> select([m], {m.status, count(m.id)})
    |> Repo.all()
    |> Enum.into(%{})
  end

  # Private functions

  defp apply_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {:name, name}, query when is_binary(name) and name != "" ->
        where(query, [m], ilike(m.name, ^"%#{name}%"))

      {:province, province}, query when is_binary(province) and province != "" ->
        where(query, [m], m.province == ^province)

      {:municipality, municipality}, query when is_binary(municipality) and municipality != "" ->
        where(query, [m], m.municipality == ^municipality)

      {:neighborhood, neighborhood}, query when is_binary(neighborhood) and neighborhood != "" ->
        where(query, [m], m.neighborhood == ^neighborhood)

      _, query ->
        query
    end)
  end
end
