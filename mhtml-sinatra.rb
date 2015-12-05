require "sinatra"
require "sinatra/reloader"
require "httparty"

get "/:page.json" do
  "json"
end

get "/:page?" do
  File.read("public/html/index.html")
end

post "/" do

end
