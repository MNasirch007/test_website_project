export const STATUSES = ['Requested', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
export const money = value => `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const dateLabel = (value, options = {}) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', ...options }).format(new Date(value));
export const localInput = value => new Date(new Date(value).getTime() + 5 * 3600000).toISOString().slice(0, 16);
export const fromLocal = value => new Date(`${value}:00+05:00`).toISOString();
export const atDay = (offset, hour = 10) => {
  const date = new Date(`${today()}T00:00:00+05:00`);
  date.setTime(date.getTime() + (offset * 24 + hour) * 3600000);
  return date.toISOString();
};
export const rentalDays = (start, end) => Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000));
export function quote(vehicle, start, end, mode = 'Self-drive', settings = {}) {
  const days = rentalDays(start, end);
  const driver = mode === 'With driver' ? Number(settings.driverRate || 0) * days : 0;
  return { days, rate: vehicle.rate, subtotal: days * vehicle.rate, driver, total: days * vehicle.rate + driver, deposit: vehicle.deposit };
}
export function balance(state, booking) {
  const entries = state.payments.filter(p => p.bookingId === booking.id);
  const paid = entries.reduce((sum, p) => sum + (p.kind === 'Rental payment' ? p.amount : p.kind === 'Rental refund' ? -p.amount : 0), 0);
  const security = entries.reduce((sum, p) => sum + (p.kind === 'Security deposit' ? p.amount : p.kind === 'Deposit refund' ? -p.amount : 0), 0);
  return { paid, security, due: booking.status === 'Cancelled' ? 0 : Math.max(0, booking.price.total + (booking.extraCharges || 0) - paid) };
}
export function conflict(state, vehicleId, start, end, ignore = '') {
  const buffer = (state.settings.turnaroundHours || 0) * 3600000;
  const a = Date.parse(start), z = Date.parse(end);
  return state.bookings.find(b => b.id !== ignore && b.vehicleId === vehicleId && ['Confirmed', 'Active'].includes(b.status) && a < Date.parse(b.end) + buffer && z + buffer > Date.parse(b.start))
    || state.maintenance.find(m => m.vehicleId === vehicleId && a < Date.parse(m.end) && z + buffer > Date.parse(m.start));
}
export function vehicleStatus(state, vehicle, now = Date.now()) {
  if (state.maintenance.some(m => m.vehicleId === vehicle.id && Date.parse(m.start) <= now && Date.parse(m.end) > now)) return 'Maintenance';
  if (state.bookings.some(b => b.vehicleId === vehicle.id && b.status === 'Active')) return 'On rent';
  if (!vehicle.listed) return 'Paused';
  return 'Available';
}
export function emptyWorkspace(name = 'Your rental business') {
  return {
    demo: false,
    settings: { name, ownerName: 'Owner', city: 'Lahore', phone: '', address: '', driverRate: 2000, turnaroundHours: 2, policy: 'Rental is billed in 24-hour periods. Fuel, tolls and fines are the customer’s responsibility unless agreed otherwise. The refundable security deposit is separate from rental charges. Requests are subject to owner confirmation and document verification.', coverage: 'Ask the owner about available coverage and exclusions.' },
    vehicles: [], customers: [], bookings: [], payments: [], maintenance: [], activity: [], executed: [],
  };
}
export function sampleWorkspace() {
  const state = emptyWorkspace('Greenline Rentals');
  state.demo = true;
  state.settings = { ...state.settings, ownerName: 'Ahmed', city: 'Lahore', address: 'Gulberg III, Lahore', phone: '+92 300 000 0000' };
  const names = [
    ['Toyota Corolla', 'Car', 'Sedan', 6500, 20000, 'Automatic', 5, 'Silver'],
    ['Honda Civic', 'Car', 'Sedan', 9000, 25000, 'Automatic', 5, 'White'],
    ['Suzuki Alto', 'Car', 'Hatchback', 4500, 15000, 'Manual', 4, 'White'],
    ['Toyota Yaris', 'Car', 'Sedan', 6000, 20000, 'Automatic', 5, 'Grey'],
    ['Kia Sportage', 'Car', 'SUV', 14000, 40000, 'Automatic', 5, 'Black'],
    ['Honda City', 'Car', 'Sedan', 6000, 20000, 'Manual', 5, 'White'],
    ['Suzuki Swift', 'Car', 'Hatchback', 5500, 18000, 'Automatic', 4, 'Red'],
    ['Toyota Fortuner', 'Car', 'SUV', 22000, 60000, 'Automatic', 7, 'Black'],
    ['Honda CB 150F', 'Bike', 'Motorcycle', 2200, 10000, 'Manual', 2, 'Red'],
    ['Yamaha YBR 125', 'Bike', 'Motorcycle', 1800, 8000, 'Manual', 2, 'Blue'],
    ['Suzuki GS 150', 'Bike', 'Motorcycle', 2000, 10000, 'Manual', 2, 'Black'],
    ['Honda CD 70', 'Bike', 'Motorcycle', 1000, 5000, 'Manual', 2, 'Red'],
  ];
  state.vehicles = names.map((n, i) => ({ id: `v${i+1}`, name: n[0], type: n[1], category: n[2], rate: n[3], deposit: n[4], transmission: n[5], seats: n[6], color: n[7], registration: `DEMO-${String(i+1).padStart(3,'0')}`, year: 2024, city: 'Lahore', fuel: 'Petrol', listed: true, mileageLimit: 200, excessKmRate: 20, description: n[1] === 'Bike' ? 'Helmet included. A valid motorcycle licence is required for self-drive.' : 'A comfortable ride for city trips and weekends away.', modes: n[1] === 'Bike' ? ['Self-drive'] : ['Self-drive', 'With driver'] }));
  const people = ['Ali Hassan', 'Sara Ahmed', 'Usman Malik', 'Ayesha Khan', 'Bilal Shah', 'Zain Abbas', 'Hira Faisal', 'Omar Farooq'];
  state.customers = people.map((name, i) => ({ id: `c${i+1}`, name, phone: `+92 300 000 00${String(i+1).padStart(2,'0')}`, email: `${name.split(' ')[0].toLowerCase()}@example.com`, city: 'Lahore', notes: 'Fictional sample customer' }));
  const make = (i, vi, ci, start, end, status) => {
    const vehicle = state.vehicles[vi];
    return { id: `b${i}`, reference: `RN-${1000+i}`, vehicleId: vehicle.id, customerId: state.customers[ci].id, vehicleName: vehicle.name, registration: vehicle.registration, start: atDay(start, 10), end: atDay(end, 10), status, mode: 'Self-drive', price: quote(vehicle, atDay(start,10), atDay(end,10)), policy: state.settings.policy, coverage: state.settings.coverage, notes: '', createdAt: atDay(start-2), source: 'Owner', extraCharges: 0, handover: status === 'Active' || status === 'Completed' ? { odometer: 32000, fuel: 'Full', condition: 'No visible damage', verified: true, agreement: true, at: atDay(start) } : null };
  };
  state.bookings = [make(1,0,0,-1,2,'Active'),make(2,1,1,-2,0,'Active'),make(3,4,2,-1,3,'Active'),make(4,8,3,-1,1,'Active'),make(5,5,4,0,3,'Confirmed'),make(6,9,5,0,2,'Confirmed'),make(7,2,6,1,4,'Requested'),make(8,3,7,2,5,'Requested')];
  for (let i = 9; i < 26; i++) {
    const booking = make(i, i%8, i%8, -30+(i-9), -28+(i-9), 'Completed');
    booking.returnCheck = { odometer: 32400, fuel: 'Full', condition: 'Returned in good condition', at: booking.end };
    state.bookings.push(booking);
  }
  state.payments = state.bookings.filter(b => ['Active','Completed'].includes(b.status)).flatMap((b, i) => [{ id:`p${i}`, bookingId:b.id, amount:b.status === 'Completed' ? b.price.total : Math.floor(b.price.total/2), kind:'Rental payment', method:i%2 ? 'Bank transfer' : 'Cash', at:b.start, reference:'Sample entry', recordedBy:'Ahmed' }]);
  state.payments.push({ id:'deposit1', bookingId:'b1', amount:20000, kind:'Security deposit', method:'Cash', at:atDay(-1), reference:'Sample entry', recordedBy:'Ahmed' });
  state.maintenance = [{ id:'m1', vehicleId:'v7', start:atDay(-1), end:atDay(2), reason:'Scheduled oil change & inspection' }];
  state.activity = [{ id:'a1', text:'Ali Hassan picked up Toyota Corolla', at:atDay(-1), kind:'booking' }, { id:'a2', text:'Honda City is confirmed for pickup today', at:atDay(-1,15), kind:'booking' }, { id:'a3', text:'A rental request arrived from Hira Faisal', at:atDay(-1,18), kind:'request' }];
  return state;
}
