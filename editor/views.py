from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from __future__ import print_function


def index(request):
    return render(request, 'editor/home.html')


def createFile(text, extension, name="default"):
    # Creates a file in editor/tmp directory
    file_name = '%s.%s' % (name, extension)
    try:
        print(text, file=open(file_name, "w"))
    except IOError:
        pass


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
        name = request.POST.get('sourceInp', '')

        # Create a file in the same directory as before
        createFile(code, lang, name)
        return HttpResponse("OK")
