import os
import json

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


def recursive_walk(folder):
    global json_output
    for folderName, subfolders, filenames in os.walk(folder):
        if subfolders:
            for subfolder in subfolders:
                recursive_walk(subfolder)

        if len(folderName) == 1 or not folderName.startswith('.'):
            metaFold = {}
            if len(folderName) != 1:
                metaFold = {"title": folderName,
                            "folder": "true", "children": []}
            for filename in filenames:
                if not filename.startswith('.'):
                    metaFile = {"title": filename}
                    if len(folderName) != 1:
                        # add child to folder
                        metaFold["children"].append(metaFile)
                    else:
                        # files in current directory
                        json_output.append(metaFile)

            if len(folder) != 1:
                json_output.append(metaFold)

# Add a function attribute

recursive_walk('.')
print json.dumps(json_output)
