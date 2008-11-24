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
end
