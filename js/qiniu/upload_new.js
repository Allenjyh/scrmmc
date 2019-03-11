function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    return s.join("");
}

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined)
        url = window.createObjectURL(file);
    else if (window.URL != undefined)
        url = window.URL.createObjectURL(file);
    else if (window.webkitURL != undefined)
        url = window.webkitURL.createObjectURL(file);
    return url;
}

function isValid(checkid) {
    if (checkid != undefined && checkid.length > 0)
        return true;
    return false;
}

// 删除上传图片
function deleteUpLoadFile(token_url, bucket, imagekey) {
    var rsp = {'error_code': 200}
    if (!isValid(token_url) || !isValid(bucket)) {
        rsp['error_code'] = 0;
        rsp['erro_msg'] = '传参错误'
        return rsp;
    }

    token_url += "?bucket=" + bucket + "&imagekey=" + imagekey;
    $.ajax({
        url: token_url, type: "DELETE", async: false, success: function (data) {
            rsp = data;
        }
    });
    return rsp;
}

function getFileType(file_obj) {
    type_index = file_obj.type.indexOf('image');
    if (type_index >= 0) {
        return 1;
    }
    return 2;
}

function setFileSrc(file_id, file) {
    var urls = '';
    if (file != undefined)
        urls = getObjectURL(file);
    $('#' + file_id).attr('src', urls);
}

function getFileKey(file, type_name) {
    var file_key = file.name;
    file_key = uuid() + file_key.substring(file_key.lastIndexOf('.'), file_key.length);
    if (type_name.length != 0)
        file_key = '_' + file_key;
    file_key = type_name + file_key;
    return file_key;
}

function Uploader(fileids, parameter) {

    var input_id = fileids;// 选择文件控件id
    var file_ids = [];     // 显示图片的数组
    var auto_start = true; // 是否自动上传
    var select_type = 0;   // 0:一对一 1:一按钮对多图片
    var file_info = [];    // 文件信息
    var upload_id = '';
    var mimeType = ["image/jpg", "image/gif", "image/png", "image/bmp", "image/jpeg"];
    var token_url = '';
    var up_bucket = '';
    var file_type_name = '';
    var init_ids = [];                  // 初始化图片数组,必需顺序,只用于修改已有图片时的上传删除
    var init_src = [];                  // 初始化图片
    var function_complete = undefined;  // 上传成功函数回调
    var function_delete = undefined;    // 删除函数回调
    var function_add = undefined;       // 添加文件函数

    var start_upload = undefined;       // 上传函数
    var delete_file = undefined;        // 删除函数

    if (parameter != undefined) {
        if (parameter.hasOwnProperty('mimeType'))
            mimeType = parameter['mimeType'];
        if (parameter.hasOwnProperty('files'))
            file_ids = parameter['files'];
        if (parameter.hasOwnProperty('auto_start'))
            auto_start = parameter['auto_start'];
        if (parameter.hasOwnProperty('upload_id'))
            upload_id = parameter['upload_id'];
        if (parameter.hasOwnProperty('select_type'))
            select_type = parameter['select_type'];
        if (parameter.hasOwnProperty('bucket'))
            up_bucket = parameter['bucket'];
        if (parameter.hasOwnProperty('uptoken_url'))
            token_url = parameter['uptoken_url'];
        if (parameter.hasOwnProperty("file_type_name"))
            file_type_name = parameter['file_type_name'];
        if (parameter.hasOwnProperty("init_ids"))
            init_ids = parameter['init_ids'];
        if (parameter.hasOwnProperty("init_src"))
            init_src = parameter['init_src'];
    }

    if (select_type == 1)
        $('#' + input_id).attr('multiple', 'multiple');

    $('#' + input_id).change(function () {
        var file, file_key, info;
        if (select_type == 0) {                       // 一对一全是指定第一个文件
            if (auto_start && file_info.length > 0)  // 自动上传并有数据先删除七牛文件
                delete_file(0);
            else if (!auto_start && file_info.length > 0 && file_info[0]['complete'])
                delete_file(0);

            file_info = [];
            file = $(this).get(0).files[0];
            file_key = getFileKey(file, file_type_name);
            setFileSrc(file_ids[0], file);
            info = {'key': file_key, 'id': file_ids[0], 'file': file, 'index': 0};
            file_info.push(info);
            if (function_add != undefined)
                function_add(info);
        } else if (select_type == 1) {     // 每次选择后都把所选文件加到组数
            var file_list = $(this).get(0).files;
            if (file_info.length + file_list.length > file_ids.length) {
                console.log('select file too much!');
                alert('添加文件过多!');
                return;      // 选中添加文件过多
            }

            for (var i = 0; i < file_list.length; ++i) {
                var index = file_info.length;
                file = file_list[i];
                file_key = getFileKey(file, file_type_name);
                info = {'key': file_key, 'id': file_ids[index], 'file': file, 'index': index};
                file_info.push(info);
                setFileSrc(file_ids[index], file)
                if (function_add != undefined)
                    function_add(info);
            }
        }

        if (auto_start)	// 自动上传
            start_upload();
    });

    // 上传文件
    this.upload = function () {
        if (!isValid(token_url) || !isValid(up_bucket)) {
            console.log("token_url ! isValid or bucket ! isValid");
            return;
        }

        //七牛云上传
        $.ajax({
            type: 'get', url: token_url, data: {'bucket': up_bucket}, dataType: 'json',
            success: function (result) {
                if (result.error_code == 200) {

                    var observer = {                         //设置上传过程的监听函数
                        next(result) {                        //上传中(result参数带有total字段的 object，包含loaded、total、percent三个属性)
                            Math.floor(result.total.percent); //查看进度[loaded:已上传大小(字节);total:本次上传总大小;percent:当前上传进度(0-100)]
                        },
                        error(err) {                          //失败后
                            alert(err.message);
                        },
                        complete(res) {                      //成功后
                            // 取出本地的文件路径
                            for (var i = 0; i < file_info.length; ++i) {
                                if (file_info[i]['key'] == res.key) {
                                    file_info[i]['complete'] = true;         // 已上传
                                    if (function_complete != undefined)
                                        function_complete(file_info[i]);
                                }
                            }
                        }
                    };

                     var putExtra = {
                        fname: "",            // 原文件名
                        params: {},           // 用来放置自定义变量
                        mimeType: mimeType,   // 限制上传文件类型
                    };

                    var config = {
                        region: qiniu.region.z2,             //存储区域(z0: 代表华东;不写默认自动识别)
                        concurrentRequestLimit: 3            //分片上传的并发请求量
                    };

                    for (var i = 0; i < file_info.length; ++i) {
                        if (!file_info[i]['complete']) {
                            var observable = qiniu.upload(file_info[i]['file'], file_info[i]['key'], result.token, putExtra, config);
                            var subscription = observable.subscribe(observer)          // 上传开始
                        }
                    }

                } else {
                    alert(result.error_msg);  //获取凭证失败
                }
            },
            error: function () {               //服务器响应失败处理函数
                alert("服务器繁忙");
            }
        });
    };

    // 设置图片id
    this.addFileId = function (file_id) {
        if (!isValid(file_id))
            return;
        if (this.select_type == 0) {
            if (file_ids.length == 0)
                file_ids.push(file_id);
        } else {
            for (var i = 0; i < file_ids.length; ++i) {
                if (file_ids[i] == file_id)
                    return;
            }
            file_ids.push(file_id)
        }
    };

    // 绑定开始上传事件 uploadid 控件id
    this.bindStart = function (uploadid) {
        if (!isValid(uploadid))
            return;

        $('#' + uploadid).on('click', function () {
            start_upload();
        });
    };

    this.bindStart(upload_id);

    // 设置上传参数
    this.setUploadTokenSet = function (url, bucket) {
        if (isValid(url))
            token_url = url;
        if (isValid(bucket))
            up_bucket = bucket;
    };

    // 设置文件名前缀
    this.setFileTypeName = function (type_name) {
        file_type_name = type_name;
    };

    // 删除文件
    this.deleteFile = function (file_index) {
        var init_len = init_ids.length;
        var rsp = {'error_code': 200}
        if (file_index < 0 || file_index >= file_info.length + init_len) {
            rsp['error_code'] = 0;
            rsp['error_msg'] = 'file_index 错误';
            return rsp;
        }

        var id = null;
        var info = {};
        if (file_index < init_len) {	// 删除初始图片
            id = init_ids[file_index];
            info['key'] = init_src[file_index];
        } else {
            var file_list = $('#' + input_id).get(0).files;
            info = file_info[file_index - init_len];
            id = info['id'];
        }

        //自动上传调接口删除        非自动直接删内存
        if (auto_start || info['complete'])
            rsp = deleteUpLoadFile(token_url, up_bucket, info['key']);

        if (rsp['error_code'] == 200) {
            setFileSrc(id);
            if (file_index < init_len) {         // 删除初始图片

                id = init_ids[init_len - 1];
                file_ids.unshift(id);

                // 重排初始图
                for (var i = file_index; i < init_ids.length; ++i) {
                    if (i + 1 == init_ids.length)
                        break;

                    id = init_ids[i]
                    var next_img = $('#' + init_ids[i + 1]);
                    $('#' + id).attr('src', next_img.attr('src'));
                    next_img.attr('src', '');
                }
                init_ids.splice(init_len - 1, 1);
                init_src.splice(file_index, 1);
            } else {
                file_index -= init_len;
                delete file_list[file_index];
                file_info.splice(file_index, 1);
            }

            // 重新计算排版
            for (var i = 0; i < file_info.length; ++i) {
                id = file_info[i]['id'];
                setFileSrc(id);
                id = file_ids[i];
                setFileSrc(id, file_info[i]['file']);
                file_info[i]['id'] = id;
                file_info[i]['index'] = i;
            }
            $('#' + input_id).val('');
        }

        if (function_delete != undefined)
            function_delete(rsp, id);

        return rsp;
    };

    // 强制删除并重排
    this.forceDelete = function (file_index) {
        var init_len = init_ids.length;
        var rsp = {'error_code': 200}
        if (file_index < 0 || file_index >= file_info.length + init_len) {
            rsp['error_code'] = 0;
            rsp['error_msg'] = 'file_index 错误';
            return rsp;
        }

        var id = null;
        var info = {};
        if (file_index < init_len) {	// 删除初始图片
            id = init_ids[file_index];
            info['key'] = init_src[file_index];
        } else {
            var file_list = $('#' + input_id).get(0).files;
            info = file_info[file_index - init_len];
            id = info['id'];
        }

        //自动上传调接口删除        非自动直接删内存
        setFileSrc(id);
        if (file_index < init_len) {         // 删除初始图片

            id = init_ids[init_len - 1];
            file_ids.unshift(id);

            // 重排初始图
            for (var i = file_index; i < init_ids.length; ++i) {
                if (i + 1 == init_ids.length)
                    break;

                id = init_ids[i]
                var next_img = $('#' + init_ids[i + 1]);
                $('#' + id).attr('src', next_img.attr('src'));
                next_img.attr('src', '');
            }
            init_ids.splice(init_len - 1, 1);
            init_src.splice(file_index, 1);
        } else {
            file_index -= init_len;
            delete file_list[file_index];
            file_info.splice(file_index, 1);
        }

        // 重新计算排版
        for (var i = 0; i < file_info.length; ++i) {
            id = file_info[i]['id'];
            setFileSrc(id);
            id = file_ids[i];
            setFileSrc(id, file_info[i]['file']);
            file_info[i]['id'] = id;
            file_info[i]['index'] = i;
        }
        $('#' + input_id).val('');
    };

    // 绑定函数
    this.bind = function (event_name, fun) {
        if ('complete' == event_name)
            function_complete = fun;
        else if ('delete' == event_name)
            function_delete = fun;
        else if ('add' == event_name)
            function_add = fun;
    };

    this.getFileKeys = function () {
        var keys = [];
        for (var i = 0; i < init_ids.length; ++i) {
            keys.push(init_src[i])
        }
        for (var i = 0; i < file_info.length; ++i) {
            if (file_info[i]['complete'])
                keys.push(file_info[i]['key'])
        }
        return keys;
    };

    start_upload = this.upload;
    delete_file = this.deleteFile;
    return this;
};
