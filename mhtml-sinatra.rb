require "sinatra"
require "sinatra/reloader"
require "httparty"

get "/:page.html" do
  filepath = path_to params[:page]
  if !filepath
    redirect "/"
  else
    File.read filepath
  end
end

get "/:page?" do
  filepath = path_to params[:page]
  if !params[:page] || (filepath && params[:page] != "index")
    File.read path_to "index"
  else
    redirect "/"
  end
end

post "/" do

end

private
def path_to filename
  return nil if !filename
  path = "page/#{filename}.html"
  return false if !File.exists?(path)
  return path
end
