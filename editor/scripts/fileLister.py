import os
import json

# Copyright (c) Aman Garg 2016 Copyright Holder All Rights Reserved.

"""Recursively list all files and return their tree representation
    which is a hierarchial element of divs where the folders have a class of
    <folder>
    [{"title": "Node 1", "key": "1"},
 {"title": "Folder 2", "key": "2", "folder": true, "children": [
    {"title": "Node 2.1", "key": "3"},
    {"title": "Node 2.2", "key": "4"}
  ]}
]
"""

json_output = []


def path_to_dict(path):
    name = os.path.basename(path)
    d = None
    if not (name.startswith('.') and len(name) != 1):
        d = {'title': name}
        if os.path.isdir(path):
            # ignore hidden folders and files
            d['folder'] = "true"
            d['children'] = []
            if name == '.':
                # Base folder. Don't allow editing
                d['expanded'] = "true"
                d['noedit'] = "true"
            paths = [os.path.join(path, x) for x in os.listdir(path)]
        # Just the children that are themselves valid
            for p in paths:
                c = path_to_dict(p)
                if c is not None:
                    d['children'].append(c)
            if not d['children']:
                return d
    return d


# By default return the directory listing of the current directory
print '[%s]' % (json.dumps(path_to_dict('.'), indent=2))
