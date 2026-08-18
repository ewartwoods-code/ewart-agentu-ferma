FROM postgres:18-alpine
COPY migration/farm.sql /migration/farm.sql
CMD ["sh", "-lc", "psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration/farm.sql"]
