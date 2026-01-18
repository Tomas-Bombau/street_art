defmodule Backend.Murals.Mural do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses ["pending", "approved", "rejected"]

  schema "murals" do
    field :name, :string
    field :image_url, :string
    field :cloudinary_public_id, :string
    field :latitude, :decimal
    field :longitude, :decimal
    field :province, :string
    field :municipality, :string
    field :neighborhood, :string
    field :formatted_address, :string
    field :status, :string, default: "pending"
    field :rejection_reason, :string
    field :contributor_email, :string
    field :reviewed_at, :utc_datetime
    field :reviewed_by_id, :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating a new mural submission.
  """
  def create_changeset(mural, attrs) do
    mural
    |> cast(attrs, [
      :name,
      :image_url,
      :cloudinary_public_id,
      :latitude,
      :longitude,
      :province,
      :municipality,
      :neighborhood,
      :formatted_address,
      :contributor_email
    ])
    |> validate_required([
      :image_url,
      :latitude,
      :longitude,
      :province,
      :contributor_email
    ])
    |> validate_email()
    |> validate_coordinates()
    |> validate_length(:name, max: 255)
    |> validate_length(:province, max: 255)
    |> validate_length(:municipality, max: 255)
    |> validate_length(:neighborhood, max: 255)
  end

  @doc """
  Changeset for approving a mural with an optional name.
  """
  def approve_changeset(mural, admin_id, name \\ nil) do
    changes = %{
      status: "approved",
      reviewed_at: DateTime.utc_now() |> DateTime.truncate(:second),
      reviewed_by_id: admin_id,
      rejection_reason: nil
    }

    changes = if name && name != "", do: Map.put(changes, :name, name), else: changes

    mural
    |> change(changes)
    |> validate_length(:name, max: 255)
  end

  @doc """
  Changeset for rejecting a mural.
  """
  def reject_changeset(mural, admin_id, reason) do
    mural
    |> change(%{
      status: "rejected",
      reviewed_at: DateTime.utc_now() |> DateTime.truncate(:second),
      reviewed_by_id: admin_id,
      rejection_reason: reason
    })
    |> validate_required([:rejection_reason])
    |> validate_length(:rejection_reason, min: 1, max: 1000)
  end

  defp validate_email(changeset) do
    changeset
    |> validate_format(:contributor_email, ~r/^[^\s]+@[^\s]+$/,
      message: "must be a valid email address"
    )
    |> validate_length(:contributor_email, max: 160)
  end

  defp validate_coordinates(changeset) do
    changeset
    |> validate_number(:latitude, greater_than_or_equal_to: -90, less_than_or_equal_to: 90)
    |> validate_number(:longitude, greater_than_or_equal_to: -180, less_than_or_equal_to: 180)
  end

  @doc """
  Returns the list of valid statuses.
  """
  def statuses, do: @statuses
end
