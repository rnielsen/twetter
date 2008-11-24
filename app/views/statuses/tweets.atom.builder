atom_feed do |feed|
  feed.title("Tweets!")
  feed.updated((@tweets.first.created_at))

  for tweet in @tweets
    feed.entry(tweet) do |entry|
      entry.title(tweet.tweet)
      entry.content(tweet.tweet, :type => 'text')
    end
  end
end