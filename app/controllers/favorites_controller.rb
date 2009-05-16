class FavoritesController < ApplicationController
  before_filter :authenticateUser

  def index
    @tweets = @user.favorite_tweets
    render_tweets
  end

  def create
    @tweet = Tweet.find(params[:id])
    @user.favorite_tweets << @tweet
    render :text=>"OK"
  end

  def destroy
    @tweet = Tweet.find(params[:id])
    if (@tweet)
      @user.favorite_tweets.delete(@tweet)
      render :text=>"OK"
    end
  end
end
