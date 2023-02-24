import puppeteer from 'puppeteer'
import koa from 'koa'
import koaRouter from '@koa/router'
import fs from 'fs'

const app = new koa()
const router = new koaRouter()

router.post('/update/:id', async ctx => {
  ctx.status = 200
  const start = async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
	
	console.log(`START`)
	
	const date = ctx.params.id;
	
	console.log(date)
	
    const page = await browser.newPage()
	await page.goto('https://btfscores.com/', {
		waitUntil: "domcontentloaded"
	});
	await page.hover('#today')
	await page.waitForSelector('.ddDate')
	await page.click('li[data-date="'+date+'"]')
	
	const data = await page.evaluate(() => {
		const result = []
		for (const tr of document.querySelectorAll('#table_1 > tbody > tr.ls-row')) {
		  const row = {}
		  const odds = []
		  let oddscounter = 0
		  for (const td of tr.querySelectorAll('td')) {
			  if(td.classList.contains('time-sc')) {
				  row['kickoff'] = td.textContent
			  }
			  
			  if(td.classList.contains('status-sc')) {
				  row['status'] = td.textContent
			  }
			  
			  if(td.classList.contains('team-1')) {
				  row['home'] = td.textContent
			  }
			  
			  if(td.classList.contains('team-2')) {
				  row['away'] = td.textContent
			  }
			  
			  if(td.classList.contains('result-score')) {
				  row['score'] = td.textContent
			  }
			  
			  console.log(row['home'] + ' - ' + row['away'])
		  }
		  
		  result.push(row)
		}
		
		return result
    })
	
	console.log(`END`)
	
    fs.writeFile('data.json', JSON.stringify(data), 'utf-8', () => console.log(`Writing data.json`))
    await browser.close()
    return data
  }
  ctx.body = await start()
  // ctx.body = start()
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(process.env.PORT || 3000, () => console.log(`App listening on: localhost:3000`))
