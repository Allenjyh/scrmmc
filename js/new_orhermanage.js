$(function(){
	$('.arherbox').on('click','span',function(){
		let i = $(this).index();
		$('.arherbox span').removeClass('clickspan');
		$(this).addClass('clickspan');
		if(i == 0){
			$('.managebox li:eq(0)').show();
			$('.managebox li:eq(1)').hide();
		}else{
			$('.managebox li:eq(1)').show();
			$('.managebox li:eq(0)').hide();
		}
	})

})
