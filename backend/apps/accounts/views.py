from django.contrib.auth import authenticate, get_user_model, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from apps.customers.models import Customer
from .permissions import IsAdminOrCashier
from .serializers import ChangePasswordSerializer, LoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


@method_decorator(ensure_csrf_cookie, name='dispatch')
@extend_schema(tags=['Auth'], responses={200: UserSerializer})
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


@extend_schema(tags=['Auth'], request=LoginSerializer, responses={200: UserSerializer})
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response(UserSerializer(user).data)


@extend_schema(tags=['Auth'], request=RegisterSerializer, responses={201: UserSerializer})
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
            full_name=serializer.validated_data['full_name'],
            role=User.Role.CUSTOMER,
        )
        customer = Customer.objects.create(
            user=user,
            full_name=serializer.validated_data['full_name'],
            phone=serializer.validated_data.get('phone') or None,
            email=serializer.validated_data.get('email') or None,
        )
        login(request, user)
        response_data = UserSerializer(user).data
        response_data['customer_id'] = customer.id
        return Response(response_data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Auth'], request=ChangePasswordSerializer, responses={200: dict})
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({'detail': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully'})


@extend_schema(tags=['Auth'], responses={204: None})
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['Admin - Staff Management'])
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('branch').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrCashier]
