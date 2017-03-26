import os

"""Recursively list all files and return their tree representation
    which is a hierarchial element of divs where the folders have a class of
    <folder>
"""


def recursive_walk(folder):
    for folderName, subfolders, filenames in os.walk(folder):
        if subfolders:
            for subfolder in subfolders:
                recursive_walk(subfolder)

        if len(folderName) == 1 or not folderName.startswith('.'):
            if len(folderName) == 1:
                recursive_walk.repr += '<li class="folder expanded">%s<ul>' % (
                    folderName)
            else:
                recursive_walk.repr += '<li class="folder">%s<ul>' % (
                    folderName)
            for filename in filenames:
                if not filename.startswith('.'):
                    recursive_walk.repr += '<li>%s</li>' % (filename)
            recursive_walk.repr += '</ul></li>'

# Add a function attribute
recursive_walk.repr = ""
recursive_walk('.')
print recursive_walk.repr
