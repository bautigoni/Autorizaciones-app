#!/bin/sh
set -e

if [ ! -f /app/data/nexoescolar.db ]; then
  echo "First boot: seeding database..."
  npm run db:seed
fi

exec npm start
