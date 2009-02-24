module StatusesHelper
    def link_users(tweet)
        html_escape(tweet).gsub(/@(\S+)/, '@<a href="/\1"/>\1</a>')    
    end
end
