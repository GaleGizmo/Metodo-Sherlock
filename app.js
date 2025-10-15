const HEADLINES_URL = 'headlines.json'

let headlines = []
let index = 0

const headlineText = document.getElementById('headlineText')
const imageSlot = document.getElementById('imageSlot')
const progress = document.getElementById('progress')
const modal = document.getElementById('resultModal')
const truthLabel = document.getElementById('truthLabel')
const percentagesEl = document.getElementById('percentages')
const nextBtn = document.getElementById('nextBtn')
const prevBtn = document.getElementById('prevBtn')
const nextNavBtn = document.getElementById('nextNavBtn')
const voteArea = document.getElementById('voteArea')
const postVote = document.getElementById('postVote')
const yourVoteLabel = document.getElementById('yourVoteLabel')
const showStatsBtn = document.getElementById('showStatsBtn')

function formatCaseNumber(i){
  return `CASO ${i+1}`
}

function loadHeadlines(){
  fetch(HEADLINES_URL).then(r=>r.json()).then(data=>{
    headlines = data
    render()
  }).catch(e=>{
    console.error(e)
    headlines = []
    render()
  })
}

function render(){
  if(!headlines.length){
    headlineText.textContent = 'No hay titulares disponibles.'
    progress.textContent = '0 / 0'
    return
  }

  const h = headlines[index]
  // show compact info in the top bar title: "CASO N: TOPIC"
  const topTitle = document.querySelector('.top-bar .title')
  if(topTitle){
    topTitle.textContent = `${formatCaseNumber(index)}: ${h.topic || ''}`
  }
  headlineText.textContent = h.text
  // placeholder image text
  imageSlot.textContent = h.imageLabel || ''
  progress.textContent = `${index+1} / ${headlines.length}`

  // check local vote
  const stored = localStorage.getItem(getStorageKey(h.id))
  const validVotes = ['true','false','doubt']
  if(validVotes.includes(stored)){
    // show post-vote UI
    if(voteArea){
      voteArea.querySelector('.buttons').style.display = 'none'
      postVote.style.display = 'flex'
      // map to friendly label
      const map = { true: 'VERDADERO', false: 'FALSO', doubt: 'DUDOSO' }
      yourVoteLabel.textContent = map[stored]
    }
  } else {
    if(voteArea){
      voteArea.querySelector('.buttons').style.display = 'flex'
      postVote.style.display = 'none'
    }
  }
}

function getStorageKey(id){ return `ms_vote_${id}` }

function handleChoice(choice){
  const h = headlines[index]
  // store vote locally
  try{ localStorage.setItem(getStorageKey(h.id), choice) }catch(e){}
  // update UI to post-vote
  if(voteArea){
    voteArea.querySelector('.buttons').style.display = 'none'
    postVote.style.display = 'flex'
    yourVoteLabel.textContent = choice.toUpperCase()
  }

  // compute percentages combining seedCounts from JSON + local vote for demo
  const seed = h.seedCounts || {true:10,false:5,doubt:3}
  const local = {true:0,false:0,doubt:0}
  // for demo, count user's own vote as part of totals
  local[choice] = 1

  const totals = {
    true: seed.true + local.true,
    false: seed.false + local.false,
    doubt: seed.doubt + local.doubt
  }
  const sum = totals.true + totals.false + totals.doubt

  // show modal
  truthLabel.textContent = h.truth === 'true' ? 'VERDADERO' : (h.truth === 'false' ? 'FALSO' : 'DUDOSO')
  percentagesEl.innerHTML = ''

  const rows = [
    {k:'true',label:'VERDADERO',color:'var(--true)'},
    {k:'false',label:'FALSO',color:'var(--false)'},
    {k:'doubt',label:'DUDOSO',color:'var(--doubt)'}
  ]

  rows.forEach(r=>{
    const pct = sum ? Math.round((totals[r.k]/sum)*100) : 0
    const row = document.createElement('div')
    row.className = 'percent-row'
    row.innerHTML = `<div class="label">${r.label}</div><div class="bar"><i style="width:${pct}%;background:${r.color}"></i></div><div style="width:36px;text-align:right;font-weight:700">${pct}%</div>`
    percentagesEl.appendChild(row)
  })

  modal.setAttribute('aria-hidden','false')
}

function closeModal(){
  modal.setAttribute('aria-hidden','true')
}

function next(){
  closeModal()
  index = (index + 1) % headlines.length
  render()
}

// wire buttons
// only wire the voting buttons (others are separate)
document.querySelectorAll('.buttons .btn').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const choice = btn.getAttribute('data-choice')
    handleChoice(choice)
  })
})

// show statistics for already voted headline
if(showStatsBtn){
  showStatsBtn.addEventListener('click', ()=>{
    // compute and show modal for current headline
    const h = headlines[index]
    // simulate calling handleChoice with stored choice to compute percentages without re-saving
    const stored = localStorage.getItem(getStorageKey(h.id)) || null
    if(stored){
      // compute percentages using stored
      const seed = h.seedCounts || {true:10,false:5,doubt:3}
      const local = {true:0,false:0,doubt:0}
      local[stored] = 1
      const totals = { true: seed.true + local.true, false: seed.false + local.false, doubt: seed.doubt + local.doubt }
      const sum = totals.true + totals.false + totals.doubt
      truthLabel.textContent = h.truth === 'true' ? 'VERDADERO' : (h.truth === 'false' ? 'FALSO' : 'DUDOSO')
      percentagesEl.innerHTML = ''
      const rows = [ {k:'true',label:'VERDADERO',color:'var(--true)'}, {k:'false',label:'FALSO',color:'var(--false)'}, {k:'doubt',label:'DUDOSO',color:'var(--doubt)'} ]
      rows.forEach(r=>{
        const pct = sum ? Math.round((totals[r.k]/sum)*100) : 0
        const row = document.createElement('div')
        row.className = 'percent-row'
        row.innerHTML = `<div class="label">${r.label}</div><div class="bar"><i style="width:${pct}%;background:${r.color}"></i></div><div style="width:36px;text-align:right;font-weight:700">${pct}%</div>`
        percentagesEl.appendChild(row)
      })
      modal.setAttribute('aria-hidden','false')
    }
  })
}

// navigation buttons
if(prevBtn){ prevBtn.addEventListener('click', ()=>{ index = (index - 1 + headlines.length) % headlines.length; render() }) }
if(nextNavBtn){ nextNavBtn.addEventListener('click', ()=>{ index = (index + 1) % headlines.length; render() }) }

nextBtn.addEventListener('click', next)

// close modal when clicking outside content
modal.addEventListener('click', e=>{
  if(e.target === modal) closeModal()
})

loadHeadlines()
