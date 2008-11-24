class User < ActiveRecord::Base
  has_many :tweets
  has_many :replies, :class_name=>'Tweet', :foreign_key=>'recipient_id', :conditions=>"tweet_type='reply'", :order => "tweets.created_at DESC"
  has_many :direct_messages_received, :class_name=>'Tweet', :foreign_key=>'recipient_id', :conditions=>"tweet_type='direct'", :order => "tweets.created_at DESC"
  has_many :direct_messages_sent, :class_name=>'Tweet', :conditions=>"tweet_type='direct'", :order => "tweets.created_at DESC"
  has_many :public_tweets, :class_name=>'Tweet', :conditions=>"tweet_type!='direct'", :order=>"tweets.created_at DESC"

  def profile_url
    File.exists?("#{RAILS_ROOT}/public/images/profile/#{self.username}.png") ? 
      "http://twitter.com/images/profile/#{self.username}.png" :
      "http://twitter.com/images/rails.png"
  end
  
  def to_map(include_latest=false)
    ret = {:id=>id, :name=>username, :screen_name=>username, :profile_image_url=> profile_url,
     :location=>'Rails Camp', :description=>'', :url=>'', :protected=>false, :followers_count=>User.count}
    if (include_latest)
      last_tweet = public_tweets.find(:first)
      ret[:status] = last_tweet.to_map(false) if (!last_tweet.nil?)
    end
    ret
  end
  
end
