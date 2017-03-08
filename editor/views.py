from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return render(request, 'editor/home.html')


def execute(request):
    """Create a file on server code.language
        compile it using the script provided
        and return the result
    """
    print 'I reached here 2'
    return render(request, 'editor/home.html')
