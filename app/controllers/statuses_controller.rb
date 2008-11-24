class StatusesController < ApplicationController
  before_filter :authenticate, :except => [:show]
  def replies
    @tweets = @user.replies.find(:all, :include => :user,:limit => 25)
    render_tweets
  end
    
  def friends_timeline
    limit = params[:all] ? 100000000000 : 25
    @tweets = Tweet.find(:all,:order => "tweets.created_at DESC",:conditions => "tweets.tweet_type!='direct'",:include => :user,:limit => limit)
    render_tweets
  end

  def user_timeline
    limit = params[:all] ? 100000000000 : 25
    @tweets = @user.tweets.find(:all,:order => "tweets.created_at DESC",:conditions => "tweets.tweet_type!='direct'",:include => :user,:limit => limit)
    render_tweets
  end
  
  def followers
    @users=User.find(:all)
    render_users
  end
  
  def friends
    followers
  end
  
  def show
    @tweet = Tweet.find(params[:id])
    render_tweet
  end
  
  def update
    tweet = params[:status]
    type='tweet'
    if (tweet=~/^d (\S+) (.*)$/m)
      type='direct'
      recipient_name = $1
      tweet = $2
      recipient = User.find_or_create_by_username(recipient_name)
    elsif (tweet=~/^@(\S+) /)
      type="reply"
      recipient_name = $1
      recipient = User.find_or_create_by_username(recipient_name)
    end
      
    @tweet = Tweet.create({:tweet => tweet, :user => @user, :recipient => recipient, :tweet_type => type, :source => params[:source]})
    render_tweet
        
  end
end
