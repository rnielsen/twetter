require 'net/http'

namespace :utils do
  task(:download_images) do
      twitterers = ['rob_nielsen', 'pat', 'radarlistener', 'i2w', 'ryan_allen', 'notahat', 'glenmaddern',
              'nigel_rausch', 'chendo', 'toolmantim', 'ben_h', 'bjeanes', 'npart', 'gegster', 'aussiegeek', 'drnic',
              'paul_okeeffe','lachie','mattallen','benj72','lachlanhardy','keithpitty','robertpostill','lindsayevans',
              'dylanfm','philoye','yob_au','nullobject','gnoll110','snapperwolf','benschwarz','andrewjgrimm']
      Net::HTTP.start('twitter.com') {|http|
        twitterers.each do |twitterer|
          if (!FileTest.exist?("#{RAILS_ROOT}/public/images/profile/#{twitterer}.png"))
            req = Net::HTTP::Get.new("/account/profile_image/#{twitterer}.json")
            req.basic_auth ENV['USER'], ENV['PASS']
            response = http.request(req)
            if (response.body =~ /src="(.*?)"/)
              image_url = $1
              img = Net::HTTP.get(URI.parse(image_url))
              upload_image = "#{RAILS_ROOT}/tmp/upload/#{twitterer}"
              File.open(upload_image, "wb") { |f| f.write(img) }
              cmd = "convert -size 200x200 #{upload_image} #{RAILS_ROOT}/public/images/profile/#{twitterer}.png"
              puts cmd
              puts `#{cmd}`
            end
           end
        end
      }
  end
end