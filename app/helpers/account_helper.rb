module AccountHelper
    def settings_list_entry(page)
        "<li id=\"tab_#{page}\">#{settings_link(page)}</li>"
    end
    
    def settings_link(page)
        if (params[:action]==page)
            page.capitalize
        else
            "<a href=\"#{page}\" id=\"#{page}_tab\">#{page.capitalize}</a>"
        end   
    end
end
