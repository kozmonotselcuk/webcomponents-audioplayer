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
		this.progress = null
		this.player = null
	}

	connectedCallback() {
		let template = `
			<style>
				:host {
					all: initial;
				}
				.audio-wrapper, .audio-container {
					background: white;
					width:400px;
					height:90px;
					border-radius:10px;
					position:relative;
					box-shadow: 0px 10px 20px rgba(0,0,0,0.2);
					display:flex;
					justify-content:flex-start;
				}

				.audio-container {
					z-index:2;
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
			<div class="audio-wrapper">

				${this.getPlayerStatus()}
				${this.getPlaylist()}

				<div class="audio-container">

					${this.getRecordPreview()}
		
					<div class="button__container">
						<img class="media-buttons previous" src="icons/skip_previous.svg" alt="skip previous"/>
						<img class="media-buttons play" src="icons/play-button.svg" alt="play/pause"/>
						<img class="media-buttons next" src="icons/skip_next.svg" alt="skip next"/>
						<img class="media-buttons list" src="icons/list.svg" alt="playlist"/>
					</div>

					<audio 
						style="display:none";
						class="audio-player" 
						preload="auto"
						src=${this.config.src}
					/>
				</div>
			</div>
		`
		this.shadow.innerHTML = template
		this.player = this.shadow.querySelector(".audio-player")
		this.getPlayListItem()

		this.registerEvents();
	}

	get source() {
		return this.getAttribute("source")
	}

	set source(val) {
		this.setAttribute("source", val)
	}

	get list() {
		return this.getAttribute("list")
	}

	set list(list) {
		this.hasAttribute("list")
	}

	static get observedAttributes() {
		return ["source", "mute", "play", "list"]
	}

	disconnectedCallback() {
		this.shadow.querySelector(".play").removeEventListener("click", this.togglePlay.bind(this))
		this.shadow.querySelector(".audio-player").removeEventListener("timeupdate", this.timeupdate.bind(this))
		this.shadow.querySelector(".audio-player").removeEventListener("ended", this.ended.bind(this))
		this.playListBtn.removeEventListener("click", this.openPlayList.bind(this))
		this.progressSeek.removeEventListener("click", this.seekToTime.bind(this))
		this.shadow.querySelector(".audio__list").removeEventListener("click", this.setPlayingItem.bind(this))
	}

	registerEvents() {
		this.shadow.querySelector(".play").addEventListener("click", this.togglePlay.bind(this))
		this.shadow.querySelector(".audio-player").addEventListener("timeupdate", this.timeupdate.bind(this))
		this.shadow.querySelector(".audio-player").addEventListener("ended", this.ended.bind(this))
		this.progressBar = this.shadow.querySelector(".progress-bar__width")
		this.progressSeek = this.shadow.querySelector(".progress-bar")

		this.playListBtn = this.shadow.querySelector(".list")
		this.playListBtn.addEventListener("click", this.openPlayList.bind(this))

		this.progressSeek.addEventListener("click", this.seekToTime.bind(this))

		this.shadow.querySelector(".audio__list").addEventListener("click", this.setPlayingItem.bind(this))

		if (this.source == "") {
			const l = this.getListItems();
			this.source = l[0]
		}
	}

	setPlayingItem(item) {
		this.source = item.target.getAttribute("source")
		this.player.load()
		this.player.play()
	}

	openPlayList() {
		const playlist = this.shadow.querySelector(".playlist")
		if (playlist.classList.contains("open")) {
			playlist.classList.remove("open")
		} else {
			playlist.classList.add("open")
		}
	}

	ended() {
		this.player.pause()
		this.setAttribute("play", false)
	}

	timeupdate(event) {
		this.progressBar.style.width = this.player.currentTime / this.player.duration * 100 + "%"
	}

	seekToTime(x) {
		const percent = x.offsetX / this.progressSeek.clientWidth

		this.player.currentTime = percent * this.player.duration
	}

	togglePlay() {
		if (this.source !== "" && this.player.readyState !== 0) {
			if (this.player.paused) {
				this.player.play()
				this.setAttribute("play", true)
			} else {
				this.player.pause()
				this.setAttribute("play", false)
			}
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
					z-index: 1;
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
					transition: width .1s linear;
					border-radius:5px;
					width:0px;
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

	getPlaylist() {
		const template = `
			<style>
				.playlist {
					height: 90px;
					background: rgba(255,255,255, 0.5);
					width: 95%;
					height:0;
					position: absolute;
					z-index: 1;
					transition: all .5s ease-in-out;
					transform: translateY(0px);
					border-radius: 10px;
					margin: auto;
					left: 0px;
					right: 0px;
					bottom:5px;
					opacity:0;
					box-sizing:border-box;
					padding: 20px 10px;
					overflow-y: auto;
				}
				.playlist.open {
					transition: all .5s ease-in-out;
					transform: translateY(100%);
					height:250px;
					opacity:1;
				}
				.audio__item {
					padding:10px;
					margin-bottom:10px;
					transition: background-color .2s ease-in;
					font-size:14px;
					border-radius:10px;
				}
				.audio__item div.active {

				}
				.audio__item:hover {
					transition: background-color .2s ease-in;
					background-color:whitesmoke;
					color:#252525;
					cursor:pointer;
					border-radius:10px;
				}
			</style>
			<div class="playlist">

			</div>
		`
		return template
	}

	getListItems() {
		return this.list.split(",")
	}

	getPlayListItem() {
		const div = document.createElement("div")
		div.classList.add("audio__list")
		for (const item of this.getListItems()) {
			const d = document.createElement("div")
			d.setAttribute("source", item.trim())
			d.classList.add("audio__item")
			d.innerText = item
			div.appendChild(d)
		}

		this.shadow.querySelector(".playlist").appendChild(div)
	}

	attributeChangedCallback(name, oldValue, newValue) {
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

			case "list":
				this.list = Array.from(newValue.split(","))
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
