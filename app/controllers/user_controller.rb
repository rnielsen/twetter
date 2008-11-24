class UserController < ApplicationController
  def index
    @duser = User.find_or_create_by_username(params[:username])
    if (@duser == @user)
      redirect_to :controller=>'account'
    else
      @tweets = @duser.public_tweets.find(:all,:include => :user,:limit => 20  )
    end
  end
end
