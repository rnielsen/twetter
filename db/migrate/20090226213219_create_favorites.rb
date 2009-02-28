class CreateFavorites < ActiveRecord::Migration
  def self.up
    create_table :favorites, :id => false do |t| 
      t.column :user_id, :integer, :null => false
      t.column :tweet_id, :integer, :null => false
    end
  end

  def self.down
    drop_table :favorites
  end
end
