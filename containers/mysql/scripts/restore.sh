#!/bin/sh
set -e

# Check if a file path is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <path-to-backup-file>"
  echo "Example: $0 /backups/01-01-2025/database-14-30-00.sql.gz"
  exit 1
fi

BACKUP_FILE=$1

# Check if the file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Starting restore of $BACKUP_FILE to $MYSQL_DATABASE..."

# Determine if the file is compressed (gz) or plain SQL
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | mysql -h localhost -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"
else
  mysql -h localhost -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$BACKUP_FILE"
fi

# Check if the restore was successful
if [ $? -eq 0 ]; then
  echo "Restore completed successfully from: $BACKUP_FILE"
else
  echo "Restore failed."
  exit 1
fi