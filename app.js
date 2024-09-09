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
      headless: true,
	  args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'],
    })
	
	console.log(`START`)
	
	const date = ctx.params.id;
	
	console.log(date)
	
    const page = await browser.newPage()
	await page.goto('https://btfscores.com/');
	
	await page.waitForTimeout(5000);
	
	console.log('a');
	
	// Step 1: Hover over the #today element to trigger the dropdown
	await page.hover('#today');
  console.log('Hovered over the Today element to show dropdown.');
  
  // Step 2: Add a short delay after hover to allow the dropdown to appear
  await page.waitForTimeout(1000);  // Adding 1 second delay (adjust as needed)

  // Step 3: Wait for the dropdown UL to become visible
  await page.waitForSelector('ul.ddDate', { visible: true });
  console.log('Dropdown is visible.');

  // Step 4: Add another small delay to ensure that the list is ready for interaction
  await page.waitForTimeout(500);  // Adding a half-second delay before clicking

  // Step 5: Click the LI element with data-date="2024-09-08"
  await page.evaluate(() => {
    const liElement = document.querySelector('li[data-date="2024-09-08"]');
    if (liElement) {
	console.log('Date element clicked.');
      liElement.click();
      console.log('Date element clicked.');
    } else {
      console.log('Date element not found.');
    }
  });
	  
	await page.waitForTimeout(5000);
	
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

    await browser.close()
    return data
  }
  ctx.body = await start()
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(process.env.PORT || 3000, () => console.log(`App listening on: localhost:3000`))
