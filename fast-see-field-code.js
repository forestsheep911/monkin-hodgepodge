// ==UserScript==
// @name         kintone不去管理界面便可查看字段code
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  如果想查看字段code，以前一定要去后台管理界面，只是简单的看一个要点很多次很不友好，现在只要把鼠标放到元素题目上就可以看了。如果有同名标题，只能显示多个code了。暂时不支持subtable
// @author       bxu
// @match        https://*.cybozu.cn/k/*/show*
// @icon         https://www.google.com/s2/favicons?domain=cybozu.cn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const params = {
        app: kintone.app.getId(),
    }

    async function getFields() {
        const rs = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', params)
        return rs
    }

    async function mainWork() {
        const objFields = await getFields()
        const eleCommonLabels = document.querySelectorAll('.control-label-gaia, .group-label-gaia, .subtable-label-gaia')
        for (let i = 0; i < eleCommonLabels.length; i += 1) {
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
                for (let j = 1; j < eleCommonLabels[i].childNodes.length; j += 1) {
                    eleCommonLabels[i].childNodes[j].remove()
                }
            }
        }
    }

    mainWork()

})();
