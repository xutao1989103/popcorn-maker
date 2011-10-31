// PLUGIN: image

(function (Popcorn) {

"use strict";

	var nop = {
			start: function() {},
			end: function() {}
		},
		styleSheet;

	Popcorn.plugin( 'image' , function(options) {
		var popcorn,
			video,
			target,
			container,
			textContainer,
			lightboxContainer,
			text, node, i,
			figure,
			playing = false,
			loaded = false,
			sources, ext,

			thumbLoaded = function() {
				loaded = true;
				if (typeof options.onLoad === 'function') {
					options.onLoad(options);
				}
			};
		
		if (!options) {
			return nop;
		}

		if (!options.target || !options.url && !options.thumb) {
			return nop;
		}

		if (options.url) {
			if (!options.mode) {
				ext = options.url.split('.');
				if (ext.length > 1) {
					ext = ext.pop().toLowerCase();
				}

				if (ext === 'mp4' || ext === 'm4v'|| ext === 'ogv:' || ext === 'webm') {
					options.mode = 'video';
				} else if (ext === 'ogg' || ext === 'mp3' || ext === 'wav') {
					options.mode = 'audio';
				} else if (ext === 'jpg' || ext === 'png' || ext === 'gif') {
					options.mode = 'image';
				}
			}

			if (!options.thumb) {
				options.thumb = options.url;	
			}
		}

		if (!options.thumb && !options.mode) {
			return nop;
		}

		popcorn = this;
		video = popcorn.media;

		target = options.target;

		if (typeof target === 'string') {

			target = document.getElementById(target);
			
			if (!target) {
				return nop;
			}
		}
		
		//default styles in a style sheet so they can be overridden
		if (!styleSheet) {
			styleSheet = document.createElement('style');
			styleSheet.setAttribute('type', 'text/css');
			styleSheet.appendChild(document.createTextNode(
			'.popcorn-image { cursor: pointer; display: none; position: relative; }\n' +
			'.popcorn-image.active { display: inline-block; }\n' +
			'.popcorn-image > figure { position: relative; margin: 0; display: inline-block; }\n' +
			'.popcorn-image > figure > figcaption { position: absolute; top: 0; left: 0; font-size: 16px; width: 100%; padding: 4px; background-color: rgba(0, 0, 0, 0.5); color: white; visibility: hidden; overflow: hidden; }\n' +
			'.popcorn-image > figure:hover > figcaption { visibility: visible; }\n' +
			'.popcorn-image-lightbox { position: fixed; padding: 40px; background-color: rgba(0, 0, 0, 0.7); color: white; border: 4px solid rgba(255, 255, 255, 0.6); border-radius: 8px; z-index: 999999; margin: 10% auto; max-width: 90%; max-height: 90%; display: none; }\n' +
			'.popcorn-image-lightbox > .close { position:absolute; top: 4px; right: 4px; cursor: pointer; text-decoration: underline; }'+
			'.popcorn-image-lightbox.active { display: block; }'
			));
			document.head.appendChild(styleSheet);
		}

		container = document.createElement('div');
		container.style.cssText = options.style || '';
		options.container = container;

		i = options.top;
		if (i || i === 0) {
			if (!isNaN(i)) {
				i += 'px';
			}
			container.style.top = i;
			container.style.position = 'absolute';
		}

		i = options.left;
		if (i || i === 0) {
			if (!isNaN(i)) {
				i += 'px';
			}
			container.style.left = i;
			container.style.position = 'absolute';
		}
		
		i = options.right;
		if (i || i === 0) {
			if (!isNaN(i)) {
				i += 'px';
			}
			container.style.right = i;
			container.style.position = 'absolute';
		}
		
		i = options.bottom;
		if (i || i === 0) {
			if (!isNaN(i)) {
				i += 'px';
			}
			container.style.bottom = i;
			container.style.position = 'absolute';
		}
		
		if (options.align) {
			container.style.textAlign = options.align;
		}

		figure = document.createElement('figure');
		container.appendChild(figure);
		if (options.thumb) {
			node = document.createElement('img');
			node.src = options.thumb;
			node.setAttribute('class','popcorn-image-thumb');
			options.thumbImage = node;
			figure.appendChild(node);

			if (node.naturalWidth || node.width) {
				thumbLoaded();
			} else {
				node.addEventListener('load', thumbLoaded, false);
			}
		}

		if (options.url && options.mode) {
			lightboxContainer = document.createElement('div');
			lightboxContainer.setAttribute('class', 'popcorn-image-lightbox');

			if (options.mode === 'video') {
				node = document.createElement('video');
				node.setAttribute('controls', '');
				node.src = options.url;
				options.video = node;
			} else {
				node = document.createElement('img');
				node.src = options.url;
			}

			lightboxContainer.appendChild(node);

			container.addEventListener('click', function() {
				playing = !video.paused;
				video.pause();
				lightboxContainer.classList.add('active');
				
				var top = Math.max((window.innerHeight - lightboxContainer.offsetHeight) / 2, 0);
				top = Math.min(top, window.innerHeight * 0.1);

				lightboxContainer.style.top = top + 'px';

				lightboxContainer.style.left = Math.max((window.innerWidth - lightboxContainer.offsetWidth) / 2, 0) + 'px';

				if (options.video && options.video.play) {
					options.video.play();
				}
			}, false);
			
			node = document.createElement('div');
			node.setAttribute('class','close');
			node.innerHTML = 'Close';
			node.addEventListener('click', function() {
				if (options.video && options.video.pause) {
					options.video.pause();
				}

				lightboxContainer.classList.remove('active');
				if (playing) {
					video.play();
				}
			}, false);
			lightboxContainer.insertBefore(node, lightboxContainer.firstChild);

			document.body.appendChild(lightboxContainer);		}

		if (options.title) {
			node = document.createElement('figcaption');
			node.appendChild(document.createTextNode(options.title));
			figure.appendChild(node);
		}

		if (lightboxContainer) {
			if (options.link) {
				textContainer = document.createElement('a');
				textContainer.setAttribute('href', options.link);
				if (options.linkTarget) {
					textContainer.setAttribute('target', options.linkTarget);
				} else {
					textContainer.setAttribute('target', '_new');
				}

				//pause video when link is clicked
				textContainer.addEventListener('click', function() {
					video.pause();
				}, false);

				lightboxContainer.appendChild(textContainer);
			} else {
				textContainer = lightboxContainer;
			}

			if (text) {
				text = options.text.split(/[\n\r]/);
				for (i = 0; i < text.length; i++) {
					if (i) {
						textContainer.appendChild(document.createElement('br'));
					}
					textContainer.appendChild(document.createTextNode(text[i]));
				}
			}
		}

		if (options.classes) {
			if (options.classes.length && options.classes.join) {
				//an array works
				container.setAttribute('class', 'popcorn-image ' + options.classes.join(' '));
			} else {
				container.setAttribute('class', 'popcorn-image ' + options.classes.split(/,\s\n\r/).join(' '));
			}
		} else {
			container.setAttribute('class', 'popcorn-image');
		}


		target.appendChild(container);

		//if event callbacks are strings, swap them out for functions
		(function() {
			var i, event, events = ['onSetup', 'onLoad', 'onStart', 'onFrame', 'onEnd', 'onTeardown'];
			for (i = 0; i < events.length; i++) {
				event = events[i];
				if (options[event] && typeof options[event] === 'string') {
					if (window[ options[event] ] && typeof window[ options[event] ] === 'function') {
						options[event] = window[ options[event] ];
					}
				}
			}
		}());

		if (typeof options.onSetup === 'function') {
			options.onSetup(options);
		}

		return {
			start: function( event, options ) {
				if (loaded) {
					options.container.classList.add('active');
				}

				if (typeof options.onStart === 'function') {
					try {
						options.onStart(options);
					} catch (e) {
						console.log(e.message);
					}
				}
			},
			frame: function(event, options, time){
				if (typeof options.onFrame === 'function') {
					try {
						options.onFrame(options, time);
					} catch (e) {
						console.log(e.message);
					}
				}
			},
			end: function( event, options ) {
				options.container.classList.remove('active');
				
				if (typeof options.onEnd === 'function') {
					try {
						options.onEnd(options);
					} catch (e) {
						console.log(e.message);
					}
				}
			},
			_teardown: function( options ) {
				if (options.container.parentNode) {
					options.container.parentNode.removeChild(options.container);
					container = null;
					delete options.container;
				}
				
				if (typeof options.onEnd === 'function') {
					try {
						options.onEnd(options);
					} catch (e) {
						console.log(e.message);
					}
				}
			}
		};
	},
	{
		about: {
			name: 'Popcorn Image and Video Plugin',
			version: 0.1,
			author: 'Brian Chirls',
			website: 'http://chirls.com'
		},
		options: {
			start: {elem:'input', type:'text', label:'In'},
			end: {elem:'input', type:'text', label:'Out'},
			text: {
				elem:'input',
				type:'text',
				label:'Text'
			},
			link: {
				elem:'input',
				type:'text',
				label:'Link (URL)'
			},
			classes: {
				elem:'input',
				type:'text',
				label:'List of classes to apply to text container'
			},
			style: {
				elem:'input',
				type:'text',
				label:'CSS to apply to text'
			},
			align: {
				elem:'select',
				label:'CSS to apply to text'
			},
			top: {
				elem:'input',
				type:'number',
				label:'Top position'
			},
			left: {
				elem:'input',
				type:'number',
				label:'Left position'
			},
			bottom: {
				elem:'input',
				type:'number',
				label:'Bottom position'
			},
			right: {
				elem:'input',
				type:'number',
				label:'Right position'
			}/*,
			onSetup: {
				type: "function",
				label: "onSetup callback function"
			},
			onLoad: {
				type: "function",
				label: "onLoad callback function"
			},
			onStart: {
				type: "function",
				label: "onStart callback function"
			},
			onEnd: {
				type: "function",
				label: "onEnd callback function"
			},
			onFrame: {
				type: "function",
				label: "onFrame callback function"
			}*/
		}
	});
})( Popcorn );
