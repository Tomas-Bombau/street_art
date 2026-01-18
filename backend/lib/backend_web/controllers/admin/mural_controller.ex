defmodule BackendWeb.Admin.MuralController do
  use BackendWeb, :controller

  alias Backend.Murals
  alias Backend.Murals.Mural
  alias Backend.Mailer
  alias Backend.Emails

  @doc """
  Lists murals by status (for admin dashboard).
  """
  def index(conn, params) do
    status = params["status"] || "pending"

    unless status in Mural.statuses() do
      conn
      |> put_status(:bad_request)
      |> json(%{error: "Invalid status. Must be one of: #{Enum.join(Mural.statuses(), ", ")}"})
    else
      page = parse_page(params["page"])
      result = Murals.list_murals_by_status(status, page: page)

      conn
      |> put_status(:ok)
      |> json(%{
        data: Enum.map(result.data, &mural_to_admin_json/1),
        meta: result.meta
      })
    end
  end

  @doc """
  Gets summary counts by status.
  """
  def summary(conn, _params) do
    counts = Murals.count_by_status()

    conn
    |> put_status(:ok)
    |> json(%{
      data: %{
        pending: Map.get(counts, "pending", 0),
        approved: Map.get(counts, "approved", 0),
        rejected: Map.get(counts, "rejected", 0)
      }
    })
  end

  @doc """
  Approves a mural with an optional name.
  Accepts optional `send_email` (boolean) and `message` (string) parameters.
  """
  def approve(conn, %{"id" => id} = params) do
    admin = conn.assigns.current_user
    name = params["name"]
    send_email = params["send_email"] == true
    message = params["message"]

    case Murals.get_mural(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Mural not found"})

      %Mural{status: "pending"} = mural ->
        case Murals.approve_mural(mural, admin.id, name) do
          {:ok, updated_mural} ->
            # Send approval email only if requested
            if send_email do
              send_approval_email(updated_mural, message)
            end

            conn
            |> put_status(:ok)
            |> json(%{
              data: mural_to_admin_json(updated_mural),
              message: "Mural approved successfully"
            })

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: format_changeset_errors(changeset)})
        end

      %Mural{status: status} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Cannot approve mural with status: #{status}"})
    end
  end

  @doc """
  Rejects a mural with a reason.
  Accepts optional `send_email` (boolean) parameter.
  """
  def reject(conn, %{"id" => id, "reason" => reason} = params) do
    admin = conn.assigns.current_user
    send_email = params["send_email"] == true

    case Murals.get_mural(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Mural not found"})

      %Mural{status: "pending"} = mural ->
        case Murals.reject_mural(mural, admin.id, reason) do
          {:ok, updated_mural} ->
            # Send rejection email only if requested
            if send_email do
              send_rejection_email(updated_mural)
            end

            conn
            |> put_status(:ok)
            |> json(%{
              data: mural_to_admin_json(updated_mural),
              message: "Mural rejected successfully"
            })

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: format_changeset_errors(changeset)})
        end

      %Mural{status: status} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Cannot reject mural with status: #{status}"})
    end
  end

  def reject(conn, %{"id" => _id}) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Rejection reason is required"})
  end

  # Private functions

  defp parse_page(nil), do: 1
  defp parse_page(page) when is_binary(page) do
    case Integer.parse(page) do
      {n, _} when n > 0 -> n
      _ -> 1
    end
  end
  defp parse_page(page) when is_integer(page) and page > 0, do: page
  defp parse_page(_), do: 1

  defp mural_to_admin_json(%Mural{} = mural) do
    %{
      id: mural.id,
      name: mural.name,
      image_url: mural.image_url,
      cloudinary_public_id: mural.cloudinary_public_id,
      latitude: mural.latitude && Decimal.to_float(mural.latitude),
      longitude: mural.longitude && Decimal.to_float(mural.longitude),
      province: mural.province,
      municipality: mural.municipality,
      neighborhood: mural.neighborhood,
      formatted_address: mural.formatted_address,
      status: mural.status,
      rejection_reason: mural.rejection_reason,
      contributor_email: mural.contributor_email,
      reviewed_at: mural.reviewed_at,
      reviewed_by_id: mural.reviewed_by_id,
      created_at: mural.inserted_at,
      updated_at: mural.updated_at
    }
  end

  defp send_approval_email(mural, message) do
    Task.start(fn ->
      mural
      |> Emails.approval_email(message)
      |> Mailer.deliver()
    end)
  end

  defp send_rejection_email(mural) do
    Task.start(fn ->
      mural
      |> Emails.rejection_email()
      |> Mailer.deliver()
    end)
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
