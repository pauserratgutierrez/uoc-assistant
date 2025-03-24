# mysql

FROM mysql:8.4.4

COPY my.cnf /etc/mysql/conf.d/my.cnf
RUN chmod 644 /etc/mysql/conf.d/my.cnf

COPY scripts/backup.sh /etc/mysql/backup.sh
RUN chmod +x /etc/mysql/backup.sh

COPY scripts/restore.sh /etc/mysql/restore.sh
RUN chmod +x /etc/mysql/restore.sh

COPY ./migrations/*.sql /docker-entrypoint-initdb.d/