from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    url(r'^$', auth_views.login, name="login"),
    url(r'^home/$', views.home, name="home"),
    url(r'^register/$', views.register, name="register"),
    url(r'^register/success/$', views.register_success, name="reg_success"),
    url(r'^accounts/login/$', auth_views.login, name="accounts_login"),
    url(r'^logout/$', views.logout_page, name="logout")
]
