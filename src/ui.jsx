import { useEffect, useRef } from 'react';
import { Car, Bike, ArrowUpRight, ArrowDownLeft, Plus, ChevronRight, Search, X, CalendarDays, LayoutDashboard, Users, Wallet, Settings, Bell, SlidersHorizontal, MoreHorizontal, Check, CheckCircle2, Clock3, Wrench, Fuel, Gauge, MapPin, ExternalLink, Download, ArrowRight, Menu, LogOut, RefreshCw, ShieldCheck, CircleHelp, Copy, Printer, CheckSquare, ChevronLeft, Phone } from 'lucide-react';
const icons = {Car,Bike,ArrowUpRight,ArrowDownLeft,Plus,ChevronRight,Search,X,CalendarDays,LayoutDashboard,Users,Wallet,Settings,Bell,SlidersHorizontal,MoreHorizontal,Check,CheckCircle2,Clock3,Wrench,Fuel,Gauge,MapPin,ExternalLink,Download,ArrowRight,Menu,LogOut,RefreshCw,ShieldCheck,CircleHelp,Copy,Printer,CheckSquare,ChevronLeft,Phone};
export function Icon({name,size=18,...props}) { const Component=icons[name] || Car; return <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props}/>; }
export function Brand({light=false}) { return <div className={`brand ${light?'light':''}`}><span className="brand-symbol"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 23V5h9a6 6 0 0 1 0 12H9m6 0 7 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M2 17h11" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span><span>renter<span className="brand-dot">.</span></span></div>; }
export function Badge({children}) { const color={'Requested':'amber','Confirmed':'blue','Active':'green','Completed':'neutral','Cancelled':'red','Available':'green','On rent':'blue','Maintenance':'amber','Paused':'neutral'}[children] || 'neutral'; return <span className={`badge ${color}`}><span/>{children}</span>; }
const initials = name => name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'R';
export function Avatar({name,index=0}) { return <span className={`avatar tone-${index%4}`}>{initials(name)}</span>; }
export function Empty({title='Nothing here yet',text='Your records will appear here.',action}) { return <div className="empty"><span><Icon name="Car" size={30}/></span><h3>{title}</h3><p>{text}</p>{action}</div>; }
export function Field({label,children,hint}) { return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>; }
export function VehicleArt({vehicle,large=false}) {
  const color={White:'#f4f4f0',Black:'#36423f',Grey:'#9ea9a4',Silver:'#c9d1cd',Red:'#a8493e',Blue:'#567a95'}[vehicle?.color] || '#bfc9c3';
  if(vehicle?.type==='Bike') return <svg className={`vehicle-art ${large?'large':''}`} viewBox="0 0 280 140" role="img" aria-label={`${vehicle.name} illustration`}><ellipse cx="145" cy="116" rx="95" ry="9" fill="#dfe5e1"/><g fill="#253830" stroke="#e7ece9" strokeWidth="5"><circle cx="63" cy="100" r="29"/><circle cx="217" cy="100" r="29"/></g><g fill="none" stroke="#70827a" strokeWidth="5"><circle cx="63" cy="100" r="17"/><circle cx="217" cy="100" r="17"/><path d="m63 100 55-55 42 55H63m97 0 41-44 16 44m-99-55 67 7m3-22 12 25"/></g><path d="m99 45 48-11 28 16-17 21-45-5z" fill={color} stroke="#778780" strokeWidth="2"/><path d="M84 43h49M188 29h20" stroke="#293f34" strokeWidth="9" strokeLinecap="round"/><path d="m112 73 42 3-6 22h-26z" fill="#6a7972"/><path d="m158 104 35 6" stroke="#7c8e84" strokeWidth="9" strokeLinecap="round"/><path d="m203 53 18 7-4 10" fill="#ecddb1"/></svg>;
  const suv=vehicle?.category==='SUV';
  return <svg className={`vehicle-art ${large?'large':''}`} viewBox="0 0 280 140" role="img" aria-label={`${vehicle?.name || 'Car'} illustration`}><ellipse cx="140" cy="115" rx="117" ry="10" fill="#dfe5e1"/><path d={suv?'M20 69 54 62 79 29h100l40 32 39 12v34H22z':'M17 77 48 66 84 38h86l48 31 36 10 5 25H19z'} fill={color} stroke="#94a19a" strokeWidth="1.5"/><path d={suv?'m68 61 20-25h40v25zm68-25h40l30 25h-70z':'m60 68 29-25h39v25zm76-25h31l36 25h-67z'} fill="#597267"/><path d="m89 47-20 18M149 46l39 18" stroke="#88a298" strokeWidth="3"/><path d="M130 72v29m75-27 8 28M34 86h210" fill="none" stroke="#9daaa2" strokeWidth="1"/><path d="M16 78h21v10H16m232-9h9v11h-9" fill="#f8f2d6"/><path d="M151 77h14m46-3h10" stroke="#52665a" strokeWidth="3" strokeLinecap="round"/><path d="M19 99h240" stroke="#85968b" strokeWidth="5"/><g fill="#27382e" stroke="#e0e6e1" strokeWidth="2"><circle cx="66" cy="104" r="23"/><circle cx="215" cy="104" r="23"/></g><g fill="#c2cec6" stroke="#738578" strokeWidth="2"><circle cx="66" cy="104" r="12"/><circle cx="215" cy="104" r="12"/></g><path d="m63 97 6 14m-9-4 13-6m139-4 6 14m-9-4 13-6" stroke="#f0f3f1" strokeWidth="2"/></svg>;
}
export function Modal({title,subtitle,children,onClose,wide=false}) {
  const modalRef=useRef(null),closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const box=modalRef.current;
    const elements=()=>Array.from(box.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')).filter(el=>!el.disabled&&el.offsetParent!==null);
    (box.querySelector('[autofocus]')||elements()[0]||box).focus();
    const handle=e=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'){const focusable=elements(),first=focusable[0],last=focusable.at(-1);if(!first){e.preventDefault();return;}if(e.shiftKey&&(document.activeElement===first||document.activeElement===box)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
    box.addEventListener('keydown',handle);
    return()=>{box.removeEventListener('keydown',handle);document.body.style.overflow=overflow;previous?.focus();};
  },[]);
  return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section className={`modal ${wide?'wide':''}`} ref={modalRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}><div className="modal-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="X"/></button></div>{children}</section></div>;
}
