
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

  //----------------------------------------------------------

  //randomExchange() function: Exchanges backround images for 2 random blocks

  randomExchange: function() {

    let $elem1, $elem2, 
      elem1_url, elem2_url,
      elem1_ranking, elem2_ranking;

    do{
      $elem1 = $('.js-album-leaf').random();
      $elem2 = $('.js-album-leaf').random();
      elem1_url = $elem1.css('background-image');
      elem2_url = $elem2.css('background-image');
      elem1_ranking = $elem1.attr('data-ranking');
      elem2_ranking = $elem2.attr('data-ranking');
    }while(elem1_url == elem2_url);    //prevents choosing the same album leafs

    $elem1.addClass('during-exchange');
    $elem2.addClass('during-exchange');

    setTimeout(function() {
      // switch background colors, data ranking, and remove 'during-exchnage' class

      $elem1
        .css('background-image', elem2_url)
        .attr('data-ranking', elem2_ranking)
        .removeClass('during-exchange');

      $elem2
        .css('background-image', elem1_url)
        .attr('data-ranking', elem1_ranking)
        .removeClass('during-exchange');

      $('.js-album-leaf.hover').mouseenter();   //retrigger events that should happen when mouse is over a leaf and the image just changed

    }, 450);

  },

  //randomExchangeStart()

  randomExchangeStart : function() {

    if( ! $('body').hasClass('album-detail')) {

      clearInterval(s.randomExchangeTimer);

      s.randomExchangeTimer = setTimeout(function() {

        //do an exchange of album leaves
        Favs.randomExchange();

        //increase timeout interval
        s.randomExchangeInterval += s.randomExchangeIntervalIncrease;

        if(s.randomExchangeInterval > s.randomExchangeIntervalMax) {
          s.randomExchangeInterval = s.randomExchangeIntervalMax;
        }


        //call timeout again

        Favs.randomExchangeStart();

      }, s.randomExchangeInterval);

    }
  },

  //randomExchangeStop function to stop the exchnage

  randomExchangeStop : function() {

    clearInterval(s.randomExchangeTimer);
    
  },

  // enterDetailView finction: shows detail view of the album

  enterDetailView: function(e) {

    let $this = $(e);

    // Change background to current album image
    const albumSlug = $this.data('album-slug');
    $('.js-albums').css('backgorund-image', 'url(images/' + albumSlug + '.jpg');


    //get album data
    const artist = $this.find('.js-list-artist').text();
    const title = $this.data('title');
    const number = $('.js-list-item').index($this) + 1;

    //output meta data
    $('.js-artist').text(artist);
    $('.js-title').text(title);
    $('.js-number').text(number);

    //show detail by adding the album-detail class
    $('body').addClass('album-detail');

    //stop the random exchnage
    Favs.randomExchangeStop();

    //Audio
    if(s.audioOn) {

      if(s.howl) {
        s.howl.stop(); //just in case
      }


      //get audio info for current selection
      let audioSrc = [
        'audio/' + albumSlug + '.mp3',
      ];


      //set up howl
      s.howl = new Howl({
        src: audioSrc,
        html5: true,
      });

      //play and fade in 
      let howlInstance = s.howl.play();
      s.howl.fade(0, s.audioMaxVolume, a.audioFadeIn, howlInstance);

      //save what is playing in variable
      s.audioPlaying = howlInstance;

      //cancel any audio timers thats already playing
      clearTimeout(s.audioPlayTimer);
      clearTimeout(s.audioStopTimer);

      //play audio clip until a set max length
      s.audioPlayTimer = setTimeout(function(){

        //Fade audio out
        s.howl.fade(s.audioMaxVolume, 0, s.audioFadeOut, s.audioPlaying);
        s.audioPlaying = false;

        //Exit detail view
        Favs.exitDetailView();

      }, s.audioMaxLength);

      //progress bar
      Favs.progressBar('start');
    }

  },

  
  









}




//start the script

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