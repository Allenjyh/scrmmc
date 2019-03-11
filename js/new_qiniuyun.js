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

	$('.thiskey1').click(function(){
		$('.floatbox').hide();
		$('.thisbox1').show();
	})
	$('.thiskey2').click(function(){
		$('.floatbox').hide();
		$('.thisbox2').show();
	})
	$('.thiskey3').click(function(){
		$('.floatbox').hide();
		$('.thisbox3').show();
	})
	$('.btn_false').click(function(){
		$('.floatbox').hide();
	})
})