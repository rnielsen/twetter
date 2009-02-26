class UserController < ApplicationController

  def index
    @duser = User.fetch(params[:username])
    @tweets = @duser.public_tweets.find(:all,:include => :user,:limit => 20  )
  end
end
