import { test, expect } from '@playwright/test';
import { localInput, atDay } from '../shared/rental.js';
async function signIn(page){await page.goto('/signin-with-chatgpt?return_to=%2F');await expect(page.getByRole('heading',{name:/Good (morning|afternoon|evening)/})).toBeVisible();}
test('owner workspace renders, searches, navigates, and opens keyboard-accessible dialogs',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await signIn(page);await expect(page.getByText('Fleet at a glance')).toBeVisible();
  await page.screenshot({path:'outputs/renter-dashboard.png',fullPage:true});
  await page.getByRole('link',{name:'My fleet',exact:true}).click();await expect(page.getByRole('heading',{name:'Your fleet',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Bikes',exact:true}).click();await expect(page.getByRole('heading',{name:'Honda CB 150F'})).toBeVisible();await expect(page.getByRole('heading',{name:'Toyota Corolla',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Add vehicle',exact:true}).click();await expect(page.getByRole('dialog',{name:'Add a vehicle'})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link',{name:'Bookings',exact:false}).first().click();await expect(page.getByRole('heading',{name:'Bookings',exact:true})).toBeVisible();
  await page.getByRole('textbox',{name:'Search the current page'}).fill('Ali Hassan');await expect(page.locator('tbody tr').filter({hasNotText:'Ali Hassan'})).toHaveCount(0);await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.getByRole('textbox',{name:'Search the current page'}).fill('');
  await page.getByRole('link',{name:'Payments',exact:true}).click();await expect(page.getByRole('heading',{name:'Payments & deposits'})).toBeVisible();await expect(page.getByText('Manual ledger:',{exact:false})).toBeVisible();
  await page.getByRole('link',{name:'Availability',exact:true}).click();await expect(page.getByRole('heading',{name:'Availability calendar'})).toBeVisible();
  await page.getByRole('link',{name:'Customers',exact:true}).click();await expect(page.getByRole('heading',{name:'Customer directory',exact:false})).toBeVisible();
  await page.getByRole('link',{name:'Settings',exact:true}).click();await expect(page.getByRole('textbox',{name:'Business name',exact:true})).toHaveValue('Greenline Rentals');
  expect(errors).toEqual([]);
});
test('customer request reaches the owner, can be confirmed, and can be cancelled',async({page,context})=>{
  await signIn(page);const workspace=await(await page.request.get('/api/workspace')).json();
  const customer=await context.newPage();await customer.goto(`/book/${workspace.publicId}`);
  await expect(customer.getByRole('heading',{name:/A better way/})).toBeVisible();
  await customer.screenshot({path:'outputs/renter-booking-page.png',fullPage:true});
  await customer.getByRole('button',{name:'Request Suzuki Alto',exact:true}).click();
  const modal=customer.getByRole('dialog',{name:'Request Suzuki Alto'});await expect(modal).toBeVisible();
  await modal.getByLabel('Pickup · Pakistan time',{exact:true}).fill(localInput(atDay(20)));
  await modal.getByLabel('Return · Pakistan time',{exact:true}).fill(localInput(atDay(22)));
  await modal.getByLabel('Your full name').fill('Browser Test Customer');await modal.getByLabel('Phone number').fill('+92 300 999 8765');await modal.getByLabel('Email (optional)').fill('browser-test@example.com');
  await modal.getByRole('checkbox').check();await modal.getByRole('button',{name:'Send booking request'}).click();
  await expect(customer.getByRole('heading',{name:'Your request is on its way.'})).toBeVisible();
  await page.getByRole('button',{name:'Refresh workspace'}).click();await page.getByRole('link',{name:'Bookings',exact:false}).first().click();
  await page.getByRole('textbox',{name:'Search the current page'}).fill('Browser Test Customer');const row=page.locator('tbody tr').filter({hasText:'Browser Test Customer'}).filter({hasText:'Requested'}).first();await expect(row).toBeVisible();await row.getByRole('button',{name:/Open RN-/}).click();
  await page.getByRole('button',{name:'Confirm booking',exact:true}).click();await expect(page.getByRole('dialog').getByText('Confirmed',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cancel booking',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Cancel booking',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('tbody tr').filter({hasText:'Browser Test Customer'}).filter({hasText:'Cancelled'}).first()).toBeVisible();await customer.close();
});
test('mobile owner navigation and storefront have no horizontal page overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await signIn(page);await page.screenshot({path:'outputs/renter-dashboard-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('link',{name:'My fleet',exact:true}).click();await expect(page.getByRole('heading',{name:'Your fleet',exact:true})).toBeVisible();
  const workspace=await(await page.request.get('/api/workspace')).json();await page.goto(`/book/${workspace.publicId}`);await page.getByRole('button',{name:'Bikes',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Yamaha YBR 125'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'outputs/renter-booking-page-mobile.png',fullPage:true});
});
