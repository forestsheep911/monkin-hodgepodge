// ==UserScript==
// @name         快速查看kintone字段代码
// @namespace    https://github.com/forestsheep911/monkin-hodgepodge/blob/main/fast-see-field-code.js
// @version      0.5
// @description  如果想查看字段code，以前一定要去后台管理界面，只是简单的看一个要点很多次很不友好，现在只要把鼠标放到元素题目上就可以看了。鼠标不动，单击就是拷贝code。如果有同名标题，只能显示多个code了。暂时不支持subtable。
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
// @icon         https://img.icons8.com/ios/50/000000/happy-eyes.png
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle(`
        #swal2-title {
            text-align: center;
        }
    `)
    const params = {
        app: kintone.app.getId(),
        lang: 'user',
      }
      
      async function getFields() {
        const res = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', params)
        return res
      }
      
      async function mainWork() {
        const objFields = await getFields()
        const eleCommonLabels = document.querySelectorAll('.control-label-gaia, .group-label-gaia')
        for (let i = 0; i < eleCommonLabels.length; i += 1) {
            eleCommonLabels[i].style.cursor = 'copy'
            eleCommonLabels[i].onmouseover = () => {
                const eleFieldCode = document.createElement('span')
                eleFieldCode.style.marginLeft = '20px'
                Object.keys(objFields.properties).forEach((key) => {
                    if (eleCommonLabels[i].innerText === objFields.properties[key].label) {
                        const textnodeFieldCodeContent = document.createElement('span')
                        textnodeFieldCodeContent.innerText = objFields.properties[key].code
                        textnodeFieldCodeContent.style.marginLeft = '20px'
                        textnodeFieldCodeContent.style.color = '#e35db6'
                        eleFieldCode.appendChild(textnodeFieldCodeContent)
                    }
                })
                eleCommonLabels[i].appendChild(eleFieldCode)
            }
            eleCommonLabels[i].onmouseout = () => {
                if (eleCommonLabels[i].childNodes.length > 1) {
                    eleCommonLabels[i].childNodes[1].remove()
                }
            }
            eleCommonLabels[i].onclick = async () => {
                if (eleCommonLabels[i].childNodes.length > 1) {
                    await navigator.clipboard.writeText(eleCommonLabels[i].childNodes[1].innerText)
                    Swal.fire({
                        title: 'copied',
                        toast: true,
                        position: 'bottom',
                        showConfirmButton: false,
                        width: 120,
                        hight: 60,
                        padding: `0em`,
                        timer: 3000,
                    })
                }
            }
        }
    }
    kintone.events.on('app.record.detail.show', function (event) {
        mainWork()
        return event
    })
})();
