
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
    audioMaxLength: 28 * 1000, //secs
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
      const url = 'url(images/' + $(this).data('album-slug') + '.jpg)';

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

  // enterDetailView function: shows detail view of the album

  enterDetailView: function(e) {

    let $this = $(e);

    // Change background to current album image
    const albumSlug = $this.data('album-slug');
    $('.js-albums').css('background-image', 'url(images/' + albumSlug + '.jpg)');


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
      s.howl.fade(0, s.audioMaxVolume, s.audioFadeIn, howlInstance);

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


  //exitDetailView function : Exit detailed view of album

  exitDetailView : function() {

    //remove album-detail class
    $('body').removeClass('album-detail');

    //clear hover classes (for touch)
    $('.js-list-item').removeClass('hover');
    $('.js-album-leaf').removeClass('hover');

    //remove big background image after a delay for exit animation to be complete
    setTimeout(function(){

      if( ! $('body').hasClass('album-detail')  && ! $('body').hasClass('album-hovered'))
      {
        $('.js-albums').css('background-image', '');
      }
    },1000);

    //restart Random leaf exchnage
    Favs.randomExchangeStart();

    //Fade current audio out
    if(s.howl && s.audioPlaying)
    {
      s.howl.fade(s.audioMaxVolume, 0, s.audioFadeOut, s.audioPlaying);
    }

    //cancel any audio timers already running
    clearTimeout(s.audioPlayTimer);
    clearTimeout(s.audioStopTimer);

    //after fade out stop audio
    s.audioStopTimer = setTimeout(function(){

      if(s.howl)
      {
        s.howl.stop();
      }

      s.audioPlaying = false;
      Favs.progressBar('stop');

    }, s.audioFadeOut);

  },

  //progressBar function : animates the progress bar

  progressBar : function(e) {

    switch(e){

      //start
      case 'start':
        Favs.progressBar('reset');
        s.progressBarTimer = setInterval(function() {
          Favs.progressBar('update');
        }, 1000);
      break;

      //stop
      case 'stop':
        clearInterval(s.progressBarTimer);
        $('.js-progress').css('top', '100%');
      break;

      //reset
      case 'reset':
        clearInterval(s.progressBarTimer);
        s.progressBarTimeStamp = new Date();
        Favs.progressBar('update');
      break;
      
      case 'update':
        let time = Favs.progressBar('getTime');
        let maxTime = s.audioMaxLength;
        let progress = 100 - (time/maxTime * 100)-5;  //-5 to compensate for accuracy

        if(progress < 0)
        {
          progress = 0;
        }

        $('.js-progress').css('top', progress + '%');
      break;

      case 'getTime':
        let d = new Date();
        let now = d.getTime();
        let then = s.progressBarTimeStamp.getTime();
        let diff = now - then;
        return diff;
    }
  },

  // bindEvents function : to call the binding functions

  bindEvents : function () {
    Favs.bindListItems();
		Favs.bindExitDetailView();
		Favs.bindAlbumLeaves();
		Favs.bindKeyboard();
		Favs.bindOptions();
  },

  //bindListItems function : event handler for list items

  bindListItems : function(){

    //list-items CLICK
    $('.js-list-item').click(function(e){

      e.stopPropagation();

      Favs.enterDetailView(this);

    });

    let listItems_hoverTimer;

    //list-items hover
    $('.js-list-item').on('mouseenter', function(){

      //hover IN
      clearTimeout(listItems_hoverTimer);

      let $this = $(this);

      //set album highlight color
      const color = $this.data('highlight-color');
      document.documentElement.style.setProperty('--album-highlight-color', color);

      function listItems_hoverIn() {

        const albumSlug = $this.data('album-slug');

        $('.js-albums').css('background-image', 'url(images/' + albumSlug + '.jpg)');

        //ranking of list-item hovered
        const i = $('.js-list-item').index($this) + 1;

        $('body')
          .addClass('album-hovered')
          .alterClass('album-hovered*')  //remove all classes that start with 'album-hovered'
          .addClass('album-hovered--' + i);  //add which album is being hovered on
      }

      //Use different timeouts depending on a body class
      if ( ! $('body').hasClass('album-hovered'))
      {
        // If there isn't already a hover active, delay for longer so it doesn't create a twitchy experience when the mouse briefly goes through a link 
        listItems_hoverTimer = setTimeout(function() {
					listItems_hoverIn();				
				}, 130)
      } 
      else 
      {
				listItems_hoverTimer = setTimeout(function() {
					listItems_hoverIn();				
				}, 0)
      }
      
      Favs.randomExchangeStart();

    }).on('mouseleave', function(){

      //hover OUT
      clearTimeout(listItems_hoverTimer);

      listItems_hoverTimer = setTimeout(function(){
        $('body').removeClass('album-hovered');
        $('body').alterClass('album-hovered--*');

        if(! $('body').hasClass('album-detail'))
        {
          $('.js-albums').css('background-image','');
        }
      },30);

      Favs.randomExchangeStart();

    });

  },

  bindExitDetailView : function() {

    $('.wrapper, .js-close' ).on('click', function(e){

      e.stopPropagation();
      Favs.exitDetailView();

    });

    // Prevent title and artist from triggering the exit of detail view  (so they can be selected)
    $('.js-meta').on('click', function(e){

      e.stopPropagation();

    });

  },

  bindAlbumLeaves : function() {
    
    //album leaf click
    $('.js-album-leaf').click(function(e){

      e.stopPropagation();

      //get list item in relation to clicked album leaf
      const ranking = $(this).attr('data-ranking');
      const list_item = $('.js-list-item').eq(ranking - 1);

      Favs.enterDetailView(list_item);

    });

    let albumLeaves_hoverTimer;

    //Album leaf HOVER
    $('.js-album-leaf').on('mouseenter', function(){

      //hover IN

      if(! $('body').hasClass('album-detail'))
      {
        clearTimeout(albumLeaves_hoverTimer);

        let $this = $(this);

        $this.addClass('hover');

        // Get ranking from this album leaf
        const ranking = $(this).attr('data-ranking');
        //get list item
        let $list_item = $('.js-list-item').eq(ranking-1);

        //set album highlight color
        const color = $list_item.data('highlight-color');
        document.documentElement.style.setProperty('--album-highlight-color', color);

        albumLeaves_hoverTimer = setTimeout(function(){

          //add hover class to the corresponding list item
          $('.js-list-item').removeClass('hover');
          $list_item.addClass('hover');
        }, 200);

      }
    }).on('mouseleave', function(){

      if(! $('body').hasClass('album-detail'))
      {
        let $this = $(this);
        
        //hover OUT
        clearTimeout(albumLeaves_hoverTimer);
        
        //remove hover classes
        $('.js-list-item').removeClass('hover');
        $this.removeClass('hover');

      }

    });

  },

  /**
	* FUNCTION: bindKeyboard()
	* ********
	* Keyboard events
	*/
	bindKeyboard : function() {
		
		$(document).keyup(function(e) {
		
			// ESC
			if (e.keyCode === 27) { // esc
				Favs.exitDetailView();
			}

		});
		
	},

  /**
	* FUNCTION: bindOptions()
	* ********
	* Bind click events for options
	*/
	bindOptions : function() {
		
		// Audio On/Off
		$('.js-option-audio').click(function(e) {

			e.stopPropagation();

			$this = $(this);
			
			if ( $this.hasClass('option--off') ) {
				$this
					.removeClass('option--off')
					.addClass('option--on');
				
				s.audioOn = true;
				
			} else {
				$this
					.removeClass('option--on')
					.addClass('option--off');

				// Stop any playing audio immediately
				if (s.howl) {
					s.howl.stop(); 
					
					Favs.progressBar('stop');
				}
				
				s.audioOn = false;
			}
		});
	},

}  //end of App object




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