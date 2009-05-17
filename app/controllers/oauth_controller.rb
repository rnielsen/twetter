class OauthController < ApplicationController
  before_filter :authenticateUser, :only=>:authenticate

  def request_token
    token = Digest::SHA1.hexdigest "#{Time.now.to_s}#{request.headers['Authorization']}"
    render :text=>"oauth_token=#{token}&oauth_token_secret=r4i15c4mp"
  end

  def authenticate
    token = params['oauth_token']
    callback = params['oauth_callback']
    OauthRequest.new('user_id'=>@user.id, 'request_token'=>token).save!
    redirect_to "#{callback}?oauth_token=#{token}"
  end

  def access_token
    auth = request.headers['Authorization']
    if (auth)
      if (auth=~/^OAuth.*oauth_token="(.*?)"/)
        request = OauthRequest.find_by_request_token($1)
        if (request && request.user)
          request.destroy
          render :text=>"oauth_token=#{request.user.id}-#{request.user.crypted_password}&oauth_token_secret=p455w0rd&user_id=#{request.user.id}&screen_name=#{request.user.username}"
          return
        end
      end
    end
    render :text=>"FAIL"
  end

end
