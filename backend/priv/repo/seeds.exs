# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Backend.Repo.insert!(%Backend.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Backend.Accounts

# Create admin user if it doesn't exist
admin_email = "admin@example.com"

case Accounts.get_user_by_email(admin_email) do
  nil ->
    {:ok, _admin} =
      Accounts.create_user(%{
        email: admin_email,
        password: "admin123",
        role: "admin"
      })

    IO.puts("Admin user created: #{admin_email}")

  _user ->
    IO.puts("Admin user already exists: #{admin_email}")
end
