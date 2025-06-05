#!/bin/bash

# Конфигурация
S3_BUCKET="gamevault-backups"
BACKUP_FILE="mongodb-backup-latest.tar.gz"
RESTORE_DIR="/tmp/restore"
MONGODB_HOST="mongodb"
MONGODB_PORT="27017"
MONGODB_USER="admin"
MONGODB_PASS="password"

# Создание директории для восстановления
mkdir -p $RESTORE_DIR

# Загрузка последней резервной копии из S3
echo "Downloading backup from S3..."
aws s3 cp s3://$S3_BUCKET/$BACKUP_FILE $RESTORE_DIR/$BACKUP_FILE

# Распаковка архива
echo "Extracting backup..."
tar -xzf $RESTORE_DIR/$BACKUP_FILE -C $RESTORE_DIR

# Восстановление базы данных
echo "Restoring MongoDB..."
mongorestore --host $MONGODB_HOST --port $MONGODB_PORT --username $MONGODB_USER --password $MONGODB_PASS --drop $RESTORE_DIR/dump

# Очистка
echo "Cleaning up..."
rm -rf $RESTORE_DIR

echo "Restore completed successfully!"