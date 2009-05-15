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

    has_many :favorites
    has_many :favorite_tweets, :source=>:tweet, :through=>:favorites, :order => "created_at DESC"

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
     u = fetch(login)
     if (!u.crypted_password)
         u.password = password
         u.save!
         return u
     end
     u.authenticated?(password) ? u : nil
  end

  def self.fetch(username)
    find_or_create_by_username(username.downcase)
  end
  
  def password_required?
      false
  end


  def username=(value)
    write_attribute :username, (value ? value.downcase : nil)
  end

  def self.upload_image(username, image)
    upload_image = "#{RAILS_ROOT}/tmp/upload/#{username}"
    File.open(upload_image, "wb") { |f| f.write(image) }
    cmd = "convert -resize 200x200 #{upload_image} #{RAILS_ROOT}/public/images/profile/full/#{username}.png"
    logger.info cmd
    `#{cmd}`
    cmd = "convert -resize 48x48! #{upload_image} #{RAILS_ROOT}/public/images/profile/#{username}.png"
    logger.info cmd
    `#{cmd}`
  end

  def web_profile_url(type = :small)
    path = "/images/profile#{type == :full ? "/full" : ""}/#{self.username}.png"
    if (!File.exists?("#{RAILS_ROOT}/public#{path}"))
      path = "/images/default_profile#{type == :full ? "_bigger" : ""}.png"
    end
    number = File.mtime("#{RAILS_ROOT}/public#{path}").to_i.to_s rescue ""
    "#{path}?#{number}"
  end

  def profile_url
    "http://twitter.com#{self.web_profile_url}"
  end

  def to_map(include_latest=false)
    ret = {:id=>id, :name=>name, :screen_name=>username, :profile_image_url=> profile_url,
     :location=>location, :description=>bio, :url=>'', :protected=>false, :followers_count=>followers_count}
    if (include_latest)
      last_tweet = public_tweets.find(:first)
      ret[:status] = last_tweet.to_map(false) if (!last_tweet.nil?)
    end
    ret
  end

  def name
      n = read_attribute(:name)
      n = self.username if (n.blank?)
      n
  end

  def latest_tweet
      public_tweets[0]
  end

  def friends_count
      User.count - 1
  end

  def followers_count
      User.count - 1
  end

  def friends
      User.find(:all, :conditions => ["id != ?", self.id])
  end

  def followers
    friends
  end


  private

   def self.md5(pass)
     Digest::MD5.hexdigest("--Twetter--#{pass}")
   end


  protected
    


end
