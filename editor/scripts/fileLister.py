import os

"""Recursively list all files and return their tree representation
    which is a hierarchial element
"""


def recursive_walk(folder):
    for folderName, subfolders, filenames in os.walk(folder):
        if subfolders:
            for subfolder in subfolders:
                recursive_walk(subfolder)

        if not (folderName == "." and folderName.startswith('.')):
            recursive_walk.repr += '<li class="folder">%s<ul>' % (
                folderName)
            for filename in filenames:
                if not filename.startswith('.'):
                    recursive_walk.repr += '<li>%s</li>' % (filename)
            recursive_walk.repr += '</ul></li>'

recursive_walk.repr = ""
recursive_walk('.')
print recursive_walk.repr
