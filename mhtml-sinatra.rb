require "sinatra"
require "sinatra/reloader"
require "httparty"

get "/:page?.?:format?" do
  filepath = path_to params[:page]
  if !params[:page]
    File.read path_to "index"
  elsif filepath && params[:page] != "index"
    File.read filepath
  else
    redirect "/"
  end
end

post "/" do

end

private
def path_to filename
  return nil if !filename
  path = "public/page/#{filename}.html"
  return false if !File.exists?(path)
  return path
end
