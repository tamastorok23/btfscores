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
  console.log('Hovering over #btabDate element...');
  await page.hover('#btabDate');

  // Step 2: Add a small delay to ensure the hover has triggered the dropdown
  await page.waitForTimeout(2000); // Give more time after hover
  console.log('Hover complete, waiting for dropdown to become visible...');

  // Step 3: Wait for the dropdown UL to become visible and verify it's displayed
  const dropdownVisible = await page.waitForSelector('ul.ddDate', { visible: true, timeout: 5000 }).catch(() => null);
  if (!dropdownVisible) {
    console.error('Dropdown did not become visible.');
    await browser.close();
    return;
  }
  console.log('Dropdown is visible.');

	await page.waitForSelector('[data-date="'+date+'"]');
	const btnAction = await page.$('[data-date="'+date+'"]');
	
	btnAction.click();

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
