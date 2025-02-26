# Backup directory structure
DATE=$(date +"%d-%m-%Y")
TIME=$(date +"%H-%M-%S")
BACKUP_DIR="/backups/$DATE"
mkdir -p "$BACKUP_DIR" # Create directory if it doesn't exist
BACKUP_FILE="$BACKUP_DIR/$MYSQL_DATABASE-$TIME.sql"

# Run the MySQL dump command
echo "Starting backup for $MYSQL_DATABASE..."
mysqldump -h $MYSQL_HOST -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
else
  echo "Backup failed."
fi