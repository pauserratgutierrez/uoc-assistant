# mysql

FROM mysql:8.4.4

COPY my.cnf /etc/mysql/conf.d/my.cnf
RUN chmod 644 /etc/mysql/conf.d/my.cnf

COPY backup.sh /etc/mysql/backup.sh
RUN chmod +x /etc/mysql/backup.sh