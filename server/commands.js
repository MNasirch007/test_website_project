import { balance, conflict, quote, emptyWorkspace } from '../shared/rental.js';
export class ValidationError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const fail = (condition, message, status) => { if (condition) throw new ValidationError(message, status); };
const text = (value, field, max = 250, required = true) => { fail(typeof value !== 'string' || value.length > max || (required && !value.trim()), `Check ${field}.`); return value.trim(); };
const integer = (value, field, min = 0, max = 100000000) => { const number = Number(value); fail(!Number.isSafeInteger(number) || number < min || number > max, `${field} must be a whole number from ${min} to ${max}.`); return number; };
const time = value => { fail(typeof value !== 'string' || !Number.isFinite(Date.parse(value)), 'Choose a valid pickup and return time.'); return new Date(value).toISOString(); };
const range = (start, end) => { const s=time(start), e=time(end); fail(Date.parse(e) <= Date.parse(s), 'Return must be after pickup.'); fail(Date.parse(e)-Date.parse(s)>366*86400000,'Rentals can be at most one year.'); return [s,e]; };
const id = () => crypto.randomUUID();
const event = (state, message, user) => state.activity.unshift({ id: id(), text: message, at: new Date().toISOString(), by:user, kind:'update' });
const find = (items, key, label) => { const item=items.find(i=>i.id===key); fail(!item,`${label} was not found.`,404); return item; };
function available(state, vehicle, start, end, ignore) {
  fail(!vehicle.listed,'This vehicle is paused.');
  fail(Boolean(conflict(state,vehicle.id,start,end,ignore)),'Vehicle is already reserved or in maintenance for these dates.',409);
  fail(state.bookings.some(b=>b.vehicleId===vehicle.id && b.id!==ignore && b.status==='Active' && Date.parse(b.end)<Date.now()),'This vehicle has an overdue rental. Record its return before another confirmation.',409);
}
export function applyCommand(original, input, user = 'Owner', publicRequest = false) {
  fail(!input || typeof input !== 'object' || Array.isArray(input),'Invalid request.');
  const key=text(input.commandId,'request identifier',80);
  if (original.executed.includes(key)) return original;
  fail(original.bookings.length >= 3000 && input.action==='createBooking','This workspace has reached its booking limit. Contact support.',409);
  const state=structuredClone(original);
  const action=text(input.action,'action',60), data=input.data || {};
  fail(publicRequest && action!=='createBooking','Action is not permitted.',403);
  if(action==='vehicle') {
    const vehicle = {
      id:data.id || id(), name:text(data.name,'vehicle name',100), registration:text(data.registration,'registration',40), type:data.type, category:text(data.category || (data.type==='Bike'?'Motorcycle':'Sedan'),'category',30),
      rate:integer(data.rate,'Daily rate',1), deposit:integer(data.deposit,'Security deposit'), year:integer(data.year,'Year',1980,2100), transmission:data.transmission, seats:integer(data.seats,'Seats',1,20), color:text(data.color || 'Silver','color',30),
      fuel:data.fuel, city:text(data.city || state.settings.city,'city',60), mileageLimit:integer(data.mileageLimit,'Daily mileage',1,10000), excessKmRate:integer(data.excessKmRate,'Extra kilometre rate'), description:text(data.description || '','description',800,false), listed:data.listed!==false,
      modes: data.type==='Bike' ? ['Self-drive'] : ['Self-drive','With driver'],
    };
    fail(!['Car','Bike'].includes(vehicle.type)||!['Automatic','Manual'].includes(vehicle.transmission)||!['Petrol','Diesel','Electric','Hybrid'].includes(vehicle.fuel),'Select valid vehicle specifications.');
    fail(state.vehicles.some(v=>v.id!==vehicle.id&&v.registration.toLowerCase()===vehicle.registration.toLowerCase()),'A vehicle already uses this registration.');
    if(data.id) Object.assign(find(state.vehicles,data.id,'Vehicle'),vehicle); else state.vehicles.push(vehicle);
    event(state,`${vehicle.name} ${data.id?'updated':'added to the fleet'}`,user);
  } else if(action==='customer') {
    const customer={ id:data.id || id(), name:text(data.name,'customer name',100), phone:text(data.phone,'phone number',30), email:text(data.email || '','email',150,false), city:text(data.city || '','city',60,false), notes:text(data.notes || '','notes',800,false) };
    fail(!/^[+\d\s()-]{7,30}$/.test(customer.phone),'Enter a valid phone number.');
    fail(customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email),'Enter a valid email address.');
    if(data.id) Object.assign(find(state.customers,data.id,'Customer'),customer); else state.customers.push(customer);
    event(state,`${customer.name} added to customers`,user);
  } else if(action==='createBooking') {
    const vehicle=find(state.vehicles,data.vehicleId,'Vehicle');
    const [start,end]=range(data.start,data.end);
    fail(Date.parse(start)<Date.now()-3600000,'Pickup must be in the future.');
    fail(!vehicle.modes.includes(data.mode),'This rental mode is not offered.');
    available(state,vehicle,start,end);
    let customer;
    if(!publicRequest && data.customerId) customer=find(state.customers,data.customerId,'Customer');
    else {
      const name=text(data.name,'name',100), phone=text(data.phone,'phone',30), email=text(data.email || '','email',150,false);
      fail(!/^[+\d\s()-]{7,30}$/.test(phone),'Enter a valid phone number.');
      fail(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email address.');
      if(publicRequest) {
        fail(data.website,'Unable to submit request.');
        fail(data.accepted!==true,'Please accept the rental terms.');
        fail(state.bookings.filter(b=>b.status==='Requested').length>=100,'The owner has too many pending requests. Please call the business.',429);
        const matchingIds=state.customers.filter(c=>c.phone===phone).map(c=>c.id);
        fail(state.bookings.filter(b=>matchingIds.includes(b.customerId)&&Date.parse(b.createdAt)>Date.now()-86400000).length>=3,'You have already submitted several requests. Please contact the owner.',429);
      }
      customer={ id:id(), name, phone, email, city:state.settings.city, notes:'' }; state.customers.push(customer);
    }
    const price=quote(vehicle,start,end,data.mode,state.settings);
    state.bookings.unshift({ id:id(), reference:`RN-${String(state.bookings.length+1001)}`, submissionId:key, vehicleId:vehicle.id, customerId:customer.id, vehicleName:vehicle.name, registration:vehicle.registration, start,end,mode:data.mode, price, policy:state.settings.policy,coverage:state.settings.coverage,mileageLimit:vehicle.mileageLimit,excessKmRate:vehicle.excessKmRate,status:'Requested',notes:text(data.notes || '','notes',800,false),createdAt:new Date().toISOString(),source:publicRequest?'Customer page':'Owner',extraCharges:0 });
    event(state,`New request: ${customer.name} · ${vehicle.name}`,user);
  } else if(['confirm','cancel','handover','return','extend'].includes(action)) {
    const booking=find(state.bookings,data.id,'Booking'),vehicle=find(state.vehicles,booking.vehicleId,'Vehicle');
    if(action==='confirm') { fail(booking.status!=='Requested','Only requested rentals can be confirmed.'); available(state,vehicle,booking.start,booking.end,booking.id); booking.status='Confirmed'; }
    if(action==='cancel') { fail(!['Requested','Confirmed'].includes(booking.status),'Only requested or confirmed bookings can be cancelled.'); booking.status='Cancelled'; }
    if(action==='handover') {
      fail(booking.status!=='Confirmed','Confirm this booking before handover.');
      fail(data.verified!==true || data.agreement!==true,'Document check and agreement acceptance are required.');
      fail(Date.now()<Date.parse(booking.start)-3600000,'Handover can start within one hour of the booked pickup.');
      fail(Date.now()>Date.parse(booking.end),'Extend this booking before handing over a vehicle after its return time.');
      fail(state.bookings.some(b=>b.id!==booking.id&&b.vehicleId===booking.vehicleId&&b.status==='Active'),'This vehicle is still with another customer.',409);
      fail(state.maintenance.some(m=>m.vehicleId===vehicle.id&&Date.parse(m.start)<=Date.now()&&Date.parse(m.end)>Date.now()),'This vehicle is currently in maintenance.',409);
      booking.handover={ odometer:integer(data.odometer,'Odometer'), fuel:text(data.fuel,'fuel level',30), condition:text(data.condition,'condition notes',1000),verified:true,agreement:true,at:new Date().toISOString(),by:user }; booking.status='Active';
    }
    if(action==='return') {
      fail(booking.status!=='Active','Only an active rental can be returned.');
      const odometer=integer(data.odometer,'Return odometer'); fail(odometer<booking.handover.odometer,'Return odometer cannot be less than the pickup reading.');
      booking.returnCheck={ odometer,fuel:text(data.fuel,'fuel level',30),condition:text(data.condition,'condition notes',1000),at:new Date().toISOString(),by:user };
      booking.extraCharges=integer(data.extraCharges || 0,'Agreed extra charges'); booking.status='Completed';
    }
    if(action==='extend') {
      fail(!['Confirmed','Active'].includes(booking.status),'Only confirmed or active rentals can be extended.');
      const [,end]=range(booking.start,data.end); fail(Date.parse(end)<=Date.parse(booking.end),'An extension must end after the current return.');
      available(state,vehicle,booking.start,end,booking.id);
      const driverRate=booking.mode==='With driver' ? booking.price.driver/booking.price.days : 0;
      booking.price=quote({rate:booking.price.rate,deposit:booking.price.deposit},booking.start,end,booking.mode,{driverRate}); booking.end=end;
    }
    event(state,`${booking.reference} · ${action==='return'?'returned':action==='handover'?'handed over':action==='extend'?'extended':action==='cancel'?'cancelled':'confirmed'}`,user);
  } else if(action==='payment') {
    const booking=find(state.bookings,data.bookingId,'Booking');
    fail(!['Rental payment','Rental refund','Security deposit','Deposit refund'].includes(data.kind),'Select a payment purpose.');
    fail(!['Cash','Bank transfer'].includes(data.method),'Select a supported payment method.');
    const amount=integer(data.amount,'Amount',1), totals=balance(state,booking);
    if(data.kind==='Rental payment') fail(booking.status==='Cancelled'||amount>totals.due,'Amount exceeds the outstanding rental balance.');
    if(data.kind==='Rental refund') fail(amount>totals.paid,'Refund exceeds recorded rental payments.');
    if(data.kind==='Security deposit') fail(booking.status==='Cancelled'||amount+totals.security>booking.price.deposit,'Amount exceeds the agreed security deposit.');
    if(data.kind==='Deposit refund') fail(amount>totals.security,'Refund exceeds the security deposit held.');
    state.payments.unshift({id:id(),bookingId:booking.id,amount,kind:data.kind,method:data.method,reference:text(data.reference || '','reference',150,false),at:new Date().toISOString(),recordedBy:user});
    event(state,`${data.kind} recorded for ${booking.reference}`,user);
  } else if(action==='maintenance') {
    const vehicle=find(state.vehicles,data.vehicleId,'Vehicle');
    const [start,end]=range(data.start,data.end);
    fail(Boolean(conflict(state,vehicle.id,start,end)),'Maintenance overlaps an existing reservation or maintenance block.',409);
    fail(state.bookings.some(b=>b.vehicleId===vehicle.id&&b.status==='Active'),'Return the active rental before scheduling maintenance.');
    state.maintenance.push({id:id(),vehicleId:vehicle.id,start,end,reason:text(data.reason,'maintenance reason',300)}); event(state,`${vehicle.name} scheduled for maintenance`,user);
  } else if(action==='removeMaintenance') {
    find(state.maintenance,data.id,'Maintenance'); state.maintenance=state.maintenance.filter(m=>m.id!==data.id); event(state,'Maintenance block removed',user);
  } else if(action==='settings') {
    state.settings={name:text(data.name,'business name',100),ownerName:text(data.ownerName,'owner name',80),phone:text(data.phone || '','phone',30,false),city:text(data.city,'city',60),address:text(data.address || '','address',250,false),driverRate:integer(data.driverRate,'Driver daily rate'),turnaroundHours:integer(data.turnaroundHours,'Turnaround hours',0,72),policy:text(data.policy,'rental policy',2500),coverage:text(data.coverage,'coverage description',1000)};
    event(state,'Business settings updated',user);
  } else if(action==='startBusiness') {
    fail(!state.demo,'This workspace already contains your business.'); return {...emptyWorkspace(text(data.name,'business name',100)),executed:[key]};
  } else throw new ValidationError('Unknown action.');
  state.executed.push(key); state.executed=state.executed.slice(-200); state.activity=state.activity.slice(0,150);
  return state;
}

