$(function(){
	$('.layui-input-block').on('click','div:eq(0)',function(){
		$('.layui-input-block div:gt(0)').click();
	})
})