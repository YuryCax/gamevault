#!/bin/bash
TIMESTAMP=$(date +%F_%H-%M-%S)
BACKUP_DIR="/backups"
DB_NAME="gamevault"
MONGO_URI="mongodb://localhost:27017"

mkdir -p $BACKUP_DIR
mongodump --uri=$MONGO_URI --db=$DB_NAME --out=$BACKUP_DIR/backup_$TIMESTAMP
tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $BACKUP_DIR backup_$TIMESTAMP
rm -rf $BACKUP_DIR/backup_$TIMESTAMP

echo "Backup completed: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"