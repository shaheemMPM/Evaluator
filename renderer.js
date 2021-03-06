const {ipcRenderer} = require('electron')

const btnOpen = document.getElementById('btnOpen')
const fileName = document.getElementById('filename')
const ipNoQue = document.getElementById('ipNoQue')
const corRes = document.getElementById('corRes')
const ipNoJunk = document.getElementById('ipNoJunk')
const btnEvaluate = document.getElementById('btnEvaluate')

let renderColumns = (nos) => {
    let htmlStr = `<div class="columns">`
    for (let i = 1; i <= nos; i++) {
        let tempCol = `<div class="column"><input type="text" placeholder="${i}" id="ans${i}" class="input res-ip"></div>`
        htmlStr += tempCol
        if (i%10 === 0 && i !== nos) {
            htmlStr += `</div><div class="columns">`
        }
    }
    htmlStr += `</div>`
    corRes.innerHTML = htmlStr
}

btnOpen.addEventListener('click', () => {
    ipcRenderer.send('asynchronous-message', 'openDialog') 
})

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    fileName.innerText = arg
})

ipcRenderer.on('success-reply', (event, arg) => {
    alert(`Result File Downloaded in ${arg}`)
    window.location.reload()
})

ipNoQue.addEventListener('input', () => {
    let noQue = Number(ipNoQue.value)
    renderColumns(noQue)
})

btnEvaluate.addEventListener('click', () => {
    if (Number(ipNoQue.value) > 0 && Number(ipNoJunk.value) < Number(ipNoQue.value)) {
        let ansList = []
        for (let i = 1; i <= Number(ipNoQue.value); i++) {
            const temRef = document.getElementById(`ans${i}`)
            if (temRef.value.length > 1) {
                alert('Invalid input found')
                temRef.value = ''
                return
            }else {
                temRef.value = temRef.value.toUpperCase()
                if (temRef.value === 'A' || temRef.value === 'B' || temRef.value === 'C' || temRef.value === 'D') {
                    ansList.push(temRef.value)
                } else {
                    alert('Invalid input found')
                    temRef.value = ''
                    return
                }
            }
        }
        let data = {
            noQues: Number(ipNoQue.value),
            noJunk: Number(ipNoJunk.value),
            answer: ansList
        }
        if (data.answer.length !== Number(ipNoQue.value)){
            alert("Enter Answers of all questions")
            return
        }else {
            if (filename.innerText === '') {
                alert("Select a response xlsx file first")
            }else {
                ipcRenderer.send('data-channel', data)
            }
        }
    }else {
        alert('Input miss match found')
    }
})