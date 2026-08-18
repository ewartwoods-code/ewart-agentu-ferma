FROM postgres:18-alpine
COPY migration/003-compat.sql /migration/003-compat.sql
CMD ["sh", "-lc", "psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration/003-compat.sql"]
