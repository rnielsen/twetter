class AccountController < ApplicationController
  before_filter :authenticate

  def index
    @tweets = @user.public_tweets.find(:all,:include => :user,:limit => 20  )
  end
  
  def end_session
    reset_session
  end
  
  def update_profile_image
    upload_image = "#{RAILS_ROOT}/tmp/upload/#{@user.id}" 
    File.open(upload_image, "wb") { |f| f.write(params[:image].read) }
    cmd = "convert -size 100x100 #{upload_image} #{RAILS_ROOT}/public/images/profile/#{@user.username}.png"
    puts cmd 
    puts `#{cmd}`
    redirect_to :action=>'index'
  end
  
  def verify_credentials
    respond_to do |format|
      format.xml { render :xml=>"<authorized>true</authorized>"}
      format.json { render :json=>{:authorized=>true} } 
    end
  end
  
  def rate_limit_status
    rate_limit = {:reset_time_in_seconds=>1.hour.from_now.to_i,:remaining_hits=>100,:reset_time=>date_formatted(1.hour.from_now),:hourly_limit=>100}
    respond_to do |format|
      format.xml { render :xml => rate_limit.to_xml(:skip_types=>true)}
      format.json { render :json => rate_limit }
    end
  end
  
  private
  
  def date_formatted(date)
    date.gmtime.strftime("%a %b %d %H:%M:%S +0000 %Y")
  end
  
end
