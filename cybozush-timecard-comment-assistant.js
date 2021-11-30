// ==UserScript==
// @name         才望子上海打卡
// @namespace    https://github.com/forestsheep911/monkin-hodgepodge/blob/main/tempsss
// @version      0.1
// @description  通过预制文本，快速备注。免除备注一次刷两个画面的烦恼。还有增量备注和清除功能。
// @author       bxu
// @run-at       document-end
// @match        https://cybozush.cybozu.cn/g/timecard/index.csp*
// @require      https://cdn.jsdelivr.net/npm/axios@0.24.0/dist/axios.min.js
// @resource     mycss https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css
// @icon         https://img.icons8.com/plasticine/50/000000/timer.png
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* global garoon */
/* global axios */
(function () {
  "use strict";
  GM_addStyle(GM_getResourceText("mycss"));

  async function modifyComment(commentString, dateString) {
    const bodyFormData = `csrf_ticket=${garoon.base.request.getRequestToken()}&remarks=${commentString}&date=${dateString}`;
    await axios.post("/g/timecard/command_modify.csp?", bodyFormData);
  }

  function commitComment(date, commentConetent, oldComment, appendCheckbox) {
    return async () => {
      let finnalCommitComment = null;
      if (appendCheckbox.checked) {
        finnalCommitComment = `${oldComment}  ${commentConetent}`;
      } else {
        finnalCommitComment = commentConetent;
      }
      await modifyComment(finnalCommitComment, date);
      window.location.reload();
    };
  }

  function clearComment(date) {
    return async () => {
      await modifyComment("", date);
      window.location.reload();
    };
  }

  function loadPreinputComment() {
    const theTextArea = document.getElementById("preCommentInputForm");
    if (localStorage.pre_save_comment) {
      const commentJson = JSON.parse(localStorage.pre_save_comment);
      theTextArea.value = commentJson.join("\n");
    }
  }

  function savePreinputComment(commitPreCommentHint) {
    return () => {
      const theTextArea = document.getElementById("preCommentInputForm");
      const splitStringArray = theTextArea.value.split("\n");
      localStorage.pre_save_comment = JSON.stringify(splitStringArray);
      const clonePara = commitPreCommentHint;
      clonePara.innerText = "保存成功";
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };
  }

  function selectAppendCheckAll() {
    return () => {
      const checkboxEles = document.getElementsByClassName("rowsCheckbox");
      for (let i = 0; i < checkboxEles.length; i += 1) {
        checkboxEles[i].checked = !checkboxEles[i].checked
      }
    };
  }

  function editTimeSheet() {
    const timesheetEles = document.getElementsByClassName("timecard");
    if (timesheetEles.length === 0) {
      throw new Error("表格元素定位失败，取消执行其他操作");
    }
    const yearMonthEles = document.getElementsByClassName("margin_vert");
    if (yearMonthEles.length === 0) {
      throw new Error("年月元素定位失败，取消执行其他操作");
    }
    const yearMonthMetaString = yearMonthEles[0].innerText;
    const yearMonthReg = /(\d{4})\D+(\d+)/;
    const yearMonthRegExecResult = yearMonthReg.exec(yearMonthMetaString);
    if (yearMonthRegExecResult.length < 3) {
      throw new Error("获取年月失败，取消执行其他操作");
    }
    const yyyy = yearMonthRegExecResult[1];
    const mm = yearMonthRegExecResult[2];
    const timeCardtbody = timesheetEles[0].children[0];
    const timeCardAllRows = timeCardtbody.children;
    for (let i = 0; i < timeCardAllRows.length; i += 1) {
      if (i === 0) {
        const newColHead = timeCardAllRows[i].children[5].cloneNode(true);
        newColHead.lastChild.innerText = "追加而不是替换";
        timeCardAllRows[i].appendChild(newColHead);
        const appendCheckboxHead = document.createElement("input");
        appendCheckboxHead.setAttribute("type", "checkbox");
        appendCheckboxHead.setAttribute("class", "form-check-input");
        appendCheckboxHead.setAttribute("id", "appendCheckbox");
        appendCheckboxHead.style.display = "inline-block";
        appendCheckboxHead.style.marginRight = "12px";
        newColHead.insertBefore(appendCheckboxHead, newColHead.firstChild);
      } else {
        const oldComment = timeCardAllRows[i].children[5].innerText;
        const thisRowDate = `${yyyy}-${mm}-${i}`;
        const commentBtnTd = document.createElement("td");
        commentBtnTd.setAttribute("nowrap", "");
        commentBtnTd.classList.add("s_date");
        commentBtnTd.classList.add("tAlignCenter-grn");
        timeCardAllRows[i].appendChild(commentBtnTd);
        const appendCheckboxRow = document.createElement("input");
        appendCheckboxRow.setAttribute("type", "checkbox");
        appendCheckboxRow.setAttribute("class", "form-check-input rowsCheckbox");
        appendCheckboxRow.style.display = "inline-block";
        appendCheckboxRow.style.marginRight = "12px";
        appendCheckbox.onclick = selectAppendCheckAll();
        commentBtnTd.appendChild(appendCheckboxRow);
        const commentJson = JSON.parse(localStorage.pre_save_comment);
        for (let j = 0; j < commentJson.length; j += 1) {
          if (commentJson[j] !== "") {
            const commitPreCommentBtn = document.createElement("button");
            commitPreCommentBtn.setAttribute("type", "button");
            commitPreCommentBtn.setAttribute(
              "class",
              "btn btn-outline-success btn-sm"
            );
            commitPreCommentBtn.style.paddingTop = "2px";
            commitPreCommentBtn.style.paddingBottom = "2px";
            commitPreCommentBtn.style.marginRight = "2px";
            commitPreCommentBtn.innerText = j + 1;
            commitPreCommentBtn.setAttribute("data-toggle", "tooltip");
            commitPreCommentBtn.setAttribute("data-placement", "right");
            commitPreCommentBtn.setAttribute("title", commentJson[j]);
            commitPreCommentBtn.onclick = commitComment(
              thisRowDate,
              commentJson[j],
              oldComment,
              appendCheckboxRow
            );
            commentBtnTd.appendChild(commitPreCommentBtn);
          }
        }
        const clearBtn = document.createElement("button");
        clearBtn.setAttribute("type", "button");
        clearBtn.setAttribute("class", "btn btn-outline-danger btn-sm");
        clearBtn.style.paddingTop = "2px";
        clearBtn.style.paddingBottom = "2px";
        clearBtn.style.marginLeft = "6px";
        clearBtn.innerText = "清除";
        clearBtn.onclick = clearComment(thisRowDate);
        commentBtnTd.appendChild(clearBtn);
      }
    }
  }

  function initPreCommentStatement() {
    const insertAnchor = document.getElementsByClassName("margin_vert");
    if (insertAnchor.length === 0) {
      throw new Error("元素定位失败，取消执行其他操作");
    }

    const commitPreCommentHint = document.createElement("span");
    commitPreCommentHint.setAttribute("role", "alert");
    commitPreCommentHint.setAttribute("class", "alert alert-light");
    commitPreCommentHint.style.paddingTop = "2px";
    commitPreCommentHint.style.paddingBottom = "2px";
    commitPreCommentHint.style.marginLeft = "16px";

    const preCommentTextArea = document.createElement("div");
    preCommentTextArea.innerHTML = `
      <div class="mb-3">
        <label for="preCommentInputForm" class="form-label text-warning">
          请设置预设语句 换行分隔
        </label>
        <textarea class="form-control" id="preCommentInputForm" rows="5"></textarea>
      </div>
    `;
    if (insertAnchor[0].parentNode) {
      insertAnchor[0].parentNode.insertBefore(
        preCommentTextArea,
        insertAnchor[0]
      );
    }

    const saveCommentBtn = document.createElement("button");
    saveCommentBtn.setAttribute("type", "button");
    saveCommentBtn.setAttribute("class", "btn btn-outline-primary btn-sm");
    saveCommentBtn.style.paddingTop = "2px";
    saveCommentBtn.style.paddingBottom = "2px";
    saveCommentBtn.innerText = "Save";
    saveCommentBtn.onclick = savePreinputComment(commitPreCommentHint);
    preCommentTextArea.appendChild(saveCommentBtn);
    if (preCommentTextArea.parentNode) {
      preCommentTextArea.parentNode.insertBefore(
        commitPreCommentHint,
        preCommentTextArea.nextSibling
      );
      preCommentTextArea.parentNode.insertBefore(
        saveCommentBtn,
        preCommentTextArea.nextSibling
      );
    }
  }

  function exec() {
    try {
      initPreCommentStatement();
      loadPreinputComment();
      editTimeSheet();
    } catch (e) {
      console.log(e);
    }
  }

  exec();
})();
