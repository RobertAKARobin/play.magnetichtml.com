require "sinatra"
require "sinatra/json"
require "sinatra/reloader" if development?
require "httparty"
require "digest"
require "./env.rb" if File.exists?("env.rb")

class MHTML < Sinatra::Base

  get "/:page.html" do
    filepath = current_path_for params[:page]
    if File.exists?(filepath)
      File.read filepath
    else
      redirect "/"
    end
  end

  get "/:page?" do
    filepath = current_path_for params[:page]
    if !params[:page] || (filepath && params[:page] != "index")
      File.read current_path_for "index"
    else
      redirect "/"
    end
  end

  post "/" do
    html = params[:sitehtml]
    pass = totally_secure_password_encode params[:password]
    base = params[:sitename].gsub(/[^a-zA-Z0-9_-]/, "")
    path = current_path_for base
    completed = "create" if (!path && pass)
    completed = "update" if (path && pass && pass == password_from(path))
    return (json success: false) unless completed
    File.open("page/#{base}.#{pass}.html", "w"){|f| f.write html}
    return (json success: true, action: completed, base: base)
  end

  private
  def totally_secure_password_encode string
    return false if (!string || string.strip.empty?)
    Digest::SHA256.hexdigest(string + ENV["salt"])
  end

  def password_from filename
    chunks = filename.split(".")
    return false if chunks.size < 3
    return chunks[1]
  end

  def current_path_for filebase
    return false if (!filebase || filebase.strip.empty?)
    return Dir.glob("page/#{filebase}\.*").first
  end

end
