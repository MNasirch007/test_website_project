import { test, expect } from '@playwright/test';
import { connectTestBackend } from './browser-fixture.js';
import { localInput, atDay } from '../shared/rental.js';
async function signIn(page){await page.goto('/');await page.getByLabel('Email address',{exact:true}).fill('owner@example.com');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in to your workspace'}).click();await expect(page.getByRole('heading',{name:/Good (morning|afternoon|evening)/})).toBeVisible();}
test.beforeEach(async({context})=>{context.renterFixture=await connectTestBackend(context);});

test('local startup serves the page and public configuration without a runtime error',async({page})=>{
  const response=await page.request.get('/');expect(response.status()).toBe(200);
  const html=await response.text();expect(html).toContain('id="root"');expect(html).not.toContain('fetch failed');
  const configuration=await page.request.get('/api/config');expect(configuration.status()).toBe(200);
  expect(Object.keys(await configuration.json()).sort()).toEqual(['publishableKey','supabaseUrl']);
});

test('missing Supabase configuration gives a visible explanation',async({page,context})=>{
  await context.route('**/api/config',route=>route.fulfill({json:{supabaseUrl:'',publishableKey:''}}));
  await page.goto('/');await expect(page.getByRole('heading',{name:'Connect your workspace'})).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Supabase is not connected yet');
});

test('owner signup, password reset, empty workspace and sign-out use the Supabase contract',async({page,context})=>{
  context.renterFixture=await connectTestBackend(context,{empty:true});
  await page.goto('/');await page.getByRole('button',{name:'New to Renter? Create an account'}).click();
  await page.getByLabel('Email address',{exact:true}).fill('owner@example.com');await page.getByLabel('Password',{exact:true}).fill('long-test-password');
  await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByRole('status')).toContainText('Check your email');
  await page.getByRole('button',{name:'Back to sign in'}).click();await page.getByRole('button',{name:'Forgot password?'}).click();
  await page.getByLabel('Email address',{exact:true}).fill('owner@example.com');await page.getByRole('button',{name:'Send reset link'}).click();
  await expect(page.getByRole('status')).toContainText('password reset link');await page.getByRole('button',{name:'Back to sign in'}).click();
  await page.getByLabel('Email address',{exact:true}).fill('owner@example.com');await page.getByLabel('Password',{exact:true}).fill('long-test-password');
  await page.getByRole('button',{name:'Sign in to your workspace'}).click();await expect(page.getByRole('heading',{name:/Good (morning|afternoon|evening)/})).toBeVisible();
  await expect(page.locator('.workspace-context')).toContainText('Your business workspace');await expect(page.getByText('Greenline Rentals',{exact:true})).toHaveCount(0);
  await page.goto('/?reset=password');await expect(page.getByRole('heading',{name:'Choose a new password.'})).toBeVisible();
  await page.getByLabel('New password',{exact:true}).fill('new-long-password');await page.getByRole('button',{name:'Save new password'}).click();
  await expect(page.locator('.workspace-context')).toContainText('Your business workspace');
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Welcome back to Renter.'})).toBeVisible();
});
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
  await signIn(page);const workspace=page.context().renterFixture.getWorkspace();
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
  const workspace=page.context().renterFixture.getWorkspace();await page.goto(`/book/${workspace.publicId}`);await page.getByRole('button',{name:'Bikes',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Yamaha YBR 125'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'outputs/renter-booking-page-mobile.png',fullPage:true});
});
