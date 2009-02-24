require 'digest/sha1'

class User < ActiveRecord::Base
  include Authentication
  include Authentication::ByPassword
  include Authentication::ByCookieToken

  has_many :tweets
    has_many :replies, :class_name=>'Tweet', :foreign_key=>'recipient_id', :conditions=>"tweet_type='reply'", :order => "tweets.created_at DESC"
    has_many :direct_messages_received, :class_name=>'Tweet', :foreign_key=>'recipient_id', :conditions=>"tweet_type='direct'", :order => "tweets.created_at DESC"
    has_many :direct_messages_sent, :class_name=>'Tweet', :conditions=>"tweet_type='direct'", :order => "tweets.created_at DESC"
    has_many :public_tweets, :class_name=>'Tweet', :conditions=>"tweet_type!='direct'", :order=>"tweets.created_at DESC"

  validates_presence_of     :username
  validates_length_of       :username,    :within => 3..40
  validates_uniqueness_of   :username
  validates_format_of       :username,    :with => Authentication.login_regex, :message => Authentication.bad_login_message

  validates_format_of       :name,     :with => Authentication.name_regex,  :message => Authentication.bad_name_message, :allow_nil => true
  validates_length_of       :name,     :maximum => 100


  # HACK HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :username, :name, :password, :password_confirmation, :bio, :location



  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.  
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
     u = find_or_create_by_username(login)
     if (!u.crypted_password)
         u.password = password
         u.save!
         return u
     end
     u.authenticated?(password) ? u : nil
  end

  def password_required?
      false
  end


  def username=(value)
    write_attribute :username, (value ? value.downcase : nil)
  end

  def web_profile_url
    file = "#{RAILS_ROOT}/public/images/profile/#{self.username}.png"
    if (File.exists?(file))
      number = File.mtime(file).to_i.to_s rescue ""
      "/images/profile/#{self.username}.png?#{number}"
    else
      "/images/default_profile.png"
    end
  end

  def profile_url
    "http://twitter.com#{self.web_profile_url}"
  end

  def to_map(include_latest=false)
    ret = {:id=>id, :name=>name, :screen_name=>username, :profile_image_url=> profile_url,
     :location=>location, :description=>bio, :url=>'', :protected=>false, :followers_count=>follower_count}
    if (include_latest)
      last_tweet = public_tweets.find(:first)
      ret[:status] = last_tweet.to_map(false) if (!last_tweet.nil?)
    end
    ret
  end

  def name
      read_attribute(:name) || self.username
  end

  def latest_tweet
      public_tweets[0]
  end

  def following_count
      User.count - 1
  end

  def follower_count
      User.count - 1
  end

  def friends
      User.find(:all, :conditions => ["id != ?", self.id])
  end


  private

   def self.md5(pass)
     Digest::MD5.hexdigest("--Twetter--#{pass}")
   end


  protected
    


end
