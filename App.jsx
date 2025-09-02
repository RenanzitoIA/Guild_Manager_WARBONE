
import React, { useMemo, useState, useEffect } from 'react'

const ROLES = ["HEALER","DPS_MELEE","DPS_RANGED","STOPPER","TANK","DEF_TANK"]
const CARGOS = ["LIDER","OFICIAL","CALLER","RECRUTADOR","MEMBRO"]

const nfmt = (n)=> (Number(n)||0).toLocaleString('pt-BR')
const today = ()=> new Date().toISOString().slice(0,10)
const Tag = ({children}) => <span className="tag">{children}</span>
const Section = ({title, right, children}) => (<div className="section"><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><h2>{title}</h2>{right}</div>{children}</div>)
async function readJsonFromFile(file){ const t=await file.text(); try{ return JSON.parse(t) }catch(e){ alert('Erro ao ler '+file.name+': '+e.message); return null }}

/* --------- WELCOME --------- */
function Welcome({ onEnter }){
  return (<div className="welcome">
    <div className="panel">
      <div className="title">BEM VINDO A STFU</div>
      <p className="subtitle">Gestão de Guilda </p>
      <div style={{display:'flex',gap:12,justifyContent:'center'}}>
        <button className="btn btn-primary" onClick={onEnter}>Entrar</button>
        <a className="btn" href="https://discord.gg/vs9cFJj8uB" target="_blank" rel="noreferrer">Discord</a>
      </div>
    </div>
  </div>)
}

/* --------- UTILS --------- */
function toCSV(rows){ if(!rows?.length) return ""; const headers=Object.keys(rows[0]); const esc=v=>{ if(v==null) return ""; const s=String(v); return /[\",\\n]/.test(s)?`\"${s.replaceAll('\"','\"\"')}\"`:s }; return [headers.join(','), ...rows.map(r=> headers.map(h=>esc(r[h])).join(','))].join('\\n'); }
async function readCSV(file){
  const text=await file.text(); const [head,...rows]=text.split(/\\r?\\n/).filter(Boolean); const cols=head.split(',')
  return rows.map(line=>{ const vals=line.match(/\\\"([^\\\"]*)\\\"|[^,]+/g)?.map(s=> s?.replaceAll(/^\\\"|\\\"$/g,''))||[]; const obj={}; cols.forEach((c,i)=> obj[c]=vals[i]||'' ); return obj; })
}

/* --------- CATALOGO --------- */
function EntryKV({ obj, exclude=[] }){
  if(!obj || typeof obj!=='object') return null
  const keys = Object.keys(obj).filter(k=> !exclude.includes(k) && typeof obj[k] !== 'object')
  if(!keys.length) return null
  return (<div className="small">{keys.map(k=>(<div key={k}><span style={{color:'#7f8db0'}}>{k}:</span> <b>{String(obj[k])}</b></div>))}</div>)
}
function CatalogPreview({ catalog }){
  const [tab,setTab] = useState('weapons')
  const [query,setQuery] = useState('')
  const weapons = Array.isArray(catalog?.weapon)? catalog.weapon : []
  const armors = Array.isArray(catalog?.armor)? catalog.armor : []
  const filteredWeapons = useMemo(()=>{ const q=query.toLowerCase().trim(); return weapons.filter(w=> !q || JSON.stringify(w).toLowerCase().includes(q)) },[weapons,query])
  const filteredArmors = useMemo(()=>{ const q=query.toLowerCase().trim(); return armors.filter(a=> !q || JSON.stringify(a).toLowerCase().includes(q)) },[armors,query])

  return (
    <Section title="Catálogo — Pré-visualização (JSONs carregados)">
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <button className={`btn ${tab==='weapons'?'btn-primary':''}`} onClick={()=>setTab('weapons')}>Armas</button>
        <button className={`btn ${tab==='armors'?'btn-primary':''}`} onClick={()=>setTab('armors')}>Armaduras</button>
        <input className="input" placeholder="Buscar por nome/atributo..." value={query} onChange={e=>setQuery(e.target.value)} />
      </div>
      {tab==='weapons' && (
        <div className="grid grid-3">
          {filteredWeapons.slice(0,300).map((w,i)=>{
            const name = w.nome || w.name || w.id || w.key || `Weapon #${i+1}`
            const role = w.role || w.classe || (Array.isArray(w.allowedRoles)? w.allowedRoles.join(', '): null)
            const skills = w.skills || w.habilidades || w.abilities || []
            const stats = w.stats || w.atributos || w.attributes || null
            return (
              <div className="card" key={i}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{fontWeight:700}}>{name}</div>
                  {role && <span className="badge">{role}</span>}
                </div>
                <EntryKV obj={w} exclude={['stats','atributos','attributes','skills','habilidades','abilities','nome','name','id','key','role','classe','allowedRoles']} />
                {stats && <div style={{marginTop:8}}><div className="small" style={{color:'#9aa3b2'}}>Stats:</div><EntryKV obj={stats}/></div>}
                {Array.isArray(skills) && skills.length>0 && <div style={{marginTop:8}}><div className="small" style={{color:'#9aa3b2'}}>Habilidades:</div><ul style={{margin:'6px 0 0 16px'}}>{skills.slice(0,6).map((s,idx)=> <li key={idx} className="small">{typeof s==='string'? s : (s.nome||s.name||JSON.stringify(s))}</li>)}</ul></div>}
              </div>
            )
          })}
          {filteredWeapons.length===0 && <div className="small">Nenhuma arma encontrada. Carregue weapon.json na aba acima.</div>}
        </div>
      )}
      {tab==='armors' && (
        <div className="grid grid-3">
          {filteredArmors.slice(0,300).map((a,i)=>{
            const name = a.nome || a.name || a.id || a.key || `Armor #${i+1}`
            const slot = (a.slot || a.tipo || '').toUpperCase()
            const stats = a.stats || a.atributos || a.attributes || null
            return (
              <div className="card" key={i}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{fontWeight:700}}>{name}</div>
                  {slot && <span className="badge">{slot}</span>}
                </div>
                <EntryKV obj={a} exclude={['stats','atributos','attributes','skills','habilidades','abilities','nome','name','id','key','slot','tipo']} />
                {stats && <div style={{marginTop:8}}><div className="small" style={{color:'#9aa3b2'}}>Stats:</div><EntryKV obj={stats}/></div>}
              </div>
            )
          })}
          {filteredArmors.length===0 && <div className="small">Nenhuma armadura encontrada. Carregue armor.json na aba acima.</div>}
        </div>
      )}
    </Section>
  )
}
function CatalogLoader({ setCatalog, catalog }){
  const [files, setFiles] = useState({})
  const onChange = (k,f)=> setFiles(prev=> ({...prev, [k]: f}))
  const load = async ()=>{
    const weapon = files.weapon ? await readJsonFromFile(files.weapon) : catalog.weapon
    const armor = files.armor ? await readJsonFromFile(files.armor) : catalog.armor
    const stats = files.stats ? await readJsonFromFile(files.stats) : catalog.stats
    const mod = files.mod ? await readJsonFromFile(files.mod) : catalog.mod
    const drifter = files.drifter ? await readJsonFromFile(files.drifter) : catalog.drifter
    const link = files.link ? await readJsonFromFile(files.link) : catalog.link
    setCatalog({ weapon, armor, stats, mod, drifter, link })
  }
  return (
    <>
      <Section title="Catálogo — Carregar JSONs" right={<button className="btn btn-primary" onClick={load}>Aplicar</button>}>
        <div className="grid grid-3" style={{gap:12,fontSize:14}}>
          <label>weapon.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('weapon', e.target.files?.[0])}/></label>
          <label>armor.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('armor', e.target.files?.[0])}/></label>
          <label>stats.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('stats', e.target.files?.[0])}/></label>
          <label>mod.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('mod', e.target.files?.[0])}/></label>
          <label>drifter.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('drifter', e.target.files?.[0])}/></label>
          <label>link.json<input className="input" type="file" accept="application/json" onChange={e=>onChange('link', e.target.files?.[0])}/></label>
        </div>
        <div className="small" style={{marginTop:8}}>Depois de aplicar, o Builder e as pré-visualizações usarão estes JSONs.</div>
      </Section>
      <CatalogPreview catalog={catalog} />
    </>
  )
}

/* --------- DASHBOARD --------- */
function useKPIs(sessions){
  const now=new Date(); const weekAgo=new Date(now); weekAgo.setDate(now.getDate()-7)
  return useMemo(()=>{
    const allTotal=sessions.reduce((a,s)=>a+(s.total||0),0)
    const allWeekly=sessions.filter(s=> new Date(s.date)>=weekAgo).reduce((a,s)=>a+(s.total||0),0)
    const gankTotal=sessions.filter(s=>s.type==="GANK").reduce((a,s)=>a+(s.total||0),0)
    const gankWeekly=sessions.filter(s=>s.type==="GANK" && new Date(s.date)>=weekAgo).reduce((a,s)=>a+(s.total||0),0)
    return { allTotal, allWeekly, gankTotal, gankWeekly }
  },[sessions])
}
function Dashboard({ members, sessions }){
  const { allTotal, allWeekly, gankTotal, gankWeekly } = useKPIs(sessions)
  const rolesCount = useMemo(()=>{ const m={}; ROLES.forEach(r=>m[r]=0); members.forEach(p=> m[p.roleBuild]=(m[p.roleBuild]||0)+1); return m },[members])
  const cargosCount = useMemo(()=>{ const m={}; CARGOS.forEach(c=>m[c]=0); members.forEach(p=> m[p.cargoGuilda]=(m[p.cargoGuilda]||0)+1); return m },[members])
  return (<div className="grid grid-2">
    <Section title="Resumo da Guilda">
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Tag>Membros: {members.length}</Tag><Tag>Ativos: {members.filter(p=>p.status==='ativo').length}</Tag><Tag>Trial: {members.filter(p=>p.status==='trial').length}</Tag>
      </div>
      <div style={{marginTop:12}}>
        <h3 style={{margin:'10px 0 6px 0'}}>Distribuição de Roles</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{Object.entries(rolesCount).map(([k,v])=> <Tag key={k}>{k}: {v}</Tag>)}</div>
        <h3 style={{margin:'14px 0 6px 0'}}>Estrutura de Cargos</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{Object.entries(cargosCount).map(([k,v])=> <Tag key={k}>{k}: {v}</Tag>)}</div>
      </div>
    </Section>
    <Section title="KPIs Financeiros">
      <div className="grid grid-2">
        <div className="kpi"><div className="label">GANK — Total</div><div className="value">{nfmt(gankTotal)} prata</div></div>
        <div className="kpi"><div className="label">GANK — Semanal</div><div className="value">{nfmt(gankWeekly)} prata</div></div>
        <div className="kpi"><div className="label">Todos Conteúdos — Total</div><div className="value">{nfmt(allTotal)} prata</div></div>
        <div className="kpi"><div className="label">Todos Conteúdos — Semanal</div><div className="value">{nfmt(allWeekly)} prata</div></div>
      </div>
    </Section>
    <Section title="Loot Recentes">
      <table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Sessão</th><th>Total</th><th>Players</th><th>Banco</th></tr></thead><tbody>
        {sessions.slice().reverse().slice(0,7).map((s,i)=> (<tr key={i}><td>{s.date}</td><td>{s.type}</td><td>{s.name}</td><td>{nfmt(s.total)}</td><td>{s.participants?.length||0}</td><td>{nfmt((s.total||0)*(s.guildBankPercent||0)/100)}</td></tr>))}
      </tbody></table>
    </Section>
  </div>)
}

/* --------- MEMBERS --------- */
function ProfileModal({ member, onClose, sessions }){
  if(!member) return null
  // calcula loot total por player
  let totalPrata = 0
  sessions.forEach(s=>{
    if(s.perPlayer && s.perPlayer[member.nickname]!=null){
      totalPrata += Number(s.perPlayer[member.nickname])||0
    }else if((s.participants||[]).includes(member.nickname)){
      const bank = Math.floor((s.total||0) * (s.guildBankPercent||0) / 100)
      const net = Math.max(0,(s.total||0)-bank)
      const base = Math.floor(net/((s.participants||[]).length||1))
      totalPrata += base
    }
  })
  return (<div className="modal" onClick={onClose}>
    <div className="modal-card" onClick={e=>e.stopPropagation()}>
      <h3>Perfil — {member.nickname}</h3>
      <div className="grid grid-2">
        <div>
          <div className="card">
            <div className="small">Cargo</div><div style={{fontWeight:700}}>{member.cargoGuilda}</div>
            <div className="small" style={{marginTop:8}}>Role</div><div style={{fontWeight:700}}>{member.roleBuild}</div>
          </div>
          <div className="card" style={{marginTop:10}}>
            <div className="small">Loot acumulado (estimado)</div>
            <div style={{fontSize:22,fontWeight:800}}>{nfmt(totalPrata)} prata</div>
          </div>
        </div>
        <div>
          <div className="card">
            <div style={{fontWeight:700, marginBottom:6}}>Build atual</div>
            <div className="small">ARMA: <b>{member.arma_id||'-'}</b></div>
            <div className="small">CAP: <b>{member.capacete_id||'-'}</b></div>
            <div className="small">PEIT: <b>{member.peitoral_id||'-'}</b></div>
            <div className="small">CALÇA: <b>{member.calca_id||'-'}</b></div>
            <div className="small">BOTAS: <b>{member.botas_id||'-'}</b></div>
          </div>
        </div>
      </div>
      <div style={{textAlign:'right', marginTop:12}}><button className="btn" onClick={onClose}>Fechar</button></div>
    </div>
  </div>)
}
function Members({ members, setMembers, onOpenProfile }){
  const [filter, setFilter] = useState("")
  const [form, setForm] = useState({ nickname:"", discord_id:"", cargoGuilda:"MEMBRO", roleBuild:"DPS_MELEE", status:"ativo" })
  const filtered = useMemo(()=>{ const q=filter.trim().toLowerCase(); if(!q) return members; return members.filter(m=> Object.values(m).some(v=> String(v||'').toLowerCase().includes(q))) },[filter,members])
  const exportCSV = ()=>{ const csv=toCSV(members); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='members_export.csv'; a.click(); URL.revokeObjectURL(url) }
  const addManual = ()=>{
    if(!form.nickname.trim() || !form.discord_id.trim()) return alert("Preencha Nickname e Discord ID.");
    if(members.some(m=> m.discord_id===form.discord_id)) return alert("Já existe membro com este Discord ID.");
    setMembers([{...form}, ...members])
    setForm({ nickname:"", discord_id:"", cargoGuilda:"MEMBRO", roleBuild:"DPS_MELEE", status:"ativo" })
  }
  const deleteMember = (discord_id)=> setMembers(members.filter(m=> m.discord_id!==discord_id))
  const importAppend = async(file)=>{ const list=await readCSV(file); const map=new Map(members.map(m=>[m.discord_id,m])); for(const r of list){ if(!map.has(r.discord_id)) map.set(r.discord_id,r) } setMembers(Array.from(map.values())) }
  const importSync = async(file)=>{ const list=await readCSV(file); setMembers(list) }

  return (<Section title="Membros" right={<div style={{display:'flex',gap:8}}>
      <input type="file" accept=".csv" onChange={e=> e.target.files?.[0] && importAppend(e.target.files[0])} className="input" />
      <button className="btn" onClick={()=>document.getElementById('syncCsv').click()}>Sincronizar pelo CSV</button>
      <input id="syncCsv" type="file" accept=".csv" style={{display:'none'}} onChange={e=> e.target.files?.[0] && importSync(e.target.files[0])} />
      <button className="btn btn-primary" onClick={exportCSV}>Exportar CSV</button>
    </div>}>
    <div className="card" style={{marginBottom:12}}>
      <div style={{fontWeight:700, marginBottom:8}}>Adicionar membro (manual)</div>
      <div className="grid grid-4">
        <input className="input" placeholder="Nickname" value={form.nickname} onChange={e=>setForm({...form, nickname:e.target.value})}/>
        <input className="input" placeholder="Discord ID" value={form.discord_id} onChange={e=>setForm({...form, discord_id:e.target.value})}/>
        <select className="select" value={form.cargoGuilda} onChange={e=>setForm({...form, cargoGuilda:e.target.value})}>{CARGOS.map(c=> <option key={c} value={c}>{c}</option>)}</select>
        <select className="select" value={form.roleBuild} onChange={e=>setForm({...form, roleBuild:e.target.value})}>{ROLES.map(r=> <option key={r} value={r}>{r}</option>)}</select>
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <select className="select" style={{maxWidth:200}} value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
          {['ativo','trial','inativo'].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={addManual}>Adicionar</button>
      </div>
    </div>

    <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar..." className="input" style={{marginBottom:12}} />
    <div style={{overflow:'auto'}}><table className="table"><thead><tr><th>Nickname</th><th>Discord</th><th>Cargo</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>
      {filtered.map((m,i)=> (<tr key={i}>
        <td><button className="btn" onClick={()=>onOpenProfile(m)}>{m.nickname}</button></td>
        <td>{m.discord_id}</td><td>{m.cargoGuilda}</td><td>{m.roleBuild}</td><td>{m.status}</td>
        <td><button className="btn" onClick={()=>deleteMember(m.discord_id)}>Excluir</button></td></tr>))}
    </tbody></table></div>
  </Section>)
}

/* --------- BUILDER(slots) --------- */
function LinkBonusPanel({ weaponId, pieces, linkJson }){
  const [active, setActive] = useState([])
  useEffect(()=>{
    const rules = Array.isArray(linkJson)? linkJson : (Array.isArray(linkJson?.rules)? linkJson.rules : [])
    const hasAll = (arr)=> arr.every(req=>{
      const r = String(req).toLowerCase()
      return [weaponId, pieces.cap, pieces.peit, pieces.cal, pieces.bot]
        .filter(Boolean).map(x=> String(x).toLowerCase()).some(v=> v.includes(r))
    })
    const on = rules.filter(r=> hasAll(r.require||r.requires||r.items||[])).map(r=> ({ name: r.name||r.id||"Bônus", desc: r.desc||r.description||"", effect: r.effect||r.bonus||"" }))
    setActive(on)
  },[weaponId,pieces,linkJson])
  if(active.length===0) return <div className="small">Nenhum link ativo.</div>
  return (<div className="grid">{active.map((b,i)=> (<div key={i} className="link-bonus"><div style={{fontWeight:700}}>{b.name}</div><div className="small" style={{whiteSpace:'pre-wrap'}}>{b.desc||b.effect}</div></div>))}</div>)
}

function Builder({ currentUser, members, setMembers, catalog }){
  const canEdit = ["LIDER","OFICIAL"].includes(currentUser?.cargoGuilda)
  const [selected, setSelected] = useState(members[0]?.nickname || "")
  const member = members.find(m=>m.nickname===selected) || members[0]
  const [role, setRole] = useState(member?.roleBuild || "")
  const [arma, setArma] = useState(member?.arma_id || "")
  const [cap, setCap] = useState(member?.capacete_id || "")
  const [peit, setPeit] = useState(member?.peitoral_id || "")
  const [bot, setBot] = useState(member?.botas_id || "")
  const [cal, setCal] = useState(member?.calca_id || "")

  useEffect(()=>{ if(!member) return; setRole(member.roleBuild||""); setArma(member.arma_id||""); setCap(member.capacete_id||""); setPeit(member.peitoral_id||""); setCal(member.calca_id||""); setBot(member.botas_id||""); },[selected])

  const openPicker = (slot)=>{
    const list = slot==='arma' ? (catalog.weapon||[]) : (catalog.armor||[]).filter(a=> (a.slot||a.tipo||'').toUpperCase()===slot.toUpperCase())
    const nameOf = (x)=> x.nome||x.name||x.id||x.key
    const val = prompt(`Escolha ${slot}:\n` + list.slice(0,200).map((x,i)=> `${i+1}. ${nameOf(x)}`).join('\n') + `\n\nDigite o número da lista:`)
    const idx = (parseInt(val||'0')-1)|0
    const chosen = list[idx]
    if(!chosen) return
    const id = chosen.id||chosen.key||chosen.nome||chosen.name
    if(slot==='arma') setArma(id)
    if(slot==='CAPACETE') setCap(id)
    if(slot==='PEITORAL') setPeit(id)
    if(slot==='CALÇA') setCal(id)
    if(slot==='BOTAS') setBot(id)
  }

  const save=()=>{
    if(!canEdit){ alert("Sem permissão."); return }
    const i=members.findIndex(m=>m.nickname===selected); if(i>=0){
      const copy=members.slice(); copy[i]={...copy[i], roleBuild:role, build_role:role, arma_id:arma, capacete_id:cap, peitoral_id:peit, calca_id:cal, botas_id:bot}; setMembers(copy); alert("Build salva para o membro.")
    }
  }

  const placeholder = (label)=> <div style={{width:'100%',height:'100%'}} className="center"><span className="small">{label}</span></div>

  return (
    <Section title="Montar Build (gamificado)" right={<Tag>{canEdit?"Edição habilitada":"Somente visualização"}</Tag>}>
      <div className="builder-wrap">
        <div className="char-stage">
          <div className="char-center">
            <img src="/images/logo.png" alt="char" style={{opacity:.15,width:'100%',objectFit:'contain'}}/>
          </div>
          <div className="slot slot-arma" onClick={()=>canEdit && openPicker('arma')}>
            {arma? <div className="center small" style={{padding:6}}><b>{arma}</b></div> : placeholder('ARMA')}
            <div className="slot-label">ARMA</div>
          </div>
          <div className="slot slot-cap" onClick={()=>canEdit && openPicker('CAPACETE')}>
            {cap? <div className="center small" style={{padding:6}}><b>{cap}</b></div> : placeholder('CAP')}</div>
          <div className="slot slot-peit" onClick={()=>canEdit && openPicker('PEITORAL')}>
            {peit? <div className="center small" style={{padding:6}}><b>{peit}</b></div> : placeholder('PEIT')}</div>
          <div className="slot slot-cal" onClick={()=>canEdit && openPicker('CALÇA')}>
            {cal? <div className="center small" style={{padding:6}}><b>{cal}</b></div> : placeholder('CALÇA')}</div>
          <div className="slot slot-bot" onClick={()=>canEdit && openPicker('BOTAS')}>
            {bot? <div className="center small" style={{padding:6}}><b>{bot}</b></div> : placeholder('BOTAS')}</div>
        </div>
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
              <label>Selecionar membro</label>
              <select value={selected} onChange={e=>setSelected(e.target.value)} className="select" style={{marginLeft:8}}>{members.map(m=> <option key={m.discord_id} value={m.nickname}>{m.nickname} ({m.cargoGuilda})</option>)}</select>
            </div>
            <label>ROLE</label>
            <select disabled={!canEdit} value={role} onChange={e=>setRole(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{ROLES.map(r=> <option key={r} value={r}>{r}</option>)}</select>
            {canEdit && <button className="btn btn-primary" onClick={save}>Salvar Build</button>}
          </div>
          <div className="card">
            <div style={{fontWeight:700, marginBottom:6}}>Link Bonuses Ativos</div>
            <LinkBonusPanel weaponId={arma} pieces={{cap,peit,cal,bot}} linkJson={catalog.link}/>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* --------- CREATE BUILD --------- */
function BuildCard({ title, characterImg, icons }){
  return (
    <div className="card" style={{display:'grid', gridTemplateColumns:'96px 1fr', gap:12, alignItems:'center'}}>
      <div style={{width:96,height:96,background:'#0b1020',border:'1px solid #1e2a45',borderRadius:12,overflow:'hidden'}}>
        {characterImg ? <img src={characterImg} alt="char" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div className="center" style={{height:'100%',color:'#73809a',fontSize:12}}>Personagem</div>}
      </div>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700}}>{title}</div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
          {icons.map((it,idx)=> (
            <div key={idx} className="center" style={{width:40,height:40,border:'1px solid #1e2a45',borderRadius:10,overflow:'hidden',background:'#0b1020'}}>
              {it ? <img src={it} alt="icon" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:10,color:'#73809a'}}>—</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CreateBuild({ currentUser, members, setMembers, catalog, buildsLibrary, setBuildsLibrary }){
  const canEdit=["LIDER","OFICIAL"].includes(currentUser?.cargoGuilda)
  const [name,setName]=useState(""), [role,setRole]=useState(""), [arma,setArma]=useState(""), [cap,setCap]=useState(""), [peit,setPeit]=useState(""), [calca,setCalca]=useState(""), [bot,setBot]=useState(""), [notes,setNotes]=useState("")
  const [imgChar,setImgChar]=useState(null), [imgArma,setImgArma]=useState(null), [imgCap,setImgCap]=useState(null), [imgPeit,setImgPeit]=useState(null), [imgCal,setImgCal]=useState(null), [imgBot,setImgBot]=useState(null)
  const [selected,setSelected]=useState([])
  const weapons = Array.isArray(catalog?.weapon)? catalog.weapon: []; const armors = Array.isArray(catalog?.armor)? catalog.armor: []
  const armorBySlot = (slot)=> armors.filter(a=> (a.slot||a.tipo||"").toUpperCase()===slot)
  const weaponsByRole = weapons.filter(w=> !role || (w.role===role || w.classe===role || (Array.isArray(w.allowedRoles)&&w.allowedRoles.includes(role))))
  function resetForm(){ setName(""); setRole(""); setArma(""); setCap(""); setPeit(""); setCalca(""); setBot(""); setNotes(""); setImgChar(null); setImgArma(null); setImgCap(null); setImgPeit(null); setImgCal(null); setImgBot(null); setSelected([]) }
  function saveTemplate(){ if(!canEdit) return alert("Sem permissão."); if(!name.trim()) return alert("Dê um nome para a build."); const tpl={ id:`${Date.now()}`, name:name.trim(), role, arma, capacete:cap, peitoral:peit, calca, botas:bot, notes, imgs:{ character:imgChar && URL.createObjectURL(imgChar), arma:imgArma && URL.createObjectURL(imgArma), capacete:imgCap && URL.createObjectURL(imgCap), peitoral:imgPeit && URL.createObjectURL(imgPeit), calca:imgCal && URL.createObjectURL(imgCal), botas:imgBot && URL.createObjectURL(imgBot) } }; setBuildsLibrary(prev=>[tpl,...prev]); alert("Modelo salvo!") }
  function assignToSelected(){ if(!canEdit) return alert("Sem permissão."); if(selected.length===0) return alert("Selecione ao menos um membro."); setMembers(prev=> prev.map(m=> selected.includes(m.nickname) ? { ...m, roleBuild: role||m.roleBuild, build_role: role||m.build_role, arma_id: arma||m.arma_id, capacete_id: cap||m.capacete_id, peitoral_id: peit||m.peitoral_id, calca_id: calca||m.calca_id, botas_id: bot||m.botas_id, imgs:{ ...(m.imgs||{}), character: (imgChar && URL.createObjectURL(imgChar)) || (m.imgs?.character), arma: (imgArma && URL.createObjectURL(imgArma)) || (m.imgs?.arma), capacete: (imgCap && URL.createObjectURL(imgCap)) || (m.imgs?.capacete), peitoral: (imgPeit && URL.createObjectURL(imgPeit)) || (m.imgs?.peitoral), calca: (imgCal && URL.createObjectURL(imgCal)) || (m.imgs?.calca), botas: (imgBot && URL.createObjectURL(imgBot)) || (m.imgs?.botas) } } : m)); alert(`Build atribuída a ${selected.length} membro(s).`); setSelected([]) }
  const toggle=(nick)=> setSelected(prev=> prev.includes(nick)? prev.filter(n=>n!==nick): [...prev,nick])
  const applyTemplate=(t)=>{ setName(t.name); setRole(t.role||""); setArma(t.arma||""); setCap(t.capacete||""); setPeit(t.peitoral||""); setCalca(t.calca||""); setBot(t.botas||""); setNotes(t.notes||""); }
  const removeTemplate=(id)=> setBuildsLibrary(prev=> prev.filter(t=> t.id!==id))
  const objUrl = f=> f? URL.createObjectURL(f): null

  return (
    <Section title="Criar Build" right={<Tag>{canEdit?"Edição habilitada":"Somente visualização"}</Tag>}>
      <div className="grid grid-3">
        <div>
          <label>Nome do modelo</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: DPS_MELEE Slayer" className="input" style={{margin:'6px 0 12px 0'}}/>
          <label>ROLE</label><select disabled={!canEdit} value={role} onChange={e=>setRole(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{ROLES.map(r=> <option key={r} value={r}>{r}</option>)}</select>
          <label>ARMA</label><select disabled={!canEdit} value={arma} onChange={e=>setArma(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{weaponsByRole.map(w=> <option key={w.id||w.key||w.nome} value={w.id||w.key||w.nome}>{w.nome||w.id}</option>)}</select>
          <label>CAPACETE</label><select disabled={!canEdit} value={cap} onChange={e=>setCap(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{armorBySlot("CAPACETE").map(a=> <option key={a.id||a.key||a.nome} value={a.id||a.key||a.nome}>{a.nome||a.id}</option>)}</select>
          <label>PEITORAL</label><select disabled={!canEdit} value={peit} onChange={e=>setPeit(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{armorBySlot("PEITORAL").map(a=> <option key={a.id||a.key||a.nome} value={a.id||a.key||a.nome}>{a.nome||a.id}</option>)}</select>
          <label>CALÇA</label><select disabled={!canEdit} value={calca} onChange={e=>setCalca(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{armorBySlot("CALÇA").map(a=> <option key={a.id||a.key||a.nome} value={a.id||a.key||a.nome}>{a.nome||a.id}</option>)}</select>
          <label>BOTAS</label><select disabled={!canEdit} value={bot} onChange={e=>setBot(e.target.value)} className="select" style={{marginBottom:12}}><option value="">Selecione...</option>{armorBySlot("BOTAS").map(a=> <option key={a.id||a.key||a.nome} value={a.id||a.key||a.nome}>{a.nome||a.id}</option>)}</select>
          <label>Notas (opcional)</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} className="input" rows={3} placeholder="Observações do call/estratégia"/>
        </div>
        <div>
          <div className="card">
            <div style={{fontWeight:700,marginBottom:8}}>Imagens (opcional)</div>
            <label>Foto do Personagem<input type="file" accept="image/*" className="input" onChange={e=> setImgChar(e.target.files?.[0]||null)} /></label>
            <label>Ícone Arma<input type="file" accept="image/*" className="input" onChange={e=> setImgArma(e.target.files?.[0]||null)} /></label>
            <label>Ícone Capacete<input type="file" accept="image/*" className="input" onChange={e=> setImgCap(e.target.files?.[0]||null)} /></label>
            <label>Ícone Peitoral<input type="file" accept="image/*" className="input" onChange={e=> setImgPeit(e.target.files?.[0]||null)} /></label>
            <label>Ícone Calça<input type="file" accept="image/*" className="input" onChange={e=> setImgCal(e.target.files?.[0]||null)} /></label>
            <label>Ícone Botas<input type="file" accept="image/*" className="input" onChange={e=> setImgBot(e.target.files?.[0]||null)} /></label>
          </div>
          <div style={{marginTop:12}}>
            <BuildCard
              title={`${name || 'Nova Build'} — ${role || 'ROLE'}`}
              characterImg={objUrl(imgChar)}
              icons={[objUrl(imgArma), objUrl(imgCap), objUrl(imgPeit), objUrl(imgCal), objUrl(imgBot)]}
            />
          </div>
        </div>
        <div>
          {canEdit && <div style={{display:'flex',gap:8,marginTop:10}}><button onClick={saveTemplate} className="btn btn-primary">Salvar modelo</button><button className="btn" onClick={resetForm}>Limpar</button></div>}
          <label style={{display:'block',marginTop:12}}>Atribuir a membros</label>
          <div style={{height:270,overflow:'auto',border:'1px solid #1e2a45',borderRadius:12,padding:8,marginTop:6}}>{members.map(m=> (<label key={m.discord_id} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,borderBottom:'1px solid #1a2340',padding:'6px 0'}}><input type="checkbox" checked={selected.includes(m.nickname)} onChange={()=> setSelected(prev=> prev.includes(m.nickname)? prev.filter(n=>n!==m.nickname): [...prev, m.nickname]) } /><span style={{width:120}}>{m.nickname}</span><span style={{color:'#9aa3b2'}}>{m.roleBuild}</span><span style={{color:'#73809a'}}>— {m.cargoGuilda}</span></label>))}</div>
          {canEdit && <button onClick={assignToSelected} className="btn btn-primary" style={{marginTop:12,width:'100%'}}>Atribuir build aos selecionados</button>}
        </div>
      </div>
    </Section>
  )
}


/* --------- ADMIN --------- */
function Admin({ currentUser, settings, setSettings, members, setSystemAdmins, systemAdmins }){
  const canAdmin = currentUser?.cargoGuilda === "LIDER" || systemAdmins.includes(currentUser?.discord_id)
  const [bank, setBank] = React.useState(settings.defaultBankPercent ?? 10)

  const save = ()=>{
    if(!canAdmin){ alert("Apenas Líder ou Administrador do Sistema pode alterar."); return }
    const v = Math.max(0, Math.min(100, Number(bank)||0))
    const ns = { ...settings, defaultBankPercent: v }
    setSettings(ns)
    localStorage.setItem('stfu_settings', JSON.stringify(ns))
    alert("Configuração salva.")
  }

  return (
    <Section title="Administração — Configurações">
      <div className="card" style={{marginBottom:12}}>
        <div style={{fontWeight:700, marginBottom:6}}>Loot (GANK / GvG)</div>
        <div className="small" style={{marginBottom:6}}>Percentual padrão que vai para o <b>Banco da Guilda</b>.</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <input type="number" className="input" style={{maxWidth:120}} value={bank} onChange={e=>setBank(e.target.value)} disabled={!canAdmin}/>
          <span className="small">%</span>
          <button className="btn btn-primary" onClick={save} disabled={!canAdmin}>Salvar</button>
          {!canAdmin && <Tag>Somente Líder/Admin</Tag>}
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:700, marginBottom:6}}>Administradores do Sistema</div>
        <div className="small" style={{marginBottom:6}}>Quem aparece aqui tem acesso administrativo.</div>
        <div className="grid grid-2" style={{maxHeight:240,overflow:'auto'}}>
          <div>
            <div className="small" style={{marginBottom:6}}>Usuários atuais com permissão:</div>
            {systemAdmins.length===0 && <div className="small">Nenhum administrador adicional.</div>}
            {systemAdmins.map(id=>{
              const m = members.find(x=> x.discord_id===id)
              return <div key={id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1a2340',padding:'6px 0'}}>
                <div>{m? `${m.nickname} (${m.discord_id})` : id}</div>
                {canAdmin && <button className="btn" onClick={()=>{
                  const arr=systemAdmins.filter(x=>x!==id); setSystemAdmins(arr); localStorage.setItem('stfu_admins', JSON.stringify(arr))
                }}>Remover</button>}
              </div>
            })}
          </div>
          <div>
            <div className="small" style={{marginBottom:6}}>Adicionar membro como Admin</div>
            {canAdmin ? members.map(m=>{
              const enabled = !systemAdmins.includes(m.discord_id)
              return <div key={m.discord_id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1a2340',padding:'6px 0'}}>
                <div>{m.nickname} — {m.cargoGuilda}</div>
                <button className="btn" disabled={!enabled} onClick={()=>{
                  const arr=[...systemAdmins, m.discord_id]; setSystemAdmins(arr); localStorage.setItem('stfu_admins', JSON.stringify(arr))
                }}>{enabled? 'Tornar Admin':'Já é Admin'}</button>
              </div>
            }) : <Tag>Somente Líder pode adicionar</Tag>}
          </div>
        </div>
      </div>
    </Section>
  )
}



/* --------- SESSION DETAILS --------- */
function SessionDetails({ session, onClose }){
  if(!session) return null
  const names = session.participants || []
  const per = session.perPlayer || {}
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <h3>Detalhes da Sessão — {session.name}</h3>
        <div className="small" style={{marginBottom:8}}>Data: <b>{session.date}</b> • Tipo: <b>{session.type}</b> • Total: <b>{(Number(session.total)||0).toLocaleString('pt-BR')}</b> • % Banco: <b>{session.guildBankPercent}%</b></div>
        <div className="card">
          <div style={{fontWeight:700, marginBottom:6}}>Participantes ({names.length})</div>
          <div style={{maxHeight:'40vh',overflow:'auto'}}>
            <table className="table">
              <thead><tr><th>Nickname</th><th>Prata Recebida</th></tr></thead>
              <tbody>
                {names.map(n=> (
                  <tr key={n}><td>{n}</td><td>{per[n]!=null ? Number(per[n]).toLocaleString('pt-BR') : '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{textAlign:'right', marginTop:12}}><button className="btn" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  )
}


/* --------- LOOT (igual v3) --------- */
function Loot({ members, sessions, setSessions, settings, currentUser, systemAdmins }){
  const [memberQuery, setMemberQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const [type,setType]=useState("GANK"), [name,setName]=useState("GANK Blackzone"), [date,setDate]=useState(today()), [guildBankPercent,setGBP]=useState(settings?.defaultBankPercent ?? 10), [participants,setParticipants]=useState([]), [total,setTotal]=useState(0)
  const [overrides,setOverrides]=useState({}); const [groups,setGroups]=useState([]); const canAddGroup = groups.length<7
  const toggleParticipant = (nick)=> setParticipants(prev=> prev.includes(nick)? prev.filter(n=>n!==nick): [...prev,nick])
  useEffect(()=>{ if(type==='GANK' || type==='GvG'){ setGBP(settings?.defaultBankPercent ?? 10) } },[type, settings])
  const canEditPercent = currentUser?.cargoGuilda==='LIDER' || (systemAdmins||[]).includes(currentUser?.discord_id)
  const perBase = useMemo(()=>{ const bank=Math.floor(total*(guildBankPercent/100)); const net=Math.max(0,total-bank); const n=participants.length||1; return {bank,net,base:Math.floor(net/n)}; },[total,guildBankPercent,participants])
  const sumOverrides = useMemo(()=> Object.values(overrides).reduce((a,b)=>a+(Number(b)||0),0), [overrides])
  const remaining = Math.max(0, perBase.net - sumOverrides)
  const saveSession = ()=>{ if(!participants.length) return alert("Selecione ao menos 1 participante."); const perPlayer={}; const autoShare=participants.length? Math.floor(remaining/participants.length):0; participants.forEach(nick=> perPlayer[nick]=(Number(overrides[nick]||0)+autoShare)); const sess={ type,name,date,guildBankPercent,participants:[...participants], total:Number(total)||0, perPlayer, bank:perBase.bank }; setSessions([...sessions,sess]); setParticipants([]); setOverrides({}); setTotal(0) }
  const addGroup=()=>{ if(!canAddGroup) return; const id=`Grupo ${groups.length+1}`; setGroups([...groups,{id,participants:[],total:0,guildBankPercent}]) }
  const removeGroup=(idx)=> setGroups(groups.filter((_,i)=>i!==idx))
  return (<>
    <Section title="Sessão de Loot (Prata)">
      <div className="grid grid-3">
        <div>
          <label>Tipo</label><select value={type} onChange={e=>setType(e.target.value)} className="select" style={{marginBottom:12}}>{['GANK','Raid','GvG','Treino'].map(t=> <option key={t} value={t}>{t}</option>)}</select>
          <label>Nome</label><input value={name} onChange={e=>setName(e.target.value)} className="input" style={{marginBottom:12}} />
          <label>Data</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input" style={{marginBottom:12}} />
          <label>% Banco</label><input type="number" value={guildBankPercent} onChange={e=>setGBP(Number(e.target.value)||0)} className="input" style={{marginBottom:12}} disabled={!canEditPercent} /> { !canEditPercent && <div className="small">Padrão definido pela Administração</div> }
          <label>Total (prata)</label><input type="number" value={total} onChange={e=>setTotal(Number(e.target.value)||0)} className="input" />
        </div>
        <div>
          <label>Participantes</label>
          <input className="input" placeholder="Pesquisar membro..." value={memberQuery} onChange={e=>setMemberQuery(e.target.value)} style={{margin:'6px 0 6px 0'}}/>
          <div style={{height:220,overflow:'auto',border:'1px solid #1e2a45',borderRadius:12,padding:8,marginTop:6}}>{members.filter(m=> !memberQuery || (m.nickname||'').toLowerCase().includes(memberQuery.toLowerCase())).map(m=> (<label key={m.discord_id} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,borderBottom:'1px solid #1a2340',padding:'6px 0'}}><input type="checkbox" checked={participants.includes(m.nickname)} onChange={()=>toggleParticipant(m.nickname)} /><span style={{width:160}}>{m.nickname}</span><span style={{color:'#9aa3b2'}}>{m.roleBuild}</span></label>))}</div>
        </div>
        <div><div className="card"><div className="small">Cálculo</div><div style={{marginTop:6}}>Banco da Guilda: <b>{nfmt(perBase.bank)}</b></div><div>Valor a dividir: <b>{nfmt(perBase.net)}</b></div><div>Participantes: <b>{participants.length}</b></div><div style={{fontWeight:700,fontSize:18,marginTop:6}}>Base automática: {nfmt(perBase.base)} / player</div></div></div>
      </div>
      <div style={{marginTop:12}}>
        <h3>Overrides por player (opcional)</h3>
        <div style={{overflow:'auto'}}><table className="table"><thead><tr><th>Player</th><th>Override (prata)</th></tr></thead><tbody>{participants.map(nick=> (<tr key={nick}><td>{nick}</td><td><input type="number" className="input" style={{width:160}} value={overrides[nick]||''} onChange={e=> setOverrides(prev=> ({...prev, [nick]: e.target.value})) }/></td></tr>))}</tbody></table></div>
        <div className="small" style={{marginTop:6}}>Somatório dos overrides: <b>{nfmt(sumOverrides)}</b> | Restante distribuído igualmente: <b>{nfmt(remaining)}</b></div>
        <button onClick={saveSession} className="btn btn-primary" style={{marginTop:10}}>Salvar & Fechar Sessão</button>
      </div>
    </Section>
    <Section title="Grupos de Loot (até 7)">
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><button disabled={!canAddGroup} onClick={addGroup} className={`btn ${canAddGroup? 'btn-primary':''}`} style={{opacity:canAddGroup?1:.6}}>{canAddGroup? 'Adicionar Grupo':'Limite atingido'}</button><Tag>{groups.length}/7</Tag></div>
      <div className="grid grid-3">{groups.map((g,idx)=>{ const bank=Math.floor(g.total*((g.guildBankPercent??guildBankPercent)/100)); const net=Math.max(0,g.total-bank); const pcount=g.participants.length||1; const per=Math.floor(net/pcount); return (<div key={g.id} className="card"><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontWeight:700}}>{g.id}</div><button onClick={()=>removeGroup(idx)} className="btn">Remover</button></div><div style={{marginBottom:8}}><label>Total do grupo (prata)</label><input type="number" value={g.total} onChange={e=>{ const v=Number(e.target.value)||0; const copy=groups.slice(); copy[idx]={...copy[idx],total:v}; setGroups(copy); }} className="input" /></div><div style={{height:160,overflow:'auto',border:'1px solid #1e2a45',borderRadius:12,padding:8,marginBottom:8}}>{members.map(m=>{ const checked=g.participants.includes(m.nickname); return (<label key={m.discord_id} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,borderBottom:'1px solid #1a2340',padding:'6px 0'}}><input type="checkbox" checked={checked} onChange={()=>{ const copy=groups.slice(); const arr=new Set(copy[idx].participants); checked? arr.delete(m.nickname):arr.add(m.nickname); copy[idx]={...copy[idx], participants:Array.from(arr)}; setGroups(copy); }} /><span style={{width:120}}>{m.nickname}</span><span style={{color:'#9aa3b2'}}>{m.roleBuild}</span></label>) })}</div><div>Banco: {nfmt(bank)}</div><div>Por player: {nfmt(per)}</div></div>) })}</div>
    </Section>
    <Section title="Histórico de Sessões">
      <table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Nome</th><th>Total</th><th>Players</th><th>Banco</th></tr></thead><tbody>{sessions.map((s,i)=> (<tr key={i} onClick={()=>setDetail(s)} style={{cursor:'pointer'}} title="Ver detalhes"><td>{s.date}</td><td>{s.type}</td><td>{s.name}</td><td>{nfmt(s.total)}</td><td>{s.participants?.length||0}</td><td>{nfmt(((s.total||0)*(s.guildBankPercent||0))/100)}</td></tr>))}</tbody></table>
    </Section>
    {detail && <SessionDetails session={detail} onClose={()=>setDetail(null)} />}
  </>)
}

/* --------- APP --------- */
export default function App(){
  const [settings, setSettings] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('stfu_settings')||'{}') }catch{ return {} } })
  const [systemAdmins, setSystemAdmins] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('stfu_admins')||'["1234567890"]') }catch{ return ["1234567890"] } })
  const [tab, setTab] = useState("welcome")
  const [members, setMembers] = useState([
    { nickname:"Andyrr", discord_id:"123", cargoGuilda:"OFICIAL", roleBuild:"DPS_MELEE", status:"ativo", arma_id:"Axe_Slayer", capacete_id:"helm_pesado_01", peitoral_id:"armor_pesado_01", calca_id:"calca_pesada_01", botas_id:"botas_pesadas_01" },
    { nickname:"Renanzito", discord_id:"123", cargoGuilda:"MEMBRO", roleBuild:"HEALER", status:"ativo", arma_id:"Mace_1HandMace", capacete_id:"helm_leve_02", peitoral_id:"armor_leve_02", calca_id:"calca_leve_02", botas_id:"botas_leves_02" },
    { nickname:"Mono", discord_id:"123", cargoGuilda:"CALLER", roleBuild:"TANK", status:"ativo", arma_id:"Sword_Knight", capacete_id:"helm_pesado_03", peitoral_id:"armor_pesado_03", calca_id:"calca_pesada_03", botas_id:"botas_pesadas_03" },
    { nickname:"Anne", discord_id:"123", cargoGuilda:"MEMBRO", roleBuild:"DPS_RANGED", status:"trial", arma_id:"Bow_War", capacete_id:"helm_medio_01", peitoral_id:"armor_medio_01", calca_id:"calca_media_01", botas_id:"botas_medias_01" }
  ]);
  const [sessions, setSessions] = useState([
    { type:"GANK", name:"GANK Blackzone 27-08", date:"2025-08-27", total:1000000, guildBankPercent:10, participants:["Zer0","Healz","TankGod","Shadow"] },
    { type:"Raid", name:"Raid Sexta 21h", date:"2025-08-26", total:2400000, guildBankPercent:8, participants:["Zer0","Healz","TankGod","Shadow"] }
  ]);
  const [currentUserNick, setCurrentUserNick] = useState("Zer0"); const currentUser = members.find(m=>m.nickname===currentUserNick) || members[0]
  const [catalog, setCatalog] = useState({ weapon:null, armor:null, stats:null, mod:null, drifter:null, link:null });
  const [buildsLibrary, setBuildsLibrary] = useState([]);
  const [profile, setProfile] = useState(null)
  return (<div className="container">
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}><img src="/images/logo.png" alt="STFU" style={{height:36,filter:'drop-shadow(0 0 8px rgba(255,0,61,.5))'}}/><div style={{fontFamily:'Russo One',letterSpacing:1,fontSize:20}}>STFU — Gestão de Guilda</div></div>
      <div style={{display:'flex',alignItems:'center',gap:8}}><span className="small">Usuário:</span><select value={currentUserNick} onChange={e=>setCurrentUserNick(e.target.value)} className="select" style={{width:220}}>{members.map(m=> <option key={m.discord_id} value={m.nickname}>{m.nickname} — {m.cargoGuilda}</option>)}</select></div>
    </header>
    <nav className="navbar">{[{id:'welcome',label:'Início'},{id:'dashboard',label:'Dashboard'},{id:'members',label:'Membros'},{id:'builder',label:'Builds'},{id:'create',label:'Criar Build'},{id:'loot',label:'Loot'},{id:'catalog',label:'Catálogo (JSON)'},{id:'admin',label:'Admin'}].map(b=> <button key={b.id} onClick={()=>setTab(b.id)} className={`btn ${tab===b.id?'tab-active':''}`}>{b.label}</button>)}</nav>
    {tab==='welcome' && <Welcome onEnter={()=>setTab('dashboard')} />}
    {tab==='dashboard' && <Dashboard members={members} sessions={sessions} />}
    {tab==='members' && <><Members members={members} setMembers={setMembers} onOpenProfile={(m)=>setProfile(m)} />{profile && <ProfileModal member={profile} onClose={()=>setProfile(null)} sessions={sessions} />}</>}
    {tab==='builder' && <Builder currentUser={currentUser} members={members} setMembers={setMembers} catalog={catalog} />}
    {tab==='create' && <CreateBuild currentUser={currentUser} members={members} setMembers={setMembers} catalog={catalog} buildsLibrary={buildsLibrary} setBuildsLibrary={setBuildsLibrary} />}
    {tab==='loot' && <Loot members={members} sessions={sessions} setSessions={setSessions} settings={settings} currentUser={currentUser} systemAdmins={systemAdmins} />}
    {tab==='catalog' && <CatalogLoader setCatalog={setCatalog} catalog={catalog} />}
    {tab==='admin' && <Admin currentUser={currentUser} settings={settings} setSettings={setSettings} members={members} setSystemAdmins={setSystemAdmins} systemAdmins={systemAdmins} />}
    <footer style={{marginTop:20,textAlign:'center',fontSize:12,color:'#8fa0bf'}}>VERSÃO DE TESTE</footer>
  </div>)
}
