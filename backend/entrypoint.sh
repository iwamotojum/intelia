#!/bin/bash
set -e

cd /app

rm -f tmp/pids/server.pid

bundle exec rake db:create db:migrate

exec bundle exec rails server -p 3000 -b 0.0.0.0