module StatusesHelper
    # Take a Status update and generate link elements
    def create_links(tweet)
      # NOTE: URLs before Users, otherwise we'll double escape the URLs
      link_users(link_urls(html_escape(tweet)))
    end

    # Turn @username into a link element
    def link_users(tweet)
      tweet.gsub(/@(\S+)/, '@<a href="/\1">\1</a>')    
    end
    
    # Turn URLs into a link
    def link_urls(tweet)
      tweet.gsub(/([A-Z]+:\/\/[^\s]+)/i, '<a href="\1">\1</a>')
    end
end
