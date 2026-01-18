defmodule Backend.Emails do
  @moduledoc """
  Email templates for mural approval/rejection notifications.
  """

  import Swoosh.Email

  defp from_email, do: Application.get_env(:backend, :mailer_from)[:email] || "noreply@streetart.com"
  defp from_name, do: Application.get_env(:backend, :mailer_from)[:name] || "Buenos Aires Street Art"

  @doc """
  Creates an approval email for a mural submission.
  Accepts an optional message from the admin.
  """
  def approval_email(mural, message \\ nil) do
    new()
    |> to(mural.contributor_email)
    |> from({from_name(), from_email()})
    |> subject("Your mural submission has been approved!")
    |> html_body(approval_html(mural, message))
    |> text_body(approval_text(mural, message))
  end

  @doc """
  Creates a rejection email for a mural submission.
  """
  def rejection_email(mural) do
    new()
    |> to(mural.contributor_email)
    |> from({from_name(), from_email()})
    |> subject("Update on your mural submission")
    |> html_body(rejection_html(mural))
    |> text_body(rejection_text(mural))
  end

  # HTML templates

  defp approval_html(mural, message) do
    message_html = if message && message != "" do
      """
      <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0;">
        <strong>Message from admin:</strong><br>
        #{html_escape(message)}
      </div>
      """
    else
      ""
    end

    """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FFCC00; padding: 20px; text-align: center; }
        .header h1 { margin: 0; color: #000; }
        .content { padding: 20px; background: #f9f9f9; }
        .mural-name { font-size: 24px; font-weight: bold; color: #0066FF; }
        .location { color: #666; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Buenos Aires Street Art</h1>
        </div>
        <div class="content">
          <p>Great news!</p>
          <p>Your mural submission has been <strong>approved</strong> and is now visible on our map!</p>
          <p class="mural-name">#{html_escape(mural.name)}</p>
          <p class="location">#{html_escape(mural.formatted_address || "#{mural.province}, #{mural.neighborhood}")}</p>
          #{message_html}
          <p>Thank you for contributing to the Buenos Aires street art community.</p>
        </div>
        <div class="footer">
          <p>Buenos Aires Street Art - Celebrating urban art culture</p>
        </div>
      </div>
    </body>
    </html>
    """
  end

  defp rejection_html(mural) do
    """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #333; padding: 20px; text-align: center; }
        .header h1 { margin: 0; color: #fff; }
        .content { padding: 20px; background: #f9f9f9; }
        .mural-name { font-size: 24px; font-weight: bold; color: #333; }
        .reason { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Buenos Aires Street Art</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We've reviewed your mural submission:</p>
          <p class="mural-name">#{html_escape(mural.name)}</p>
          <p>Unfortunately, we were unable to approve it at this time.</p>
          <div class="reason">
            <strong>Reason:</strong><br>
            #{html_escape(mural.rejection_reason)}
          </div>
          <p>Feel free to submit a new request addressing the feedback above.</p>
          <p>Thank you for your interest in contributing to the Buenos Aires street art community.</p>
        </div>
        <div class="footer">
          <p>Buenos Aires Street Art - Celebrating urban art culture</p>
        </div>
      </div>
    </body>
    </html>
    """
  end

  # Plain text templates

  defp approval_text(mural, message) do
    message_text = if message && message != "" do
      """

      Message from admin:
      #{message}
      """
    else
      ""
    end

    """
    Buenos Aires Street Art

    Great news!

    Your mural submission has been APPROVED and is now visible on our map!

    Mural: #{mural.name}
    Location: #{mural.formatted_address || "#{mural.province}, #{mural.neighborhood}"}
    #{message_text}
    Thank you for contributing to the Buenos Aires street art community.

    --
    Buenos Aires Street Art - Celebrating urban art culture
    """
  end

  defp rejection_text(mural) do
    """
    Buenos Aires Street Art

    Hello,

    We've reviewed your mural submission:

    Mural: #{mural.name}

    Unfortunately, we were unable to approve it at this time.

    Reason: #{mural.rejection_reason}

    Feel free to submit a new request addressing the feedback above.

    Thank you for your interest in contributing to the Buenos Aires street art community.

    --
    Buenos Aires Street Art - Celebrating urban art culture
    """
  end

  defp html_escape(nil), do: ""
  defp html_escape(text) when is_binary(text) do
    text
    |> String.replace("&", "&amp;")
    |> String.replace("<", "&lt;")
    |> String.replace(">", "&gt;")
    |> String.replace("\"", "&quot;")
  end
end
