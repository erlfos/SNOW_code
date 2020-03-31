#!/usr/local/bin/python
from influxdb import InfluxDBClient
import requests
import os
import sys
import json
import time

# This URL is to a REST API I created
url = 'https://myinstance.com/api/icnas/grafana_site_down/query'
headers = {"Accept":"application/json"}

with open('config.json') as json_file:
    config = json.load(json_file)
try:
    user = os.environ['SNOWUSER'] # export SNOWUSER=username_here
    pwd = os.environ['SNOWPW'] # export SNOWPW=password_here
    influxClient = InfluxDBClient(host=config["influxDB_host"], port=config["influxDB_port"], database=config["influxDB_database"])
except:
    print("Set username in environment variable $SNOWUSER and password in $SNOWPW")
    print("export SNOWUSER=<username>")
    print("export SNOWPW=<username>")
    sys.exit()

# The script will stay in this while loop and query the SNOW Site down API every 60 seconds and write the result to an InfluxDB
while True:
    line_protocol_list = []
    response = requests.post(url, auth=(user,pwd), headers=headers)
    now = time.strftime("%H:%M:%S", time.localtime())
    if response.status_code != 200:
         print(now, 'Error towards SNOW API: Status:', response.status_code, 'Headers:', response.headers, 'Error Response:',response.json())
         time.sleep(60)
         continue
    timestamp = int(time.time())
    for site in response.json()[0]['rows']:
        #print(site)
        transmissionCode = 0
        if site[5] == 'Telenor':
            transmissionCode = 10
        elif site[5] == 'GlobalConnect':
            transmissionCode = 20
        else:
            transmissionCode = 30
        line_protocol_list.append("%s,ci_status=%s,node=%s,transmission=%s,alert=%s %s=%s %s" %('sites_down',site[4],site[3],site[5],site[1],'down',transmissionCode, timestamp))
    #for line in line_protocol_list: print(line)
    #for l in line_protocol_list: print l
    try:
        if influxClient.write_points(line_protocol_list,time_precision='s',database=config["influxDB_database"],protocol='line') == True:
            print(now, "%s points written to database" %(len(line_protocol_list)))
        else:
            raise InfluxError(now,'Something went wrong while writing to the InfluxDB')
    except:
        print(sys.exc_info())
    print(now, "Waiting 60 seconds")
    time.sleep(60)
