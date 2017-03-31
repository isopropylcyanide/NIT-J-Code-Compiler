function getRemotePath(node) {
    // given a tree node, recurse and return the absolute path for the remote
    var path = node.title;
    if (path === 'root')
        return '.';
    while (node.parent.title != 'root') {
        node = node.parent;
        path = node.title + '/' + path;
    }
    return path;
}


var tree_comparator = function(a, b) {
    //Custom comparator for fancy tree
    var x = (a.isFolder() ? "0" : "1") + a.title.toLowerCase(),
        y = (b.isFolder() ? "0" : "1") + b.title.toLowerCase();
    return x === y ? 0 : x > y ? 1 : -1;
};


var treeOptions = {
    //options for fancy tree
    extensions: ["glyph", "edit", "childcounter", "contextMenu"],
    contextMenu: {
        menu: function(node) {
            if (node.data.noedit) {
                return {
                    "add_folder": {
                        "name": "Add folder",
                        "icon": "add"
                    },
                    "add_file": {
                        "name": "Add file",
                        "icon": "add"
                    }
                };
            } else if (node.folder) {
                return {
                    "add_folder": {
                        "name": "Add folder",
                        "icon": "add"
                    },
                    "add_file": {
                        "name": "Add file",
                        "icon": "add"
                    },
                    "remove": {
                        "name": "Remove",
                        "icon": "delete"
                    },
                    "rename": {
                        "name": "Rename",
                        "icon": "edit"
                    }
                };
            } else return {
                "open": {
                    "name": "Open",
                    "icon": "quit"
                },
                "open_new": {
                    "name": "Open New",
                    "icon": "quit"
                },
                "remove": {
                    "name": "Remove",
                    "icon": "delete"
                },
                "rename": {
                    "name": "Rename",
                    "icon": "edit"
                }
            };
        },
        actions: function(node, action, options) {
            var path = getRemotePath(node);

            switch (action) {
                case "open":
                    //open file in the editorList.getActiveEditor()
                    displayFileinEditor(path, node.title);
                    break;
                case "open_new":
                    //create a new tab
                    //open file in the editorList.getActiveEditor()
                    $('#add-tab').trigger("click");
                    displayFileinEditor(path, node.title);
                    break;
                case "remove":
                    //remove file from the user directory
                    deleteFileFromUserDirectory(path, node);
                    break;
                case "rename":
                    //rename file given by path to something new
                    node.editStart();
                    break;
                case "add_folder":
                    //Add a folder here
                    var childNode = {
                        title: "New Folder",
                        folder: "true"
                    };
                    //first make an AJAX request
                    //if the result is successful, then only update tree
                    makeRemoteDirectory(node, childNode, "False");
                    break;
                case "add_file":
                    //Add a folder here
                    var fileChildNode = {
                        title: "New File"
                    };
                    //first make an AJAX request
                    //if the result is successful, then only update tree
                    makeRemoteDirectory(node, fileChildNode, "True");
                    break;
                default:
                    break;
            }
        }
    },
    modifyChild: (function(event, data) {
        //child operation control passed to parent
    }),
    edit: {
        // triggerStart: ["f2", "shift+click", "mac+enter"],
        beforeEdit: function(event, data) {},
        edit: function(event, data) {},
        save: function(event, data) {
            data.node.oldName = data.node.title;
            return true;
        },
        close: function(event, data) {
            if (data.save) {
                renameRemoteFile(data.node.parent, data.node.title, data.node.oldName);
            }
        }
    },
    childcounter: {
        deep: true,
        hideZeros: true,
        hideExpanded: true
    },
    loadChildren: function(event, data) {
        // update node and parent counters after lazy loading
        data.node.sortChildren(tree_comparator, true);
        data.node.updateCounters();
    },

    glyph: glyph_opts,
    toggleEffect: {
        effect: "drop",
        options: {
            direction: "left"
        },
        duration: 400
    },

    autoActivate: true, // Automatically activate a node when it is focused using keyboard
    autoScroll: true, // Automatically scroll nodes into visible area
    clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
    idPrefix: "ft_", // Used to generate node id´s like <span id='fancytree-id-<key>'>
    icon: true, // Display node icons
    keyboard: true, // Support keyboard navigation
    keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath()
    minExpandLevel: 1, // 1: root node is not collapsible
    quicksearch: true, // Navigate to next node by typing the first letters
    selectMode: 2, // 1:single, 2:multi, 3:multi-hier
    tabindex: "0", // Whole tree behaves as one single control
    dataType: "json",
    source: {
        url: "refreshDirectory"
    },
    dblclick: (function(event, data) {
        // A node was double clicked
        //Extract its full path and view if not a folder
        var node = data.node;
        if (node.folder) {
            return;
        }
        //Display the file in the editorList.getActiveEditor()
        else {
            var path = getRemotePath(node);
            displayFileinEditor(path, node.title);
        }
    }),
};

/*---------------------------FANCY tree customiation ends--------------------------*/
