FROM postgres:18-alpine
COPY migration/004-customer-service.sql /migration.sql
CMD ["sh","-c","psql \"$DATABASE_URL\" -v ON_ERROR_STOP=1 -f /migration.sql && echo customer-service-migration-complete"]
