# mod
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
import os
import json
import scripts.fileExplorer as filexp
import scripts.terminal as wetty
from django.contrib.auth.models import User

orig_dir = os.getcwd()
def_host = "127.0.0.1"
def_pass = "12"
term_pid = None
term_port = None


def validate(passA, passB):
    from login.views import saved_user as def_username
    """Validates if two passwords are equal and updates them in the database"""
    print passA, passB
    if passA != passB:
        print 'Two passwords do not match'
        return 'Two passwords do not match'
    currentUser = User.objects.get(username=def_username)
    if not currentUser.check_password(passA):
        print 'Incorrect password'
        return 'Incorrect password'
    # else save the password
    print 'changing password'
    currentUser.set_password(passA)
    currentUser.save()
    return "OK"


@csrf_exempt
def getProfile(request):
    from login.views import saved_user as def_username
    """Gets the user profile. Take care while changing passwords"""
    if request.is_ajax():
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userData = userDir.loadUserConfig()
            userDir.close()
            return HttpResponse(json.dumps(userData))
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def updateProfile(request):
    from login.views import saved_user as def_username
    """Update the user profile. Take care while changing passwords"""
    if request.is_ajax():
        try:
            data = {
                'name': request.POST.get('name'),
                'roll': request.POST.get('roll'),
                'email': request.POST.get('email'),
                'tel': request.POST.get('tel'),
                'dob': request.POST.get('dob'),
                'skill': request.POST.get('skill'),
                'picture': request.POST.get('picture')
            }
            pass1 = request.POST.get('pass1')
            pass2 = request.POST.get('pass2')
            outputResponse = validate(pass1, pass2)
            if outputResponse != "OK":
                return HttpResponseServerError(content=b'%s' % outputResponse)
            else:
                outputResponse = 'Profile updated successfully'
            # if user is validated, save the config file
            print 'User validated now'
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.saveUserConfig(data)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def getJSONListing(request):
    from login.views import saved_user as def_username
    """Return the contents of the file directory at the user's account"""
    if request.is_ajax():
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.executeJSONList(def_username)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            print 'error:', e
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def createWettyTerminal(request):
    from login.views import saved_user as def_username
    """Return the contents of the remote file at the server"""
    global term_pid, term_port
    if request.is_ajax():
        try:
            print 'trying to allocate: ', def_username
            term_pid = wetty.terminal(def_username, term_port)
            terminal_port = term_pid.allocate()
            return HttpResponse(str(terminal_port))
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def stopWettyTerminal(request):
    """Return the contents of the remote file at the server"""
    global term_pid, term_port
    if request.is_ajax():
        try:
            term_pid.terminate()
            print 'closed wetty: ', term_port
            return HttpResponse('')
        except Exception as e:
            print 'except: ', e
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def renameRemoteFile(request):
    from login.views import saved_user as def_username
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            outputResponse = "File renamed successfully"
            remote_path = request.POST.get('remote_path')
            new_path = request.POST.get('new_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.renameRemoteFile(remote_path, new_path)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def makeRemoteDirectory(request):
    from login.views import saved_user as def_username
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            remote_path = request.POST.get('remote_path')
            is_file = request.POST.get('is_file')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.makeRemoteDirectory(remote_path, is_file)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def deleteRemoteDir(request):
    from login.views import saved_user as def_username
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            outputResponse = "Deleted successfully"
            remote_path = request.POST.get('remote_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.deleteRemoteFile(remote_path)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def viewfilecontents(request):
    from login.views import saved_user as def_username
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            remote_path = request.POST.get('remote_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.viewRemoteFile(remote_path)
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            print 'error while viewing file: ', e
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def refreshDirectory(request):
    from login.views import saved_user as def_username
    print 'i received username: ', def_username
    """List all files in directory"""
    if request.is_ajax():
        try:
            print 'before resp using ', def_username, '', type(def_username)
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.listFiles()
            userDir.close()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


@csrf_exempt
def saveFile(request):
    from login.views import saved_user as def_username
    """Save file as requested by the user to his location"""
    if request.is_ajax():
        code = request.POST.get('sourceCode', '')
        lang = request.POST.get('sourceLang', '')
        path_to_save = request.POST.get('remotePath', '')
        file_name = request.POST.get('sourceName', '').split('.')[0]
        if lang == "":
            file_name = '%s' % (file_name)
        else:
            file_name = '%s.%s' % (file_name, lang)
        output_message = "Saved file successfully at <strong>%s</strong>" % (
            path_to_save)

        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.saveFileToRemote(path_to_save, file_name, code)
            userDir.close()
            return HttpResponse(output_message)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)


def index(request):
    global term_port
    from login.views import saved_user as def_username
    """App invocation point: Return the editor page
        Also set up a new terminal port for use
    """
    if term_port is None:
        # we have no instance already running
        term_port = wetty.getUsablePort()
    else:
        print 'using prev port: ', term_port
    print 'usable port: ', term_port
    return render(request, 'editor/editorHome.html',
                  context={'user': def_username})


def home(request):
    from login.views import saved_user as def_username
    """App invocation point: Return the editor page"""
    return render(request, 'editor/editorWork.html',
                  context={'user': def_username})


def profile(request):
    from login.views import saved_user as def_username
    """App invocation point: Return the profile page"""
    return render(request, 'editor/profile.html',
                  context={'user': def_username})


@csrf_exempt
def executeCode(request):
    from login.views import saved_user as def_username
    """Create a file on server code.language
        compile it using the script provided
        and return the result
    """
    if request.is_ajax():
        code = request.POST.get('sourceCode', '')
        lang = request.POST.get('sourceLang', '')
        inp = request.POST.get('sourceInp', '')
        name = request.POST.get('sourceName', '')
        parentDir = request.POST.get('parentDir', '')
        curPath = request.POST.get('curPath', '')
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.execute_CompileCode(
                code, lang, def_username, inp, name, parentDir, curPath)
            return HttpResponse(outputResponse)
            userDir.close()
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
