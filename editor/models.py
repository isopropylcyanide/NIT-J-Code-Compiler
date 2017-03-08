from django.db import models

# Create your models here.


class Text_Editor(models.Model):
    # A text editor stores source code per language for saved sessions
    text = models.CharField(max_length=2000)
    lang = models.CharField(max_length=20)
