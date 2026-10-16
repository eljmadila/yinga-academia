import logging
from decimal import Decimal, InvalidOperation
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from apps.courses.models import Course
from .models import Order, Payment
from apps.students.models import Enrollment
from .mpesa import MpesaClient
from .flutterwave import FlutterwaveClient
from .paystack import PaystackClient
from .throttles import MpesaInitiationRateThrottle

logger = logging.getLogger(__name__)

def generate_tx_ref(user_id, course_id):
    import uuid
    return f"tx_{user_id}_{course_id}_{uuid.uuid4().hex[:8]}"


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id, student=request.user)
    payment_status = Payment.objects.filter(order=order).values_list('status', flat=True).first()
    return Response({
        'order_id': str(order.id),
        'course_id': str(order.course_id),
        'status': order.status,
        'payment_status': payment_status,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def flutterwave_checkout(request):
    try:
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        course = get_object_or_404(Course, id=course_id)
        user = request.user
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        client = FlutterwaveClient()
            
        # Create Order
        order = Order.objects.create(
            student=user,
            course=course,
            amount=course.price,
            status='PENDING'
        )
        
        tx_ref = generate_tx_ref(user.id, course.id)
        
        # Determine redirect URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/student/checkout/success?order_id={order.id}&courseId={course.id}"
        
        customer_details = {
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}".strip() or user.email
        }
        customizations = {
            "title": "Yinga Academia",
            "description": f"Payment for {course.title}",
        }
        
        payment_link = client.generate_payment_link(
            tx_ref=tx_ref,
            amount=float(course.price),
            currency='XAF', # Or EUR, USD
            redirect_url=redirect_url,
            customer_details=customer_details,
            customizations=customizations
        )
        
        # Create Payment record
        payment = Payment.objects.create(
            order=order,
            payment_method='FLUTTERWAVE',
            payment_reference=tx_ref,
            amount=course.price,
            currency='XAF',
            status='PENDING'
        )
        
        return Response({'url': payment_link})
        
    except ImproperlyConfigured:
        return Response({'error': 'Payment provider is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        logger.error(f"Flutterwave checkout error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def flutterwave_webhook(request):
    try:
        import os
        # Verify the signature
        secret_hash = getattr(settings, 'FLUTTERWAVE_WEBHOOK_SECRET', os.getenv('FLUTTERWAVE_WEBHOOK_SECRET'))
        signature = request.headers.get('verif-hash')
        if not signature or (signature != secret_hash and secret_hash):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
            
        payload = request.data
        logger.info(f"Flutterwave webhook payload: {payload}")
        
        event = payload.get('event')
        data = payload.get('data', {})
        tx_ref = data.get('tx_ref')
        status_flw = data.get('status')
        transaction_id = data.get('id')
        
        if event == 'charge.completed' and status_flw == 'successful':
            try:
                payment = Payment.objects.get(payment_reference=tx_ref, payment_method='FLUTTERWAVE')
            except Payment.DoesNotExist:
                logger.error(f"Flutterwave Payment not found for tx_ref: {tx_ref}")
                return Response(status=status.HTTP_404_NOT_FOUND)
                
            # Double check with API to prevent spoofing
            client = FlutterwaveClient()
            verification = client.verify_transaction(transaction_id)
            
            if verification and verification.get('data', {}).get('status') == 'successful':
                # Valid payment
                if payment.status != 'SUCCESSFUL':
                    payment.status = 'SUCCESSFUL'
                    payment.transaction_id = str(transaction_id)
                    payment.metadata = verification
                    payment.save()
                    
                    order = payment.order
                    order.status = 'COMPLETED'
                    order.save()
                    
                    # Grant Access
                    Enrollment.objects.get_or_create(
                        student_id=order.student_id,
                        course_id=order.course_id,
                        defaults={'status': 'ACTIVE'}
                    )
                    
        return Response({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Flutterwave webhook error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([MpesaInitiationRateThrottle])
def mpesa_stk_push(request):
    try:
        course_id = request.data.get('course_id')
        phone_number = request.data.get('phone_number') # Expected in format 2547XXXXXXXX
        idempotency_key = request.data.get('idempotency_key')
        
        if not course_id or not phone_number or not idempotency_key:
            return Response(
                {'error': 'course_id, phone_number, and idempotency_key are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(idempotency_key, str) or len(idempotency_key) > 128:
            return Response({'error': 'Invalid idempotency key.'}, status=status.HTTP_400_BAD_REQUEST)
            
        course = get_object_or_404(Course, id=course_id)

        if course.price <= 0:
            return Response(
                {'error': 'Free courses should use free enrollment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        client = MpesaClient()
        backend_url = settings.BACKEND_URL
        if not backend_url.startswith('https://'):
            raise ImproperlyConfigured('BACKEND_URL must be configured with a public HTTPS origin.')
        callback_url = f"{backend_url}/api/payments/mpesa/webhook/"

        order, created = Order.objects.get_or_create(
            idempotency_key=idempotency_key,
            defaults={
                'student': request.user,
                'course': course,
                'amount': course.price,
                'status': 'PENDING',
            },
        )
        if not created:
            if order.student_id != request.user.id or order.course_id != course.id:
                return Response({'error': 'Idempotency key already used.'}, status=status.HTTP_409_CONFLICT)
            if order.status == 'FAILED':
                return Response(
                    {'error': 'This payment attempt failed. Start a new payment request.'},
                    status=status.HTTP_409_CONFLICT,
                )
            existing_payment = Payment.objects.filter(order=order).first()
            existing_metadata = (existing_payment.metadata or {}) if existing_payment else {}
            existing_push = existing_metadata.get('stk_push_response', {})
            return Response({
                'message': 'This payment request was already received.',
                'order_id': str(order.id),
                'checkout_request_id': existing_payment.transaction_id if existing_payment else None,
                'merchant_request_id': existing_push.get('MerchantRequestID'),
            }, status=status.HTTP_202_ACCEPTED)

        tx_ref = generate_tx_ref(request.user.id, course.id)
        payment = Payment.objects.create(
            order=order,
            payment_method='MPESA',
            payment_reference=tx_ref,
            amount=course.price,
            currency='KES',
            status='PENDING',
        )

        try:
            mpesa_response = client.stk_push(
                phone_number=phone_number,
                amount=course.price,
                account_reference=f"Order {order.id}",
                transaction_desc=f"Payment for {course.title}",
                callback_url=callback_url
            )
            if not mpesa_response.get('CheckoutRequestID') or not mpesa_response.get('MerchantRequestID'):
                raise RuntimeError('M-Pesa did not return checkout identifiers.')
        except Exception:
            payment.status = 'FAILED'
            payment.metadata = {'initiation_failed': True}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])
            order.status = 'FAILED'
            order.save(update_fields=['status', 'updated_at'])
            logger.warning("M-Pesa initiation failed for order %s", order.id, exc_info=True)
            return Response(
                {'error': 'Payment provider could not start this payment. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        payment.transaction_id = mpesa_response.get('CheckoutRequestID')
        payment.metadata = {'stk_push_response': mpesa_response}
        payment.save(update_fields=['transaction_id', 'metadata', 'updated_at'])
        
        return Response({
            'message': 'STK Push initiated successfully. Please check your phone to confirm.',
            'order_id': str(order.id),
            'checkout_request_id': mpesa_response.get('CheckoutRequestID'),
            'merchant_request_id': mpesa_response.get('MerchantRequestID')
        })
        
    except ImproperlyConfigured:
        return Response({'error': 'Payment provider is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        logger.error(f"M-Pesa STK Push error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mpesa_webhook(request):
    try:
        data = request.data
        body = data.get('Body', {}).get('stkCallback', {})
        merchant_request_id = body.get('MerchantRequestID')
        checkout_request_id = body.get('CheckoutRequestID')
        result_code = body.get('ResultCode')

        if not checkout_request_id or not merchant_request_id or result_code is None:
            return Response({'status': 'invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("M-Pesa callback received for checkout %s", checkout_request_id)
            
        try:
            payment = Payment.objects.get(transaction_id=checkout_request_id, payment_method='MPESA')
            order = payment.order
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for CheckoutRequestID: {checkout_request_id}")
            return Response({'status': 'not found'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status != 'PENDING':
            return Response({'status': 'success'})

        initial_response = (payment.metadata or {}).get('stk_push_response', {})
        if initial_response.get('MerchantRequestID') != merchant_request_id:
            return Response({'status': 'invalid merchant request'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = MpesaClient().query_stk_status(checkout_request_id)
        except Exception:
            logger.warning("M-Pesa status verification failed for checkout %s", checkout_request_id, exc_info=True)
            return Response({'status': 'verification unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if (
            verification.get('CheckoutRequestID') != checkout_request_id
            or str(verification.get('ResultCode')) != str(result_code)
        ):
            return Response({'status': 'payment not verified'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        callback_amount = None
        if result_code in (0, '0'):
            items = body.get('CallbackMetadata', {}).get('Item', [])
            callback_amount = next(
                (item.get('Value') for item in items if item.get('Name') == 'Amount'),
                None,
            )
            try:
                if Decimal(str(callback_amount)) != payment.amount:
                    return Response({'status': 'payment amount mismatch'}, status=status.HTTP_400_BAD_REQUEST)
            except (InvalidOperation, TypeError, ValueError):
                return Response({'status': 'invalid payment amount'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(pk=payment.pk)
            if payment.status != 'PENDING':
                return Response({'status': 'success'})

            current_metadata = payment.metadata or {}
            current_metadata['callback'] = data
            current_metadata['verification'] = verification
            payment.metadata = current_metadata

            if result_code in (0, '0'):
                payment.status = 'SUCCESSFUL'
                payment.save()

                order = payment.order
                order.status = 'COMPLETED'
                order.save()

                Enrollment.objects.get_or_create(
                    student_id=order.student_id,
                    course_id=order.course_id,
                    defaults={'status': 'ACTIVE'}
                )
            else:
                payment.status = 'FAILED'
                payment.save()

                order = payment.order
                order.status = 'FAILED'
                order.save()

        return Response({'status': 'success'})
        
    except Exception as e:
        logger.error(f"M-Pesa Webhook processing error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def paystack_initialize(request):
    try:
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        course = get_object_or_404(Course, id=course_id)
        user = request.user

        if course.price <= 0:
            return Response({'error': 'Free courses should use free enrollment.'}, status=status.HTTP_400_BAD_REQUEST)

        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        client = PaystackClient()

        # Create Order
        order = Order.objects.create(
            student=user,
            course=course,
            amount=course.price,
            status='PENDING'
        )

        import uuid
        tx_ref = f"paystack_{user.id}_{course.id}_{uuid.uuid4().hex[:10]}"

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        callback_url = f"{frontend_url}/student/checkout/success?order_id={order.id}&courseId={course.id}&reference={tx_ref}"

        # Amount in subunits (cents / kobo: price * 100)
        amount_in_subunits = int(Decimal(str(course.price)) * 100)

        metadata = {
            'order_id': str(order.id),
            'course_id': str(course.id),
            'student_id': str(user.id),
            'course_title': course.title,
        }

        init_data = client.initialize_transaction(
            email=user.email,
            amount_in_subunits=amount_in_subunits,
            reference=tx_ref,
            callback_url=callback_url,
            metadata=metadata
        )

        # Create Payment record
        Payment.objects.create(
            order=order,
            payment_method='PAYSTACK',
            payment_reference=tx_ref,
            amount=course.price,
            currency=client.currency,
            status='PENDING'
        )

        return Response({
            'authorization_url': init_data.get('authorization_url'),
            'access_code': init_data.get('access_code'),
            'reference': tx_ref,
            'order_id': str(order.id),
        })

    except ImproperlyConfigured:
        return Response({'error': 'Paystack payment provider is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        logger.error(f"Paystack initialize error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def paystack_verify(request, reference):
    try:
        payment = get_object_or_404(Payment, payment_reference=reference, payment_method='PAYSTACK')
        order = payment.order

        # Security check: order belongs to current user or staff
        if order.student_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # If already successful, return immediately
        if payment.status == 'SUCCESSFUL':
            return Response({
                'status': 'success',
                'order_id': str(order.id),
                'course_id': str(order.course_id),
                'message': 'Payment already verified successfully.'
            })

        client = PaystackClient()
        verification = client.verify_transaction(reference)

        if not verification or not verification.get('status'):
            return Response({
                'status': 'failed',
                'error': 'Verification failed from Paystack'
            }, status=status.HTTP_400_BAD_REQUEST)

        data = verification.get('data', {})
        gateway_status = data.get('status')

        if gateway_status == 'success':
            verified_amount = Decimal(str(data.get('amount', 0))) / Decimal('100')
            if verified_amount < payment.amount:
                logger.error(f"Paystack underpayment detected: expected {payment.amount}, received {verified_amount}")
                payment.status = 'FAILED'
                payment.save()
                order.status = 'FAILED'
                order.save()
                return Response({'error': 'Payment amount mismatch'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                payment.status = 'SUCCESSFUL'
                payment.transaction_id = str(data.get('id', ''))
                payment.metadata = verification
                payment.save()

                order.status = 'COMPLETED'
                order.save()

                Enrollment.objects.get_or_create(
                    student_id=order.student_id,
                    course_id=order.course_id,
                    defaults={'status': 'ACTIVE'}
                )

            return Response({
                'status': 'success',
                'order_id': str(order.id),
                'course_id': str(order.course_id),
            })
        else:
            return Response({
                'status': gateway_status or 'pending',
                'order_id': str(order.id),
                'gateway_response': data.get('gateway_response')
            })

    except Exception as e:
        logger.error(f"Paystack verify error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paystack_webhook(request):
    try:
        client = PaystackClient()
        signature = request.headers.get('x-paystack-signature')
        if not client.verify_webhook_signature(request.body, signature):
            return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)

        payload = request.data
        event = payload.get('event')
        data = payload.get('data', {})

        if event == 'charge.success':
            reference = data.get('reference')
            if not reference:
                return Response({'status': 'ignored'}, status=status.HTTP_200_OK)

            try:
                payment = Payment.objects.get(payment_reference=reference, payment_method='PAYSTACK')
            except Payment.DoesNotExist:
                logger.warning(f"Paystack payment record not found for webhook reference: {reference}")
                return Response({'status': 'not_found'}, status=status.HTTP_200_OK)

            if payment.status != 'SUCCESSFUL':
                with transaction.atomic():
                    payment.status = 'SUCCESSFUL'
                    payment.transaction_id = str(data.get('id', ''))
                    payment.metadata = payload
                    payment.save()

                    order = payment.order
                    order.status = 'COMPLETED'
                    order.save()

                    Enrollment.objects.get_or_create(
                        student_id=order.student_id,
                        course_id=order.course_id,
                        defaults={'status': 'ACTIVE'}
                    )

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Paystack webhook error: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

