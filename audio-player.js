"use strict"

class AudioPlayer extends HTMLElement {

	constructor() {
		super()
		this.shadow = this.attachShadow({ mode: "open" })
		this.config = {
			src: null,
			progress: 0,
			poster: null
		}
		this.src = null
		this.progress = null;
		this.player = null;
	}

	connectedCallback() {
		let template = `
			<style>
				:host {
					all: initial;
				}
				.audio-container {
					background: white;
					width:400px;
					height:90px;
					border-radius:10px;
					position:relative;
					box-shadow: 0px 10px 20px rgba(0,0,0,0.2);
					display:flex;
					justify-content:flex-start;
				}
				.button__container {
					display:flex;
					align-items:center;
					padding-left:60px;
				}
				.button__container img {
					width:10px;
					height:10px;
					padding:20px;
					margin-right:10px;
					border-radius:10px;
					transition: background-color .2s ease;
				}
				.button__container img:hover {
					cursor:pointer;
					background-color:whitesmoke;
					transition: background-color .2s ease;
				}
			</style>
			<div class="audio-container">

				${this.getRecordPreview()}
				${this.getPlayerStatus()}

				<div class="button__container">
					<img class="media-buttons previous" src="icons/skip_previous.svg" alt="skip previous"/>
					<img class="media-buttons play" src="icons/play-button.svg" alt="play/pause"/>
					<img class="media-buttons next" src="icons/skip_next.svg" alt="skip next"/>
				</div>

				<audio 
					style="display:none";
					class="audio-player" 
					src=${this.config.src}
				/>
			</div>
		`
		this.shadow.innerHTML = template
		this.player = this.shadow.querySelector(".audio-player")

		this.registerEvents();
	}

	get source() {
		return this.source
	}

	set source(val) {
		this.setAttribute("source", val)
	}

	static get observedAttributes() {
		return ["source", "mute", "play"]
	}

	disconnectedCallback() {
		this.shadow.querySelector(".play").removeEventListener("click", this.togglePlay.bind(this))
		this.shadow.querySelector(".audio-player").removeEventListener("timeupdate", this.timeupdate.bind(this))
		this.progressSeek.removeEventListener("click", this.seekToTime.bind(this))
	}

	registerEvents() {
		this.shadow.querySelector(".play").addEventListener("click", this.togglePlay.bind(this))
		this.shadow.querySelector(".audio-player").addEventListener("timeupdate", this.timeupdate.bind(this))
		this.progressBar = this.shadow.querySelector(".progress-bar__width")
		this.progressSeek = this.shadow.querySelector(".progress-bar")
		this.progressSeek.addEventListener("click", this.seekToTime.bind(this))
	}

	timeupdate(event) {
		this.progressBar.style.width = this.player.currentTime / this.player.duration * 100 + "%"
	}

	seekToTime(x) {
		console.log(x)
	}

	togglePlay() {
		if (this.player.paused) {
			this.player.play()
			this.setAttribute("play", true)
		} else {
			this.player.pause()
			this.setAttribute("play", false)
		}
	}

	getRecordPreview() {
		const template = `
			<style>
			.record__wrapper {
				width:100px;
				height:100px;
				border-radius:50%;
				position:relative;
				transform: translate3d(30px,-20px, 0) scale(1);
				transition: transform .2s ease-in;
				transform-origin:center;
			}
			.record__wrapper:before {
				content:"";
				position:absolute;
				width:20px;
				height:20px;
				border-radius:50%;
				background-color:white;
				margin:auto;
				left:0px;
				right:0px;
				top:0px;
				bottom:0px;
				box-shadow: 0px 5px 10px rgba(0,0,0,0.2);
				z-index:2
			}
			.record__wrapper.playing {
				transform: translate3d(30px,-30px, 0) scale(1.2);
				transition: transform .2s ease-in;
				will-change: auto;
			}
			.audio__record {
				background-image: url(${this.config.poster ? this.config.poster : 'icons/record.svg'});
				background-position:center;
				background-size: cover;
				width:100px;
				height:100px;
				border-radius:50%;
				will-change: auto;
				transform-origin:center;
			}
			.audio__record.spin {
				animation: spin infinite 2s linear;
			}

			@keyframes spin {
				from {
					transform: rotate(-360deg);
				}
			}
			</style>
			<div class="record__wrapper">
				<div class="audio__record">

				</div>
			</div>
		`

		return template;
	}

	getPlayerStatus() {
		const template = `
			<style>
				.player__status {
					height: 90px;
					background: rgba(255,255,255, 0.5);
					width: 95%;
					position: absolute;
					z-index: -1;
					transition: transform .5s ease-in-out;
					transform: translateY(0%) scale(0.8);
					border-radius: 10px;
					margin: auto;
					left: 0px;
					right: 0px;
					padding-left:170px;
					box-sizing:border-box;
				}
				.player__status.open {
					transition: transform .5s ease-in-out;
					transform: translateY(-65%) scale(1);
				}
				.artist__name {
					padding:10px 0;
					font-family:inherit;
				}
				.progress-bar {
					position:relative;
					width:90%;
					height:5px;
					border-radius:5px;
					background-color:rgba(0,0,0,.1);
				}
				.progress-bar__width {
					position:absolute;
					left:0px;
					top:0;
					bottom:0px;
					transition: width .2s linear;
					border-radius:5px;
					width:50px;
					background-color:red;
				}
			</style>
			<div class="player__status">
					<div class="artist__name">Artist Name...</div>
					<div class="progress-bar">
						<span class="progress-bar__width"></span>
					</div>
			</div>
		`

		return template
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log(name, newValue)
		const playPause = this.shadow.querySelector(".play")
		const audioRecord = this.shadow.querySelector(".audio__record")
		const recordWrapper = this.shadow.querySelector(".record__wrapper")
		const playerStatus = this.shadow.querySelector(".player__status")

		switch (name) {
			case "source":
				this.config.src = newValue
				if (this.player) {
					this.player.setAttribute("src", newValue)
					this.player.load()
					this.togglePlay()
				}
				break

			case "play":
				playPause.src = (newValue == "true" ? "icons/pause.svg" : "icons/play-button.svg")

				if (newValue == "true") {
					audioRecord.classList.add("spin")
					recordWrapper.classList.add("playing")
					playerStatus.classList.add("open")
				} else {
					audioRecord.classList.remove("spin")
					recordWrapper.classList.remove("playing")
					playerStatus.classList.remove("open")
				}

				break

			default:
				break
		}


	}

}

window.customElements.define("audio-player", AudioPlayer)
