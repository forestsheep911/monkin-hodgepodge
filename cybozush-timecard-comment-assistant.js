import { post, get } from 'axios'

// Make a request for a user with a given ID
async function modifyComment(scrf) {
  // const bodyFormData = new FormData()
  // bodyFormData.append('csrf_ticket', scrf)
  // bodyFormData.append('remarks', '上班吃饭下班睡觉')
  // bodyFormData.append('date', '2011-11-24')
  const bodyFormData = `csrf_ticket=${scrf}&remarks=上班吃饭下来吧&date=2021-11-24`
  const r = await post('/g/timecard/command_modify.csp?', bodyFormData, {
    // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  console.log(r)
}
get('/g/timecard/index.csp?date=2021-11-24')
  .then(function (response) {
    // handle success
    // console.log(response.data)
    // const csrfRegexExpress = /"CSRF_TICKET":"(\S+?)"/
    // const resultArray = csrfRegexExpress.exec(response.data)
    // if (resultArray[1]) {
    //   console.log(resultArray[1])
    modifyComment(garoon.base.request.getRequestToken())
    // }
  })
  .catch(function (error) {
    // handle error
    console.log(error)
  })
  .then(function () {
    // always executed
    console.log('okle')
  })
