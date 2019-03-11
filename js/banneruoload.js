layui.use('upload', function(){
  var $ = layui.jquery
  ,upload = layui.upload;
  
  //拖拽上传
  upload.render({
    elem: '#test10'
    ,url: '/upload/'
    ,done: function(res){
      console.log(res)
    }
  });
  
});