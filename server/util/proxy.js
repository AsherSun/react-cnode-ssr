const axios = require('axios')
const qs = require('qs')
const baseUrl = 'http://cnodejs.org/api/v1'
module.exports = async (ctx, next) => {
  const path = ctx.request.path.slice(4)
  console.log('path', path)
  const user = ctx.session.user || {}
  const needAccessToken = ctx.request.needAccessToken

  if(needAccessToken && !user.accessToken) {
    ctx.status = 401
    ctx.body = {
      success: false,
      msg: 'need login'
    }
  }

  const query = Object.assign({}, ctx.request.query,{
    accesstoken: (needAccessToken && ctx.request.method === 'GET') ? user.accesstoken : ''
  })
  const data = Object.assign({}, ctx.request.body, {
    accesstoken: (needAccessToken && ctx.request.method === 'POST')? user.accessToken : ''
  })
  if (query.needAccessToken) delete query.needAccessToken;
  try {
    console.log(`${baseUrl}${path}`)
    let resp = await axios(`${baseUrl}${path}`, {
      method: ctx.request.method,
      params: query,
      data: qs.stringify(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if(resp.status === 200) {
      ctx.body = resp.data
    } else {
      ctx.status = resp.status
      ctx.body = resp.data
    }
  }catch(err){
    if (err.response) {
      ctx.status = 500
      ctx.body = err.response.data
    } else {
      ctx.status = 500
      ctx.body = {
        success: false,
        msg: '未知错误'
      }
    }
  }
}

