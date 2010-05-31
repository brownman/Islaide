/* ShowOff JS Logic */

var ShowOff = {};

var preso_started = false
var slidenum = 0
var slideTotal = 0
var slides
var currentSlide
var totalslides = 0
var slidesLoaded = false
var incrSteps = 0
var incrElem
var incrCurr = 0
var incrCode = false
var gotoSlidenum = 0
var shiftKeyActive = false


function setupPreso(load_slides, prefix) {
  if (preso_started)
  {
     alert("already started")
     return
  }
  preso_started = true

 
  loadSlides(load_slides, prefix)


  // bind event handlers
  document.onkeydown = keyDown
  document.onkeyup = keyUp
  /* window.onresize  = resized; */
  /* window.onscroll = scrolled; */
  /* window.onunload = unloaded; */
}

function loadSlides(load_slides, prefix) { 
  //load slides offscreen, wait for images and then initialize
  if (load_slides) {
  	$("#slides").load("/slides", false, function(){
    	$("#slides img").batchImageLoad({
			loadingCompleteCallback: initializePresentation(prefix)
		})
  	})
  } else {
	$("#slides img").batchImageLoad({
		loadingCompleteCallback: initializePresentation(prefix)
	})
  }
}

function initializePresentation(prefix) {
  //center slides offscreen
  centerSlides($('#slides > .slide'))

  //copy into presentation area
  $("#preso").empty()
  $('#slides > .slide').appendTo($("#preso"))

  //populate vars
  slides = $('#preso > .slide')
  slideTotal = slides.size()

  //setup manual jquery cycle
  $('#preso').cycle({
    timeout: 0
  })

  if (slidesLoaded) {
    showSlide()
    alert('slides loaded')
  } else {
    showFirstSlide()
    slidesLoaded = true
  }
  prettyPrint();
}

function centerSlides(slides) {
  slides.each(function(s, slide) {
    centerSlide(slide)
  })
}

function centerSlide(slide) {
  var slide_content = $(slide).children(".content").first()
  var height = slide_content.height()
  var mar_top = (0.5 * parseFloat($(slide).height())) - (0.5 * parseFloat(height))
  if (mar_top < 0) {
    mar_top = 0
  }
  slide_content.css('margin-top', mar_top)
}

function gotoSlide(slideNum) {
  slidenum = parseInt(slideNum)
  if (!isNaN(slidenum)) {
    showSlide()
  }
}

function showFirstSlide() {
  slidenum = 0
  showSlide()
}

function showSlide(back_step) {

  if(slidenum < 0) {
    slidenum = 0
    return
  }

  if(slidenum > (slideTotal - 1)) {
    slidenum = slideTotal - 1
    return
  }

  currentSlide = slides.eq(slidenum)

  var transition = currentSlide.attr('data-transition')
  var fullPage = currentSlide.find(".content").is('.full-page');

  if (back_step || fullPage) {
    transition = 'none'
  }

  $('#preso').cycle(slidenum, transition)

  if (fullPage) {
    $('#preso').css({'width' : '100%', 'overflow' : 'visible'});
    currentSlide.css({'width' : '100%', 'text-align' : 'center', 'overflow' : 'visible'});
  } else {
    $('#preso').css({'width' : '1020px', 'overflow' : 'hidden'});
  }

  percent = getSlidePercent()
  $("#slideInfo").text((slidenum + 1) + '/' + slideTotal + '  - ' + percent + '%')

  if(!back_step) {
    // determine if there are incremental bullets to show
    // unless we are moving backward
    determineIncremental()
  } else {
    incrCurr = 0
    incrSteps = 0
  }

  $('body').addSwipeEvents().
    bind('swipeleft',  swipeLeft).
    bind('swiperight', swipeRight)
  removeResults()

  return getCurrentNotes()
}

function getSlideProgress()
{
  return (slidenum + 1) + '/' + slideTotal
}

function getCurrentNotes() 
{
  return currentSlide.find("p.notes").text()
}

function getSlidePercent()
{
  return Math.ceil(((slidenum + 1) / slideTotal) * 100)
}

function determineIncremental()
{
  incrCurr = 0
  incrCode = false
  incrElem = currentSlide.find(".incremental > ul > li")
  incrSteps = incrElem.size()
  if(incrSteps == 0) {
    // also look for commandline
    incrElem = currentSlide.find(".incremental > pre > code > code")
    incrSteps = incrElem.size()
    incrCode = true
  }
  incrElem.each(function(s, elem) {
    $(elem).hide()
  })
}

function prevStep()
{
  slidenum--
  return showSlide(true) // We show the slide fully loaded
}

function nextStep()
{
  if (incrCurr >= incrSteps) {
    slidenum++
    return showSlide()
  } else {
    elem = incrElem.eq(incrCurr)
    if (incrCode && elem.hasClass('command')) {
      incrElem.eq(incrCurr).show().jTypeWriter({duration:1.0})
    } else {
      incrElem.eq(incrCurr).show()
    }
    incrCurr++
  }
}

function prevStep() {
  slidenum--
  return showSlide(true) // We show the slide fully loaded
}

//  See e.g. http://www.quirksmode.org/js/events/keys.html for keycodes
function keyDown(event)
{
    var key = event.keyCode;

    if (event.ctrlKey || event.altKey || event.metaKey)
       return true;

 
    if (key >= 48 && key <= 57) // 0 - 9
    {
      gotoSlidenum = gotoSlidenum * 10 + (key - 48);
      return true;
    }
    if (key == 13 && gotoSlidenum > 0)
    {
      slidenum = gotoSlidenum - 1;
      showSlide(true);
    }
    gotoSlidenum = 0;

    if (key == 16) // shift key
    {
      shiftKeyActive = true;
    }
    if (key == 32) // space bar
    {
      if (shiftKeyActive) { prevStep() }
      else                { nextStep() }
    }
    else if (key == 37 || key == 33) // Left arrow or page up
    {
      prevStep()
    }
    else if (key == 39 || key == 34) // Right arrow or page down
    {
      nextStep()
    }
    else if (key == 90) // z for help
    {
      $('#help').toggle()
    }
    else if (key == 66 || key == 70) // f for footer (also "b" which is what kensington remote "stop" button sends
    {
      toggleFooter()
    }
	else if (key == 27) // esc
	{
		removeResults();
	}
    return true
}

function toggleFooter() 
{
  $('#footer').toggle()
}

function keyUp(event) {
  var key = event.keyCode;
  if (key == 16) // shift key
  {
    shiftKeyActive = false;
  }
}


function swipeLeft() {
  nextStep()
}

function swipeRight() {
  prevStep()
}

function ListMenu(s)
{
  this.slide = s
  this.typeName = 'ListMenu'
  this.itemLength = 0;
  this.items = new Array();
  this.addItem = function (key, text, slide) {
    if (key.length > 1) {
      thisKey = key.shift()
      if (!this.items[thisKey]) {
        this.items[thisKey] = new ListMenu(slide)
      }
      this.items[thisKey].addItem(key, text, slide)
    } else {
      thisKey = key.shift()
      this.items[thisKey] = new ListMenuItem(text, slide)
    }
  }
  this.getList = function() {
    var newMenu = $("<ul>")
    for(var i in this.items) {
      var item = this.items[i]
      var domItem = $("<li>")
      if (item.typeName == 'ListMenu') {
        choice = $("<a rel=\"" + (item.slide - 1) + "\" href=\"#\">" + i + "</a>")
        domItem.append(choice)
        domItem.append(item.getList())
      }
      if (item.typeName == 'ListMenuItem') {
        choice = $("<a rel=\"" + (item.slide - 1) + "\" href=\"#\">" + item.slide + '. ' + item.textName + "</a>")
        domItem.append(choice)
      }
      newMenu.append(domItem)
    }
    return newMenu
  }
}

function ListMenuItem(t, s)
{
  this.typeName = "ListMenuItem"
  this.slide = s
  this.textName = t
}

var removeResults = function() {
  $('.results').remove();
};

var print = function(text) {
  removeResults();
  var _results = $('<div>').addClass('results').text($.print(text));
  $('body').append(_results);
  _results.click(removeResults);
};

$('.sh_javaScript code').live("click", function() {
  result = null;
  var codeDiv = $(this);
  codeDiv.addClass("executing");
  eval(codeDiv.text());
  setTimeout(function() { codeDiv.removeClass("executing");}, 250 );
  if (result != null) print(result);
});
