class FavouritesController < ApplicationController
  before_filter :authenticate

  def index
    @tweets = @user.favorites
    render_tweets
  end

  def create
    @tweet = Tweet.find(params[:id])
    @user.favorites << @tweet
    render :text=>"OK"
  end

  def destroy
    @tweet = Tweet.find(params[:id])
    if (@tweet)
      @user.favorites.delete(@tweet)
      render :text=>"OK"
    end
  end
      
end
