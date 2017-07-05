#/bin/sh

cat $1 | nc $2 65500 & 
PID=$!
sleep 2
kill $PID
