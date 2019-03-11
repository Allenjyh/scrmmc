
$(function(){
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
	var textnumber=0;
	var editor = new Simditor({
	  textarea: $('#editor'),
	});
	 console.log(editor.getValue);
	editor.on('valuechanged',function(){
		var text = editor.sync();
		textnumber =  editor.sync().length;
		if( textnumber >0){
			//let thistext = text.substring(0,499);
			//editor.setValue(thistext);
			return true;
		}else{
			return false;
		}
	})
	$('.form_box4 span').click(function(){
		$('.form_box4 input').click();
	})


        var hyValue=1;
    var ii=0;
    var typearr=[];//已选择的标签数组
    var oldtypearr;
    $('.inputing').keydown(function (e) {
        var e = e || window.event, ec = e.keyCode || e.which;
        var nulls = /^[\s]*$/;
        if (!e.ctrlKey && 13 == ec) {
            $('.tijiao').click();//监控回车键 调用tijiao方法
            return false;
        }
    })
    $('.tijiao').click(function(){
        $('.curtainfff').show();
        $('.searchnav').show();
        // 弹窗顶部的搜索框 点击提交的时候 这里写ajax方法
        var search = $('.inputing').val();
        $.ajax({
            url: '/search',
            type: 'POST',
            data: {
                // '_token':'{{csrf_token()}}',
                'search': search
            },
            contentType: "application/x-www-form-urlencoded",
            success: function (msg) {

                if(msg == ""){

                    $('.searchnav').html("<li style='text-align: center;margin-top: 40px; color: rgba(0,0,0,0.65); font-size: 18px;'>没有结果...</li>");

                }else{
                    $('.searchnav').html(msg);
                    $('.curtainfff').show();
                    $('.searchnav').show();
                    var tijiaotext = $('.inputing').val();
                    var thisli = $('.searchnav li').length;
                    for(let a = 0;a<thisli;a++){
                        var thistext = $('.searchnav li:eq('+a+')').text();
                        var newtext = thistext.split(tijiaotext);
                        var alsdkfj =  newtext.join('<i style="color:#198cff;">'+tijiaotext+'</i>');
                        $('.searchnav li:eq('+a+')').html(alsdkfj);
                    }
                    $('.searchnav li').click(function(){
                        var data = $(this).text();
                        $('.inputing').val(data);
                    })
                }

            },
            error: function (xhr) {
                console.log(xhr.status);
                // tipsPopup(2,xhr);
                //alert(xhr);
            }
        });
    })
    $('.hy-title li').hover(function(){
        $(this).addClass('active').siblings().removeClass('active');
        $('.hy-lable>ul').stop();
        var i = $(this).index();
        var height = i*-678;
        $('.hy-lable>ul').animate({"top":height+"px"},100);
        hyValue = $(this).attr("value");
    })


    // 动态添加和删除标签
    // 输入框输入结束回车提交和失去焦点提交方法
    $('.hy-lable>ul>li .add-lable-btn').keydown(function(e) {
           var f = e || window.event, ec = e.keyCode || e.which;
           var nulls = /^[\s]*$/;
           if (!f.ctrlKey && 13 == ec) {
           	thisfocunsout1(hyValue);
           	return false;
           }
        
        console.log($('.add-lable-btn').val());
    });
    $('.hy-lable>ul>li').focusout(function(){
        console.log(hyValue);
        thisfocunsout1(hyValue);//失去焦点就提交
    })
    function thisfocunsout1(thiscalss){
        let k = thiscalss;
        let thisval = $('.add-lable-btn'+k).val();
        let j = $(this).attr('id');
        console.log(thisval);
        if (thisval == '') {
            //判断不为空
        }else if(typearr.length == 6){
            //判断数组长度为6的时候
        }else{
            typearr.push({'thistext':thisval,'thisid':j,'industry_id':k});
            ergodicarr();
            oldtypearr = typearr;
            $('.add-lable-btn').val('');//方法结束之后清空输入框
        }
    }
    // 点击添加当前标签的方法
    $('.hy-lable-box ul li').click(function(){
        let i = $(this).text();
        let j = $(this).attr('id');
        let k = $(this).attr('industry_id');
        if(typearr.length == 6){
        }else{
            typearr.push({'thistext':i,'thisid':j,'industry_id':k});
            ergodicarr();
            oldtypearr = typearr;
        }
    })
    $('.searchnav').on('click','li',function(){
        let i = $(this).text();
        let j = $(this).attr('id');
        let k = $(this).attr('industry_id');
        typearr.push({'thistext':i,'thisid':j,'industry_id':k});
        ergodicarr();
        oldtypearr = typearr;

    })
    //遍历数组并打印到页面上  还要加上一个新旧数组比对的方法
    function ergodicarr(){
        $('.selectedul li').remove();
        for(let iii = 0 ; iii<typearr.length;iii++){
            $('.selectedul').append('<li title="点击删除">'+typearr[iii].thistext+'</li>')
        }
    }
    // 点击删除对应数组下标的方法
    // 重构remove方法
    Array.prototype.removearr=function(dx){
        if(isNaN(dx)||dx>this.length){
            return false;
        }
        for(let i=0,n=0;i<this.length;i++){
            if(this[i]!=this[dx]){
                this[n++]=this[i]
            }
        }
        this.length-=1
    }
    $('.selectedul').on('click','li',function(){
        let i = $(this).index();
        typearr.removearr(i-1);

        $('.selectedul li:eq('+(i-1)+')').remove();
    });


    $('.curtain').click(function(){
        $('.navbigbox').hide();
        $('.curtain').hide();
    });
    $('.simulationtext').click(function(){
        $('.simulationtext').text('');
        $('.navbigbox').show();
        $('.curtain').show();
    });
    $('.thisclose').click(function(){
        $('.navbigbox').hide();
        $('.curtain').hide();
    });

    // 提交之后在打印typearr数组
    $('.ok-navbigbox').click(function(){
        // 点击确定之后关闭页面
        $('.curtain').hide();
        $('.navbigbox').hide();
        for(let iii = 0 ; iii<typearr.length;iii++){
        	console.log(typearr);
            $('.simulationtext').append('<i id='+typearr[iii].thisid+' industry_id='+typearr[iii].industry_id+'>'+typearr[iii].thistext+'  </i>')
        }
    });

    $('#div2').keydown(function(){
        console.log($('#div2 p').text().length);
    });

	/*服务区域选择*/
	$('.fwqy').click(function(){
		if ($('.fwqy_select_box').css('display') == 'none') {
			$('.fwqy_select_box').slideDown();
		}
	});
	
	var cityName,city_towName,countyName;
	var city = 0,city_two = 0,county = 0;
	//一级
	$('.city li').hover(function(){
		city = $(this).index();
		cityName = $(this).text();
		$(this).addClass('active').siblings().removeClass('active');
		$('.city_two ul').eq(city).slideDown().siblings().slideUp();
	});
	//二级
	$('.city_two ul li').hover(function(){
		city_two = $(this).index();
		city_twoName = $(this).text();
		$(this).addClass('active').siblings().removeClass('active');
	});
	$('.county li').hover(function(){
		$(this).addClass('active').siblings().removeClass('active');
	});
	$('.county li').click(function(){
		county = $(this).index();
		countyName = $(this).text();
		$('.select_name').text(cityName+city_twoName+countyName);
		$('.fwqy_select_box').slideUp();
	});
	
	/*服务区域选择结束*/

    /*文本域的字数控制*/
    $('.simditor-body').on("keyup", function () {
        $('.textNum').text($('.simditor-body').text().length);//这句是在键盘按下时，实时的显示字数
        if ($('.simditor-body').text().length > 600) {
            $('.textNum').text(600);//长度大于100时0处显示的也只是100
            $('.simditor-body').text($('.simditor-body').text().substring(0, 600));//长度大于100时截取钱100个字符
        }
    });
    $('.textNum').text($('.simditor-body').val().length);//这句是在刷新的时候仍然显示字数


    /*对话框开始
    number 状态编号 1：通过 2：错误 3：警告 4：普通
    tipsPopup(3,'抱歉，申请加入企业不通过，请联系客服。');*/

    function tipsPopup(number,thiscontent){
        $('.tipsPopupbigbox').show();
        var tipsbox = '<div class="thistips tipsPopup'+number+'">'
            +'<p>'
            +'<i class="iconfont"></i>'
            +'<span>'+thiscontent+'</span>'
            +'<span class="iconcuo iconfont icon-cuo1"></span>'
            +'</p>'
            +'</div>';
        $('.tipsPopupbigbox').append(tipsbox);
        $('.tipsPopup1 i').addClass('icon-check-circle-fill');
        $('.tipsPopup2 i').addClass('icon-close-circle-fill');
        $('.tipsPopup3 i').addClass('icon-info-circle-fill');
        $('.tipsPopup4 i').addClass('icon-warning-circle-fill');
    }




    // 监控搜索框 关键字变色
	$('.tijiao').click(function(){
		$('.curtainfff').show();
		$('.searchnav').show();
		var tijiaotext = $('.inputing').val();
		var thisli = $('.searchnav li').length;
		for(let a = 0;a<thisli;a++){
			var thistext = $('.searchnav li:eq('+a+')').text();
			// console.log(thistext);
			var newtext = thistext.split(tijiaotext);
			var alsdkfj =  newtext.join('<i style="color:#198cff;">'+tijiaotext+'</i>');
			$('.searchnav li:eq('+a+')').html(alsdkfj);
		}
	})
	$('.curtainfff').click(function(){
		$('.curtainfff').hide();
		$('.searchnav').hide();
	})
	$('.searchnav').on('click','li',function(){
		$('.searchnav').hide();
	})
	
	function sendType(thisclass){//发布类型select
		let sendTypeVal = $(thisclass).val();
		if (sendTypeVal == 0) {
			$(thisclass).css({'border':'1px solid #F52230'});
			return false;
		} else{
			$(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
		}
	}
	
	function select_fwqy(){
		let select_fwqy = $('.select_name').text();
		if (select_fwqy == '未选择') {
			$('.fwqy').css({'border':'1px solid #F52230'});
			return false;
		} else{
			$('.fwqy').css({'border':'1px solid #5FCC29'});
            return true;
		}
	}

	function textphone(thisclass){  //手机号码判断
        let Uphone = $(thisclass).val();
        let Tphone = /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\d{8}$/;
        if(Tphone.test(Uphone) == false|| Uphone == ''){
            $(thisclass).css({'border':'1px solid #F52230'});
            return false;
        }else if(Tphone.test(Uphone)==true){
            $(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
        }
    }
    function textemail(thisclass){  //邮箱判断
        let Uemail = $(thisclass).val();
        let Temail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if(Temail.test(Uemail) == false || Uemail == ''){
            $(thisclass).css({'border':'1px solid #F52230'});
            return false;
        }else if(Temail.test(Uemail) == true){
            $(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
        }
    }
    function textqq(thisclass){   //QQ号码判断
        let Uqq = $(thisclass).val();
        let Tqq = /^[1-9][0-9]\d{5,12}$/;
        if(Tqq.test(Uqq) == false || Uqq == ''){
            $(thisclass).css({'border':'1px solid #F52230'});
            return false;
        }else if(Tqq.test(Uqq) == true){
            $(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
        }
    }
    function textnull(thisclass){   //不为空判断
        let Unull = $(thisclass).val();
        // console.log(Unull);
        if(Unull.length == 0){
            $(thisclass).css({'border':'1px solid #F52230'});
            return false;
        }else{
            $(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
        }
    }
    function textFixed(thisclass){//座机判断
        let Ufixed = $(thisclass).val();
        // let Tfixed = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
        let Tfixed=/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
        if(Tfixed.test(Ufixed) == false ){
            $(thisclass).css({'border':'1px solid #F52230'});
            return false;
        }else if(Tfixed.test(Ufixed) == true){
            $(thisclass).css({'border':'1px solid #5FCC29'});
            return true;
        }
    }
	$('.clickformbox4').click(function(){
		let textalert = $('#editor').val().length;
		var simulationtextnumber = $('.simulationtext i').text().length;
		if(sendType('.send_type') ==false || select_fwqy() == false || textemail('.thisemail') == false || textphone('.phone') == false || textphone('.contact') == false || textFixed('.telnumber') == false || textnull('.crmformtitle') == false || textnumber == 0 || simulationtextnumber == 0){
			if(textalert == 0){
				$('.simditor-wrapper').css({'border':'1px solid #f52230'});
				$('.thisp3').show();
				$('.thisp3').text('补充描述不能为空');
			}else if(textalert != 0){
				$('.simditor-wrapper').css({'border':'1px solid #5FCC29'});
				$('.thisp3').hide();
			}
			if(simulationtextnumber == 0){
				$('.simulationtext').css({'border':'1px solid #f52230'});
				$('.thisp1').show();
				$('.thisp1').text('标签不能为空');
			}else if(simulationtextnumber != 0){
				$('.simulationtext').css({'border':'1px solid #5FCC29'});
				$('.thisp1').hide();
			}
			if(textphone('.phone') == false){
				let thistext = $('.phone').val();
				if(thistext.length == 0){
					$('.thisp4').show();
					$('.thisp4').text('手机号码不能为空');
				}else if(textphone('.phone') == false){
					$('.thisp4').show();
					$('.thisp4').text('手机号码格式错误');
				}
			}else if(textphone('.phone') == true){
				$('.thisp4').hide();
			}
			if(textphone('.contact') == false){
				let thistext = $('.contact').val();
				if(thistext.length == 0){
					$('.thisp44').show();
					$('.thisp44').text('联系人不能为空');
				}else if(textphone('.contact') == false){
					$('.thisp44').show();
					$('.thisp44').text('联系人手机号码格式错误');
				}
			}else if(textphone('.contact') == true){
				$('.thisp44').hide();
			}
			if(textemail('.thisemail') == false){
				let thistext = $('.thisemail').val();
				if(thistext.length == 0){
					$('.thisp6').show();
					$('.thisp6').text('邮箱地址不能为空');
				}else if(textemail('.thisemail') == false){
					$('.thisp6').show();
					$('.thisp6').text('邮箱地址格式错误');
				}
			}else if(textemail('.thisemail') == true){
				$('.thisp6').hide();
			}
			if(textnull('.crmformtitle') == false){
				let thistext = $('.crmformtitle').val();
				if(thistext.length == 0){
					$('.thisp2').show();
					$('.thisp2').text('标题不能为空');
				}
			}else if(textnull('.crmformtitle') == true){
				$('.thisp2').hide();
			}
			if(textFixed('.telnumber') == false){
				let thistext = $('.telnumber').val();
				if(thistext.length == 0){
					$('.thisp5').show();
					$('.thisp5').text('座机号码不能为空');
				}else{
					$('.thisp5').show();
					$('.thisp5').text('座机号码格式错误');
				}
			}else if(textFixed('.telnumber') == true){
				$('.thisp5').hide();
			}
		}else if(textemail('.thisemail') == true && textphone('.phone') == true && textFixed('.telnumber') && textnull('.crmformtitle') == true){
			$('.thisp1').hide();$('.thisp2').hide();$('.thisp3').hide();$('.thisp4').hide();$('.thisp5').hide();
			//ajax()
            //表单提交
            // $('.clickformbox4').click(function(){
                var type = $('.sendType option:selected').val();
                var label = $('.simulationtext').text();
                var title = $('.crmformtitle').val();
                var editor = $('.simditor-body p').text();
                var phone = $('.phone').val();
                var tell = $('.telnumber').val();
                var email = $('.thisemail').val();
                var qq = $('.thisqq').val();
                $.ajax({
                    type:'post',
                    url:'/adddemands',
                    data:{'type':type,'label':label,'title':title,'editor':editor,'phone':phone,'tell':tell,'email':email,'qq':qq,'typearr':typearr},
                    contentType: "application/x-www-form-urlencoded",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
                    },
                    success: function (msg) {
                        tipsPopup(1,msg);
                        //alert(msg);
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1500);

                    },
                    error: function (xhr) {
                        console.log(xhr);
                    }
                });
            // })

			return true;
		}
	});

	$('.radio_box span').click(function(){
		if ($(this).find('i').eq(1).css('display') == 'none') {
			$(this).find('i').eq(0).hide();
			$(this).find('i').eq(1).show();
			$(this).siblings().find('i').eq(0).show();
			$(this).siblings().find('i').eq(1).hide();
			var thisCheck = $(this).index();
			console.log(thisCheck);
		}
	});
    
    $('.tishi').hover(function(){
    	$(this).find('span').stop();
    	$(this).find('span').fadeIn(500);
    },function(){
    	$(this).find('span').stop();
    	$(this).find('span').fadeOut(500);
    });
})