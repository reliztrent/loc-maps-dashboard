/*
Card glow
*/

$('.sidebar .nav-link').click(function(){
    $('.glow').removeClass('glow');
    var anchor_href = $(this).attr('href');
    var anchor = anchor_href.split('#')[anchor_href.split('#').length-1];
    var anchor_id = $('#' + anchor);
    anchor_id.addClass('glow');
    setTimeout(function () {
        anchor_id.removeClass('glow');
    }, 3000); /This should match the number of seconds on the glow css class/
})

/* 
Card zoom
*/

$('.zoom').click(function(){

	/* get parent card */
	var card = $(this).closest(".card");
	/* calculate for a new height-based width */
	var cardh = $(card).height();
	var cardw = $(card).width();
	var cardp = cardw/cardh
	var wh = $(window).height();
	var ww = $(window).width();
	var neww = wh * cardp;
	/* only zoom if card is < 90% of the screen  size */
	if (cardw < (ww*.8)) {
		/* apply the zoom */
		$(card)
		  .width(neww)
		  .css('position','fixed')
		  .css('left',(ww-neww)/2)
		  .css('z-index','2000')
		  .css('top','2rem')
		  .prepend( /* add a close button */
			  '<div class="modal-header">'+
		        '<button type="button" class="close card-close p-0" aria-label="Close">'+
		          '<span aria-hidden="true">×</span>'+
		        '</button>'+
		      '</div>'
	      	);
		/* remove the top-right buttons */
		$(this).closest('div.top-right').hide();
	};
		

	$('.card-close').children('span').click(function(){
		/* get parent card */
		var card = $(this).closest(".card");
		
		/* remove zoom properites */
		$(card)
			.css('width','')
			.css('position','')
			.css('left','')
			.css('z-index','')
			.css('top','');
	    /* remove close btn and restore zoom btn */
		$(card).children('.modal-header').remove();
		/* restore close btn and restore zoom btn */
		$(card).find('div.top-right').show();
	})
});

