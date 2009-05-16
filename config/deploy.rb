set :ssh_options, { :forward_agent => true }

set :repository, "."
set :scm, :none
set :deploy_via, :copy

# This shouldn't be here - why is it not picking up the local username automagically?
#require 'etc'
set :runner, "root"
set :user, "root"
set :app_user, "twetter"
set :group, "twetter"

role :app, "172.16.104.202" #, "172.16.xxx.xxx"
role :db, "172.16.104.202", :primary => true 

set :deploy_to, "/srv/rails/twetter"

task :after_update_code, :roles => :app do
  sudo <<-CMD
    sh -c "chown -R #{app_user}:#{group} #{release_path} &&
    chmod -R g+w #{release_path}" &&
    chown -R twetter /srv/rails/twetter
  CMD
end

namespace :deploy do
  desc "Trigger a passenger restart on the next request"
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{deploy_to}/current/tmp/restart.txt"
  end
end
