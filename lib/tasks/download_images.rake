require 'net/http'

namespace :utils do
  task(:download_images => :environment) do
      twitterers = [
              # Railscamp
              'rob_nielsen', 'pat', 'radarlistener', 'i2w', 'ryan_allen', 'notahat', 'glenmaddern',
              'nigel_rausch', 'chendo', 'toolmantim', 'ben_h', 'bjeanes', 'nkpart', 'gegster', 'aussiegeek', 'drnic',
              'paul_okeeffe','lachie','mattallen','benj72','lachlanhardy','keithpitty','robertpostill','lindsayevans',
              'dylanfm','philoye','yob_au','nullobject','gnoll110','snapperwolf','benschwarz','andrewjgrimm',

              # Barcamp GC
              'barcampgc', 'spidie', 'Pixieguts', 'gmccane', 'sdiddy', 'aussietechhead', 'bmn', 'mrees',
              'amuir_netecol','jms_','DoctorWkt','SaschaV', 'nikokot', 'deswalsh'
      ]
      Net::HTTP.start('twitter.com') {|http|
        twitterers.each do |twitterer|
          puts "#{twitterer}"
          if (!FileTest.exist?("#{RAILS_ROOT}/public/images/profile/#{twitterer}.png"))
            puts "fetching user.."
            req = Net::HTTP::Get.new("/account/profile_image/#{twitterer}.json")
            req.basic_auth ENV['USER'], ENV['PASS']
            response = http.request(req)
            if (response.body =~ /src="(.*?)"/)
              puts "saving image.."
              image_url = $1
              img = Net::HTTP.get(URI.parse(image_url))
              User.upload_image(twitterer, img)
            else
              puts response.body
            end
           end
        end
      }
  end
end