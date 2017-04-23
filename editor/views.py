from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
import scripts.littleChecker as checker
import os
import scripts.fileExplorer as filexp
import scripts.terminal as wetty

orig_dir = os.getcwd()
def_host = "127.0.0.1"
def_username = "new1"
def_pass = "12"
term_pid = None
term_port = None


@csrf_exempt
def createWettyTerminal(request):
    """Return the contents of the remote file at the server"""
    global term_pid, term_port
    if request.is_ajax():
        try:
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
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            outputResponse = "File renamed successfully"
            remote_path = request.POST.get('remote_path')
            new_path = request.POST.get('new_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.renameRemoteFile(remote_path, new_path)
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            userDir.close()


@csrf_exempt
def makeRemoteDirectory(request):
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:

            remote_path = request.POST.get('remote_path')
            is_file = request.POST.get('is_file')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.makeRemoteDirectory(remote_path, is_file)
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            userDir.close()


@csrf_exempt
def deleteRemoteDir(request):
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            outputResponse = "Deleted successfully"
            remote_path = request.POST.get('remote_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.deleteRemoteFile(remote_path)
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            userDir.close()


@csrf_exempt
def viewfilecontents(request):
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            remote_path = request.POST.get('remote_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.viewRemoteFile(remote_path)
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            userDir.close()


@csrf_exempt
def refreshDirectory(request):
    """List all files in directory"""
    if request.is_ajax():
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.listFiles()
            return HttpResponse(outputResponse)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
            # raise e
        finally:
            userDir.close()


@csrf_exempt
def saveFile(request):
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
            return HttpResponse(output_message)
        except Exception as e:
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            userDir.close()


def fileManagerIframe(request):
    """for loading filemanager """
    return render(request, "editor/fileManager.html")


def index(request):
    """App invocation point: Return the editor page
        Also set up a new terminal port for use
    """
    global term_port
    if term_port is None:
        # we have no instance already running
        term_port = wetty.getUsablePort()
    else:
        print 'using prev port: ', term_port
    print 'usable port: ', term_port
    return render(request, 'editor/editorHome.html',
                  context={'user': 'new1'})


def home(request):
    """App invocation point: Return the editor page"""
    return render(request, 'editor/editorWork.html',
                  context={'user': 'new1'})


def createFile(text, extension, name="main", isSaved=False):
    # Creates a file in editor/tmp directory if not isSaved
    if not isSaved:
        os.chdir(orig_dir)
        os.chdir('editor/scripts/')
    print 'Current directory: ', orig_dir
    if extension == "":
        file_name = '%s' % (name)
    else:
        file_name = '%s.%s' % (name, extension)
    with open(file_name, 'w') as f:
        f.write(text)
    if not isSaved:
        os.chdir(orig_dir)
    return file_name


@csrf_exempt
def execute(request):
    """Create a file on server code.language
        compile it using the script provided
        and return the result
    """
    if request.is_ajax():
        code = request.POST.get('sourceCode', '')
        lang = request.POST.get('sourceLang', '')
        inp = request.POST.get('sourceInp', '')
        name = request.POST.get('sourceName', '')
        print ('Received: Code: %s \n lang: %s \n inp: %s \n name: %s\n ' %
               (code, lang, inp, name))
        output = ""
        try:
            created = createFile(code, lang, name)
            print 'Created file %s successfully' % (created)
            output = checker.main(created, inp, name)
            return HttpResponse(output)
        except Exception as e:
            if os.path.isfile(created):
                os.remove(created)
            return HttpResponseServerError(content=b'%s' % e.message)
        finally:
            os.chdir(orig_dir)
