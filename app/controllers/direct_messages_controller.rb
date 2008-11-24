class DirectMessagesController < ApplicationController
  before_filter :authenticate

  def index
    @tweets = @user.direct_messages_received.find(:all, :include => :user,:limit => 25)
    render_tweets('direct_messages')
  end
  
  def sent
    @tweets = @user.direct_messages_sent.find(:all, :include => :user,:limit => 25)
    render_tweets('direct_messages')
  end    
  
  def new
    tweet = params[:text]
    type='direct'
    recipient = User.find_or_create_by_username(params[:user])
    @tweet = Tweet.create({:tweet => tweet, :user => @user, :recipient => recipient, :tweet_type => type, :source => params[:source]})
    render_tweet        
  end
end
