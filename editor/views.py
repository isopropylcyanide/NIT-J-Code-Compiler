from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
import scripts.littleChecker as checker
import os
import scripts.fileExplorer as filexp

orig_dir = os.getcwd()
def_host = "127.0.0.1"
def_username = "new1"
def_pass = "12"


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
        except Exception:
            return HttpResponseServerError(content=b'Couldn\'t rename file')
        finally:
            userDir.close()


@csrf_exempt
def deleteRemoteDir(request):
    """Return the contents of the remote file at the server"""
    if request.is_ajax():
        try:
            outputResponse = "File deleted successfully"
            remote_path = request.POST.get('remote_path')
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.deleteRemoteFile(remote_path)
            return HttpResponse(outputResponse)
        except Exception:
            return HttpResponseServerError(content=b'Couldn\'t delete file')
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
        except Exception:
            return HttpResponseServerError(content=b'Couldn\'t locate file')
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
        except Exception:
            return HttpResponseServerError(content=b'Directory unavailable')
            # raise e
        finally:
            userDir.close()


@csrf_exempt
def saveFile(request):
    """Save file as requested by the user to his location"""
    if request.is_ajax():
        code = request.POST.get('sourceCode', '')
        lang = request.POST.get('sourceLang', '')
        file_name = request.POST.get('sourceName', '').split('.')[0]
        output_message = "Saved file successfully"

        createdFile = createFile(code, lang, name=file_name, isSaved=True)
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.sftp_server.upload(createdFile, "./%s" % (createdFile))
            return HttpResponse(output_message)
        except Exception:
            return HttpResponseServerError(content=b'Error saving')
        finally:
            userDir.close()
            if (os.path.isfile(createdFile)):
                os.remove(createdFile)


def index(request):
    """Return the editor page"""
    return render(request, 'editor/editorHome.html', context={'user': 'new1'})


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
        except Exception:
            return HttpResponseServerError(content=b'Error during execution')
        finally:
            os.chdir(orig_dir)
            return HttpResponse(output)
