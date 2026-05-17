from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChangePasswordView, LoginView, LogoutView, MeView, RegisterView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('register/', RegisterView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', MeView.as_view()),
    path('', include(router.urls)),
]
