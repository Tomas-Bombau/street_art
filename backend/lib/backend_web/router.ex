defmodule BackendWeb.Router do
  use BackendWeb, :router

  pipeline :api do
    plug CORSPlug, origin: ["http://localhost:5173"]
    plug :accepts, ["json"]
  end

  pipeline :admin_auth do
    plug BackendWeb.Plugs.AdminAuth
  end

  scope "/api", BackendWeb do
    pipe_through :api

    get "/health", HealthController, :index

    # Public mural endpoints
    get "/murals", MuralController, :index
    get "/murals/map", MuralController, :map
    get "/murals/:id", MuralController, :show
    post "/murals", MuralController, :create

    # Filter endpoints
    get "/filters/provinces", FilterController, :provinces
    get "/filters/municipalities", FilterController, :municipalities
    get "/filters/neighborhoods", FilterController, :neighborhoods
  end

  # Admin authentication (no auth required)
  scope "/api/admin", BackendWeb.Admin do
    pipe_through :api

    post "/auth/login", AuthController, :login
    post "/auth/refresh", AuthController, :refresh
  end

  # Protected admin endpoints
  scope "/api/admin", BackendWeb.Admin do
    pipe_through [:api, :admin_auth]

    get "/murals", MuralController, :index
    get "/murals/summary", MuralController, :summary
    put "/murals/:id/approve", MuralController, :approve
    put "/murals/:id/reject", MuralController, :reject
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: BackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
