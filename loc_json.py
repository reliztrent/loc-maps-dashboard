#!/usr/bin/python3

import sys 
import os
import getopt
import time
import json
import requests

def generate_output_folder(directory):
    if not os.path.isdir(directory):
        os.makedirs(directory)


def query(url, items=[],x=0):
    max_retries = 5
    if x < max_retries:
        params = {"fo": "json", "c": 200, "at": "results,pagination,facets"}
        request = requests.get(url, params=params)
        if (request.status_code==200) & ('json' in request.headers.get('content-type')):
            data = request.json()
            results = data['results']
            for result in results:
                filter_out = ("collection" in result.get("original_format")) \
                        or ("web page" in result.get("original_format"))
                if not filter_out:
                    items.append(result)
            # Repeat the loop on the next page, unless we're on the last page. 
            if data["pagination"]["next"] is not None: 
                next_url = data["pagination"]["next"]
                query(next_url, items)

            return items
        elif request.status_code in range(500, 505):
            x += 1
            time.sleep(10)
            query(url,items,x)
        else:
            return items
    else:
        return items

    
def main(argv):
    start_date = ''
    end_date = ''
    try:
        opts, args = getopt.getopt(argv,"hs:e:d:",["start=","end=","directory="])
    except getopt.GetoptError:
        print ('loc_json.py -s <start_date (YYYY-MM-DD)> -e <end_date (YYYY-MM-DD)> -d <directory>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print ('loc_json.py -s <start_date (YYYY-MM-DD)> -e <end_date (YYYY-MM-DD)> -d <directory>')
            sys.exit()
        elif opt in ("-s", "--start_date"):
            start_date = arg
        elif opt in ("-e", "--end_date"):
            end_date = arg
        elif opt in ("-d", "--directory"):
            directory = arg
    print ('Start date is ', start_date)
    print ('End date is ', end_date)
    url = 'https://www.loc.gov/search/?at=facets&fo=json&sb=shelf-id&sq=group:gmd.mar+AND+number_source_modified:[' + start_date + ' TO ' + end_date + ']'
    print("Query URL is: ", url)
    items = query (url,[])

    print(directory)

    generate_output_folder(directory)
    with open(directory + '/gmdmar-modified-' + end_date + '.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=4)
    

    
'''
start_date = '2020-09-11'
end_date = '2020-09-12'
'''


if __name__ == "__main__":
    main(sys.argv[1:])