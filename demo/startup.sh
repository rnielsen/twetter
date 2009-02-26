killall bootpd
killall lighttpd
/sbin/ifconfig en1 10.0.2.1 netmask 255.255.255.0 broadcast 10.0.2.255
cp demo/bootpd.plist /etc
cp /etc/hosts /etc/hosts.tworig
echo "10.0.2.1 twitter.com twetter.com google.com facebook.com" >> /etc/hosts
/usr/libexec/bootpd -D
lighttpd -f demo/lighttpd.conf
python demo/DNSQuery.py
killall bootpd
killall lighttpd
mv /etc/hosts.tworig /etc/hosts
