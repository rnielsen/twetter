ActionController::Routing::Routes.draw do |map|
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.resource :session
  map.root :controller =>"statuses", :action => "friends_timeline"
  map.connect "/home" , :controller => "statuses" ,:action => "friends_timeline"
  map.connect "/replies", :controller => "statuses",:action => "replies" 
  map.connect "/friends", :controller => "statuses",:action => "friends"
  map.connect "/followers", :controller => "statuses",:action => "followers"
  map.connect "/search", :controller => "statuses",:action => "search"
  map.connect "/statistics", :controller => "statuses",:action => "statistics"
  map.connect "/public_timeline", :controller => "statuses",:action => "public_timeline"

  map.connect "/statuses/public_timeline.:format", :controller => "statuses", :action => "friends_timeline"
  map.connect "/status/update", :controller => "statuses", :action=> "update"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  map.connect ':controller.:format'
  map.connect ':controller/:action.:format'
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'

  map.connect ":username/:action", :controller => "user"
end
