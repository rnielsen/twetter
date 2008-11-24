ActionController::Routing::Routes.draw do |map|
  map.root :controller => "statuses" ,:action => "friends_timeline"
  map.connect "/home" , :controller => "statuses" ,:action => "friends_timeline"
  map.connect "/statuses/public_timeline.:format", :controller => "statuses", :action => "friends_timeline"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  map.connect ':controller.:format'
  map.connect ':controller/:action.:format'
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'

  map.connect ":username", :controller => "user", :action => "index"

end
