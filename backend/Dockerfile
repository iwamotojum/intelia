FROM ruby:3.3-alpine

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  tzdata \
  bash \
  git \
  curl \
  yaml-dev

WORKDIR /app

COPY Gemfile* ./
RUN bundle install --jobs 4 --retry 3

COPY . .

RUN mkdir -p tmp/pids

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]