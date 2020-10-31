#!/usr/bin/python3

import sys
import time
import re
from datetime import datetime
import getopt
import json
import requests
import pandas as pd

def generateOutputFolder(directory):
    if not os.path.isdir(directory):
        os.makedirs(directory)

def makeUrl(index,day):
    template = 'https://www.loc.gov/search/?all=true&fo=json&sb=shelf-id&sq=group:gmd.mar+AND+number_source_modified:[{}+TO+{}]'
    if index != 0:
        end = day.date()
        daybefore=day - pd.offsets.Day(1)
        start = daybefore.date()
        request_url = template.format(start, end)
        return request_url
    else:
        return None

def getRequest(request_url,params={'f':'json','c':'200','at':'results,facets,pagination'},timewait=10):
    time.sleep(timewait)
    i = 0
    totaltime = []
    response = requests.get(request_url,params)
    if response.status_code == 429:
        sys.exit('Too many requests. 429 status code')
    elif response.status_code != 200:
        if i < 15:
            i += 1
            totaltime.append(timewait)
            timewait += 10 
            getRequest(request_url,params,timewait)
        else:
            print('Could not get ' + request_url)
            print('{} tries over {} seconds'.format(str(i),sum(totaltime)))
            print('Last status code: ' + str(response.status_code))
            return None
    else: #if response is 200
        json = response.json()
        print('Got ' + request_url)
        return json

def makeFiles(start,end,directory):
    pattern = re.compile("^\d{4}-\d{2}-\d{2}$")
    check_dates=[start,end]
    if not all(pattern.match(date) for date in check_dates):
        sys.exit('Dates must be in the format YYYY-MM-DD. Please correct and try again.')
    datelist = pd.date_range(start, end).to_list()
    for index,day in enumerate(datelist):
        if index != 0:
            request_url = makeUrl(index,day)
            response = getRequest(request_url)
            date = str(datelist[index-1].date()).replace('-','')
            with open(directory + '/mod-gmdmar-daily-' + date + '.json', 'w') as f:
                json.dump(response, f) 

def main(argv):
    start_date = ''
    end_date = ''
    try:
        opts, args = getopt.getopt(argv,"hs:e:d:",["start=","end=","directory="])
    except getopt.GetoptError:
        print ('mod-gmdmar.py -s <start_date (YYYY-MM-DD)> -e <end_date (YYYY-MM-DD)> -d <directory>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print ('mod-gmdmar.py -s <start_date (YYYY-MM-DD)> -e <end_date (YYYY-MM-DD)> -d <directory>')
            sys.exit()
        elif opt in ("-s", "--start_date"):
            start_date = arg
        elif opt in ("-e", "--end_date"):
            end_date = arg
        elif opt in ("-d", "--directory"):
            directory = arg
    makeFiles(start_date,end_date,directory)

if __name__ == "__main__":
    main(sys.argv[1:])