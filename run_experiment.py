import requests

URLS = []
for i in range(100):
    URLS.append("http://localhost:8080/scraper-job?url=www.webscraper.io/test-sites")

def make_request(url):
    return requests.get(url)


def execute_program():
     list(map(make_request, URLS))
     return "Done"


import time
start_time = time.time()
execute_program()
print("--- %s seconds ---" % (time.time() - start_time))
