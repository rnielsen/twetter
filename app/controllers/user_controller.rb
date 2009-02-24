class UserController < ApplicationController

  def index
    @duser = User.find_or_create_by_username(params[:username])
    @tweets = @duser.public_tweets.find(:all,:include => :user,:limit => 20  )
  end
end
