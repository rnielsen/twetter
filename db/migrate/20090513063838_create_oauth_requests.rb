class CreateOauthRequests < ActiveRecord::Migration
  def self.up
    create_table :oauth_requests do |t|
      t.integer :user_id
      t.string :request_token

      t.timestamps
    end
  end

  def self.down
    drop_table :oauth_requests
  end
end
