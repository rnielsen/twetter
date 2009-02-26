class StatusesController < ApplicationController
  before_filter :authenticate, :except => [:show]

  def replies
    @tweets = @user.replies.find(:all, :include => :user,:limit => 25)
    render_tweets
  end

  def public_timeline
    friends_timeline
  end

  def friends_timeline
    puts "request=#{@user}"
    limit = params[:all] ? 100000000000 : 25
    @tweets = Tweet.find(:all,:order => "tweets.created_at DESC",:conditions => "tweets.tweet_type!='direct'",:include => :user,:limit => limit)
    render_tweets
  end

  def user_timeline
    limit = params[:all] ? 100000000000 : 25
    @tweets = @user.public_tweets.find(:all,:include => :user,:limit => limit)
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
      recipient = User.fetch(recipient_name)
    elsif (tweet=~/^@(\S+) /)
      type="reply"
      recipient_name = $1
      recipient = User.fetch(recipient_name)
    end
      
    @tweet = Tweet.create({:tweet => tweet, :user => @user, :recipient => recipient, :tweet_type => type, :source => params[:source] || 'web'})
    if (params['twttr'])
        latest_status = render_to_string :partial => "latest", :object=> @tweet
        ret = {"status_count"=>@user.public_tweets.count, "latest_status"=> latest_status,"text"=>tweet}
        ret["status_tr"] = render_to_string :partial => "tweet", :object=> @tweet, :locals=>{:type=>'friends_update'}
        render :json => ret
    else
        render_tweet
    end
  end
end
