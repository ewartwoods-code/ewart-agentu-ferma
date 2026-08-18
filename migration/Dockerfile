FROM postgres:18-alpine
COPY migration/farm.sql /migration/farm.sql
COPY migration/002-identities.sql /migration/002-identities.sql
CMD ["sh", "-lc", "psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration/farm.sql && psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration/002-identities.sql"]
