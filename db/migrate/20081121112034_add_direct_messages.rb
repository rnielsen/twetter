class AddDirectMessages < ActiveRecord::Migration
  def self.up
      change_table :tweets do |t|
        t.integer :recipient_id
        t.string :tweet_type
        t.remove :username
      end
  end
  
  def self.down
    change_table :tweets do |t|
      t.remove :recipient_id
      t.remove :tweet_type
      t.string :username
    end
  end
end
