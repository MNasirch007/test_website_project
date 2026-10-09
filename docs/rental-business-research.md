# Renter: rental business research and implementation brief

Research date: 9 October 2026. Scope confirmed with the user: Pakistan, PKR, owner dashboard plus customer booking page. Cars and motorcycles are both supported. This document separates facts published by operators from product recommendations. Operator terms are examples of their own policies, not evidence of a nationwide rule. Prices are examples observed during research, not a market average or recommended Renter tariff.

## 1. Product decision

**Recommendation:** Renter should first be a practical operating system for a local rental owner, connected to that owner's customer storefront. The core outcome is a reliable answer to: which vehicle can go out, to whom, for which dates, for how much, with what deposit, and what still needs doing?

A marketplace adds supplier vetting, commissions, disputes, payouts and competing inventories before the owner workflow is proven. Start with one configurable business; design records with an owner/business ID so a future multi-owner version has a migration path. Prioritize operational correctness over the number of homepage sections.

## 2. What first-party sources establish

### Local car rentals: the enquiry is not always the reservation

Khudcar's Pakistan terms distinguish an enquiry from a confirmed reservation: the operator confirms the vehicle, dates, rate, security requirements and payment terms. Its signed rental agreement controls where it differs from the booking terms. It lists rental charges, extensions, fuel differences, tolls, parking, fines and damage among possible customer responsibilities. [Khudcar terms](https://khudcar.com/terms-of-use).

Rehan Rent A Car in Karachi publishes both self-drive and chauffeur conditions. For its self-drive service it asks for identity and a valid car driving licence; its chauffeur service asks for identity and contact details, without a customer driving licence. It accepts bookings through phone, WhatsApp and its office, with team confirmation. Its terms separate refundable security from rental payments and identify extra fuel, intercity, overnight-driver and waiting charges. Its payment section accepts cash and bank transfer. These are this operator's terms. [Rehan terms](https://rehanrentacar.com/terms-conditions/).

**Recommendation:** the storefront submits a request and clearly says that owner confirmation is required. Staff can create the same request manually for walk-ins, phone or WhatsApp customers. A booking must record whether it is self-drive or with driver; the selected service changes required verification and pricing fields.

### Motorcycles need their own policies and equipment

Pakistan Bikers says renters need motorcycle licences and CNIC/passport, includes a standard helmet, offers additional protective equipment, and allows paid delivery. Its first rental day runs from 9:30 am to 7:30 pm; later days use a 24-hour basis. It says extensions depend on availability, reservation fees are non-refundable and early return does not reduce the agreed rental charge. It explicitly says insurance is not included. [Pakistan Bikers FAQ](https://www.pakistanbikers.com/faqs).

Karakoram Bikers publishes a different offer: comprehensive motorcycle insurance is included, with personal injury/travel insurance left to the hirer. It publishes tiered daily rates, safety-kit inclusions, optional gear, one-way location charges and an PKR 8,000 refundable security bond. Its terms describe customer-present checks before and after hire, fuel replacement, damage deductions and booking advance versus balance at pickup. [Karakoram Bikers hire](https://www.karakorambikers.com/bike-for-hire).

**Recommendation:** bikes have engine size, helmet/gear inclusions, allowed passenger configuration, licence class, fuel policy and coverage details. Insurance must state the actual operator offer; never show a universal 'fully insured' badge. The billing model must be visible beside dates, especially for a workshop-day rental.

### Mature rental software treats stock, time and fulfilment separately

Booqable documents draft, reserved, picked-up, returned and archived stages. A draft does not reserve inventory; reservation blocks it for the requested period. Return and pickup are actual fulfilment events. It rechecks availability on rental extensions and recommends reviewing prices, payments and documents after dates change. [Booqable order workflow](https://help.booqable.com/en/articles/3845244-the-booqable-order-workflow).

Booqable's feature list includes preparation/cleaning buffers, scheduled downtime, location-specific stock, partial payments, configurable deposits and manual payment records. Its published API describes downtimes for maintenance/repairs and distinguishes inventory endpoints that include business rules from raw inventory levels. It also warns that changing rental dates does not automatically recalculate prices where manual prices must be preserved. [Booqable features](https://booqable.com/features/), [Booqable API](https://developers.booqable.com/).

RentSyst's official feature catalogue groups fleet management, timeline, maintenance, damage, cashflow, clients, fines and reporting with check-in/out, fuel/mileage policies, equipment and access roles. This is a useful competitor capability map rather than proof that every small operator needs every integration. [RentSyst catalogue](https://rentsyst.com/price/).

**Recommendation:** build the daily owner workflow in this order: today's tasks; bookings; fleet; availability/calendar; payments and deposits; customers; business settings. Avoid a single vehicle-status dropdown as the entire availability model: a vehicle can be usable now but reserved tomorrow or under repair next week.

### Foreign examples help test policy flexibility, not set Pakistan's rules

Enterprise's US late-return FAQ describes a 29-minute grace period, hourly extra charges for a limited delay and an additional rental day after a longer delay. It also distinguishes physical after-hours return from next-business-day check-in. Hertz's Doha location publishes a different 59-minute grace period and full-to-full fuel expectations. These are specific foreign operator/location policies. [Enterprise US returns](https://www.enterprise.com/en/car-rental-faqs/us-reservations/late-returns-policy.html), [Hertz Doha](https://www.hertz.com/us/en/location/qatar/doha/doht50).

**Recommendation:** make grace periods, billing units, return inspection and fuel charges configurable. Do not silently import foreign age thresholds, coverage or penalty amounts into Pakistani rentals.

## 3. Recommended owner workflows

### Morning operations

The default dashboard should show pending requests, today's pickups/returns, overdue active rentals, unpaid rental balances, deposits needing settlement and upcoming maintenance. Each number opens the matching list. Show fleet utilization only with an explicit period and denominator; exclude downtime from rentable capacity if the displayed definition says so.

### Fleet setup

Each physical vehicle needs a stable ID, registration/internal identifier, type, make/model/year, branch/city, photos, capacity, transmission, fuel, daily rate, refundable security, mileage allowance, excess-kilometre rate, service modes and operational notes. Bikes add engine size and included gear. A published vehicle description is separate from private owner notes and documents.

Allow owners to add/edit vehicles, pause listings, and create a dated maintenance block. Historical bookings retain the originally agreed vehicle description and price even when a fleet record changes. Prefer archive to deletion once a vehicle has bookings.

### Request and confirmation

Customer chooses a vehicle, dates/times, service mode and pickup option, sees the cost breakdown, then submits contact details and an acknowledgement of the displayed terms. Owner checks availability, eligibility and payment expectations before accepting. Owner confirmation records a price/policy snapshot. A declined/cancelled request remains in history.

Recommended reservation states: `requested`, `confirmed`, `active`, `completed`, `cancelled`, `declined`. `overdue` is derived from active status and current time, rather than a separate mutable state. Payment and verification are separate fields. Completing a rental does not imply its security deposit has been refunded.

### Handover and return

Before starting, record actual pickup time, odometer, fuel, visible damage, accessories/helmet count, document verification outcome and agreement acceptance. Store who performed the check. On return, record actual return time, odometer/fuel, condition changes and agreed extra charges. Resolve the balance and record deposit refund/deduction with a reason and receipt. If cleaning/repairs are needed, create downtime before making the asset available again.

An extension recalculates the new quote and rechecks vehicle/driver availability. A return cannot be recorded with a lower odometer than handover. Never require a customer licence for chauffeur-only service merely because self-drive uses it.

## 4. Availability and pricing rules

**Implementation recommendation:** use half-open intervals `[start, end)` so one booking ending exactly when another starts is not inherently an overlap. Apply preparation/return buffers before checking the intervals. Conflict condition: `candidateStart < existingEnd && candidateEnd > existingStart`. Confirmed/active reservations, unexpired holds and downtime block inventory. Requests may be nonblocking, but accepting one must check again.

Use date-times with a business timezone (`Asia/Karachi`) and store canonical instants on the server. Don't rely on the browser timezone or midnight-only dates for a time-based hire. At confirmation, require return after pickup, valid business hours and the configured minimum lead time.

For a real multi-user service, perform conflict check and reservation write atomically on the server. PostgreSQL supports exclusion constraints for non-overlapping ranges and combining scalar resource identity with range exclusions. [PostgreSQL range constraints](https://www.postgresql.org/docs/18/rangetypes.html#RANGETYPES-CONSTRAINT).

**Recommended simple first pricing model:** daily charge with explicit 24-hour units, owner-configurable base/day, optional driver/day and fixed delivery charge. Estimate days using ceiling elapsed hours / 24, minimum one day. If later supporting workshop-day, hourly or monthly plans, give each plan an explicit billing definition rather than changing the meaning of existing bookings.

Show rental subtotal, driver charge, delivery/add-ons, discount, tax if configured, rental total, refundable security, advance paid and balance. Security is separate from rental revenue. Booking advance reduces rental balance; refundable security does not. Use integer minor currency units for calculations and format PKR for display. Rates in seed data must be marked illustrative.

Recommended example: three days at PKR 6,000/day, driver PKR 1,500/day, delivery PKR 1,000 gives PKR 23,500 rental charges. A PKR 15,000 refundable security is separately stated; a PKR 5,000 rental advance leaves PKR 18,500 rental balance. This is an illustrative calculation, not an observed market quote.

## 5. Payments, refunds and gateway boundaries

Booqable documents payment due, partially paid, paid and overpaid independently of rental stage, with deposit settlement tracked too. It supports recording manual payments as well as integrated provider payments. [Booqable payment workflow](https://help.booqable.com/en/articles/1664955-the-different-payment-methods-of-booqable).

JazzCash's merchant guide requires merchant registration and assigned integration credentials. Its v4.2 reference documents transaction identifiers, PKR amounts, merchant authentication and integrity hashes, plus separate mobile-account, card and voucher refund APIs. Public documents contain multiple versions; actual supported methods and merchant configuration need confirmation during onboarding. [JazzCash merchant guide](https://sandbox.jazzcash.com.pk/SandboxDocumentation/Content/documentation/Payment%20Gateway%20Integration%20Guide%20for%20Merchants-v4.2.pdf), [JazzCash API v4.2](https://sandbox.jazzcash.com.pk/SandboxDocumentation/v4.2/ApiReferences.html).

Easypaisa's merchant FAQ lists mobile-account and over-the-counter gateway methods. Its merchant portal links payment integration guides; its posted agreement makes reversals conditional on its policy, documentation and applicable charges. Payment products evolve, so use the current merchant-approved guide when connecting. [Easypaisa FAQ](https://merchantportal.easypaisa.com.pk/faq/), [integration guides](https://easypaystg.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf), [merchant portal/terms](https://easypaystg.easypaisa.com.pk/easypay-merchant/faces/pg/site/Login.jsf).

**Recommendation:** first support owner-recorded cash/bank-transfer payments with amount, date, purpose, external reference and staff identity. A transfer screenshot or customer-selected method does not prove settled money. Label records as recorded/manual; do not pretend a gateway charge occurred.

For live digital checkout, keep secrets on the server, create unique payment attempts, verify provider callbacks/transaction status, match booking amount/currency/reference, and handle repeat notifications idempotently. Track refunds as pending until provider confirmation. Rental cancellation and refund settlement are different actions. Releasing card authorization and returning collected cash are also different operations. Confirm provider support before promising security preauthorization, automated refunds or marketplace payouts.

## 6. Data protection and local verification

Punjab DLIMS is an official driving-licence service covering verification and other licence processes. Its existence supports an assisted verification workflow; this research does not establish a public integration API, nationwide coverage, automatic CNIC verification or permission to scrape. [Punjab DLIMS](https://dlims.punjab.gov.pk/verify).

Gilgit-Baltistan's Excise site publishes a regional rent-a-car rules document. It is scanned, so detailed provisions were not used as national requirements. It reinforces that regional applicability must be checked before production legal policies are written. [GB published rent-a-car rules](https://gbexcise.gov.pk/wp-content/uploads/2022/06/Rent-a-car-rules.pdf).

OWASP advises avoiding sensitive personal information and session identifiers in browser local storage because JavaScript and a single XSS issue can expose it; its testing guide recommends sensitive data reside securely server-side. [OWASP HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [browser-storage testing](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/11-Client-side_Testing/12-Testing_Browser_Storage/).

**Recommendation:** initially record identity verification status and non-sensitive contact fields, collecting licence/CNIC copies only when the operator has an established secure process and retention policy. Production needs authenticated staff, business-scoped authorization, protected file access, backups, audit trails and minimal data collection. A browser-only preview must use fictional contacts and make its shared-device limits clear. Never publish identity files in public asset folders or allow lookup of private booking details by a guessable booking number alone.

Tax rates, commercial insurance coverage, foreign-licence acceptance, liability terms, local licensing, retention periods and enforceability of electronic agreements were not established nationally in this research. Configure placeholders and obtain jurisdiction-specific operator/accountant/legal decisions before live trading. Do not copy another business's terms as Renter's final agreement.

## 7. Delivery scope and acceptance criteria

**Recommended first deliverable:** a polished responsive owner workspace and customer storefront, with real local state for fleet and bookings, safe transitions, date-overlap checking, maintenance, ledger, receipts, CSV export and configurable company/rates. If persistence is browser-only, clearly describe it as a local demo and do not claim multi-user production readiness.

A hosted production service additionally requires shared server/database persistence, real sign-in and staff roles, secure document uploads, payment onboarding, notifications, backup/restore verification and actual owner details/policies. No fake authentication, payment success, delivery notification or external submission should be presented as real functionality.

Acceptance scenarios:

1. Customer request appears in owner bookings with exact dates and cost.
2. Confirming a conflicting reservation fails; overlapping unconfirmed requests can coexist.
3. Maintenance blocks prevent confirmation for that time window.
4. Cancelling a confirmed booking releases its future inventory allocation.
5. Handover records odometer/fuel; return rejects impossible readings.
6. Extension into another confirmed rental is rejected.
7. Partial rental payment changes balance without changing booking status.
8. Deposit collection/refund never inflates rental revenue.
9. Refresh preserves documented local state; exported receipts match agreed prices.
10. Cars/bikes, self-drive/chauffeur, mobile navigation, empty lists and validation errors work without dead links.

## 8. Discovery to validate with the first owner

Recommended interviews and pilot tasks, not researched market facts: observe a busy pickup/return day; inspect an anonymized paper agreement and ledger; ask how 'one day' is billed; how often phone bookings overlap; who authorizes extensions; what deposit and verification vary by vehicle; how driver meals/overnight/fuel are quoted; which maintenance triggers remove a vehicle; who processes refunds; and what information the customer repeatedly asks for on WhatsApp. Pilot with one owner and a small fleet before adding multiple businesses.

No credible primary-source local market-size, average-utilization or profitability dataset was established. The product recommendation rests on documented workflows and policy variation, not fabricated demand forecasts.
