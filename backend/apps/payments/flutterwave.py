import os
import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class FlutterwaveClient:
    def __init__(self):
        self.secret_key = getattr(settings, 'FLUTTERWAVE_SECRET_KEY', os.getenv('FLUTTERWAVE_SECRET_KEY'))
        self.public_key = getattr(settings, 'FLUTTERWAVE_PUBLIC_KEY', os.getenv('FLUTTERWAVE_PUBLIC_KEY'))
        self.base_url = "https://api.flutterwave.com/v3"
        if not self.secret_key or self.secret_key == 'dummy':
            raise ImproperlyConfigured('Flutterwave payment credentials are not configured.')

    def generate_payment_link(self, tx_ref, amount, currency, redirect_url, customer_details, customizations):
        url = f"{self.base_url}/payments"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "tx_ref": tx_ref,
            "amount": amount,
            "currency": currency,
            "redirect_url": redirect_url,
            "customer": customer_details,
            "customizations": customizations
        }
        response = requests.post(url, json=payload, headers=headers, timeout=(5, 30))
        if response.status_code == 200:
            return response.json().get('data', {}).get('link')
        else:
            response.raise_for_status()

    def verify_transaction(self, transaction_id):
        url = f"{self.base_url}/transactions/{transaction_id}/verify"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers, timeout=(5, 15))
        if response.status_code == 200:
            return response.json()
        return None
