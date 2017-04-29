var myList = {};

function showFileManager() {
    //displays file manager after receiving AJAX string of folders
    var filemanager = $('.filemanager'),
        breadcrumbs = $('.breadcrumbs'),
        fileList = filemanager.find('.data');

    //parse data from the ajax string to JSON
    var data = JSON.parse(myList);
    var response = [data];

    var currentPath = '',
        breadcrumbsUrls = [];
    var folders = [],
        files = [];
    // This event listener monitors changes on the URL. We use it to
    // capture back/forward navigation in the browser.
    $(window).on('hashchange', function() {
        goto(window.location.hash);
        // We are triggering the event. This will execute
        // this function on page load, so that we show the correct folder:
    }).trigger('hashchange');


    // Hiding and showing the search box
    filemanager.find('.search').click(function() {
        var search = $(this);
        search.find('span').hide();
        search.find('input[type=search]').show().focus();
    });


    // Listening for keyboard input on the search field.
    // We are using the "input" event which detects cut and paste
    // in addition to keyboard input.

    filemanager.find('input').on('input', function(e) {
        folders = [];
        files = [];

        var value = this.value.trim();
        if (value.length) {
            filemanager.addClass('searching');
            // Update the hash on every key stroke
            window.location.hash = 'search=' + value.trim();
        } else {
            filemanager.removeClass('searching');
            window.location.hash = encodeURIComponent(currentPath);
        }
    }).on('keyup', function(e) {

        // Clicking 'ESC' button triggers focusout and cancels the search
        var search = $(this);
        if (e.keyCode == 27) {
            search.trigger('focusout');
        }

    }).focusout(function(e) {
        // Cancel the search
        var search = $(this);
        if (!search.val().trim().length) {
            window.location.hash = encodeURIComponent(currentPath);
            search.hide();
            search.parent().find('span').show();
        }
    });

    // Clicking on folders
    fileList.on('click', 'li.folders', function(e) {
        e.preventDefault();
        var nextDir = $(this).find('a.folders').attr('href');
        if (filemanager.hasClass('searching')) {
            // Building the breadcrumbs
            breadcrumbsUrls = generateBreadcrumbs(nextDir);
            filemanager.removeClass('searching');
            filemanager.find('input[type=search]').val('').hide();
            filemanager.find('span').show();

        } else {
            breadcrumbsUrls.push(nextDir);
        }
        window.location.hash = encodeURIComponent(nextDir);
        currentPath = nextDir;
    });

    // Clicking on files, open ajax data in a new tab
    fileList.on('click', 'li.files', function(e) {
        e.preventDefault();
        var remotePath = $(this).find('a.files').attr('title');
        displayFileinNewTab(remotePath);
    });

    // Clicking on breadcrumbs
    breadcrumbs.on('click', 'a', function(e) {
        e.preventDefault();
        var index = breadcrumbs.find('a').index($(this)),
            nextDir = breadcrumbsUrls[index];
        breadcrumbsUrls.length = Number(index);
        window.location.hash = encodeURIComponent(nextDir);
    });

    // Navigates to the given hash (path)
    function goto(hash) {
        hash = decodeURIComponent(hash).slice(1).split('=');
        if (hash.length) {
            var rendered = '';
            // if hash has search in it
            if (hash[0] === 'search') {
                filemanager.addClass('searching');
                rendered = searchData(response, hash[1].toLowerCase());

                if (rendered.length) {
                    currentPath = hash[0];
                    render(rendered);
                } else {
                    render(rendered);
                }
            }

            // if hash is some path
            else if (hash[0].trim().length) {
                rendered = searchByPath(hash[0]);
                if (rendered.length) {
                    currentPath = hash[0];
                    breadcrumbsUrls = generateBreadcrumbs(hash[0]);
                    render(rendered);
                } else {
                    currentPath = hash[0];
                    breadcrumbsUrls = generateBreadcrumbs(hash[0]);
                    render(rendered);
                }
            }

            // if there is no hash
            else {
                currentPath = data.path;
                breadcrumbsUrls.push(data.path);
                render(searchByPath(data.path));
            }
        }
    }

    // Splits a file path and turns it into clickable breadcrumbs
    function generateBreadcrumbs(nextDir) {
        var path = nextDir.split('/').slice(0);
        for (var i = 1; i < path.length; i++) {
            path[i] = path[i - 1] + '/' + path[i];
        }
        return path;
    }

    // Locates a file by path
    function searchByPath(dir) {
        var path = dir.split('/'),
            demo = response,
            flag = 0;

        for (var i = 0; i < path.length; i++) {
            for (var j = 0; j < demo.length; j++) {
                if (demo[j].name === path[i]) {
                    flag = 1;
                    demo = demo[j].items;
                    break;
                }
            }
        }
        demo = flag ? demo : [];
        return demo;
    }


    // Recursively search through the file tree
    function searchData(data, searchTerms) {
        data.forEach(function(d) {
            if (d.type === 'folder') {
                searchData(d.items, searchTerms);
                if (d.name.toLowerCase().match(searchTerms)) {
                    folders.push(d);
                }
            } else if (d.type === 'file') {
                if (d.name.toLowerCase().match(searchTerms)) {
                    files.push(d);
                }
            }
        });
        return {
            folders: folders,
            files: files
        };
    }


    // Render the HTML for the file manager
    function render(data) {
        var scannedFolders = [],
            scannedFiles = [];

        if (Array.isArray(data)) {
            data.forEach(function(d) {
                if (d.type === 'folder') {
                    scannedFolders.push(d);
                } else if (d.type === 'file') {
                    scannedFiles.push(d);
                }
            });

        } else if (typeof data === 'object') {
            scannedFolders = data.folders;
            scannedFiles = data.files;
        }

        // Empty the old result and make the new one
        fileList.empty().hide();

        if (!scannedFolders.length && !scannedFiles.length) {
            filemanager.find('.nothingfound').show();
        } else {
            filemanager.find('.nothingfound').hide();
        }

        if (scannedFolders.length) {
            scannedFolders.forEach(function(f) {
                var itemsLength = f.items.length,
                    name = escapeHTML(f.name),
                    icon = '<span class="icon folder"></span>';

                if (itemsLength) {
                    icon = '<span class="icon folder full"></span>';
                }

                if (itemsLength == 1) {
                    itemsLength += ' item';
                } else if (itemsLength > 1) {
                    itemsLength += ' items';
                } else {
                    itemsLength = 'Empty';
                }

                var folder = $('<li class="folders"><a href="' + f.path + '" title="' + f.path + '" class="folders">' + icon + '<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');
                folder.appendTo(fileList);
            });

        }

        if (scannedFiles.length) {
            scannedFiles.forEach(function(f) {
                var fileSize = bytesToSize(f.size),
                    name = escapeHTML(f.name),
                    fileType = name.split('.'),
                    icon = '<span class="icon file"></span>';

                fileType = fileType.length > 1 ? fileType[fileType.length - 1] : '';
                icon = '<span class="icon file f-' + fileType + '">' + fileType + '</span>';
                var file = $('<li class="files"><a href="javascript:void(0);" title="' + f.path + '" class="files">' + icon + '<span class="name">' + name + '</span> <span class="details">' + fileSize + '</span></a></li>');
                file.appendTo(fileList);
            });
        }

        // Generate the breadcrumbs

        var url = '';
        if (filemanager.hasClass('searching')) {
            url = '<span>Search results: </span>';
            fileList.removeClass('animated');
        } else {
            fileList.addClass('animated');
            breadcrumbsUrls.forEach(function(u, i) {

                var name = u.split('/');
                if (i !== breadcrumbsUrls.length - 1) {
                    url += '<a href="' + u + '"><span class="folderName">' + name[name.length - 1] + '</span></a> <span class="arrow">→</span> ';
                } else {
                    url += '<span class="folderName">' + name[name.length - 1] + '</span>';
                }
            });
        }

        breadcrumbs.text('').append(url);

        // Show the generated elements
        fileList.animate({
            'display': 'inline-block'
        });
        //to prevent ul from display hidden show it
        fileList.show();
    }


    // This function escapes special html characters in names
    function escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // Convert file sizes from bytes to human readable units

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
}





function receiveJSON() {
    //send an ajax request that retrieves json of the current directory
    //file will be executed under /home/username
    return $.ajax({
        method: 'POST',
        url: "getJSONListing",
        data: {},
        success: function(data) {
            //this gets called when server returns an OK response
            //now remove menu item from tree
            new $.Zebra_Dialog('Connected successfully', {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 1000,
                'type': 'confirmation',
                'title': 'Workspace'
            });
            //display the file manager now
            myList = data;
            showFileManager();
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while connecting to workspace", {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 500,
                'type': 'error',
                'title': 'Workspace Error'
            });
        }
    });
}

function displayFileinNewTab(path) {
    //Display the file in the new tab when user clicks on a folder
    return $.ajax({
        method: 'POST',
        url: "viewfilecontents",
        data: {
            'remote_path': path
        },
        success: function(data) {
            //this gets called when server returns an OK response
            var p = document.createElement('p');
            //Insert the text you want
            p.textContent = data;
            //open the window
            var win = window.open('', '_blank');
            //append the p element to the new window's body
            win.document.body.appendChild(p);
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }
        },
        error: function(data) {
            new $.Zebra_Dialog("Error occured while opening: " + "<br><br>" + data.responseText, {
                'buttons': false,
                'modal': false,
                'position': ['right - 20', 'top + 20'],
                'auto_close': 500,
                'type': 'error',
                'title': path
            });
        }
    });
}


$(document).ready(function() {
    //send an ajax request that retrieves json of the current directory
    receiveJSON();
});
