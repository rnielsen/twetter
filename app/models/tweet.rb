class Tweet < ActiveRecord::Base
  belongs_to :user
  belongs_to :recipient, :class_name => "User"
    
  def created_at_formatted
    self.created_at.gmtime.strftime("%a %b %d %H:%M:%S +0000 %Y")
  end
  
  def to_map(include_user=true)
    if (tweet_type == 'direct')
      ret = {:id=>id, 
       :sender_id=>user_id, 
       :text=>tweet, 
       :recipient_id=>recipient_id, 
       :created_at=>created_at_formatted, 
       :sender_screen_name=>user.username, 
       :recipient_screen_name=>recipient.username,
       :sender=>user.to_map(),
       :recipient=>recipient.to_map()}
    else
      ret = {:truncated=>false,
       :favorited=>false,
       :in_reply_to_status_id=>nil,
       :created_at=> created_at_formatted, #Sun Nov 23 09:19:13 +0000 2008"
       :in_reply_to_user_id=>(recipient_id ? recipient_id : nil),
       :id=>id,
       :source=>source,
       :text=>tweet}
       ret[:user] = user.to_map if include_user
     end
     ret
  end

  def self.top_ten_updaters
    find_by_sql(<<-EOF)
      SELECT count(tweets.tweet) AS updates, users.username AS name
      FROM tweets
      INNER JOIN users ON tweets.user_id = users.id
      WHERE tweets.tweet_type != 'direct'
      GROUP BY user_id ORDER BY updates DESC LIMIT 10
    EOF
  end

  def self.updates_per_hour
    hours = {}
    all(:conditions => "tweet_type != 'direct'").each do |tweet|
      hours[tweet.created_at.hour] ||= 1
      hours[tweet.created_at.hour] += 1
    end
    hours
  end

end
