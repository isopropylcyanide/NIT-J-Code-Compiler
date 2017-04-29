from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^home$', views.home, name='home'),
    url(r'^execute$', views.executeCode, name='execute'),
    url(r'^saveFile$', views.saveFile, name='save_file'),
    url(r'^refreshDirectory$', views.refreshDirectory, name='refreshDirect'),
    url(r'^viewfilecontents$', views.viewfilecontents, name='viewfileconts'),
    url(r'^deleteRemoteDir$', views.deleteRemoteDir, name='delRemoteDir'),
    url(r'^renameRemoteFile$', views.renameRemoteFile, name='renameRemote'),
    url(r'^makeRemoteDirectory$', views.makeRemoteDirectory, name='mkremdir'),
    url(r'^createWettyTerm$', views.createWettyTerminal, name='wettyCreate'),
    url(r'^stopWettyTerm$', views.stopWettyTerminal, name='wettyCreate'),
    url(r'^getJSONListing$', views.getJSONListing, name='wettyCreate')

]
