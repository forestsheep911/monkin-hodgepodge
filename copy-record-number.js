// ==UserScript==
// @name         copy kintone record number
// @namespace    https://github.com/forestsheep911/monkin-hodgepodge/blob/main/copy-record-number.js
// @version      0.1
// @description  find field code
// @author       bxu
// @run-at       document-end
// @match        https://*.cybozu.cn/k/*/show*
// @match        https://*.cybozu.com/k/*/show*
// @match        https://*.cybozu-dev.com/k/*/show*
// @match        https://*.kintone.com/k/*/show*
// @match        https://*.s.cybozu.cn/k/*/show*
// @match        https://*.s.cybozu.com/k/*/show*
// @match        https://*.s.kintone.com/k/*/show*
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11.1.2/dist/sweetalert2.all.min.js
// @icon         https://img.icons8.com/doodle/48/000000/bread--v1.png
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";
  GM_addStyle(`
    #swal2-title {
        text-align: center;
    }
  `)
  const params = {
    app: kintone.app.getId(),
    lang: "user",
  };
  async function getFields() {
    const res = await kintone.api(
      kintone.api.url("/k/v1/app/form/fields.json", true),
      "GET",
      params
    );
    return res;
  }

  async function getRecordNumberFieldCode() {
    const fieldStruct = await getFields();
    let rtn;
    Object.keys(fieldStruct.properties).forEach((key) => {
      if (fieldStruct.properties[key].type === "RECORD_NUMBER") {
        rtn = fieldStruct.properties[key].code;
      }
    });
    return rtn;
  }

  kintone.events.on("app.record.detail.show", async function (event) {
    const jlbh = await getRecordNumberFieldCode();
    const recordNumber = event.record[jlbh].value;
    const ptnStartWithNumber = /^\d/;
    const matchStartWithNumber = ptnStartWithNumber.exec(recordNumber);
    if (matchStartWithNumber) {
      console.log(4959);
      return event;
    }
    console.log(23423);
    const breadcrumbLastItem = document.getElementsByClassName(
      "gaia-argoui-breadcrumb-appbreadcrumbpath"
    );
    if (breadcrumbLastItem) {
      const button = document.createElement("button");
      button.innerText = "copy record number";
      button.style.marginTop = "5px";
      button.style.marginLeft = "5px";
      button.style.border = "none";
      button.style.color = "white";
      button.style.backgroundColor = "rgb(66, 201, 211)";
      button.onclick = async () => {
        await navigator.clipboard.writeText(recordNumber);
        Swal.fire({
          title: "copied",
          toast: true,
          position: "bottom",
          showConfirmButton: false,
          width: 120,
          hight: 60,
          padding: `0em`,
          timer: 3000,
        });
      };
      breadcrumbLastItem[0].appendChild(button);
    }
    return event;
  });
})();
