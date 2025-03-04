#!/bin/sh
set -e

# Backup directory structure
DATE=$(date +"%d-%m-%Y")
TIME=$(date +"%H-%M-%S")
BACKUP_DIR="/backups/$DATE"
BACKUP_FILE="$BACKUP_DIR/$MYSQL_DATABASE-$TIME.sql.gz"

# Ensure dir exists
mkdir -p "$BACKUP_DIR"

# Run the MySQL dump command
echo "Starting backup for $MYSQL_DATABASE..."
mysqldump -h localhost -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --quick $MYSQL_DATABASE | gzip > "$BACKUP_FILE"

# Check to see if the backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
else
  echo "Backup failed."
  exit 1
fi