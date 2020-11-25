
/* 
Favourite records
*/


let s;   //alias for settings


//App object

Favs = {

  // Settings object

  settings:{
    randomExchangeTimer: false,
    randomExchangeInterval: 2000,
    randomExchangeIntervalIncrease: 500,
    randomExchangeIntervalMax: 4500,

    howl: false,
    audioPlayTimer: false,
    audioStopTimer: false,
    audioOn: true,
    audioMaxLength: 30 * 1000, //secs
    audioMaxVolume: 0.25,
    audioFadeIn: 3000,
    audioFadeOut: 1500,
    audioPlaying: false,

    progressBarTimer: false,
    progressBarTimeStamp: false,

  },

  // initialization function

  init: function() {
    s = this.settings;    //alias for settings

    Favs.buildHtml();
    Favs.randomExchangeStart();
    Favs.bindEvents();

  },

  //buildHtml function: build initial HTML on load

  buildHtml : function() {

    $('.js-list-item').each(function(i) {

      const leafStart = $(this).data('album-leaf-start');

      //add ranking number to correct leaf
      $('.js-album-leaf').eq(leafStart - 1).attr('data-ranking', i+1);

      //set background image
      const url = 'url(images/' + $(this).data('album-slug') + '.jpg';

      $('.js-album-leaf').eq(leafStart - 1).css('background-image', url);

    });
  },



}

$( document ).ready(function() {
	Favs.init();
});

// HELPER FUNCTIONS

// Select random element from jquery set
jQuery.fn.random = function() {
    var randomIndex = Math.floor(Math.random() * this.length);  
    return jQuery(this[randomIndex]);
};


/**
 * jQuery alterClass plugin
 * Remove element classes with wildcard matching. Optionally add classes:
 *   $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
 * Copyright (c) 2011 Pete Boere (the-echoplex.net)
 */
(function ( $ ) {
	
$.fn.alterClass = function ( removals, additions ) {
	
	var self = this;
	
	if ( removals.indexOf( '*' ) === -1 ) {
		// Use native jQuery methods if there is no wildcard matching
		self.removeClass( removals );
		return !additions ? self : self.addClass( additions );
	}

	var patt = new RegExp( '\\s' + 
			removals.
				replace( /\*/g, '[A-Za-z0-9-_]+' ).
				split( ' ' ).
				join( '\\s|\\s' ) + 
			'\\s', 'g' );

	self.each( function ( i, it ) {
		var cn = ' ' + it.className + ' ';
		while ( patt.test( cn ) ) {
			cn = cn.replace( patt, ' ' );
		}
		it.className = $.trim( cn );
	});

	return !additions ? self : self.addClass( additions );
};

})( jQuery );