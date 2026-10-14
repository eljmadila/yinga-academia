import os
import requests
import base64
from datetime import datetime
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class MpesaClient:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.environment = settings.MPESA_ENVIRONMENT

        if any(not value or value == 'dummy' for value in (
            self.consumer_key,
            self.consumer_secret,
            self.shortcode,
            self.passkey,
        )):
            raise ImproperlyConfigured('M-Pesa payment credentials are not configured.')
        
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'

    def get_access_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        auth = requests.auth.HTTPBasicAuth(self.consumer_key, self.consumer_secret)
        response = requests.get(url, auth=auth, timeout=(5, 10))
        
        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            raise Exception(f"Failed to get M-Pesa access token. Status {response.status_code}: {response.text}")

    def generate_password(self):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = self.shortcode + self.passkey + timestamp
        encoded_string = base64.b64encode(data_to_encode.encode('utf-8')).decode('utf-8')
        return encoded_string, timestamp

    def query_stk_status(self, checkout_request_id):
        access_token = self.get_access_token()
        password, timestamp = self.generate_password()
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id,
        }
        response = requests.post(url, json=payload, headers=headers, timeout=(5, 15))
        response.raise_for_status()
        return response.json()

    def stk_push(self, phone_number, amount, account_reference, transaction_desc, callback_url):
        access_token = self.get_access_token()
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        password, timestamp = self.generate_password()
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", # Or CustomerBuyGoodsOnline
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=(5, 30))
        
        if response.status_code == 200:
            return response.json()
        else:
            # Handle error appropriately in production
            response.raise_for_status()
