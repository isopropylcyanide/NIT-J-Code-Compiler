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
def refreshDirectory(request):
    """List all files in directory"""
    if request.is_ajax():
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            outputResponse = userDir.listfiles()
            return HttpResponse(outputResponse)
        except Exception:
            return HttpResponseServerError(content=b'File directory error')
            # raise e
        finally:
            userDir.close()


@csrf_exempt
def saveFile(request):
    """Save file as requested by the user to his location"""
    if request.is_ajax():
        code = request.POST.get('sourceCode', '')
        lang = request.POST.get('sourceLang', '')
        file_name = request.POST.get('sourceName', '')
        print ('Saving code')
        output_message = "Saved file successfully"

        createdFile = createFile(code, lang, name=file_name, isSaved=True)
        try:
            userDir = filexp.FileExplorer(def_username, def_pass, def_host)
            userDir.sftp_server.upload(createdFile, "./%s" % (createdFile))
            return HttpResponse(output_message)
        except Exception:
            return HttpResponseServerError(content=b'File save error')
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
        except Exception, e:
            print 'Exception caught in main view: ', str(e)
        finally:
            os.chdir(orig_dir)
            return HttpResponse(output)
