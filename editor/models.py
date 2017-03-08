from django.db import models

# Create your models here.


class Text_Editor(models.Model):
    # A text editor stores source code per language for saved sessions
    source_text = models.CharField(max_length=2000)
    source_lang = models.CharField(max_length=20)
    submission_id = models.CharField(max_length=10)
