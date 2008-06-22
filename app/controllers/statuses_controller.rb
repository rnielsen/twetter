class StatusesController < ApplicationController
  before_filter :authenticate, :except => [:show]
  @user = ""
  def replies
    @tweets = Tweet.find(:all,:order => "tweets.created_at DESC", :conditions => "tweets.tweet like '@#{@user}%'",:include => :user,:limit => 25)
    respond_to do |format|
      format.xml
    end
  end
  def friends_timeline
    limit = params[:all] ? 100000000000 : 25
    @tweets = Tweet.find(:all,:order => "tweets.created_at DESC",:conditions => "tweets.tweet not like '@#{@user}%'",:include => :user,:limit => limit)
    respond_to do |format|
      format.xml
      format.html
      format.atom
    end
  end
  def show
    @tweet = Tweet.find(params[:id])
    respond_to do |format|
      format.xml
      format.html
      format.js {
        render :json => @tweet.to_json, :callback => params[:callback]
      }
    end
  end
  def update
    u = User.find_or_create_by_username(@user)
    @tweet = Tweet.create({:tweet => params[:status], :user => u, :source => params[:source]})
    respond_to do |format|
      format.xml
    end    
  end
  private
  def verify_authenticity_token
    return true
  end
  def authenticate
    if user = authenticate_with_http_basic { |u, p| u if !u.to_s.strip.blank?  }
      logger.debug user
      @user = user
    else
      request_http_basic_authentication
    end
  end
end
