class CreateTweets < ActiveRecord::Migration
  def self.up
    create_table :tweets do |t|
      t.string :tweet,:source, :tweet_type
      t.integer :recipient_id, :user_id
      t.timestamps
    end
  end

  def self.down
    drop_table :tweets
  end
end
