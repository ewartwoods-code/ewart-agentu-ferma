FROM postgres:18-alpine
COPY migration/customer-ai.sql /migration/customer-ai.sql
CMD ["sh", "-lc", "psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration/customer-ai.sql"]
