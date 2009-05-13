class AccountController < ApplicationController
  before_filter :authenticateUser, :except=>[:front, :login, :end_session]

  def index
    @tweets = @user.public_tweets.find(:all, :include => :user, :limit => 20  )
  end

  def end_session
    reset_session
    redirect_to :action=>'front'
  end

  def profile_image
    @duser = User.fetch(params[:id])
  end

  def update_profile_image
    upload_image(params[:image])
    redirect_to :action=>'index'
  end

  def verify_credentials
    render_user
  end

  def rate_limit_status
    rate_limit = {:reset_time_in_seconds=>1.hour.from_now.to_i, :remaining_hits=>100, :reset_time=>date_formatted(1.hour.from_now), :hourly_limit=>100}
    respond_to do |format|
      format.xml { render :xml => rate_limit.to_xml(:skip_types=>true)}
      format.json { render :json => rate_limit }
    end
  end

  def settings
    if (request.post?)
      if (@user.update_attributes(params[:user]))
        flash[:notice] = 'User attributes updated'
      end
    end
  end

  def picture
    if (request.post?)
      User.upload_image(@user.username, params[:profile_image][:uploaded_data].read)
    end
  end

  private

  def date_formatted(date)
    date.gmtime.strftime("%a %b %d %H:%M:%S +0000 %Y")
  end

  def upload_image(image)
    upload_image = "#{RAILS_ROOT}/tmp/upload/#{@user.username}"
    File.open(upload_image, "wb") { |f| f.write(image.read) }
    cmd = "convert -size 200x200 #{upload_image} #{RAILS_ROOT}/public/images/profile/#{@user.username}.png"
    puts cmd
    puts `#{cmd}`
  end
end
