const d = document
const $ = (selector) => d.querySelector(selector)
const audios = {}
let currentAudio = {};
let volume = 100;

const $playButton = $('.loadButton')
const $swiperWrapper = $('.swiper-wrapper')
const $progressBar = $('.progressBar')
const $progressTime = $('.progressTime')
const $durationTime = $('.durationTime')
const $volumeBar = $('.volumeBar')
const $volumeValue = $('.volumeValue')
const $volumeIcon = $('.volumeIcon ion-icon')

const getHumanTime = (time) => {
  if (isNaN(time)) return '00:00'

  let minutes = Math.floor(time / 60);
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let seconds = Math.floor(time % 60);
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${minutes}:${seconds}`
}

$progressBar.addEventListener('change', ({ target }) => {
  if (currentAudio.audio instanceof Audio) {
    currentAudio.audio.currentTime = target.value;
  }
})

$volumeBar.addEventListener('change', ({ target }) => {
  volume = Number(target.value)

  if (currentAudio.audio instanceof Audio) {
    currentAudio.audio.volume = volume / 100
  }

  $volumeIcon.setAttribute(
    'name',
    volume === 0
      ? 'volume-mute-outline'
      : volume < 30
        ? 'volume-low-outline'
        : volume < 60
          ? 'volume-medium-outline'
          : 'volume-high-outline'
  )

  $volumeValue.textContent = `${volume}%`;
})

$playButton.addEventListener('click', () => {
  fetch('./welcome.html')
    .then(res => res.text())
    .then(html => {
      $('.load').remove()
      d.body.insertAdjacentHTML('afterbegin', html)
    })
});

const updateCurrentAudio = (audio, info) => {
  if (info.id === currentAudio.id) {
    currentAudio.audio.paused
      ? currentAudio.audio.play()
      : currentAudio.audio.pause()
    return
  }

  if (currentAudio.audio instanceof Audio) {
    currentAudio.audio.pause()
  }

  $durationTime.textContent = getHumanTime(audio.duration)
  $progressBar.setAttribute('max', Math.floor(audio.duration))
  currentAudio = { ...info, audio }
  currentAudio.audio.currentTime = 0;
  currentAudio.audio.play()
}

const loadAudio = (info, $playButton, $cardImg) => {
  const audio = new Audio(info.path)

  audio.onloadstart = () => $cardImg.classList.add('loading');

  audio.onloadeddata = () => {
    $cardImg.classList.remove('loading');
    audio.volume = volume / 100;

    audio.addEventListener('pause', () => {
      $playButton.querySelector('ion-icon').name = 'play-outline'
    })
  
    audio.addEventListener('play', () => {
      $playButton.querySelector('ion-icon').name = 'pause-outline'
    })
  
    audio.addEventListener('timeupdate', () => {
      $progressTime.textContent = getHumanTime(audio.currentTime)
      $progressBar.value = Math.floor(audio.currentTime)
    })

    updateCurrentAudio(audio, info)
  }

  return audio
}

const Card = (audioInfo) => {
  const { thumbnail, title, artist } = audioInfo
  let audio = null;

  const $card = d.createElement('div');
  $card.className = 'swiper-slide';

  $card.innerHTML = `
  <figure class="card">
    <div class="cardImg">
      <img src="${thumbnail}" />
    </div>
    <div class="cardControl">
      <figcaption>
        ${title}
        <span>
        ${artist}
        </span>
      </figcaption>
      <div class="cardPlay">
        <ion-icon name="play-outline"></ion-icon>
      </div>
    </div>
  </figure>
  `;

  const $cardImg = $card.querySelector('.cardImg');
  const $playButton = $card.querySelector('.cardPlay');

  $playButton.addEventListener('click', () => {
    if (audio === null) {
      return audio = loadAudio(audioInfo, $playButton, $cardImg)
    } 

    updateCurrentAudio(audio, audioInfo)
  })

  return $card;
}

fetch('./data.json')
  .then(res => res.json())
  .then(audios => {
    audios.forEach(audio => {
      $swiperWrapper.appendChild(Card(audio))
    })
  })