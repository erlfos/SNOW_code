FROM python:3
ADD files/* /

RUN pip install influxdb requests
# Copy timezone to get correct time in container
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime

CMD [ "python", "./snow_get_sites.py" ]
