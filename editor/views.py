from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


def index(request):
    return render(request, 'editor/home.html')


@csrf_exempt
def execute(request):
    """Create a file on server code.language
        compile it using the script provided
        and return the result
    """
    if request.is_ajax():
        source_code = request.POST.get('sourceCode', '')
        source_lang = request.POST.get('sourceLang', '')
        print source_code, source_lang
        return HttpResponse("OK")
