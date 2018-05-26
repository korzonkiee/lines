$(document).ready(function() {
    let table;
    let currentPath = "";
    let files;

    initializeTable();
    initializeUploading();

    function initializeTable() {
        table = $("#table").dataTable({
            "aoColumns": [{ 
                "sTitle": "File", "mData": null,
                "render": (data, type, row, meta) => {
                    if (data.isDirectory) {
                        return `<i class="fa fa-folder-open"></i>&nbsp;&nbsp;<a href='#' target='_blank'>${data.name}</a>`;
                    } else {
                        return `<i class="fa fa-file"></i>&nbsp;&nbsp;<a href='/${data.path}' target='_blank'>${data.name}</a>`;
                    }
                  }
            }, { 
                "sTitle": "Path", "mData": null,
                "render": (data, type, row, meta) => {
                    return data.path;
                }
            }, { 
                "sTitle": "Size", "mData": null,
                "render": (data, type, row, meta) => {
                    return `${data.size} MB`;
                }
            }],
            "fnCreatedRow" :  function( nRow, aData, iDataIndex ) {
                if (!aData.isDirectory) return;
                let path = aData.path;
                $(nRow).bind("click", e => {
                    $.get('/files?path='+ path).then(function(data){
                        table.fnClearTable();
                        table.fnAddData(data);
                        currentPath = path;
                        $("#back").show();
                    });
                    e.preventDefault();
                });
            },
        });

        $.get("/files").then(files => {
            table.fnClearTable();
            table.fnAddData(files);     
        });

        $("#back").on("click", function(e){
            if (!currentPath) return;
            var idx = currentPath.lastIndexOf("/");
            if (idx == -1)
                $("#back").hide();

            var path = currentPath.substr(0, idx);
            $.get('/files?path='+ path).then(function(data){
                table.fnClearTable();
                table.fnAddData(data);
                currentPath = path || "";
            });
        });
    }

    function initializeUploading() {
        $("#upload-input").on("change", function() {
            files = $(this).get(0).files;
        });

        $("#upload-form").submit(function(e) {
            e.preventDefault();
            
            if (files && files.length > 0) {
                let form = $("#upload-form")[0];
                let formData = new FormData(form);
                formData.append("path", currentPath);

                $.ajax({
                    url: "/upload",
                    type: "POST",
                    enctype: 'multipart/form-data',
                    data: formData,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function (data) {
                        $("#upload-input").val("");
                        $.get('/files?path='+ currentPath).then(function(data){
                            table.fnClearTable();
                            table.fnAddData(data);
                        });
                    }
                });
            }
        })
    }
});