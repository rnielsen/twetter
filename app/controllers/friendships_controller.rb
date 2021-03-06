class FriendshipsController < ApplicationController
  before_filter :authenticateUser

  def exists
    respond_to do |format|
      format.xml { render :xml=>"<friends>true</friends>"}
      format.json { render :json=>true } 
    end
  end
end
