import os
import hmac
import hashlib
import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class PaystackClient:
    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', os.getenv('PAYSTACK_SECRET_KEY'))
        self.public_key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', os.getenv('PAYSTACK_PUBLIC_KEY'))
        self.currency = getattr(settings, 'PAYSTACK_CURRENCY', os.getenv('PAYSTACK_CURRENCY', 'KES'))
        self.base_url = "https://api.paystack.co"

        if not self.secret_key or self.secret_key == 'dummy':
            raise ImproperlyConfigured('Paystack payment credentials are not configured.')

    def initialize_transaction(self, email, amount_in_subunits, reference, callback_url, metadata=None):
        """
        Initializes a Paystack transaction and returns authorization URL.
        amount_in_subunits: amount in cents/kobo (e.g., 50.00 KES -> 5000)
        """
        url = f"{self.base_url}/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "amount": int(amount_in_subunits),
            "currency": self.currency,
            "reference": reference,
            "callback_url": callback_url,
        }
        if metadata:
            payload["metadata"] = metadata

        response = requests.post(url, json=payload, headers=headers, timeout=(5, 30))
        if response.status_code == 200:
            data = response.json()
            if data.get("status"):
                return data.get("data", {})
            raise Exception(data.get("message", "Paystack initialization failed"))
        else:
            response.raise_for_status()

    def verify_transaction(self, reference):
        """
        Verifies a Paystack transaction using the transaction reference.
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers, timeout=(5, 20))
        if response.status_code == 200:
            return response.json()
        return None

    def verify_webhook_signature(self, payload_bytes, signature_header):
        """
        Validates HMAC SHA512 signature sent in x-paystack-signature header.
        """
        if not signature_header or not self.secret_key:
            return False
        computed = hmac.new(
            self.secret_key.encode('utf-8'),
            payload_bytes,
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(computed, signature_header)
