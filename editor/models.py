from django.db import models

# Create your models here.


class Text_Editor(models.Model):
    # A text editor stores source code per language for saved sessions
    source_text = models.CharField(max_length=2000, default="")
    source_lang = models.CharField(max_length=20, default="")
    submission_id = models.CharField(max_length=10, default=0)
