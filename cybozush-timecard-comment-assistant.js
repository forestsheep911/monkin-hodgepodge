/* global garoon */

import { post } from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

// Make a request for a user with a given ID
async function modifyComment(commentString, dateString) {
  const bodyFormData = `csrf_ticket=${garoon.base.request.getRequestToken()}&remarks=${commentString}&date=${dateString}`
  await post('/g/timecard/command_modify.csp?', bodyFormData)
  // console.log(r)
}

// modifyComment('几点上班，几点下班', '2021-11-24')
function commitComment(date) {
  return async () => {
    await modifyComment('按下今天按钮了', date)
    window.location.reload()
  }
}
function clearComment(date) {
  return async () => {
    await modifyComment('', date)
    window.location.reload()
  }
}

function savePreComment() {
  return () => {
    const theTextArea = document.getElementById('preCommentInputForm')
    const splitStringArray = theTextArea.value.split('\n')
    localStorage.pre_save_comment = JSON.stringify(splitStringArray)
  }
}

function editTable() {
  const timeCardTable = document.getElementsByClassName('timecard')
  if (timeCardTable.length === 0) {
    throw new Error('元素定位失败，取消执行其他操作')
  }
  const yearMonthReg = /\d{4}-\d+/
  const yearMonthRegExecResult = yearMonthReg.exec(window.location.search)
  if (yearMonthRegExecResult.length === 0) {
    return
  }
  const yyyymm = yearMonthRegExecResult[0]
  // console.log(timeCardTable[0])
  const timeCardtbody = timeCardTable[0].children[0]
  // console.log(timeCardtbody)
  const timeCardAllRows = timeCardtbody.children
  // console.log(timeCardAllRows)
  for (let i = 0; i < timeCardAllRows.length; i += 1) {
    if (i === 0) {
      // console.log(timeCardAllRows[i].children[5])
      const thCopy = timeCardAllRows[i].children[5].cloneNode(true)
      thCopy.lastChild.innerText = '一键备注'
      timeCardAllRows[i].appendChild(thCopy)
    } else {
      const thisRowDate = `${yyyymm}-${i}`
      const exTd = document.createElement('td')
      exTd.setAttribute('nowrap', '')
      exTd.classList.add('s_date')
      exTd.classList.add('tAlignCenter-grn')
      timeCardAllRows[i].appendChild(exTd)
      const testBtn = document.createElement('button')
      testBtn.setAttribute('type', 'button')
      testBtn.setAttribute('class', 'btn btn-outline-success btn-sm')
      testBtn.style.paddingTop = '2px'
      testBtn.style.paddingBottom = '2px'
      const span = document.createElement('span')
      span.innerText = 1
      span.setAttribute('class', 'text-justify')
      testBtn.appendChild(span)
      testBtn.onclick = commitComment(thisRowDate)
      exTd.appendChild(testBtn)
      const clearBtn = document.createElement('button')
      clearBtn.setAttribute('type', 'button')
      clearBtn.setAttribute('class', 'btn btn-outline-danger btn-sm')
      clearBtn.style.paddingTop = '2px'
      clearBtn.style.paddingBottom = '2px'
      clearBtn.style.marginLeft = '6px'
      const span1 = document.createElement('span')
      span1.innerText = '清除'
      span1.setAttribute('class', 'text-justify')
      clearBtn.appendChild(span1)
      clearBtn.onclick = clearComment(thisRowDate)
      exTd.appendChild(clearBtn)
    }
  }
}

function initPreCommentStatement() {
  const insertAnchor = document.getElementsByClassName('margin_vert')
  if (insertAnchor.length === 0) {
    throw new Error('元素定位失败，取消执行其他操作')
  }
  const preCommentTextArea = document.createElement('div')
  preCommentTextArea.innerHTML = `
  <div class="mb-3">
    <label for="preCommentInputForm" class="form-label text-warning">
      请设置预设语句 换行分隔
    </label>
    <textarea class="form-control" id="preCommentInputForm" rows="5"></textarea>
  </div>
  `
  if (insertAnchor[0].parentNode) {
    insertAnchor[0].parentNode.insertBefore(preCommentTextArea, insertAnchor[0])
  }

  const saveCommentBtn = document.createElement('button')
  saveCommentBtn.setAttribute('type', 'button')
  saveCommentBtn.setAttribute('class', 'btn btn-outline-primary btn-sm')
  saveCommentBtn.style.paddingTop = '2px'
  saveCommentBtn.style.paddingBottom = '2px'
  saveCommentBtn.innerText = 'Save'
  saveCommentBtn.onclick = savePreComment()
  preCommentTextArea.appendChild(saveCommentBtn)
  if (preCommentTextArea.parentNode) {
    preCommentTextArea.parentNode.insertBefore(saveCommentBtn, preCommentTextArea.nextSibling)
  }
}

function exec() {
  try {
    initPreCommentStatement()
    editTable()
  } catch (e) {
    console.log(e)
  }
}

exec()
