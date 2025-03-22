import requests
import json

url = 'https://us-central1-simplixgymrewards.cloudfunctions.net/getDisplayToken'
data = {
    'displayId': 'test-display-1',
    'securityKey': 'simplix-display-test-display-1'
}
headers = {
    'Content-Type': 'application/json'
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f'Status Code: {response.status_code}')
    print('Response Headers:')
    for header, value in response.headers.items():
        print(f'{header}: {value}')
    print('\nResponse Body:')
    print(json.dumps(response.json(), indent=2) if response.text else 'No response body')
except Exception as e:
    print(f'Error: {str(e)}') 