import os
import json
import sys
# Copyright (c) Aman Garg 2016 Copyright Holder All Rights Reserved.

"""Recursively list all files and return their tree representation
    which is a hierarchial element of divs where the folders have a class of
    <folder>
            if (stat.isDirectory()) {
                return {
                    name: f,
                    type: 'folder',
                    path: prefix + '/' + p,
                    items: walk(p, prefix)
                };
            }
            return {
                name: f,
                type: 'file',
                path: prefix + '/' + p,
                size: stat.size
"""

json_output = []


def path_to_dict(path):
    name = os.path.basename(path)
    d = None
    if not (name.startswith('.') and len(name) != 1):
        d = {'name': name}
        d['type'] = "file"
        d['path'] = path
        d['size'] = os.path.getsize(path)
        if os.path.isdir(path):
            # ignore hidden folders and files
            d['type'] = "folder"
            d['items'] = []
            d.pop('size')
            paths = [os.path.join(path, x) for x in os.listdir(path)]
        # Just the children that are themselves valid
            for p in paths:
                c = path_to_dict(p)
                if c is not None:
                    d['items'].append(c)
            if not d['items']:
                return d

    return d


if __name__ == '__main__':
    """Receives the user id of the directory where this script is to be run
        Param : user id
    """
    if len(sys.argv) != 2:
        exit()
    else:
        # print 'we have: /home/%s' % (sys.argv[1])
        os.chdir('%s' % (sys.argv[1]))
        print '%s' % (json.dumps(path_to_dict
                                 ('.'), indent=2))
