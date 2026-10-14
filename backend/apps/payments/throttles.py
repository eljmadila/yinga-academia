from rest_framework.throttling import UserRateThrottle


class MpesaInitiationRateThrottle(UserRateThrottle):
    scope = 'mpesa_initiation'