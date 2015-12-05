require "sinatra"
require "sinatra/reloader"
require "httparty"

get "/" do
  File.read("public/html/index.html")
end

post "/" do

end
