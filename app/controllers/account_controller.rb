class AccountController < ApplicationController
  before_filter :authenticate

  def verify_credentials()
    respond_to do |format|
      format.xml { render :xml=>"<authorized>true</authorized>"}
      format.json { render :json=>{:authorized=>true} } 
    end
  end
  
  def rate_limit_status()
    respond_to do |format|
      format.xml
      format.html
      format.json {
        # Sun Nov 23 09:58:04 +0000 2008  
        render :json => {:reset_time_in_seconds=>1.hour.from_now.to_i,:remaining_hits=>100,:reset_time=>1.hour.from_now,:hourly_limit=>100}
      }
    end
  end
end
